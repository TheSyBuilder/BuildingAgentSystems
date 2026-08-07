import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  GOLDEN_ISSUE_SNAPSHOT_SHA256,
  goldenIssueSnapshot,
} from "../src/reference-agent/fixtures/golden-issue-snapshot.ts";
import { canonicalJson } from "../src/reference-agent/issue-snapshot.schema.ts";
import {
  ReadOnlyIssueStore,
  runReadOnlyTriage,
} from "../src/reference-agent/read-only-triage.ts";

function snapshotDigest(): string {
  return createHash("sha256")
    .update(canonicalJson(goldenIssueSnapshot))
    .digest("hex");
}

const before = snapshotDigest();
const store = new ReadOnlyIssueStore(
  goldenIssueSnapshot.fixtures.map(({ issue }) => issue),
);

assert.equal(store.listIssues().length, 40);
assert.equal(Object.isFrozen(store.listIssues()), true);
assert.throws(() => store.readIssue(999), /not present/);
assert.throws(() => {
  (store.readIssue(184) as { title: string }).title = "mutated";
}, TypeError);

const run = runReadOnlyTriage({
  issueNumber: 184,
  fixtureId: goldenIssueSnapshot.fixtureId,
  snapshotSha256: GOLDEN_ISSUE_SNAPSHOT_SHA256,
  store,
});
const replay = runReadOnlyTriage({
  issueNumber: 184,
  fixtureId: goldenIssueSnapshot.fixtureId,
  snapshotSha256: GOLDEN_ISSUE_SNAPSHOT_SHA256,
  store,
});

assert.deepEqual(run, replay, "the frozen input must produce a deterministic run");
assert.equal(Object.isFrozen(run), true);
assert.equal(run.similarity.scannedIssues, 39);
assert.equal(run.similarity.candidateIssues, 3);
assert.equal(run.similarity.openCandidates, 2);
assert.equal(run.similarity.closedCandidates, 1);
assert.equal(run.similarity.clusters.length, 2);
assert.deepEqual(
  run.similarity.clusters.map(({ representativeIssue, score }) => ({
    representativeIssue,
    score,
  })),
  [
    { representativeIssue: 133, score: 0.81 },
    { representativeIssue: 91, score: 0.62 },
  ],
);
assert.deepEqual(
  run.similarity.clusters[1].members.map(({ number }) => number),
  [91, 102],
  "the two observable parser-crash reports must collapse into one cluster",
);
assert.match(run.similarity.clusters[0].distinctions.join(" "), /closed/i);
assert.match(run.similarity.clusters[0].distinctions.join(" "), /macOS.*Windows PowerShell/i);
assert.doesNotMatch(
  run.similarity.clusters[0].sharedSignals.join(" "),
  /macOS/,
  "a negated macOS reproduction must not become a shared platform signal",
);
assert.match(run.similarity.clusters[1].distinctions.join(" "), /parser crash/i);

assert.deepEqual(run.proposal.labels, ["bug", "cli"]);
assert.equal(run.proposal.priority, "p2");
assert.equal(run.proposal.duplicateOf, null);
assert.equal(run.proposal.status, "awaiting-review");
assert.deepEqual(run.proposal.sideEffects, []);
assert.deepEqual(
  run.proposal.evidence.map(({ issueNumber }) => issueNumber),
  [184, 133, 91],
);
assert.match(run.proposal.rationale, /no duplicate is proposed/i);

assert.deepEqual(
  run.operations.map(({ tool, access }) => ({ tool, access })),
  [
    { tool: "list_issues", access: "read" },
    { tool: "read_issue", access: "read" },
    { tool: "search_similar", access: "read" },
    { tool: "propose_label", access: "proposal" },
  ],
);
assert.equal(run.guard.mode, "read-only");
assert.equal(run.guard.writeOperations, 0);
assert.equal(run.guard.approvalRequiredBeforeApply, true);
assert.equal("apply_label" in store, false, "the local store must expose no write tool");
assert.doesNotMatch(
  JSON.stringify(run),
  /"expected"|"requiresHumanReview"|"severity"|"cluster"\s*:/,
  "gold annotations must not leak into the run",
);

const after = snapshotDigest();
assert.equal(before, GOLDEN_ISSUE_SNAPSHOT_SHA256);
assert.equal(after, before, "the triage run must not mutate the frozen snapshot");

console.log(
  `Read-only triage: target=#${run.target.number} scanned=${run.similarity.scannedIssues} candidates=${run.similarity.candidateIssues} clusters=${run.similarity.clusters.length}`,
);
console.log(
  `Similarity: #133=${run.similarity.clusters[0].score.toFixed(2)} (${run.similarity.clusters[0].members[0].state}); #91/#102=${run.similarity.clusters[1].score.toFixed(2)} (${run.similarity.clusters[1].members[0].state})`,
);
console.log(
  `Proposal: labels=${run.proposal.labels.join(",")} priority=${run.proposal.priority} duplicate=none status=${run.proposal.status}`,
);
console.log(
  `Safety: tools=${run.guard.availableTools.join(",")} write-operations=${run.guard.writeOperations} snapshot-before=${before} snapshot-after=${after}`,
);
console.log("Reference-agent validation: deterministic evidence chain and zero-write boundary verified");
