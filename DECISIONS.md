# Decisions

Locked product and architecture decisions live in `SCHEDULE.md`. This file records implementation judgments made during automated runs.

- **2026-07-24 — Restore the missing run ledgers during the first site-skeleton unit.** The repository contained only the approved schedule, so progress tracking could not begin without creating `PROGRESS.md` and this file.
- **2026-07-24 — Use Tailwind CSS 4 through its Vite plugin.** This follows current official Astro guidance while preserving the locked Astro + Tailwind stack.
- **2026-07-24 — Keep the first front door static and server-rendered.** React islands and Motion are installed for upcoming labs, but the shell earns no client JavaScript yet.
- **2026-07-24 — Defer hosting setup and publication.** The schedule calls for a public Week 1 site, while the operating rules require explicit review before remote mutation.
- **2026-07-25 — Model the flagship loop as six separately inspectable stages ending in a proposal-only stop.** Separating tool result, verification, and stop condition makes the evidence chain and approval boundary visible.
- **2026-07-25 — Ship the complete trace as server-rendered HTML behind a native disclosure.** The interaction remains useful without client JavaScript and gives assistive technology a linear equivalent.
- **2026-07-27 — Lock the demonstrated editorial-workbench art direction as the v1 visual contract.** The guide shell and flagship lab already share a distinctive, accessible grammar, so future modules should extend it instead of reopening visual exploration.
- **2026-07-29 — Capture the README demo as six deterministic state holds with a 3 MiB ceiling.** Rendering the shipped trace in reduced-motion mode and applying a 64-color palette budget keeps every stage legible, compact, and byte-for-byte reproducible.
