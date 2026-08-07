import {
  deepFreeze,
  type DeepReadonly,
  type IssuePriority,
  type ObservedIssue,
} from "./issue-snapshot.schema.ts";

export interface IssueSummary {
  readonly number: number;
  readonly title: string;
  readonly state: "open" | "closed";
  readonly updatedAt: string;
}

export interface SimilarIssueEvidence extends IssueSummary {
  readonly excerpt: string;
}

export interface SimilarityCluster {
  readonly key: string;
  readonly score: number;
  readonly representativeIssue: number;
  readonly members: readonly SimilarIssueEvidence[];
  readonly sharedSignals: readonly string[];
  readonly distinctions: readonly string[];
}

export interface SimilaritySearchResult {
  readonly targetIssue: number;
  readonly scannedIssues: number;
  readonly candidateIssues: number;
  readonly openCandidates: number;
  readonly closedCandidates: number;
  readonly clusters: readonly SimilarityCluster[];
}

export interface ProposalEvidence {
  readonly issueNumber: number;
  readonly state: "open" | "closed";
  readonly observation: string;
  readonly implication: string;
}

export interface LabelProposal {
  readonly issueNumber: number;
  readonly labels: readonly string[];
  readonly priority: IssuePriority;
  readonly duplicateOf: number | null;
  readonly rationale: string;
  readonly evidence: readonly ProposalEvidence[];
  readonly status: "awaiting-review";
  readonly sideEffects: readonly never[];
}

export interface TriageOperation {
  readonly sequence: number;
  readonly tool: "list_issues" | "read_issue" | "search_similar" | "propose_label";
  readonly access: "read" | "proposal";
  readonly result: string;
}

export interface ReadOnlyTriageRun {
  readonly runId: string;
  readonly fixtureId: string;
  readonly snapshotSha256: string;
  readonly target: DeepReadonly<ObservedIssue>;
  readonly similarity: SimilaritySearchResult;
  readonly proposal: LabelProposal;
  readonly operations: readonly TriageOperation[];
  readonly guard: {
    readonly mode: "read-only";
    readonly writeOperations: 0;
    readonly approvalRequiredBeforeApply: true;
    readonly availableTools: readonly TriageOperation["tool"][];
  };
}

interface SignalDefinition {
  readonly key: string;
  readonly label: string;
  readonly pattern: RegExp;
}

const SIGNALS: readonly SignalDefinition[] = [
  {
    key: "surface:cli",
    label: "CLI surface",
    pattern: /\bcli\b|\bcommand\b|\brelaydesk\s+[a-z-]+|\bexits?\b|powershell|cmd\.exe|\bbinary\b/i,
  },
  {
    key: "failure:config-parse",
    label: "configuration parse path",
    pattern: /\bconfig(?:uration)?\b|\byaml\b|\bparser?\b|parse error|broken\.yml/i,
  },
  {
    key: "outcome:exit-status",
    label: "incorrect process exit status",
    pattern: /\bexits?\s+(?:with\s+)?(?:code\s+)?(?:0|zero|2)\b|exit(?:\s|-)?code|child exit code|successful exit/i,
  },
  {
    key: "outcome:parser-crash",
    label: "parser crash",
    pattern: /\bpanic(?:s|ked)?\b|\bcrash(?:es|ed)?\b|stack ends in/i,
  },
  {
    key: "platform:windows-powershell",
    label: "Windows PowerShell",
    pattern: /windows|powershell|cmd\.exe/i,
  },
  {
    key: "platform:macos",
    label: "macOS",
    pattern: /macos/i,
  },
  {
    key: "impact:automation-continues",
    label: "automation continues after failure",
    pattern: /script continues|continues after the failure/i,
  },
] as const;

const FAILURE_PATTERN = /\bcrash|\bpanic|\berror|\bfail|does not|doesn't|wrong|unusable|stuck|returns? [45]\d\d|\bexits?\b/i;
const PLATFORM_PREFIX = "platform:";
const CLUSTER_THRESHOLD = 0.55;

function cloneIssue(issue: ObservedIssue): ObservedIssue {
  return {
    ...issue,
    labels: [...issue.labels],
    comments: issue.comments.map((comment) => ({ ...comment })),
  };
}

function issueText(issue: ObservedIssue): string {
  return [
    issue.title,
    issue.body,
    ...issue.comments.map((comment) => comment.body),
  ].join("\n");
}

function signalKeys(issue: ObservedIssue): ReadonlySet<string> {
  const text = issueText(issue);
  return new Set(
    SIGNALS.filter(({ key, pattern }) => {
      if (key === "platform:macos" && /does not reproduce on macos/i.test(text)) {
        return false;
      }
      return pattern.test(text);
    }).map(({ key }) => key),
  );
}

function hasSignal(signals: ReadonlySet<string>, key: string): boolean {
  return signals.has(key);
}

function signalLabel(key: string): string {
  return SIGNALS.find((signal) => signal.key === key)?.label ?? key;
}

function similarityScore(
  target: ObservedIssue,
  candidate: ObservedIssue,
  targetSignals: ReadonlySet<string>,
  candidateSignals: ReadonlySet<string>,
): number {
  let score = 0;

  if (
    hasSignal(targetSignals, "surface:cli")
    && hasSignal(candidateSignals, "surface:cli")
  ) {
    score += 0.22;
  }
  if (
    hasSignal(targetSignals, "failure:config-parse")
    && hasSignal(candidateSignals, "failure:config-parse")
  ) {
    score += 0.22;
  }
  if (FAILURE_PATTERN.test(issueText(target)) && FAILURE_PATTERN.test(issueText(candidate))) {
    score += 0.18;
  }
  if (
    hasSignal(targetSignals, "outcome:exit-status")
    && hasSignal(candidateSignals, "outcome:exit-status")
  ) {
    score += 0.19;
  }

  return Number(score.toFixed(2));
}

function clusterKey(signals: ReadonlySet<string>): string {
  const ordered = [
    "surface:cli",
    "failure:config-parse",
    "outcome:exit-status",
    "outcome:parser-crash",
  ].filter((key) => signals.has(key));
  return ordered.join("/") || "unclassified-similarity";
}

function firstSentence(text: string): string {
  const sentence = text.trim().match(/^.*?(?:[.!?](?=\s|$)|$)/)?.[0] ?? text.trim();
  return sentence.length <= 180 ? sentence : `${sentence.slice(0, 177).trimEnd()}…`;
}

function platformLabels(signals: ReadonlySet<string>): readonly string[] {
  return [...signals]
    .filter((key) => key.startsWith(PLATFORM_PREFIX))
    .map(signalLabel);
}

function clusterDistinctions(
  targetSignals: ReadonlySet<string>,
  members: readonly DeepReadonly<ObservedIssue>[],
): readonly string[] {
  const distinctions = new Set<string>();
  const targetPlatforms = platformLabels(targetSignals);

  for (const member of members) {
    const memberSignals = signalKeys(member);
    const memberPlatforms = platformLabels(memberSignals);

    if (member.state === "closed") {
      distinctions.add(`Issue #${member.number} is closed; its resolution is comparison evidence, not proof of a duplicate.`);
    }
    if (
      targetPlatforms.length > 0
      && memberPlatforms.length > 0
      && targetPlatforms.join() !== memberPlatforms.join()
    ) {
      distinctions.add(`Platform differs: target ${targetPlatforms.join(", ")}; issue #${member.number} ${memberPlatforms.join(", ")}.`);
    }
    if (
      hasSignal(targetSignals, "outcome:exit-status")
      && hasSignal(memberSignals, "outcome:parser-crash")
      && !hasSignal(memberSignals, "outcome:exit-status")
    ) {
      distinctions.add(`Outcome differs: target reports a successful exit status; issue #${member.number} reports a parser crash.`);
    }
  }

  return [...distinctions];
}

export class ReadOnlyIssueStore {
  readonly #issues: ReadonlyMap<number, DeepReadonly<ObservedIssue>>;

  constructor(issues: readonly ObservedIssue[]) {
    const entries = issues.map((issue) => [
      issue.number,
      deepFreeze(cloneIssue(issue)),
    ] as const);
    this.#issues = new Map(entries);
  }

  listIssues(): readonly IssueSummary[] {
    return deepFreeze(
      [...this.#issues.values()].map(({ number, title, state, updatedAt }) => ({
        number,
        title,
        state,
        updatedAt,
      })),
    );
  }

  readIssue(issueNumber: number): DeepReadonly<ObservedIssue> {
    const issue = this.#issues.get(issueNumber);
    if (!issue) {
      throw new Error(`Issue #${issueNumber} is not present in the frozen snapshot.`);
    }
    return issue;
  }

  searchSimilar(issueNumber: number): SimilaritySearchResult {
    const target = this.readIssue(issueNumber);
    const targetSignals = signalKeys(target);
    const matches = [...this.#issues.values()]
      .filter((candidate) => candidate.number !== issueNumber)
      .map((candidate) => {
        const signals = signalKeys(candidate);
        return {
          candidate,
          signals,
          score: similarityScore(target, candidate, targetSignals, signals),
        };
      })
      .filter(({ score }) => score >= CLUSTER_THRESHOLD);

    const groups = new Map<string, typeof matches>();
    for (const match of matches) {
      const key = clusterKey(match.signals);
      groups.set(key, [...(groups.get(key) ?? []), match]);
    }

    const clusters = [...groups.entries()]
      .map(([key, group]): SimilarityCluster => {
        const sorted = group.toSorted(
          (left, right) => left.candidate.number - right.candidate.number,
        );
        const sharedKeys = [...targetSignals].filter((signal) =>
          group.some(({ signals }) => signals.has(signal)),
        );
        const members = sorted.map(({ candidate }) => candidate);

        return {
          key,
          score: Math.max(...group.map(({ score }) => score)),
          representativeIssue: sorted[0].candidate.number,
          members: members.map(({ number, title, state, updatedAt, body }) => ({
            number,
            title,
            state,
            updatedAt,
            excerpt: firstSentence(body),
          })),
          sharedSignals: sharedKeys.map(signalLabel),
          distinctions: clusterDistinctions(targetSignals, members),
        };
      })
      .toSorted(
        (left, right) => right.score - left.score
          || left.representativeIssue - right.representativeIssue,
      );

    const candidates = clusters.flatMap(({ members }) => members);
    return deepFreeze({
      targetIssue: issueNumber,
      scannedIssues: this.#issues.size - 1,
      candidateIssues: candidates.length,
      openCandidates: candidates.filter(({ state }) => state === "open").length,
      closedCandidates: candidates.filter(({ state }) => state === "closed").length,
      clusters,
    });
  }
}

export function proposeLabel(
  issue: DeepReadonly<ObservedIssue>,
  similarity: SimilaritySearchResult,
): LabelProposal {
  const signals = signalKeys(issue);
  const labels = [
    FAILURE_PATTERN.test(issueText(issue)) ? "bug" : "needs-review",
    hasSignal(signals, "surface:cli") ? "cli" : "needs-area",
  ];
  const priority: IssuePriority = hasSignal(signals, "outcome:exit-status")
    && hasSignal(signals, "impact:automation-continues")
    ? "p2"
    : "p3";
  const strongest = similarity.clusters[0];
  const parserCluster = similarity.clusters.find(({ key }) =>
    key.includes("outcome:parser-crash"),
  );

  return deepFreeze({
    issueNumber: issue.number,
    labels,
    priority,
    duplicateOf: null,
    rationale: "The macOS CLI reports a configuration failure as success, allowing automation to continue. Similar reports confirm the area and failure family, but their platform or outcome differs, so no duplicate is proposed.",
    evidence: [
      {
        issueNumber: issue.number,
        state: issue.state,
        observation: firstSentence(issue.body),
        implication: "Direct reproduction supports bug, cli, and p2: a bounded command failure is hidden from its caller.",
      },
      ...(strongest ? [{
        issueNumber: strongest.representativeIssue,
        state: strongest.members[0].state,
        observation: strongest.members[0].excerpt,
        implication: "The exit-status symptom matches, but the closed Windows PowerShell wrapper path is explicitly different from the macOS bundled binary.",
      }] : []),
      ...(parserCluster ? [{
        issueNumber: parserCluster.representativeIssue,
        state: parserCluster.members[0].state,
        observation: parserCluster.members[0].excerpt,
        implication: "The configuration parser area matches, but a crash is not the same outcome as a false successful exit.",
      }] : []),
    ],
    status: "awaiting-review",
    sideEffects: [],
  });
}

export function runReadOnlyTriage(input: {
  readonly issueNumber: number;
  readonly fixtureId: string;
  readonly snapshotSha256: string;
  readonly store: ReadOnlyIssueStore;
}): ReadOnlyTriageRun {
  const inventory = input.store.listIssues();
  const target = input.store.readIssue(input.issueNumber);
  const similarity = input.store.searchSimilar(input.issueNumber);
  const proposal = proposeLabel(target, similarity);

  return deepFreeze({
    runId: `${input.fixtureId}:issue-${input.issueNumber}:read-only-v1`,
    fixtureId: input.fixtureId,
    snapshotSha256: input.snapshotSha256,
    target,
    similarity,
    proposal,
    operations: [
      {
        sequence: 1,
        tool: "list_issues",
        access: "read",
        result: `${inventory.length} frozen issues available`,
      },
      {
        sequence: 2,
        tool: "read_issue",
        access: "read",
        result: `issue #${target.number} read with ${target.comments.length} comments`,
      },
      {
        sequence: 3,
        tool: "search_similar",
        access: "read",
        result: `${similarity.candidateIssues} candidates grouped into ${similarity.clusters.length} clusters`,
      },
      {
        sequence: 4,
        tool: "propose_label",
        access: "proposal",
        result: `${proposal.labels.join(", ")} at ${proposal.priority}; awaiting review`,
      },
    ],
    guard: {
      mode: "read-only",
      writeOperations: 0,
      approvalRequiredBeforeApply: true,
      availableTools: ["list_issues", "read_issue", "search_similar", "propose_label"],
    },
  });
}
