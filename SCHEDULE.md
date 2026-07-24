# Building Agent Systems — Project Schedule

**Schedule version:** 2.0
**Project start:** 2026-07-25
**Status:** Phase 0 closed. Implementation active.
**Current week:** `floor((today − 2026-07-25) / 7) + 1`. Compute this at the start of every run and state it in the report.

---

## Project identity

- Name: **Building Agent Systems**
- Descriptor: **An interactive guide from first loop to production.**
- Repository: **TheSyBuilder/BuildingAgentSystems**
- Product: an interactive lab for understanding, building, connecting, evaluating, and shipping agents.

Name and repository are fixed and are not open questions in any phase.

Keep the public title compact and immediately descriptive. Discoverability keywords belong in the GitHub repository description and topics field, not in the title. Position the product as an interactive agent-systems lab — not a tutorial series, beginner course, documentation portal, or framework catalog.

---

## Locked decisions

These were open in schedule v1. They are now closed. Do not relitigate them inside a run. Changing one requires explicit user approval and a corresponding entry in `DECISIONS.md`.

| Decision | Resolution |
|---|---|
| Reader promise | "Understand what an agent actually is, build one that does something real, and know how to tell whether it works." |
| Primary language | TypeScript for site and reference agent. No Python path in v1. |
| Web stack | Astro + React islands + Tailwind + Motion. MDX content collections. Static output. |
| Provider stance | Vendor-neutral concepts; one maintained reference path on a thin provider adapter over raw HTTP. Framework adapters are labeled, secondary, optional. |
| Reference agent | Issue-triage agent over a frozen, bundled sample repository snapshot. |
| Progress storage | Device-local only. Export to Markdown, JSON, and PNG. No accounts. |
| Live agent demo | Bring-your-own-key held in memory only, never persisted, plus a pre-recorded trace so every lab works with zero setup. |
| Platform ceiling | Maximum 12 platform cards maintained. Anything beyond that is a link, not a card. |
| Publication | Static host with preview deploys. Public from Week 1 behind a work-in-progress banner. |
| Maintenance owner | Repository owner, with a documented review cadence (Phase 9). |

---

## North star

Take a reader from "What is an agent?" to a small agent they can design, build, connect, test, and ship responsibly.

The reader finishes with a concrete agent blueprint, a working reference implementation, tested tool contracts, a safety plan, and an evaluation checklist.

## Experience priority

The website experience is the highest product priority. It should feel polished, playful, and memorable — not documentation with decorative styling.

- Prefer interactive teaching over long static explanation whenever interaction makes the concept clearer.
- Motion, layered diagrams, simulations, builders, and hands-on labs are part of the teaching language, not ornament.
- Let visual and interaction design influence the curriculum rather than treating design as a final presentation layer.
- Give design exploration, content depth, and polish the time they need. Do not flatten interactions or cut useful detail to reduce development or model cost.
- Fast loading, clarity, accessibility, reduced-motion support, and textual alternatives are gates, not aspirations — see Verification gates.

## Primary audience

1. Developers building their first useful agent.
2. Experienced developers who understand software but need a clear map of the agent ecosystem.

Every section offers a beginner path and an optional "go deeper" layer. The core path must be understandable without prior knowledge of agent frameworks or MCP.

## Reader promises

By the end, a reader can:

- recognize when a deterministic workflow beats an agent;
- describe the observe–decide–act–verify loop;
- choose an appropriate model, runtime, and platform surface;
- design narrow tools with typed inputs, structured outputs, and honest errors;
- distinguish a prompt, tool, skill, MCP server, agent, and multi-agent workflow;
- create and test a reusable skill;
- connect to an MCP server and understand the security boundary;
- build a small MCP server and inspect its capabilities;
- add state, memory, approvals, and retries deliberately;
- evaluate both the final answer and the trajectory of actions;
- ship with useful tracing, budgets, permissions, and failure handling.

## Product principles

- Teach concepts before products, then show how products implement the concepts.
- Use one complete reference agent throughout the core path.
- Introduce alternatives only when the reader can compare them.
- Prefer executable examples and visible state changes over abstract claims.
- Treat tools, permissions, failures, and evaluation as core architecture, not optional hardening.
- Design for momentum: every major section invites the reader to do, change, reveal, compare, or build something.
- Keep platform guidance versioned and linked to current primary documentation.
- Never imply feature parity between platforms when their contracts differ.
- Accessible by keyboard, touch, screen reader, reduced motion, and print.
- Stay useful even when a specific framework or model changes.

---

## Information architecture

**1. Start here** — What an agent is and is not. Agent versus chatbot, automation, workflow, copilot. The "Should this be an agent?" decision path. Visual map of the guide.

**2. Agent foundations** — Goals, instructions, context, models, stop conditions. The observe–decide–act–verify loop. Deterministic orchestration versus model-directed decisions. State, sessions, memory, durable work. Single-agent foundations before multi-agent patterns.

**3. Tools** — What makes software callable. Names, descriptions, schemas, validation, structured results. Read versus consequential write. Errors, timeouts, cancellation, retries, idempotency, reconciliation. Auth, secret boundaries, least privilege, approval gates. Unit, contract, integration, and trajectory testing.

**4. Skills** — Instructions versus prompts versus tools versus skills. Skill anatomy: metadata, activation guidance, instructions, scripts, references, templates, assets. Progressive disclosure and context efficiency. Creating, testing, versioning, installing, sharing, maintaining. Trust considerations for third-party skills. One small skill built and used by the reference agent.

**5. MCP** — Why MCP exists and what it does not solve. Host, client, server responsibilities. Tools, resources, prompts, elicitation, sampling, logging, notifications, durable tasks. Local versus remote servers and transports. Discovery, capability negotiation, invocation, results. Auth, approvals, tenancy, untrusted content. Connecting, inspecting, testing, troubleshooting. Building one minimal server.

**6. The wider protocol stack** *(new in v2 — one page, scope-boundary only)* — Where MCP ends and agent-to-agent coordination begins: A2A, WebMCP, MCP Apps, and the payments protocols. What each layer is for, why v1 of this guide stops at MCP, and where to read further. No implementation. This page exists so the guide does not read as unaware of the ecosystem above it.

**7. Platforms and frameworks** — Concept-first comparison of model APIs, agent SDKs, coding-agent platforms, workflow frameworks, MCP hosts, observability products. Platform cards covering intended user, abstraction level, languages, tool model, state model, approvals, MCP support, tracing, deployment, lock-in. Guided selection by use case, never a universal ranking. One maintained implementation path plus labeled adapters. Version and "last verified" marker on every platform-specific page.

**8. Build the reference agent** — Define user, job, inputs, outputs, boundaries, measurable success. Smallest useful loop. First read-only tool. Consequential action with preview and approval. Reusable skill. One MCP server. Durable state only where required. Failure and unknown-outcome handling. Final result with evidence and a clear stop condition.

**9. Safety and control** — Threat modeling and trust boundaries. Prompt injection and untrusted tool or resource content. Capability scoping, sandboxing, secret isolation, network boundaries. Human approval that actually gates the side effect. Audit records, action receipts, undo paths, incident response. Cost, time, iteration, and tool-call budgets.

**10. Evaluation and observability** — Defining success before selecting metrics. Deterministic checks, human review, model-based evaluation. Final-output, single-step, tool-contract, and trajectory evaluation. Curated cases, regression suites, adversarial cases, production feedback. Traces, spans, costs, latency, tool failures, privacy-aware logging. Turning a real failure into a reproducible test.

**11. Ship and improve** — Local development, environment config, deployment choices. Queues, durable jobs, scheduling, concurrency, recovery. Versioning prompts, tools, skills, schemas, models. Rollout, monitoring, kill switches, rollback. Production-readiness checklist. Where to go next.

---

## Interactive experiences

Tiered. Signature experiences get full design, motion, and polish. Light experiences are small, useful, and deliberately cheap.

### Signature — five, fully built

1. **Agent loop simulator** — step through observation, decision, tool call, result, verification, stop conditions. *Shipped first; this is the flagship.*
2. **Tool contract lab** — edit a tool name, description, input schema, result, and error contract; the lab highlights ambiguity and risk.
3. **MCP explorer** — one experience covering both architecture (discovery and invocation across host, client, server) and a hands-on connect / inspect / call / troubleshoot lab against a safe example server.
4. **Failure-path simulator** — compare timeout, tool error, permission denial, malformed result, and partial completion.
5. **Blueprint export** — produces a readable architecture brief and build checklist from the reader's choices, exportable as Markdown, JSON, and a shareable image.

### Light — small components, no bespoke art direction

6. Agent-or-workflow diagnostic (decision tree)
7. Architecture canvas (structured form feeding the blueprint)
8. Permission and consequence map (sortable classification table)
9. Skill anatomy explorer (annotated expandable package)
10. Skill builder (template generator + validation checklist)
11. Platform chooser (filter over the comparison matrix)
12. Evaluation builder (criteria → starter test suite)
13. Glossary and terminology map (linked, searchable)

Every interaction has a non-interactive textual equivalent and works without an account or API key. Each signature experience gets its own URL and OG image so it can be shared independently of the guide.

The delight layer — entrance choreography, tactile controls, animated state transitions, checkpoint moments, visual continuity, final blueprint reveal — applies to signature experiences. It must reinforce understanding and progress, never compete with content.

---

## Platform coverage strategy

Curated, not encyclopedic. Maximum 12 maintained cards.

**Categories:** direct model and response APIs; agent SDKs and orchestration frameworks; coding-agent and workspace-agent platforms; MCP hosts, SDKs, servers, inspectors, registries; evaluation, tracing, observability; deployment and durable execution.

**Selection criteria:** active official documentation; clear relevance to a learning objective; meaningfully different architecture or developer experience; a runnable path that can be verified; enough stability to maintain responsibly.

**Rules:** official documentation is the authority. Record version and verification date for every example. Separate fact from interpretation. Prefer a comparison matrix over repetitive tutorials. One primary code path; alternatives get focused adapters. No copied documentation — explain in original language and link to primary sources.

---

## Reference agent specification

**Job:** triage incoming issues on a frozen, bundled sample repository snapshot.

| Requirement | How it is satisfied |
|---|---|
| Recognizable job | Issue triage is a real, tedious, widely understood task. |
| Useful read-only start | Read issues, cluster by theme, propose labels and priority. |
| One consequential action | Post a triage comment or apply a label — behind an approval gate with preview and diff. |
| Structured tools | `list_issues`, `read_issue`, `search_similar`, `propose_label`, `apply_label`. |
| Reusable skill | A triage rubric skill: severity definitions, label taxonomy, duplicate heuristics. |
| Natural MCP use | A local issue-store MCP server exposing the snapshot as resources and tools. |
| Deterministic checks | Rubric conformance against a hand-labeled golden set of 40 issues. |
| Interesting failures | Ambiguous issue, duplicate, malformed response, rate limit, empty result, oversized thread. |
| Safe local run | Frozen snapshot, no network, no real repository, no irreversible action. |
| Small enough | Under 500 lines of agent code excluding tests. |

---

## Delivery schedule

Weeks are seven-day blocks from the project start date. Every phase ends with a working, deployed site — there is no phase whose output is only documents.

### Phase 1 — Spine and flagship lab
**Week 1–2 · Jul 25 – Aug 7**

- Stand up the site skeleton, routing, content pipeline, and design tokens.
- Lock art direction: typography, color, illustration language, spacing, navigation, motion vocabulary. Explore directions using real content, decide, move on.
- Build and ship the **agent loop simulator** as a standalone, linkable experience.
- Write the README front door: descriptor, demo GIF, live URL above the fold, roadmap.
- Create `docs/sources.md` and begin the primary-source ledger with verification dates.
- Draft the curriculum outline — one page mapping module → outcome → interaction → checkpoint. Not a specification document.
- **First public deploy, with a work-in-progress banner.**

Deliverables: live site, flagship interaction, README and launch packet v1, art direction, source ledger, curriculum outline.

Exit: a stranger can open one URL, use the loop simulator, and understand what this project is within thirty seconds.

**Public milestone SL-1:** share the loop simulator on its own. Measure what lands.

### Phase 2 — Foundations and reference-agent skeleton
**Week 3 · Aug 8 – Aug 14**

- Write and ship Start Here and Agent Foundations.
- Build the agent-or-workflow diagnostic and architecture canvas.
- Create the frozen sample dataset and the first read-only reference-agent capability.
- Establish example, citation, testing, and versioning conventions for all later modules.

Exit: a new reader can explain the architecture and run the first useful capability from a clean checkout.

### Phase 3 — Tools
**Week 4 · Aug 15 – Aug 21**

- Write and ship the tool-design curriculum.
- Build the **tool contract lab**.
- Add read/write distinctions, approvals, failures, retries, and contract tests to the reference agent.
- Build the permission and consequence map.

Exit: the reader can design a tool another agent can use without hidden assumptions.

**Public milestone SL-2:** share the tool contract lab.

### Phase 4 — Skills and MCP
**Week 5 · Aug 22 – Aug 28**

- Write and ship the skill curriculum, anatomy explorer, and skill builder.
- Build, test, and use one small skill in the reference agent. Document third-party trust checks.
- Write and ship the MCP conceptual path.
- Build the **MCP explorer** — architecture plus connect/inspect/call/troubleshoot.
- Build one minimal MCP server and connect it to the reference agent.

Exit: the reader can explain the boundary, connect safely, inspect capabilities, and build a server.

### Phase 5 — Platforms, protocol stack, and safety
**Week 6 · Aug 29 – Sep 4**

- Complete platform cards, comparison matrix, and platform chooser. Verify every claim against current official documentation and stamp it.
- Write the wider-protocol-stack page (A2A, WebMCP, MCP Apps, payments protocols) as a scope boundary with links.
- Write and ship the safety and control path.
- Build the **failure-path simulator**.

Exit: the reader can choose a platform for a stated use case and knows what sits above MCP.

### Phase 6 — Evaluation, shipping, and the blueprint
**Week 7 · Sep 5 – Sep 11**

- Write and ship evaluation, observability, and deployment paths.
- Build the evaluation builder.
- Build the **blueprint export**, including the shareable image form.
- Add budgets, durable state, audit records, and recovery to the reference agent where justified.
- Complete production-readiness and incident-response checklists.

Exit: the guide shows how to know whether the agent works and how to limit damage when it does not.

### Phase 7 — Integration, re-verification, and QA
**Week 8 · Sep 12 – Sep 18**

- Join every module into one coherent journey; verify cross-links and progression.
- **Re-verify every platform-specific and protocol claim.** No claim older than 14 days ships. Verification dates render on the page, not only in the ledger.
- Run every example from a clean environment on a clean machine profile.
- Full accessibility pass: keyboard, screen reader, touch, mobile, reduced motion, print, offline-readable fallbacks.
- Review animation timing, feedback, visual continuity, and perceived speed across the whole journey.
- Cut interactions that feel ornamental. Deepen the ones that carry learning.
- Beginner, experienced-developer, maintainer, and security reviews.

Exit: no placeholder modules, broken paths, unverified examples, or unsupported claims.

### Phase 8 — Launch
**Week 9 · Sep 19 – Sep 21**

- Prepare the launch review and **request explicit approval before any publication or remote mutation.**
- Publish. Confirm live experience, metadata, links, examples, and downloadable blueprint.
- Post the launch packet to chosen channels.
- Open channels for corrections and reader feedback. Publish the maintenance and version-review policy.

Exit: a reader can discover the guide, complete the core path, and leave with a usable blueprint and verified example.

### Phase 9 — Maintenance
**Ongoing**

- Review fast-changing platform pages on a defined cadence.
- Test examples and links automatically.
- Record breaking changes and deprecations visibly.
- Turn recurring reader confusion into guide improvements.
- Add advanced topics only after the core path stays healthy.

---

## Operating rules for automated runs

- **One unit per run.** One module, one interaction, or one verified integration. Finish it, verify it, commit it, stop. Do not start a second unit.
- **DONE means frozen.** Never modify a file marked DONE in `PROGRESS.md` unless the run's task is explicitly a revision of it. No opportunistic refactors or re-styling of shipped work.
- **Commit every run.** Conventional message, scoped to the unit. Local only.
- **Record decisions.** Any judgment call not covered here goes in `DECISIONS.md` with one line of reasoning.
- **Pause only for:** credentials or paid services; push, publish, rename, or delete of remote state; a locked decision that turns out to be wrong; a genuine conflict between two requirements here.

## Verification gates

Evidence required. Pasted command output in `PROGRESS.md`. A completion claim without output is a failed run.

- `pnpm build && pnpm typecheck` — pass
- Playwright smoke test for every new interaction, including keyboard-only operation
- axe-core scan on changed pages — zero serious or critical violations
- `prefers-reduced-motion` honored and manually confirmed for anything animated
- Lighthouse on changed pages — performance and accessibility both ≥ 95
- Link check across changed content
- Every technical claim carries a source URL and `verified: YYYY-MM-DD` in `docs/sources.md`

---

## Definition of done

- The beginner path works start to finish.
- The guide clearly distinguishes agents, tools, skills, MCP, platforms, and workflows, and honestly marks where MCP ends.
- The reference agent runs from a clean environment; its tools, skill, and MCP integration are tested.
- Every platform claim is current, sourced, and versioned within 14 days of launch.
- All five signature interactions are polished, shareable, and independently linkable.
- All interactions have accessible textual equivalents.
- The site has a distinctive visual identity and works well on desktop and mobile.
- The blueprint is useful outside the website.
- Safety, evaluation, tracing, deployment, and maintenance are included.
- No hidden setup steps, placeholder chapters, or claims based on marketing language.

## Scope guardrails

- No documenting every agent product. Twelve cards is the ceiling.
- No rankings based on popularity alone.
- No multi-agent implementation in the core path. The protocol-stack page is the boundary.
- No account, API key, or paid service required for any conceptual interaction.
- No reducing the experience to static documentation to save development time.
- No sacrificing accessibility, clarity, or performance for visual spectacle.
- No copied platform documentation.
- No remote commit, push, publication, or repository-level mutation without explicit review.