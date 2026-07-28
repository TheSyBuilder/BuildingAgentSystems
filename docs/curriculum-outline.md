# Curriculum outline

**Status:** v1 working map

**Version:** 1.0

**Mapped:** 2026-07-28

**Reader promise:** Understand what an agent actually is, build one that does something real, and know how to tell whether it works.

This is the v1 journey map, not module prose. Each checkpoint leaves the reader with observable evidence or a reusable artifact. The frozen issue-triage agent carries that work from foundations through production.

| Module | Reader outcome | Interaction | Checkpoint |
|---|---|---|---|
| 1. Start here | Decide whether a problem needs an agent, a deterministic workflow, or neither. | **Light:** Agent-or-workflow diagnostic; glossary and terminology map | Classify one proposed task and record the deciding uncertainty, action boundary, and reason for the choice. |
| 2. Agent foundations | Explain the observe–decide–act–verify loop and define goals, context, state, and stop conditions. | **Signature:** Agent loop simulator; **Light:** Architecture canvas | Step through the frozen triage trace, identify the evidence used at every stage, and complete a first architecture canvas with an explicit stop condition. |
| 3. Tools | Design narrow tools with typed inputs, structured results, honest errors, and visible consequences. | **Signature:** Tool contract lab; **Light:** Permission and consequence map | Produce a reviewed `read_issue` contract, classify it as read-only, and show how invalid input, timeout, and unknown outcome are represented. |
| 4. Skills | Distinguish skills from prompts and tools, then package reusable guidance with clear activation and trust boundaries. | **Light:** Skill anatomy explorer and skill builder | Generate a triage-rubric skill package, validate its structure, and use it to classify one golden-set issue. |
| 5. MCP | Explain the host–client–server boundary and safely discover, inspect, invoke, and troubleshoot capabilities. | **Signature:** MCP explorer | Inspect the local issue-store server, read a snapshot resource, call one read-only tool, and explain where approval and untrusted content enter the flow. |
| 6. The wider protocol stack | Identify where MCP ends and where browser, app, agent-to-agent, and payment protocols begin. | **Light:** Protocol boundary view within the glossary and terminology map | Place four example exchanges at the correct layer and justify why the v1 reference build stops at MCP. |
| 7. Platforms and frameworks | Select an abstraction level and platform surface for a stated use case without assuming feature parity. | **Light:** Platform chooser | Produce a short list for one deployment scenario, citing the required runtime, tool, state, approval, tracing, and lock-in constraints. |
| 8. Build the reference agent | Assemble the smallest useful issue-triage agent and add capability without hiding control boundaries. | **Light:** Architecture canvas carried into the guided reference build | Run read-only triage on the frozen snapshot, review a proposed label or comment, and show that the consequential action cannot run before approval. |
| 9. Safety and control | Threat-model the agent and bound permissions, secrets, side effects, retries, and recovery. | **Signature:** Failure-path simulator; **Light:** Permission and consequence map | Handle permission denial, malformed result, timeout, and partial completion; produce an action receipt and a safe response for every path. |
| 10. Evaluation and observability | Define success before metrics, evaluate outputs and trajectories, and turn failures into regression cases. | **Light:** Evaluation builder | Create a starter suite from the golden set, inspect one trace, and convert one observed failure into a reproducible test with a pass condition. |
| 11. Ship and improve | Prepare a bounded production plan with budgets, monitoring, rollout, recovery, and maintenance. | **Signature:** Blueprint export | Export the completed architecture brief and build checklist as Markdown, JSON, and PNG, then pass the production-readiness checkpoint with named owners and limits. |

## Journey receipts

| After | Reader keeps |
|---|---|
| Foundations | Architecture canvas and explicit stop condition |
| Tools + skills + MCP | Tool contract, permission map, triage skill, and inspected server receipt |
| Reference build + safety | Working local agent, approval preview, failure responses, and action receipt |
| Evaluation + shipping | Regression starter suite, trace review, production checklist, and exportable blueprint |

## Progression rule

A module is complete only when its checkpoint can be shown, run, or exported. “Go deeper” material may expand the reasoning, but it cannot replace the core checkpoint or introduce a second required implementation path.
