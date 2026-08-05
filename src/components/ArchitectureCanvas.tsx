import {
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from "react";

const STORAGE_KEY = "building-agent-systems:architecture-canvas:v1";
const STORAGE_VERSION = 1 as const;
const REVIEW_STEP = 3;

type Authority = "read" | "propose" | "approve" | "independent";

type CanvasValues = {
  workingTitle: string;
  goal: string;
  successEvidence: string;
  instructions: string;
  context: string;
  modelChoice: string;
  deterministicShell: string;
  authority: Authority | "";
  runState: string;
  persistence: string;
  stopConditions: string;
  handoffReceipt: string;
};

type TextField = Exclude<keyof CanvasValues, "authority">;

type CanvasState = {
  version: typeof STORAGE_VERSION;
  step: number;
  values: CanvasValues;
};

type FieldDefinition = {
  id: TextField;
  label: string;
  hint: string;
  placeholder: string;
  rows?: number;
};

const textFields: Record<TextField, FieldDefinition> = {
  workingTitle: {
    id: "workingTitle",
    label: "Working title",
    hint: "A short name for the job, not the technology.",
    placeholder: "Example: Read-only issue triage",
  },
  goal: {
    id: "goal",
    label: "Goal",
    hint: "Name the observable outcome and who needs it.",
    placeholder: "Propose one label and priority a maintainer can review.",
  },
  successEvidence: {
    id: "successEvidence",
    label: "Success evidence",
    hint: "List what would prove the outcome is correct.",
    placeholder: "A valid label, stated priority, cited facts, and rationale.",
  },
  instructions: {
    id: "instructions",
    label: "Instructions",
    hint: "State priorities, policies, and forbidden behavior.",
    placeholder: "Separate fact from inference; do not claim a duplicate without a match.",
  },
  context: {
    id: "context",
    label: "Context",
    hint: "Include only evidence needed for the current decision.",
    placeholder: "Current issue, label taxonomy, rubric, and retrieved similar issues.",
  },
  modelChoice: {
    id: "modelChoice",
    label: "Model choice",
    hint: "Describe the uncertain choice that benefits from interpretation.",
    placeholder: "Choose the next useful read and draft a supported proposal.",
  },
  deterministicShell: {
    id: "deterministicShell",
    label: "Deterministic shell",
    hint: "Keep known sequence, validation, permissions, and limits in code.",
    placeholder: "Validate inputs and outputs, execute allowlisted tools, and count steps.",
  },
  runState: {
    id: "runState",
    label: "Run state",
    hint: "Name the facts required to resume, verify, or explain this run.",
    placeholder: "Input ID, gathered evidence, tool results, step count, and pending handoff.",
  },
  persistence: {
    id: "persistence",
    label: "Persistence",
    hint: "Say what survives the run, for how long, and why.",
    placeholder: "No cross-session memory; retain only the exportable proposal receipt.",
  },
  stopConditions: {
    id: "stopConditions",
    label: "Stop conditions",
    hint: "Cover success, failure, limits, approval, and handoff.",
    placeholder: "Verified proposal, no useful read, denied result, budget reached, or approval required.",
  },
  handoffReceipt: {
    id: "handoffReceipt",
    label: "Handoff receipt",
    hint: "Specify what another person needs to inspect or continue the work.",
    placeholder: "Outcome, evidence, remaining uncertainty, actions taken, and approval request.",
  },
};

const steps: Array<{
  label: string;
  shortLabel: string;
  title: string;
  description: string;
  fields: TextField[];
}> = [
  {
    label: "Outcome",
    shortLabel: "Frame the job",
    title: "Name the outcome.",
    description: "Start with responsibility and proof. A model choice comes later.",
    fields: ["workingTitle", "goal", "successEvidence"],
  },
  {
    label: "Control",
    shortLabel: "Assign the owners",
    title: "Assign control.",
    description: "Separate the uncertain judgment from the runtime rules around it.",
    fields: ["instructions", "context", "modelChoice", "deterministicShell"],
  },
  {
    label: "Continuity",
    shortLabel: "Design the exits",
    title: "Design continuity.",
    description: "Choose what the run retains, how it stops, and what the next owner receives.",
    fields: ["runState", "persistence", "stopConditions", "handoffReceipt"],
  },
];

const authorities: Array<{
  id: Authority;
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
    description: "Prepare a change for someone else to perform.",
  },
  {
    id: "approve",
    label: "Change after approval",
    description: "Act only after a person confirms the exact change.",
  },
  {
    id: "independent",
    label: "Change independently",
    description: "Perform one bounded change without waiting for review.",
  },
];

const authorityIds = authorities.map(({ id }) => id);
const fieldIds = Object.keys(textFields) as TextField[];

const emptyValues: CanvasValues = {
  workingTitle: "",
  goal: "",
  successEvidence: "",
  instructions: "",
  context: "",
  modelChoice: "",
  deterministicShell: "",
  authority: "",
  runState: "",
  persistence: "",
  stopConditions: "",
  handoffReceipt: "",
};

const initialState: CanvasState = {
  version: STORAGE_VERSION,
  step: 0,
  values: emptyValues,
};

const receiptFields: Array<{
  id: Exclude<keyof CanvasValues, "workingTitle">;
  label: string;
}> = [
  { id: "goal", label: "Goal" },
  { id: "successEvidence", label: "Success evidence" },
  { id: "instructions", label: "Instructions" },
  { id: "context", label: "Context" },
  { id: "modelChoice", label: "Model choice" },
  { id: "deterministicShell", label: "Deterministic shell" },
  { id: "authority", label: "Authority" },
  { id: "runState", label: "Run state" },
  { id: "persistence", label: "Persistence" },
  { id: "stopConditions", label: "Stop conditions" },
  { id: "handoffReceipt", label: "Handoff receipt" },
];

function isStoredState(value: unknown): value is CanvasState {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<CanvasState>;
  if (
    candidate.version !== STORAGE_VERSION ||
    !Number.isInteger(candidate.step) ||
    Number(candidate.step) < 0 ||
    Number(candidate.step) > REVIEW_STEP ||
    !candidate.values ||
    typeof candidate.values !== "object"
  ) {
    return false;
  }

  const values = candidate.values as Partial<CanvasValues>;
  return (
    fieldIds.every((field) => typeof values[field] === "string") &&
    (values.authority === "" ||
      authorityIds.includes(values.authority as Authority))
  );
}

function authorityLabel(authority: CanvasValues["authority"]) {
  return authorities.find(({ id }) => id === authority)?.label ?? "Not set";
}

export default function ArchitectureCanvas() {
  const [state, setState] = useState<CanvasState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [storageMessage, setStorageMessage] = useState(
    "Not saved yet · entries stay in this browser",
  );
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const shouldMoveFocus = useRef(false);
  const restoredDraft = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const candidate: unknown = JSON.parse(stored);
        if (isStoredState(candidate)) {
          restoredDraft.current = true;
          setState(candidate);
          setStorageMessage(
            candidate.step === REVIEW_STEP
              ? "Blueprint draft restored from this device"
              : "Canvas draft restored from this device",
          );
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      setStorageMessage("Local saving is unavailable · the canvas still works");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (restoredDraft.current) {
      restoredDraft.current = false;
      return;
    }

    try {
      const isEmpty = Object.values(state.values).every(
        (value) => value.trim() === "",
      );

      if (isEmpty) {
        window.localStorage.removeItem(STORAGE_KEY);
        setStorageMessage("Not saved yet · entries stay in this browser");
        return;
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageMessage(
        state.step === REVIEW_STEP
          ? "Blueprint draft saved on this device"
          : "Canvas draft saved on this device",
      );
    } catch {
      setStorageMessage("Local saving is unavailable · the canvas still works");
    }
  }, [hydrated, state]);

  useEffect(() => {
    if (!shouldMoveFocus.current) return;
    stepHeadingRef.current?.focus();
    shouldMoveFocus.current = false;
  }, [state.step]);

  const moveToStep = (step: number) => {
    shouldMoveFocus.current = true;
    setState((current) => ({ ...current, step }));
  };

  const updateValue = (field: keyof CanvasValues, value: string) => {
    setState((current) => ({
      ...current,
      values: { ...current.values, [field]: value },
    }));
  };

  const continueDraft = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    moveToStep(Math.min(state.step + 1, REVIEW_STEP));
  };

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The in-memory draft still clears when browser storage is unavailable.
    }
    shouldMoveFocus.current = true;
    setState(initialState);
  };

  const completedFieldCount = Object.entries(state.values).filter(
    ([field, value]) => field !== "workingTitle" && value.trim() !== "",
  ).length;
  const currentStep = steps[state.step];

  return (
    <section
      className="architecture-builder"
      aria-labelledby="architecture-builder-title"
    >
      <div className="architecture-builder-heading">
        <div>
          <p className="module-kicker">Light lab · future blueprint input</p>
          <h3 id="architecture-builder-title">Draft your architecture.</h3>
        </div>
        <p>
          Work from outcome to control to continuity. Every field maps to the
          portable blueprint this guide will assemble later.
        </p>
      </div>

      <div className="architecture-builder-frame">
        <aside className="architecture-builder-rail" aria-label="Canvas progress">
          <p>Architecture canvas · BAS-YOURS</p>
          <ol>
            {[
              ["Outcome", "Frame the job"],
              ["Control", "Assign the owners"],
              ["Continuity", "Design the exits"],
              ["Draft", "Inspect the receipt"],
            ].map(([label, description], index) => (
              <li
                key={label}
                className={[
                  index === state.step ? "architecture-builder-stage-active" : "",
                  index < state.step ? "architecture-builder-stage-complete" : "",
                ].filter(Boolean).join(" ")}
                aria-current={index === state.step ? "step" : undefined}
              >
                <span>{(index + 1).toString().padStart(2, "0")}</span>
                <strong>{label}</strong>
                <small>{description}</small>
              </li>
            ))}
          </ol>
          <p className="architecture-builder-count">
            {completedFieldCount} / 11 blueprint fields
          </p>
          <p className="architecture-builder-local">No account · no upload</p>
        </aside>

        <div className="architecture-builder-workbench">
          {currentStep && (
            <form onSubmit={continueDraft} autoComplete="off">
              <p className="architecture-builder-step-label">
                Step {state.step + 1} / 03 · {currentStep.shortLabel}
              </p>
              <h4 ref={stepHeadingRef} tabIndex={-1}>
                {currentStep.title}
              </h4>
              <p className="architecture-builder-step-intro">
                {currentStep.description}
              </p>

              <div className="architecture-builder-fields">
                {currentStep.fields.map((fieldId) => {
                  const field = textFields[fieldId];
                  const inputId = `canvas-${field.id.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
                  const hintId = `${inputId}-hint`;
                  const isTitle = field.id === "workingTitle";

                  return (
                    <label
                      className={isTitle ? "architecture-builder-field architecture-builder-field-short" : "architecture-builder-field"}
                      htmlFor={inputId}
                      key={field.id}
                    >
                      <span>{field.label}</span>
                      {isTitle ? (
                        <input
                          id={inputId}
                          name={field.id}
                          type="text"
                          maxLength={80}
                          required
                          value={state.values[field.id]}
                          onChange={(event) => updateValue(field.id, event.currentTarget.value)}
                          aria-describedby={hintId}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <textarea
                          id={inputId}
                          name={field.id}
                          rows={field.rows ?? 3}
                          maxLength={360}
                          required
                          value={state.values[field.id]}
                          onChange={(event) => updateValue(field.id, event.currentTarget.value)}
                          aria-describedby={hintId}
                          placeholder={field.placeholder}
                        />
                      )}
                      <small id={hintId}>
                        {field.hint} · {state.values[field.id].length} / {isTitle ? 80 : 360}
                      </small>
                    </label>
                  );
                })}

                {state.step === 1 && (
                  <fieldset className="architecture-builder-authority">
                    <legend>Authority</legend>
                    <p id="canvas-authority-hint">
                      Choose the furthest action this system may take without crossing its human boundary.
                    </p>
                    <div>
                      {authorities.map((authority) => (
                        <label key={authority.id}>
                          <input
                            type="radio"
                            name="authority"
                            value={authority.id}
                            required
                            checked={state.values.authority === authority.id}
                            onChange={() => updateValue("authority", authority.id)}
                            aria-describedby="canvas-authority-hint"
                          />
                          <span>
                            <strong>{authority.label}</strong>
                            <small>{authority.description}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </div>

              <div className="architecture-builder-actions">
                {state.step > 0 ? (
                  <button type="button" onClick={() => moveToStep(state.step - 1)}>
                    <span aria-hidden="true">←</span> Previous
                  </button>
                ) : (
                  <span aria-hidden="true"></span>
                )}
                <button className="architecture-builder-primary" type="submit">
                  {state.step === 2 ? "Build blueprint draft" : `Continue to ${steps[state.step + 1].label.toLowerCase()}`}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          )}

          {state.step === REVIEW_STEP && (
            <div className="architecture-builder-review" aria-live="polite">
              <p className="architecture-builder-step-label">Local receipt · BAS-YOURS</p>
              <h4 ref={stepHeadingRef} tabIndex={-1}>Blueprint draft ready.</h4>
              <p className="architecture-builder-step-intro">
                This is a device-local draft, not a deployed system. Inspect the owners and exits before carrying it forward.
              </p>

              <article className="architecture-builder-receipt" aria-label="Architecture blueprint draft">
                <header>
                  <span>Working title</span>
                  <strong>{state.values.workingTitle}</strong>
                </header>
                <dl>
                  {receiptFields.map((field) => (
                    <div key={field.id}>
                      <dt>{field.label}</dt>
                      <dd>
                        {field.id === "authority"
                          ? authorityLabel(state.values.authority)
                          : state.values[field.id]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>

              <div className="architecture-builder-edit-grid" aria-label="Revise canvas sections">
                {steps.map((step, index) => (
                  <button type="button" onClick={() => moveToStep(index)} key={step.label}>
                    <span>{(index + 1).toString().padStart(2, "0")}</span>
                    Edit {step.label.toLowerCase()}
                  </button>
                ))}
              </div>

              <button className="architecture-builder-clear" type="button" onClick={clearDraft}>
                Clear saved canvas
              </button>
            </div>
          )}

          <div className="architecture-builder-storage" aria-live="polite">
            <span aria-hidden="true">●</span>
            <p>{storageMessage}</p>
          </div>
        </div>
      </div>

      <noscript>
        <p className="architecture-builder-noscript">
          The drafting controls need JavaScript. The complete filled reference
          and blank textual canvas remain available directly below.
        </p>
      </noscript>
    </section>
  );
}
