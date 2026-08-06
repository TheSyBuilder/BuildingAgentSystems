import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  GOLDEN_ISSUE_SNAPSHOT_SHA256,
  goldenIssueSnapshot,
} from "../src/reference-agent/fixtures/golden-issue-snapshot.ts";
import {
  canonicalJson,
  isDeeplyFrozen,
  validateGoldenIssueSnapshot,
} from "../src/reference-agent/issue-snapshot.schema.ts";

const validationErrors = validateGoldenIssueSnapshot(goldenIssueSnapshot);
assert.deepEqual(validationErrors, [], validationErrors.join("\n"));
assert.equal(isDeeplyFrozen(goldenIssueSnapshot), true, "snapshot must be deeply frozen");

const canonicalFixture = canonicalJson(goldenIssueSnapshot);
const digest = createHash("sha256").update(canonicalFixture).digest("hex");
assert.equal(
  digest,
  GOLDEN_ISSUE_SNAPSHOT_SHA256,
  `snapshot fingerprint changed; received ${digest}`,
);

assert.throws(() => {
  (goldenIssueSnapshot.repository as { name: string }).name = "mutated";
}, TypeError);

const fixtureByNumber = new Map(
  goldenIssueSnapshot.fixtures.map((fixture) => [fixture.issue.number, fixture]),
);
assert.equal(fixtureByNumber.get(184)?.issue.state, "open");
assert.equal(fixtureByNumber.get(133)?.issue.state, "closed");
assert.match(fixtureByNumber.get(91)?.issue.title ?? "", /parser/i);
assert.match(fixtureByNumber.get(133)?.issue.body ?? "", /PowerShell/);
assert.match(fixtureByNumber.get(184)?.issue.body ?? "", /macOS 15/);

const kindCounts = Object.fromEntries(
  ["bug", "feature", "docs", "question"].map((kind) => [
    kind,
    goldenIssueSnapshot.fixtures.filter(({ expected }) => expected.kind === kind).length,
  ]),
);
const duplicateCount = goldenIssueSnapshot.fixtures.filter(
  ({ expected }) => expected.duplicateOf !== null,
).length;
const reviewCount = goldenIssueSnapshot.fixtures.filter(
  ({ expected }) => expected.requiresHumanReview,
).length;
const commentCount = goldenIssueSnapshot.fixtures.reduce(
  (total, { issue }) => total + issue.comments.length,
  0,
);

assert.deepEqual(kindCounts, { bug: 28, feature: 6, docs: 4, question: 2 });
assert.equal(duplicateCount, 3);
assert.equal(reviewCount, 7);
assert.equal(commentCount, 16);

console.log(
  `Golden issue snapshot: fixtures=${goldenIssueSnapshot.fixtures.length} comments=${commentCount} duplicates=${duplicateCount} human-review=${reviewCount}`,
);
console.log(`Kinds: ${JSON.stringify(kindCounts)}`);
console.log(`SHA-256: ${digest}`);
console.log(
  "Fixture validation: schema, rubric, references, chronology, and deep immutability verified",
);
