import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type TraceStep = {
  id: string;
  stage: string;
  verb: string;
  title: string;
  summary: string;
  artifactLabel: string;
  artifact: string;
  check: string;
};

const trace: TraceStep[] = [
  {
    id: "observe",
    stage: "01",
    verb: "Observe",
    title: "A report enters the queue.",
    summary:
      "Issue #184 says the CLI exits successfully after a failed config parse. The report includes a minimal command, terminal output, and version.",
    artifactLabel: "Incoming signal",
    artifact: "agent-run --config broken.yml\n→ config error: line 4\n→ process exited 0",
    check: "Enough evidence exists to investigate without asking the reporter to repeat work.",
  },
  {
    id: "decide",
    stage: "02",
    verb: "Decide",
    title: "Search before classifying.",
    summary:
      "The agent chooses a read-only similarity search. It does not propose a label yet because a prior report may already own the failure.",
    artifactLabel: "Decision record",
    artifact: "next: search_similar\nreason: avoid duplicate triage\nwrite_access: false",
    check: "The next move is narrow, reversible, and tied to the issue-triage goal.",
  },
  {
    id: "tool",
    stage: "03",
    verb: "Tool call",
    title: "Call one bounded tool.",
    summary:
      "The request carries only the terms needed to compare the symptom against the frozen issue snapshot.",
    artifactLabel: "Tool input",
    artifact:
      '{\n  "query": "config parse exits 0",\n  "limit": 3\n}',
    check: "The input is inspectable and cannot modify the repository snapshot.",
  },
  {
    id: "result",
    stage: "04",
    verb: "Result",
    title: "Two candidates come back.",
    summary:
      "Issue #091 describes a different parser crash. Issue #133 matches the exit-code symptom, but only on Windows and was closed after a platform-specific fix.",
    artifactLabel: "Structured result",
    artifact:
      "091 · parser panic · similarity 0.62\n133 · exit code on Windows · similarity 0.81",
    check: "The result is usable, but similarity alone is not proof of a duplicate.",
  },
  {
    id: "verify",
    stage: "05",
    verb: "Verify",
    title: "Test the candidate explanation.",
    summary:
      "The current report is on macOS and reproduces on the latest bundled version. The prior fix was Windows-only, so the duplicate hypothesis does not hold.",
    artifactLabel: "Verification",
    artifact: "same symptom: yes\nsame environment: no\nsame fix path: no\nexact duplicate: no",
    check: "Evidence rules out the tempting shortcut and supports a fresh bug classification.",
  },
  {
    id: "stop",
    stage: "06",
    verb: "Stop",
    title: "Propose; do not apply.",
    summary:
      "The agent proposes the labels bug and cli, records medium priority, and stops. Applying labels is consequential and remains behind a separate approval gate.",
    artifactLabel: "Final proposal",
    artifact: "labels: bug, cli\npriority: medium\nside effects: none\nstatus: awaiting review",
    check: "The read-only goal is complete, the evidence is attached, and no further tool call is justified.",
  },
];

export default function AgentLoopSimulator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = useReducedMotion();
  const activeStep = trace[activeIndex];

  const chooseStep = (index: number, moveFocus = false) => {
    const nextIndex = Math.min(Math.max(index, 0), trace.length - 1);
    setActiveIndex(nextIndex);
    if (moveFocus) {
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const handleStageKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % trace.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + trace.length) % trace.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = trace.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      chooseStep(nextIndex, true);
    }
  };

  return (
    <section className="simulator" aria-labelledby="simulator-heading">
      <div className="simulator-heading">
        <div>
          <p className="sim-eyebrow">Frozen trace · issue #184</p>
          <h2 id="simulator-heading">Inspect one turn at a time.</h2>
        </div>
        <p className="sim-instruction" id="stage-instructions">
          Use arrow keys to move between stages.
        </p>
      </div>

      <div className="simulator-frame">
        <aside className="issue-brief" aria-labelledby="issue-brief-title">
          <div className="brief-header">
            <span>Input / 184</span>
            <span className="brief-state">untriaged</span>
          </div>
          <div className="brief-body">
            <p className="brief-kicker">Frozen sample repository</p>
            <h3 id="issue-brief-title">
              Config errors return a successful exit code
            </h3>
            <dl>
              <div>
                <dt>Surface</dt>
                <dd>CLI</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>2.4.0</dd>
              </div>
              <div>
                <dt>Platform</dt>
                <dd>macOS 15</dd>
              </div>
            </dl>
          </div>
          <p className="brief-foot">Snapshot only · no network · no writes</p>
        </aside>

        <div className="trace-workbench">
          <div
            className="stage-rail"
            role="tablist"
            aria-label="Agent loop stages"
            aria-describedby="stage-instructions"
          >
            {trace.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <div className="stage-slot" key={step.id}>
                  <button
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    type="button"
                    role="tab"
                    id={`stage-tab-${step.id}`}
                    aria-controls="trace-panel"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => chooseStep(index)}
                    onKeyDown={(event) => handleStageKeyDown(event, index)}
                  >
                    <span className="stage-number">{step.stage}</span>
                    <span>{step.verb}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="trace-panel-wrap">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                className="trace-panel"
                id="trace-panel"
                role="tabpanel"
                aria-labelledby={`stage-tab-${activeStep.id}`}
                key={activeStep.id}
                initial={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 18, rotate: -0.4 }
                }
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: -10, rotate: 0.25 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                }
              >
                <header className="panel-header">
                  <div>
                    <p>
                      Stage {activeStep.stage} / {trace.length.toString().padStart(2, "0")}
                    </p>
                    <span>{activeStep.verb}</span>
                  </div>
                  <span className="read-only-chip">
                    {activeStep.id === "stop" ? "approval boundary" : "read only"}
                  </span>
                </header>

                <div className="panel-content">
                  <h3>{activeStep.title}</h3>
                  <p className="panel-summary">{activeStep.summary}</p>
                  <div className="artifact-block">
                    <p>{activeStep.artifactLabel}</p>
                    <pre><code>{activeStep.artifact}</code></pre>
                  </div>
                  <div className="verification-note">
                    <span aria-hidden="true">✓</span>
                    <p>
                      <strong>Loop check</strong>
                      {activeStep.check}
                    </p>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          <div className="sim-controls">
            <button
              type="button"
              className="secondary-control"
              disabled={activeIndex === 0}
              onClick={() => chooseStep(activeIndex - 1)}
            >
              <span aria-hidden="true">←</span> Previous
            </button>
            <p aria-live="polite" aria-atomic="true">
              {activeStep.verb}, stage {activeIndex + 1} of {trace.length}
            </p>
            <button
              type="button"
              className="primary-control"
              disabled={activeIndex === trace.length - 1}
              onClick={() => chooseStep(activeIndex + 1)}
            >
              {activeIndex === trace.length - 1 ? "Loop stopped" : "Next stage"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      <details className="trace-transcript">
        <summary>
          Read the complete trace
          <span>Text-only equivalent</span>
        </summary>
        <ol>
          {trace.map((step) => (
            <li key={step.id}>
              <p>
                {step.stage} / {step.verb}
              </p>
              <h3>{step.title}</h3>
              <p>{step.summary}</p>
              <p><strong>Loop check:</strong> {step.check}</p>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
