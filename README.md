# Building Agent Systems

**An interactive guide from first loop to production.**

Understand what an agent actually is, build one that does something real, and know how to tell whether it works.

**[Open the live guide →](https://building-agent-systems-lab.tsa29.chatgpt.site/)**

> Work in progress · The flagship lab is live, and the rest of the guide is being built in public.

[![The agent loop simulator stepping through a frozen issue-triage trace from observation to an approval boundary](public/assets/agent-loop-demo.gif)](https://building-agent-systems-lab.tsa29.chatgpt.site/labs/agent-loop/)

## Start with the loop

The flagship lab turns an issue-triage run into an inspectable six-stage trace: observe, decide, call a tool, read the result, verify the evidence, and stop before a consequential action.

**[Step through the agent loop simulator →](https://building-agent-systems-lab.tsa29.chatgpt.site/labs/agent-loop/)**

It works from a frozen sample repository with no account or API key. Every stage has a keyboard path and a complete text equivalent.

## What this project is building

Building Agent Systems is a vendor-neutral, interaction-first lab for designing, connecting, evaluating, and shipping bounded agents. One TypeScript reference path follows the same issue-triage agent from its first read-only tool to approvals, skills, MCP, evaluation, and production controls.

The guide is organized around evidence you can inspect or keep:

- a decision about whether the job needs an agent at all;
- an architecture canvas with an explicit stop condition;
- typed tool contracts, permission boundaries, and action receipts;
- a working local reference agent over a frozen repository snapshot;
- an evaluation starter suite and a production-readiness blueprint.

## Roadmap

- **Now — Spine and flagship lab:** live shell, agent loop simulator, source ledger, art direction, and curriculum map.
- **Next — Foundations:** agent-or-workflow diagnostic, architecture canvas, and the first read-only reference-agent capability.
- **Then — Tools, skills, and MCP:** contract lab, reusable triage skill, safe local MCP server, and approval-gated actions.
- **Toward production:** platform selection, failure paths, safety, evaluation, observability, deployment, and blueprint export.

See the [project schedule](SCHEDULE.md) for the complete delivery plan and [curriculum outline](docs/curriculum-outline.md) for the module-by-module learning path.

## Run it locally

```sh
pnpm install
pnpm dev
```

The project uses a static Astro build. Run the complete local verification gates with:

```sh
pnpm build && pnpm typecheck
pnpm exec playwright test
pnpm test:links
```

Primary documentation used for technical claims is tracked with verification dates in [`docs/sources.md`](docs/sources.md).

## Current status

Phase 1 is active. The public build carries a work-in-progress banner; completed units and their verification evidence are recorded in [`PROGRESS.md`](PROGRESS.md).
