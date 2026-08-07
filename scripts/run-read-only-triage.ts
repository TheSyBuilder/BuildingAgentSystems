import {
  GOLDEN_ISSUE_SNAPSHOT_SHA256,
  goldenIssueSnapshot,
} from "../src/reference-agent/fixtures/golden-issue-snapshot.ts";
import {
  ReadOnlyIssueStore,
  runReadOnlyTriage,
} from "../src/reference-agent/read-only-triage.ts";

const store = new ReadOnlyIssueStore(
  goldenIssueSnapshot.fixtures.map(({ issue }) => issue),
);
const run = runReadOnlyTriage({
  issueNumber: 184,
  fixtureId: goldenIssueSnapshot.fixtureId,
  snapshotSha256: GOLDEN_ISSUE_SNAPSHOT_SHA256,
  store,
});

console.log(`Read-only triage: issue #${run.target.number}`);
console.log(`Fixture: ${run.fixtureId} (${run.snapshotSha256})`);
console.log(
  `Search: ${run.similarity.scannedIssues} scanned; ${run.similarity.candidateIssues} candidates; ${run.similarity.clusters.length} clusters`,
);
for (const cluster of run.similarity.clusters) {
  const members = cluster.members
    .map(({ number, state }) => `#${number} ${state}`)
    .join(", ");
  console.log(
    `- ${cluster.score.toFixed(2)} · representative #${cluster.representativeIssue} · ${members}`,
  );
  console.log(`  shared: ${cluster.sharedSignals.join(", ")}`);
  for (const distinction of cluster.distinctions) {
    console.log(`  distinction: ${distinction}`);
  }
}
console.log(
  `Proposal: labels=${run.proposal.labels.join(",")} priority=${run.proposal.priority} duplicate=${run.proposal.duplicateOf ?? "none"}`,
);
console.log(`Rationale: ${run.proposal.rationale}`);
console.log(
  `Guard: mode=${run.guard.mode} writes=${run.guard.writeOperations} status=${run.proposal.status} approval-before-apply=${run.guard.approvalRequiredBeforeApply}`,
);
