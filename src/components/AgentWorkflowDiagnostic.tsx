import {
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from "react";

const STORAGE_KEY = "building-agent-systems:start-here-diagnostic:v1";
const STORAGE_VERSION = 1 as const;

type Boundary = "read" | "propose" | "approve" | "independent";
type Answer = "yes" | "no";
type QuestionId = "response" | "specified" | "human" | "bounded";
type ClassificationId = "chatbot" | "workflow" | "copilot" | "agent" | "human";
type DiagnosticPhase = "framing" | "questions" | "result";

type Destination =
  | { type: "question"; id: QuestionId }
  | { type: "result"; id: ClassificationId };

type Question = {
  index: string;
  title: string;
  help: string;
  yes: Destination;
  no: Destination;
};

type DiagnosticState = {
  version: typeof STORAGE_VERSION;
  phase: DiagnosticPhase;
  uncertainty: string;
  boundary: Boundary | "";
  currentQuestion: QuestionId;
  history: QuestionId[];
  answers: Partial<Record<QuestionId, Answer>>;
  classification: ClassificationId | null;
};

const questions: Record<QuestionId, Question> = {
  response: {
    index: "01",
    title: "Does the job end when a response is delivered?",
    help: "There is no owned multi-step outcome and no action after the answer.",
    yes: { type: "result", id: "chatbot" },
    no: { type: "question", id: "specified" },
  },
  specified: {
    index: "02",
    title: "Can the correct path and its branches be specified in advance?",
    help: "The exceptions are known, testable, and cheaper to encode than interpret.",
    yes: { type: "result", id: "workflow" },
    no: { type: "question", id: "human" },
  },
  human: {
    index: "03",
    title: "Will a person remain available to choose every next move?",
    help: "The model can prepare work, while the person keeps sequence and judgment.",
    yes: { type: "result", id: "copilot" },
    no: { type: "question", id: "bounded" },
  },
  bounded: {
    index: "04",
    title: "Can independent steps be bounded, observed, verified, and stopped?",
    help: "Name the tools, permissions, evidence, budgets, stop conditions, and handoff.",
    yes: { type: "result", id: "agent" },
    no: { type: "result", id: "human" },
  },
};

const boundaries: Array<{
  id: Boundary;
  label: string;
  description: string;
}> = [
  {
    id: "read",
    label: "Read only",
    description: "Inspect information without proposing or changing it.",
  },
  {
    id: "propose",
    label: "Propose",
    description: "Prepare a change for someone else to review and perform.",
  },
  {
    id: "approve",
    label: "Change after approval",
    description: "Perform a named change only after a person confirms it.",
  },
  {
    id: "independent",
    label: "Change independently",
    description: "Perform a bounded change without waiting for review.",
  },
];

const classifications: Record<
  ClassificationId,
  { label: string; description: string }
> = {
  chatbot: {
    label: "Chatbot",
    description:
      "The job ends with one response. Keep the user in control of every move after it.",
  },
  workflow: {
    label: "Automation / workflow",
    description:
      "The correct route is knowable in advance. Use one automation for a single action or a deterministic workflow for several.",
  },
  copilot: {
    label: "Copilot",
    description:
      "A person can stay at the controls while the model drafts, explains, or prepares each move.",
  },
  agent: {
    label: "Agent candidate",
    description:
      "The route must adapt during the run, and its independent steps can be controlled. Start with the narrowest useful authority.",
  },
  human: {
    label: "Human-led for now",
    description:
      "The independent work cannot yet be controlled well enough. Keep it human-led or shrink the job until the boundary is clear.",
  },
};

const initialState: DiagnosticState = {
  version: STORAGE_VERSION,
  phase: "framing",
  uncertainty: "",
  boundary: "",
  currentQuestion: "response",
  history: [],
  answers: {},
  classification: null,
};

const questionIds = Object.keys(questions) as QuestionId[];
const classificationIds = Object.keys(classifications) as ClassificationId[];
const boundaryIds = boundaries.map(({ id }) => id);

function isStoredState(value: unknown): value is DiagnosticState {
  if (!value || typeof value !== "object") return false;

  const state = value as Partial<DiagnosticState>;
  const answers = state.answers ? Object.entries(state.answers) : [];

  return (
    state.version === STORAGE_VERSION &&
    (state.phase === "framing" ||
      state.phase === "questions" ||
      state.phase === "result") &&
    typeof state.uncertainty === "string" &&
    (state.boundary === "" || boundaryIds.includes(state.boundary as Boundary)) &&
    questionIds.includes(state.currentQuestion as QuestionId) &&
    Array.isArray(state.history) &&
    state.history.every((id) => questionIds.includes(id)) &&
    answers.every(
      ([id, answer]) =>
        questionIds.includes(id as QuestionId) &&
        (answer === "yes" || answer === "no"),
    ) &&
    (state.classification === null ||
      classificationIds.includes(state.classification as ClassificationId))
  );
}

export default function AgentWorkflowDiagnostic() {
  const [state, setState] = useState<DiagnosticState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [storageMessage, setStorageMessage] = useState(
    "Not saved yet · entries stay in this browser",
  );
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const shouldMoveFocus = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const candidate: unknown = JSON.parse(stored);
        if (isStoredState(candidate)) {
          setState(candidate);
          setStorageMessage(
            candidate.phase === "result"
              ? "Receipt restored from this device"
              : "Draft restored from this device",
          );
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      setStorageMessage("Local saving is unavailable · the diagnostic still works");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      const isEmpty =
        state.phase === "framing" &&
        state.uncertainty === "" &&
        state.boundary === "";

      if (isEmpty) {
        window.localStorage.removeItem(STORAGE_KEY);
        setStorageMessage("Not saved yet · entries stay in this browser");
        return;
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageMessage(
        state.phase === "result"
          ? "Receipt saved on this device"
          : "Draft saved on this device",
      );
    } catch {
      setStorageMessage("Local saving is unavailable · the diagnostic still works");
    }
  }, [hydrated, state]);

  useEffect(() => {
    if (!shouldMoveFocus.current) return;
    stepHeadingRef.current?.focus();
    shouldMoveFocus.current = false;
  }, [state.phase, state.currentQuestion, state.classification]);

  const moveTo = (nextState: DiagnosticState) => {
    shouldMoveFocus.current = true;
    setState(nextState);
  };

  const startQuestions = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const uncertainty = state.uncertainty.trim();
    if (!uncertainty || !state.boundary) return;

    moveTo({
      ...state,
      phase: "questions",
      uncertainty,
      currentQuestion: "response",
      history: [],
      answers: {},
      classification: null,
    });
  };

  const answerQuestion = (answer: Answer) => {
    const questionId = state.currentQuestion;
    const destination = questions[questionId][answer];
    const answers = { ...state.answers, [questionId]: answer };
    const history = [...state.history, questionId];

    if (destination.type === "result") {
      moveTo({
        ...state,
        phase: "result",
        history,
        answers,
        classification: destination.id,
      });
      return;
    }

    moveTo({
      ...state,
      currentQuestion: destination.id,
      history,
      answers,
    });
  };

  const goBack = () => {
    if (state.phase === "questions" && state.history.length === 0) {
      moveTo({ ...state, phase: "framing" });
      return;
    }

    const previousQuestion = state.history.at(-1);
    if (!previousQuestion) return;

    const answers = { ...state.answers };
    delete answers[previousQuestion];

    moveTo({
      ...state,
      phase: "questions",
      currentQuestion: previousQuestion,
      history: state.history.slice(0, -1),
      answers,
      classification: null,
    });
  };

  const clearDiagnostic = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // State still clears when storage is unavailable.
    }
    moveTo(initialState);
  };

  const phaseIndex =
    state.phase === "framing" ? 0 : state.phase === "questions" ? 1 : 2;
  const currentQuestion = questions[state.currentQuestion];
  const classification = state.classification
    ? classifications[state.classification]
    : null;
  const boundary = boundaries.find(({ id }) => id === state.boundary);

  return (
    <section
      className="diagnostic-section"
      id="diagnostic"
      aria-labelledby="diagnostic-title"
    >
      <div className="diagnostic-heading">
        <div>
          <p className="module-kicker">Light lab · saved locally</p>
          <h2 id="diagnostic-title">Classify one real task.</h2>
        </div>
        <p>
          Name the uncertainty and the action boundary, then follow the same
          decision path. Your receipt stays on this device.
        </p>
      </div>

      <div className="diagnostic-frame">
        <aside className="diagnostic-rail" aria-label="Diagnostic progress">
          <p>Agent / workflow diagnostic</p>
          <ol>
            {[
              ["Frame", "Name the boundary"],
              ["Decide", "Follow the branches"],
              ["Receipt", "Keep the classification"],
            ].map(([label, description], index) => (
              <li
                key={label}
                className={index === phaseIndex ? "diagnostic-stage-active" : ""}
                aria-current={index === phaseIndex ? "step" : undefined}
              >
                <span>{(index + 1).toString().padStart(2, "0")}</span>
                <strong>{label}</strong>
                <small>{description}</small>
              </li>
            ))}
          </ol>
          <p className="diagnostic-local-note">No account · no upload</p>
        </aside>

        <div className="diagnostic-workbench">
          {state.phase === "framing" && (
            <form onSubmit={startQuestions} autoComplete="off">
              <p className="diagnostic-step-label">Frame · before choosing a label</p>
              <h3 ref={stepHeadingRef} tabIndex={-1}>
                Where does the certainty end?
              </h3>

              <label className="diagnostic-field" htmlFor="diagnostic-uncertainty">
                <span>What cannot be encoded reliably in advance?</span>
                <textarea
                  id="diagnostic-uncertainty"
                  name="uncertainty"
                  rows={3}
                  maxLength={240}
                  required
                  value={state.uncertainty}
                  onChange={(event) => {
                    const uncertainty = event.currentTarget.value;
                    setState((current) => ({ ...current, uncertainty }));
                  }}
                  aria-describedby="diagnostic-uncertainty-hint"
                  placeholder="Example: deciding whether two bug reports describe the same failure"
                />
                <small id="diagnostic-uncertainty-hint">
                  One concrete sentence · {state.uncertainty.length} / 240
                </small>
              </label>

              <fieldset className="diagnostic-boundaries">
                <legend>What is the furthest safe action boundary?</legend>
                <div className="diagnostic-boundary-grid">
                  {boundaries.map((option) => (
                    <label key={option.id}>
                      <input
                        type="radio"
                        name="boundary"
                        value={option.id}
                        checked={state.boundary === option.id}
                        onChange={() =>
                          setState((current) => ({
                            ...current,
                            boundary: option.id,
                          }))
                        }
                        required
                      />
                      <span>
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="diagnostic-actions diagnostic-actions-end">
                <button className="diagnostic-primary" type="submit">
                  Start the decision path <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          )}

          {state.phase === "questions" && (
            <div className="diagnostic-question-panel">
              <p className="diagnostic-step-label">
                Question {currentQuestion.index} / 04
              </p>
              <h3 ref={stepHeadingRef} tabIndex={-1}>
                {currentQuestion.title}
              </h3>
              <p className="diagnostic-question-help">{currentQuestion.help}</p>

              <div className="diagnostic-answer-grid">
                <button
                  className="diagnostic-answer"
                  type="button"
                  onClick={() => answerQuestion("yes")}
                >
                  <span>Yes</span>
                  <small>Take this branch</small>
                </button>
                <button
                  className="diagnostic-answer"
                  type="button"
                  onClick={() => answerQuestion("no")}
                >
                  <span>No</span>
                  <small>Continue the test</small>
                </button>
              </div>

              <div className="diagnostic-actions">
                <button
                  className="diagnostic-secondary"
                  type="button"
                  onClick={goBack}
                >
                  <span aria-hidden="true">←</span> Back
                </button>
                <p>{state.history.length} answer{state.history.length === 1 ? "" : "s"} recorded</p>
              </div>
            </div>
          )}

          {state.phase === "result" && classification && boundary && (
            <div className="diagnostic-result" aria-live="polite">
              <p className="diagnostic-step-label">Your classification</p>
              <h3 ref={stepHeadingRef} tabIndex={-1}>
                {classification.label}
              </h3>
              <p className="diagnostic-result-summary">{classification.description}</p>

              <div className="diagnostic-receipt">
                <p>Local receipt · BAS-YOURS</p>
                <dl>
                  <div>
                    <dt>Uncertainty</dt>
                    <dd>{state.uncertainty}</dd>
                  </div>
                  <div>
                    <dt>Action boundary</dt>
                    <dd>{boundary.label}</dd>
                  </div>
                  <div>
                    <dt>Classification</dt>
                    <dd>{classification.label}</dd>
                  </div>
                </dl>
              </div>

              <div className="diagnostic-actions diagnostic-result-actions">
                <button
                  className="diagnostic-secondary"
                  type="button"
                  onClick={goBack}
                >
                  <span aria-hidden="true">←</span> Revise last answer
                </button>
                <button
                  className="diagnostic-clear"
                  type="button"
                  onClick={clearDiagnostic}
                >
                  Clear saved receipt
                </button>
              </div>
            </div>
          )}

          <div className="diagnostic-storage" aria-live="polite">
            <span aria-hidden="true">●</span>
            <p>{storageMessage}</p>
          </div>
        </div>
      </div>

      <noscript>
        <p className="diagnostic-noscript">
          The interactive diagnostic needs JavaScript. The complete text path
          below contains every question and outcome.
        </p>
      </noscript>
    </section>
  );
}
