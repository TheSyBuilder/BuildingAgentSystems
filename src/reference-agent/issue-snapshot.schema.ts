export const ISSUE_KINDS = ["bug", "feature", "docs", "question"] as const;
export const ISSUE_AREAS = [
  "api",
  "auth",
  "billing",
  "cli",
  "dashboard",
  "deployment",
  "docs",
  "integrations",
  "notifications",
  "performance",
  "search",
  "security",
] as const;
export const ISSUE_SEVERITIES = ["s0", "s1", "s2", "s3", "none"] as const;
export const ISSUE_PRIORITIES = ["p0", "p1", "p2", "p3"] as const;
export const AUTHOR_ASSOCIATIONS = [
  "owner",
  "member",
  "contributor",
  "none",
] as const;

export type IssueKind = (typeof ISSUE_KINDS)[number];
export type IssueArea = (typeof ISSUE_AREAS)[number];
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];
export type AuthorAssociation = (typeof AUTHOR_ASSOCIATIONS)[number];

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

export interface SnapshotRepository {
  readonly owner: string;
  readonly name: string;
  readonly defaultBranch: "main";
  readonly headSha: string;
  readonly description: string;
}

export interface IssueComment {
  readonly id: string;
  readonly authorLogin: string;
  readonly authorAssociation: AuthorAssociation;
  readonly createdAt: string;
  readonly body: string;
}

export interface ObservedIssue {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly authorLogin: string;
  readonly authorAssociation: AuthorAssociation;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly state: "open" | "closed";
  readonly labels: readonly string[];
  readonly comments: readonly IssueComment[];
}

export interface GoldenTriage {
  readonly kind: IssueKind;
  readonly area: IssueArea;
  readonly severity: IssueSeverity;
  readonly priority: IssuePriority;
  readonly cluster: string;
  readonly duplicateOf: number | null;
  readonly requiresHumanReview: boolean;
  readonly rationale: string;
}

export interface GoldenIssueFixture {
  readonly issue: ObservedIssue;
  readonly expected: GoldenTriage;
}

export interface GoldenIssueSnapshot {
  readonly schemaVersion: "1.0.0";
  readonly fixtureId: "relaydesk-golden-issues-v1";
  readonly frozenAt: string;
  readonly repository: SnapshotRepository;
  readonly fixtures: readonly GoldenIssueFixture[];
}

const severityPriority: Readonly<Record<IssueSeverity, IssuePriority>> = {
  s0: "p0",
  s1: "p1",
  s2: "p2",
  s3: "p3",
  none: "p3",
};

function isIsoTimestamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function includesValue<const Values extends readonly string[]>(
  values: Values,
  value: string,
): value is Values[number] {
  return values.includes(value as Values[number]);
}

export function validateGoldenIssueSnapshot(
  snapshot: GoldenIssueSnapshot,
): readonly string[] {
  const errors: string[] = [];
  const expectedNumbers = [
    91,
    ...Array.from({ length: 38 }, (_, index) => index + 102),
    184,
  ];
  const actualNumbers = snapshot.fixtures.map(({ issue }) => issue.number);
  const frozenAt = Date.parse(snapshot.frozenAt);

  if (snapshot.schemaVersion !== "1.0.0") {
    errors.push("schemaVersion must remain 1.0.0 for the v1 fixture contract");
  }
  if (snapshot.fixtureId !== "relaydesk-golden-issues-v1") {
    errors.push("fixtureId must match the frozen v1 snapshot identity");
  }
  if (!isIsoTimestamp(snapshot.frozenAt)) {
    errors.push("frozenAt must be a millisecond-precision UTC timestamp");
  }
  if (!/^[a-f0-9]{40}$/.test(snapshot.repository.headSha)) {
    errors.push("repository.headSha must be a lowercase 40-character SHA-1");
  }
  if (snapshot.fixtures.length !== 40) {
    errors.push(`fixtures must contain exactly 40 issues; received ${snapshot.fixtures.length}`);
  }
  if (actualNumbers.join(",") !== expectedNumbers.join(",")) {
    errors.push("issue numbers must match the frozen ordered manifest");
  }

  const issueIds = new Set<string>();
  const commentIds = new Set<string>();
  const issueNumbers = new Set(actualNumbers);

  for (const fixture of snapshot.fixtures) {
    const { issue, expected } = fixture;
    const location = `issue #${issue.number}`;

    if (issue.id !== `relaydesk-issue-${issue.number}`) {
      errors.push(`${location}: id must match its issue number`);
    }
    if (issueIds.has(issue.id)) {
      errors.push(`${location}: duplicate issue id ${issue.id}`);
    }
    issueIds.add(issue.id);

    if (issue.title.trim().length < 12) {
      errors.push(`${location}: title must contain at least 12 non-whitespace characters`);
    }
    if (issue.body.trim().length < 40) {
      errors.push(`${location}: body must contain at least 40 non-whitespace characters`);
    }
    if (issue.labels.length !== 0) {
      errors.push(`${location}: golden inputs must remain unlabelled`);
    }
    if (issue.state !== "open" && issue.state !== "closed") {
      errors.push(`${location}: state must be open or closed`);
    }
    if (!includesValue(AUTHOR_ASSOCIATIONS, issue.authorAssociation)) {
      errors.push(`${location}: issue author association is outside the schema`);
    }
    if (!isIsoTimestamp(issue.createdAt) || !isIsoTimestamp(issue.updatedAt)) {
      errors.push(`${location}: issue timestamps must use millisecond-precision UTC`);
    } else if (Date.parse(issue.createdAt) > Date.parse(issue.updatedAt)) {
      errors.push(`${location}: updatedAt cannot precede createdAt`);
    }
    if (Date.parse(issue.updatedAt) > frozenAt) {
      errors.push(`${location}: issue data cannot postdate the snapshot freeze`);
    }
    if (!includesValue(ISSUE_KINDS, expected.kind)) {
      errors.push(`${location}: expected kind is outside the taxonomy`);
    }
    if (!includesValue(ISSUE_AREAS, expected.area)) {
      errors.push(`${location}: expected area is outside the taxonomy`);
    }
    if (!includesValue(ISSUE_SEVERITIES, expected.severity)) {
      errors.push(`${location}: expected severity is outside the taxonomy`);
    }
    if (!includesValue(ISSUE_PRIORITIES, expected.priority)) {
      errors.push(`${location}: expected priority is outside the taxonomy`);
    }
    if (expected.priority !== severityPriority[expected.severity]) {
      errors.push(`${location}: priority must match the frozen severity-to-priority rubric`);
    }
    if (expected.cluster.trim().length < 3) {
      errors.push(`${location}: cluster must be a stable non-empty key`);
    }
    if (expected.rationale.trim().length < 24) {
      errors.push(`${location}: rationale must record enough evidence for review`);
    }
    if (expected.duplicateOf !== null) {
      if (!issueNumbers.has(expected.duplicateOf)) {
        errors.push(`${location}: duplicate target #${expected.duplicateOf} is missing`);
      }
      if (expected.duplicateOf >= issue.number) {
        errors.push(`${location}: duplicate target must precede the duplicate report`);
      }
      const target = snapshot.fixtures.find(
        ({ issue: candidate }) => candidate.number === expected.duplicateOf,
      );
      if (target && target.expected.cluster !== expected.cluster) {
        errors.push(`${location}: duplicate and target must share a cluster key`);
      }
    }

    let previousCommentAt = issue.createdAt;
    for (const comment of issue.comments) {
      if (commentIds.has(comment.id)) {
        errors.push(`${location}: duplicate comment id ${comment.id}`);
      }
      commentIds.add(comment.id);
      if (!isIsoTimestamp(comment.createdAt)) {
        errors.push(`${location}: comment ${comment.id} has an invalid timestamp`);
      } else if (
        Date.parse(comment.createdAt) < Date.parse(issue.createdAt)
        || Date.parse(comment.createdAt) > frozenAt
      ) {
        errors.push(`${location}: comment ${comment.id} falls outside the snapshot window`);
      }
      if (Date.parse(comment.createdAt) < Date.parse(previousCommentAt)) {
        errors.push(`${location}: comment ${comment.id} is out of chronological order`);
      }
      previousCommentAt = comment.createdAt;
      if (comment.body.trim().length < 8) {
        errors.push(`${location}: comment ${comment.id} is too short to be useful evidence`);
      }
      if (!includesValue(AUTHOR_ASSOCIATIONS, comment.authorAssociation)) {
        errors.push(`${location}: comment ${comment.id} author association is outside the schema`);
      }
    }

    const expectedUpdatedAt = issue.comments.at(-1)?.createdAt ?? issue.createdAt;
    if (issue.updatedAt !== expectedUpdatedAt) {
      errors.push(`${location}: updatedAt must equal the final frozen activity timestamp`);
    }
  }

  return errors;
}

export function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }

  return value as DeepReadonly<T>;
}

export function isDeeplyFrozen(value: unknown): boolean {
  if (!value || typeof value !== "object" || !Object.isFrozen(value)) {
    return false;
  }

  return Object.values(value).every((child) => {
    if (!child || typeof child !== "object") {
      return true;
    }
    return isDeeplyFrozen(child);
  });
}

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}
