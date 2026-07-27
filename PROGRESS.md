# Progress

**Current phase:** Phase 1 — Spine and flagship lab

**Current schedule week:** Week 1 (`floor((2026-07-27 − 2026-07-25) / 7) + 1`)

**Last completed unit:** Art-direction lock — DONE

**Next unit:** Phase 1 curriculum outline — create one page mapping each module to one reader outcome, its signature or light interaction, and a concrete checkpoint, without drafting module prose

## State note

`PROGRESS.md` and `DECISIONS.md` were absent at the start of the first run. The repository contained only an untracked `SCHEDULE.md` and had no local commits. The schedule says Phase 0 is closed and implementation is active, so this ledger begins at Phase 1.

## Schedule drift

- `SCHEDULE.md` calls for the site to be public from Week 1. The local WIP front door is ready, but hosting setup and publication remain pending because the operating rules require explicit review before remote mutation.

## Run reports

### 2026-07-24 — Phase 1 site skeleton

**Phase and unit completed**

- Phase 1 — Spine and flagship lab
- Unit: static Astro site skeleton, routing, React/MDX integration points, Tailwind design tokens, local content collection, WIP front door, accessible 404, and verification harness
- Schedule week: Week 0

**Verification output**

`pnpm build && pnpm typecheck`

```text
$ ASTRO_TELEMETRY_DISABLED=1 astro build
18:28:15 [content] Syncing content
18:28:15 [content] Synced content
18:28:15 [types] Generated 169ms
18:28:15 [build] output: "static"
18:28:15 [build] mode: "static"
18:28:15 [build] directory: /Users/Panda/Desktop/Daily/Github Research/BuildingAgentSystems/dist/
18:28:15 [build] Collecting build info...
18:28:15 [build] ✓ Completed in 179ms.
18:28:15 [build] Building static entrypoints...
18:28:15 [vite] ✓ built in 82ms
18:28:15 [vite] ✓ built in 38ms
18:28:15 [build] Rearranging server assets...

 generating static routes
18:28:15   ├─ /404.html (+4ms)
18:28:15   ├─ /index.html (+1ms)
18:28:15 ✓ Completed in 18ms.

18:28:15 [build] ✓ Completed in 150ms.
18:28:15 [build] 2 page(s) built in 330ms
18:28:15 [build] Complete!
$ ASTRO_TELEMETRY_DISABLED=1 astro check
18:28:16 [content] Syncing content
18:28:16 [content] Synced content
18:28:16 [types] Generated 166ms
18:28:16 [check] Getting diagnostics for Astro files in /Users/Panda/Desktop/Daily/Github Research/BuildingAgentSystems...
Result (10 files):
- 0 errors
- 0 warnings
- 0 hints
```

`pnpm test:smoke`

```text
$ playwright test tests/smoke.spec.ts
Running 3 tests using 3 workers
[1/3] tests/smoke.spec.ts:44:1 › small-screen layout keeps the primary path available
[2/3] tests/smoke.spec.ts:24:1 › reduced motion removes the status loop
[3/3] tests/smoke.spec.ts:3:1 › front door renders and works from the keyboard
  3 passed (517ms)
```

The keyboard test exercises the skip link and primary in-page path. The reduced-motion test emulates `prefers-reduced-motion: reduce` and asserts the status animation is reduced to one iteration at no more than `0.00001s`. The resulting full-page render at `test-results/reduced-motion.png` was manually inspected: layout and content remain intact, the status marker is static, and the browser console contains zero errors.

`pnpm test:a11y`

```text
$ playwright test tests/accessibility.spec.ts
Running 2 tests using 2 workers
[1/2] tests/accessibility.spec.ts:17:1 › front door passes axe color contrast
[2/2] tests/accessibility.spec.ts:4:1 › front door has no serious or critical axe violations
  2 passed (1.5s)
```

`pnpm test:links`

```text
$ linkinator dist --recurse
→ crawling dist
[200] dist
[200] dist/_astro/BaseLayout.B56amoVj.css

dist
  [200] dist
  [200] dist/_astro/BaseLayout.B56amoVj.css
✓ Successfully scanned 2 links in 0.021 seconds.
```

Internal hash destinations are additionally exercised by the keyboard smoke test.

Lighthouse against `http://127.0.0.1:4321/`

```text
performance: 100
accessibility: 100
FCP: 0.8 s
LCP: 0.8 s
CLS: 0
```

`docs/sources.md` now records primary official URLs and `verified: 2026-07-24` dates for the Astro integrations, Tailwind Vite integration, content collection loader, and Motion package conventions used in this unit.

```text
200 https://docs.astro.build/en/guides/integrations/
200 https://docs.astro.build/en/guides/styling/#tailwind
200 https://docs.astro.build/en/guides/content-collections/
200 https://motion.dev/docs/react-installation
```

**Decisions made this run**

- Restored the missing progress and decision ledgers during the first implementation unit.
- Selected Tailwind CSS 4 through its official Vite plugin.
- Kept the front door static with zero client JavaScript; React islands and Motion remain available for labs that need them.
- Deferred hosting and publication until explicit remote-mutation review.

**Remaining uncertainty**

- The static host and public preview URL are not configured. This is intentional pending explicit approval for remote mutation.
- Art direction is strong enough for the first shell but is not marked as the separate locked-art-direction deliverable.

**Single next unit**

Agent loop simulator — implement the standalone step-through observation → decision → tool call → result → verification flow using the frozen issue-triage trace, including keyboard controls, reduced-motion behavior, and a non-interactive textual equivalent.

### 2026-07-25 — Agent loop simulator

**Phase and unit completed**

- Phase 1 — Spine and flagship lab
- Unit: standalone agent loop simulator at `/labs/agent-loop/`
- Shipped one frozen issue-triage trace with separate observation, decision, tool call, result, verification, and stop stages; read-only evidence; a visible approval boundary; arrow-key tab traversal; previous/next controls; a server-rendered text equivalent; responsive layouts; and reduced-motion behavior
- Schedule week: Week 1

**Verification output**

`pnpm build && pnpm typecheck`

```text
$ ASTRO_TELEMETRY_DISABLED=1 astro build
18:06:55 [content] Syncing content
18:06:55 [content] Synced content
18:06:55 [types] Generated 163ms
18:06:55 [build] output: "static"
18:06:55 [build] mode: "static"
18:06:55 [build] directory: /Users/Panda/Desktop/Daily/Github Research/BuildingAgentSystems/dist/
18:06:55 [build] Collecting build info...
18:06:55 [build] ✓ Completed in 175ms.
18:06:55 [build] Building static entrypoints...
18:06:55 [vite] ✓ built in 94ms
18:06:55 [vite] ✓ built in 46ms
18:06:55 [build] Rearranging server assets...

 generating static routes
18:06:55   ├─ /404.html (+4ms)
18:06:55   ├─ /labs/agent-loop/index.html (+46ms)
18:06:55   ├─ /index.html (+1ms)
18:06:55 ✓ Completed in 63ms.

18:06:55 [build] ✓ Completed in 214ms.
18:06:55 [build] 3 page(s) built in 391ms
18:06:55 [build] Complete!
$ ASTRO_TELEMETRY_DISABLED=1 astro check
18:06:56 [content] Syncing content
18:06:56 [content] Synced content
18:06:56 [types] Generated 164ms
18:06:56 [check] Getting diagnostics for Astro files in /Users/Panda/Desktop/Daily/Github Research/BuildingAgentSystems...
Result (13 files):
- 0 errors
- 0 warnings
- 0 hints
```

`pnpm test:smoke`

```text
Running 3 tests using 3 workers
[1/3] tests/smoke.spec.ts:44:1 › small-screen layout keeps the primary path available
[2/3] tests/smoke.spec.ts:3:1 › front door renders and works from the keyboard
[3/3] tests/smoke.spec.ts:24:1 › reduced motion removes the status loop
  3 passed (1.3s)
```

`pnpm exec playwright test tests/agent-loop.spec.ts`

```text
Running 4 tests using 4 workers
[1/4] tests/agent-loop.spec.ts:42:1 › agent loop has a complete textual equivalent
[2/4] tests/agent-loop.spec.ts:3:1 › agent loop completes with keyboard-only controls
[3/4] tests/agent-loop.spec.ts:85:1 › agent loop remains usable on a small screen
[4/4] tests/agent-loop.spec.ts:51:1 › agent loop honors reduced motion
  4 passed (2.2s)
```

The keyboard-only test traverses the stage tabs with Arrow Right, End, and Home, then activates the next-stage control with Enter. The reduced-motion test emulates `prefers-reduced-motion: reduce`, asserts the status animation is `none`, and confirms the changing panel has no transform or transition duration.

`pnpm test:a11y`

```text
Running 4 tests using 4 workers
[1/4] tests/accessibility.spec.ts:4:1 › front door has no serious or critical axe violations
[2/4] tests/accessibility.spec.ts:17:1 › front door passes axe color contrast
[3/4] tests/accessibility.spec.ts:40:1 › agent loop passes axe color contrast
[4/4] tests/accessibility.spec.ts:27:1 › agent loop has no serious or critical axe violations
  4 passed (1.6s)
```

The full-page renders at `test-results/agent-loop-reduced-motion.png` and `test-results/agent-loop-mobile.png` were manually inspected. The reduced-motion render retains the complete content hierarchy with a static status marker and instant stage change; the 360 px render keeps all controls readable, preserves the evidence chain, and has no horizontal overflow.

Lighthouse against `http://127.0.0.1:4321/labs/agent-loop/`

```text
performance: 100
accessibility: 100
FCP: 1.2 s
LCP: 1.7 s
CLS: 0
```

Route-specific link crawl:

```text
→ crawling http://127.0.0.1:4321/labs/agent-loop/
[200] http://127.0.0.1:4321/labs/agent-loop/
[200] http://127.0.0.1:4321/_astro/BaseLayout.DHDLG_07.css
[200] http://127.0.0.1:4321/_astro/agent-loop.SotwMiDj.css
[200] http://127.0.0.1:4321/
✓ Successfully scanned 4 links in 0.021 seconds.
```

`docs/sources.md` records the primary source for the loop, environmental feedback, human checkpoint, and stopping-condition claims with a `verified: 2026-07-25` stamp.

```text
200 https://www.anthropic.com/engineering/building-effective-agents
```

**Decisions made this run**

- Model the flagship trace as six distinct stages, keeping tool result, verification, and stop separate so the evidence chain is inspectable.
- End at a proposal-only state; applying labels remains a consequential action behind an approval boundary.
- Ship the entire trace as server-rendered HTML behind a native disclosure so the lesson works without client JavaScript.

**Remaining uncertainty**

- The completed standalone route is not linked from the frozen homepage because front-door integration is a separate unit.
- The static host and public preview URL remain unconfigured; external deployment still requires explicit review.
- The art direction is demonstrated by the shell and flagship lab but has not yet been marked as its separate locked deliverable.

**Commit hash and push status**

- Unit commit: `f8662ec` (`feat(lab): ship agent loop simulator`)
- Push: successful ordinary non-force push to the verified canonical `origin/main` (`bc45924..f8662ec`)

**Single next unit**

Flagship front-door integration — explicitly revise the frozen homepage CTA and first-lab placeholder so they link to the completed `/labs/agent-loop/` experience, then verify the changed homepage and cross-route path.

### 2026-07-26 — Flagship front-door integration

**Phase and unit completed**

- Phase 1 — Spine and flagship lab
- Unit: flagship front-door integration from `/` to `/labs/agent-loop/`
- Replaced the stale hero placeholder with a direct lab CTA, added a direct CTA to the lab preview, linked the primary-navigation entry, and updated the WIP copy to state that the flagship lab is live
- Added keyboard-only cross-route smoke coverage and a 360 px visual evidence capture
- Schedule week: Week 1

**Verification output**

`pnpm build && pnpm typecheck`

```text
$ ASTRO_TELEMETRY_DISABLED=1 astro build
18:02:22 [content] Syncing content
18:02:22 [content] Synced content
18:02:22 [types] Generated 172ms
18:02:22 [build] output: "static"
18:02:22 [build] mode: "static"
18:02:22 [build] directory: /Users/Panda/Desktop/Daily/Github Research/BuildingAgentSystems/dist/
18:02:22 [build] Collecting build info...
18:02:22 [build] ✓ Completed in 183ms.
18:02:22 [build] Building static entrypoints...
18:02:22 [vite] ✓ built in 108ms
18:02:22 [vite] ✓ built in 54ms
18:02:22 [build] Rearranging server assets...

 generating static routes
18:02:22   ├─ /404.html (+5ms)
18:02:22   ├─ /labs/agent-loop/index.html (+47ms)
18:02:22   ├─ /index.html (+1ms)
18:02:22 ✓ Completed in 65ms.

18:02:22 [build] ✓ Completed in 238ms.
18:02:22 [build] 3 page(s) built in 423ms
18:02:22 [build] Complete!
$ ASTRO_TELEMETRY_DISABLED=1 astro check
18:02:23 [content] Syncing content
18:02:23 [content] Synced content
18:02:23 [types] Generated 170ms
18:02:23 [check] Getting diagnostics for Astro files in /Users/Panda/Desktop/Daily/Github Research/BuildingAgentSystems...
Result (13 files):
- 0 errors
- 0 warnings
- 0 hints
```

`pnpm test:smoke`

```text
Running 3 tests using 3 workers
[1/3] tests/smoke.spec.ts:49:1 › small-screen layout keeps the primary path available
[2/3] tests/smoke.spec.ts:3:1 › front door renders and works from the keyboard
[3/3] tests/smoke.spec.ts:29:1 › reduced motion removes the status loop
  3 passed (1.4s)
```

The keyboard-only test focuses and activates the hero CTA, confirms navigation to `/labs/agent-loop/`, and verifies the simulator heading. It also asserts that both the hero and preview CTAs point to the completed route.

`pnpm test:a11y`

```text
Running 4 tests using 4 workers
[1/4] tests/accessibility.spec.ts:40:1 › agent loop passes axe color contrast
[2/4] tests/accessibility.spec.ts:27:1 › agent loop has no serious or critical axe violations
[3/4] tests/accessibility.spec.ts:17:1 › front door passes axe color contrast
[4/4] tests/accessibility.spec.ts:4:1 › front door has no serious or critical axe violations
  4 passed (1.7s)
```

Reduced-motion and mobile behavior were manually inspected in the generated full-page renders at `test-results/reduced-motion.png` and `test-results/front-door-mobile.png`. The reduced-motion page retains the complete hierarchy with a static status marker; computed animation duration is no more than `0.00001s` with one iteration. At 360 px, both CTAs remain legible, the preview stacks into one column, and the page has no horizontal overflow.

Lighthouse against `http://127.0.0.1:4321/`

```text
performance: 100
accessibility: 100
FCP: 0.8 s
LCP: 0.9 s
CLS: 0
```

`pnpm test:links`

```text
$ linkinator dist --recurse
→ crawling dist
[200] dist
[200] dist/labs/agent-loop/
[200] dist/_astro/BaseLayout.Vm1UIJon.css
[200] dist/_astro/agent-loop.SotwMiDj.css

  [200] dist
  [200] dist/labs/agent-loop/
  [200] dist/_astro/BaseLayout.Vm1UIJon.css
  [200] dist/_astro/agent-loop.SotwMiDj.css
dist
dist/labs/agent-loop/
✓ Successfully scanned 4 links in 0.022 seconds.
```

This integration adds no technical claims, so `docs/sources.md` requires no new entry.

**Decisions made this run**

- None. The unit implements the next task already fixed by `PROGRESS.md`.

**Remaining uncertainty**

- The static host and public preview URL remain unconfigured because external deployment requires explicit approval.
- The demonstrated art direction is not yet captured as a locked deliverable.

**Commit hash and push status**

- Unit commit: `51651a2` (`feat(site): link flagship lab from home`)
- Push: successful ordinary non-force push to the verified canonical `origin/main` (`b048f5d..51651a2`)

**Single next unit**

Art-direction lock — codify the demonstrated typography, color, illustration, spacing, navigation, and motion vocabulary in `docs/art-direction.md`, then verify both shipped routes against it without restyling DONE work.

### 2026-07-27 — Art-direction lock

**Phase and unit completed**

- Phase 1 — Spine and flagship lab
- Unit: locked the demonstrated editorial-workbench art direction in `docs/art-direction.md`
- Codified typography, core and contextual color roles, illustration language, spacing and responsive rules, navigation, controls, motion, page grammar, content voice, accessibility gates, and extension rules
- Added a route-level Playwright audit covering the guide front door and flagship lab without modifying either DONE route
- Schedule week: Week 1

**Verification output**

`pnpm build && pnpm typecheck`

```text
$ ASTRO_TELEMETRY_DISABLED=1 astro build
18:07:04 [content] Syncing content
18:07:04 [content] Synced content
18:07:04 [types] Generated 214ms
18:07:04 [build] output: "static"
18:07:04 [build] mode: "static"
18:07:04 [build] directory: /Users/Panda/Desktop/Daily/Github Research/BuildingAgentSystems/dist/
18:07:04 [build] Collecting build info...
18:07:04 [build] ✓ Completed in 226ms.
18:07:04 [build] Building static entrypoints...
18:07:04 [vite] ✓ built in 86ms
18:07:04 [vite] ✓ built in 49ms
18:07:04 [build] Rearranging server assets...

 generating static routes
18:07:04   ├─ /404.html (+5ms)
18:07:04   ├─ /labs/agent-loop/index.html (+63ms)
18:07:04   ├─ /index.html (+1ms)
18:07:04 ✓ Completed in 81ms.

18:07:04 [build] ✓ Completed in 231ms.
18:07:04 [build] 3 page(s) built in 458ms
18:07:04 [build] Complete!
$ ASTRO_TELEMETRY_DISABLED=1 astro check
18:07:05 [content] Syncing content
18:07:05 [content] Synced content
18:07:05 [types] Generated 188ms
18:07:05 [check] Getting diagnostics for Astro files in /Users/Panda/Desktop/Daily/Github Research/BuildingAgentSystems...
Result (14 files):
- 0 errors
- 0 warnings
- 0 hints
```

Full Playwright regression, including smoke, keyboard-only operation, art-direction audit, reduced motion, mobile overflow, and axe:

```text
Running 14 tests using 7 workers
[1/14] tests/agent-loop.spec.ts:51:1 › agent loop honors reduced motion
[2/14] tests/agent-loop.spec.ts:42:1 › agent loop has a complete textual equivalent
[3/14] tests/agent-loop.spec.ts:3:1 › agent loop completes with keyboard-only controls
[4/14] tests/accessibility.spec.ts:27:1 › agent loop has no serious or critical axe violations
[5/14] tests/accessibility.spec.ts:40:1 › agent loop passes axe color contrast
[6/14] tests/accessibility.spec.ts:4:1 › front door has no serious or critical axe violations
[7/14] tests/accessibility.spec.ts:17:1 › front door passes axe color contrast
[8/14] tests/agent-loop.spec.ts:85:1 › agent loop remains usable on a small screen
[9/14] tests/art-direction.spec.ts:29:1 › front door conforms to the locked art direction
[10/14] tests/art-direction.spec.ts:121:1 › agent loop conforms to the locked art direction
[11/14] tests/art-direction.spec.ts:198:1 › both routes collapse decorative motion when reduced motion is requested
[12/14] tests/smoke.spec.ts:3:1 › front door renders and works from the keyboard
[13/14] tests/smoke.spec.ts:31:1 › reduced motion removes the status loop
[14/14] tests/smoke.spec.ts:51:1 › small-screen layout keeps the primary path available
  14 passed (2.5s)
```

The reduced-motion renders at `test-results/reduced-motion.png` and `test-results/agent-loop-reduced-motion.png` were manually inspected. Both retain the complete hierarchy and visible state with static status markers and immediate panel changes. The desktop audit captures at `test-results/art-direction-home.png` and `test-results/art-direction-agent-loop.png` conform to the locked composition, type, color, rule, control, and evidence grammar. The 360 px captures at `test-results/front-door-mobile.png` and `test-results/agent-loop-mobile.png` recompose cleanly with no horizontal overflow.

Lighthouse against both audited routes:

```text
test-results/lighthouse-home.json
{
  "performance": 100,
  "accessibility": 100,
  "FCP": "0.8 s",
  "LCP": "0.9 s",
  "CLS": "0"
}
test-results/lighthouse-agent-loop.json
{
  "performance": 100,
  "accessibility": 100,
  "FCP": "0.9 s",
  "LCP": "0.9 s",
  "CLS": "0"
}
```

`pnpm test:links`

```text
$ linkinator dist --recurse
→ crawling dist
[200] dist
[200] dist/labs/agent-loop/
[200] dist/_astro/BaseLayout.Dc1CQ5QZ.css
[200] dist/_astro/agent-loop.SotwMiDj.css

  [200] dist
dist
  [200] dist/labs/agent-loop/
  [200] dist/_astro/BaseLayout.Dc1CQ5QZ.css
dist/labs/agent-loop/
  [200] dist/_astro/agent-loop.SotwMiDj.css
✓ Successfully scanned 4 links in 0.023 seconds.
```

`docs/art-direction.md` contains no external or Markdown links. It records internal design decisions and implemented values rather than new technical claims, so `docs/sources.md` requires no update.

**Decisions made this run**

- Locked the demonstrated editorial-workbench direction as the v1 visual contract: paper and ink construction, hard rules, condensed display type, monospace instrumentation, sparse semantic signal color, CSS-native geometry, and short state-driven motion.
- Added a contract-level computed-style audit instead of screenshot snapshots so future work can preserve the vocabulary while still composing new pages.

**Remaining uncertainty**

- The static host and public preview URL remain unconfigured because external deployment requires explicit approval.
- The README front door cannot yet satisfy its required live URL above the fold. The curriculum outline is the next unblocked Phase 1 unit.

**Commit hash and push status**

- Unit commit: `cb4a0ed` (`docs(design): lock art direction`)
- Metadata-cleanup commit: `3aaec42` (`docs(design): clean art direction metadata`)
- Push: successful ordinary non-force push to the verified canonical `origin/main` (`6e7f1f7..3aaec42`)

**Single next unit**

Phase 1 curriculum outline — create `docs/curriculum-outline.md` as a one-page map of module → reader outcome → signature or light interaction → concrete checkpoint, without drafting module prose.
