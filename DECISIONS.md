# Decisions

Locked product and architecture decisions live in `SCHEDULE.md`. This file records implementation judgments made during automated runs.

- **2026-07-24 — Restore the missing run ledgers during the first site-skeleton unit.** The repository contained only the approved schedule, so progress tracking could not begin without creating `PROGRESS.md` and this file.
- **2026-07-24 — Use Tailwind CSS 4 through its Vite plugin.** This follows current official Astro guidance while preserving the locked Astro + Tailwind stack.
- **2026-07-24 — Keep the first front door static and server-rendered.** React islands and Motion are installed for upcoming labs, but the shell earns no client JavaScript yet.
- **2026-07-24 — Defer hosting setup and publication.** The schedule calls for a public Week 1 site, while the operating rules require explicit review before remote mutation.
