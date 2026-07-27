# Art direction

**Status:** locked  
**Version:** 1.0  
**Locked:** 2026-07-27  
**Applies to:** the guide shell, content modules, light interactions, signature labs, and exported visuals

## Direction

Building Agent Systems is an **editorial workbench**: part field manual, part instrument panel. It should feel direct, physical, and inspectable. The visual system makes structure visible with hard rules, numbered stages, evidence cards, status labels, and a small set of loud signals.

The character comes from composition and useful state—not decorative illustration. New work extends this grammar; it does not open a new visual direction for each module.

## Core principles

1. **Show the system.** Use rails, stages, receipts, inputs, results, and checks to expose cause and effect.
2. **Make hierarchy unmistakable.** Display type announces the lesson; monospace labels explain the instrument; readable body copy carries the argument.
3. **Use color as a signal.** Paper and ink build the page. Acid, coral, and blue identify action, attention, and explanation.
4. **Keep the construction visible.** Borders, grids, offsets, stamps, and simple geometry should feel assembled rather than polished away.
5. **Move only when state changes.** Motion clarifies selection, progression, or feedback. It never delays access to content.

## Typography

The system uses local system-font stacks only. Do not add a network font in v1.

| Role | Stack | Treatment |
|---|---|---|
| Display and reading | `"Arial Narrow", "Avenir Next Condensed", "Helvetica Neue", sans-serif` | Dense, heavy headlines; compact line height; negative tracking. Body copy stays sentence case and uses comfortable line height. |
| Instrumentation | `"SFMono-Regular", "Roboto Mono", "Courier New", monospace` | Eyebrows, navigation, buttons, chips, indices, metadata, code, and status readouts. Usually small, bold, and uppercase. |

Display headlines use responsive `clamp()` sizing, a maximum measure of roughly 9–17 characters, weights from 850–900, line height from 0.78–0.93, and negative tracking from `-0.055em` to `-0.08em`. Their job is to create one decisive entry point per section.

Body copy generally stays between 16–26 px depending on hierarchy, with a line height from 1.2–1.5 and a maximum readable measure. Monospace copy is not a body-text substitute; it denotes controls, state, evidence, and machine-readable artifacts.

## Color

### Core tokens

| Token | Value | Role |
|---|---:|---|
| Paper | `#f3f0e8` | Default surface and light text on ink |
| Ink | `#151515` | Text, borders, workbench surfaces, and hard shadows |
| Acid | `#c6ff39` | Primary actions, selected states, verification, active status |
| Coral | `#ff5d3a` | Attention, incoming work, path sections, large geometric accents |
| Blue | `#4f73ff` | Explanatory emphasis and the global focus ring |
| Lab blue | `#334fc2` | Contrast-safe blue surface inside the loop lab |

Muted neutrals may support grids, secondary copy, and dividers, but they must remain subordinate to the core palette. White is reserved for text on blue when paper would weaken contrast.

Color rules:

- Keep most of a page paper and ink; one signal color should dominate a section.
- Acid means available, active, or verified—not generic decoration.
- Coral marks attention or incoming work; it does not imply failure.
- Blue marks explanation, focus, or a distinct conceptual takeaway.
- Never rely on color alone for state. Pair it with labels, geometry, position, or text.
- A new named color requires a product-level semantic need and contrast verification.

## Illustration language

Illustration is built from native page materials:

- square grid backgrounds at 4 rem for page atmosphere and 2 rem inside work areas;
- 2 px rules that divide sections, rails, cards, and controls;
- circles for status and phase stamps;
- hard-offset shadows that make actionable cards feel tactile;
- chips, indices, traces, code blocks, and receipts that show evidence;
- one oversized geometric accent when a quiet section needs energy.

Prefer CSS geometry, structured HTML, and real interaction state. Avoid stock imagery, glossy 3D renders, gradients used only as decoration, mascot art, or product screenshots that do not teach a boundary.

## Layout and spacing

- Page shells are centered, span at most 1600 px, and retain visible inline rules.
- Horizontal page padding is `clamp(1rem, 3vw, 2.5rem)`.
- Major sections use vertical space in the 3–8 rem range, responsive with `clamp()`.
- The base rhythm is 0.5 rem. Prefer multiples of it; use smaller values only for optical alignment or dense instrument labels.
- Desktop compositions favor asymmetric two-column grids: lesson and evidence, input and workbench, heading and explanation.
- Cards and panels touch the grid through shared borders. Avoid floating collections of unrelated rounded cards.
- Corners remain square. Circles are reserved for status, stamps, and checks.

Responsive behavior is a re-composition, not a scaled-down desktop:

- the guide shell begins collapsing at 760 px and becomes single-column where needed by 440 px;
- signature-lab framing collapses at 980 px, and dense controls reflow at 680 px;
- navigation may remove secondary orientation labels, but the home path, primary task, and current state stay available;
- 320 px is the minimum supported viewport; no horizontal page overflow is acceptable.

## Navigation

The global pattern has three layers:

1. a high-visibility work-in-progress or state banner;
2. a left-aligned `B/AS` wordmark that always returns home;
3. right-side contextual navigation, a module index, or a primary next action.

The header is a tool rail, not a marketing navbar. Keep it shallow, bordered, text-first, and free of menus until the information architecture genuinely requires one. Every page retains a skip link and a visible return or onward path.

Signature labs may adapt the right side into a compact stage index, but they keep the banner, wordmark, shell width, type roles, and border grammar.

## Controls and state

- Primary actions use acid, a 2 px ink border, monospace uppercase text, and—when space permits—a hard shadow.
- Secondary actions use transparent or paper surfaces with the same border and type grammar.
- Selected stage controls use acid plus a second indicator such as the inset ink bar.
- Consequence and approval states must be named in text.
- Disabled controls remain visible with reduced opacity and a non-interactive cursor.
- Focus is a 4 px high-contrast outline with 4 px offset. A lab may switch the focus color only when the surrounding surface preserves contrast.
- Control labels lead with a verb and state what happens next.

## Motion vocabulary

Motion is quick, legible, and state-driven:

| Pattern | Timing | Use |
|---|---:|---|
| Tactile control response | 120 ms, standard ease | Small translate, shadow compression, or arrow movement on hover |
| Panel state change | 220 ms, ease `[0.22, 1, 0.36, 1]` | Short fade and vertical shift when the selected trace stage changes |
| Ambient status | 1.8 s, stepped | Small binary status dot only |

Do not animate reading order, autoplay a lesson, parallax the page, or add motion to fill empty space. A signature interaction may introduce a new transition only when it explains a new kind of state change.

When `prefers-reduced-motion: reduce` is active:

- smooth scrolling becomes immediate;
- CSS animation and transition durations collapse to effectively zero and run once;
- Motion components render the destination state with zero duration and no transformed intermediate state;
- all content, hierarchy, and feedback remain available.

## Page grammar

Guide pages should compose from:

- state banner;
- brand and contextual navigation rail;
- oversized lesson statement with one clear supporting paragraph;
- dark workbench or evidence section;
- colored takeaway or next-path section;
- compact monospace footer.

Signature labs add:

- a lab identity and explicit scope;
- a frozen or safe starting state;
- an inspectable input beside the active work area;
- numbered stage navigation;
- structured artifacts and verification receipts;
- an accessible text-only equivalent;
- a clearly named stop or approval boundary.

Not every module needs every layer. The minimum is a clear statement, visible structure, and a useful next action.

## Content voice

Headlines are compact assertions: “The loop is the system.” Labels are concrete nouns or verbs: “Observe,” “Tool input,” “Loop check.” Supporting copy explains why the evidence earns the next step.

Avoid framework slogans, vague futurism, and inflated promises. Prefer visible verbs—read, choose, call, check, stop—and name side effects plainly.

## Accessibility and performance

These are part of the art direction:

- semantic HTML and a logical reading order precede visual composition;
- all controls work by keyboard and touch;
- interactions expose current state programmatically;
- every interaction has a complete non-interactive textual equivalent;
- serious and critical axe violations are zero, and color contrast is checked separately;
- reduced motion preserves meaning;
- mobile layouts retain the primary task without horizontal overflow;
- visual character must not require a heavy image or font payload;
- changed pages must score at least 95 for both Lighthouse performance and accessibility.

## Shipped-route audit

| Route | Demonstrated contract | Status |
|---|---|---|
| `/` | Paper grid, bordered shell, WIP rail, `B/AS` wordmark, oversized condensed statement, blue highlight, acid tactile CTA, ink loop board, coral path section, compact footer | Conforms |
| `/labs/agent-loop/` | Shared shell and banner grammar, contextual stage index, oversized lab statement, ink simulator field, coral input brief, acid selected and verified states, blue takeaway, Motion panel transitions, text-only trace | Conforms |

The automated route-level audit in `tests/art-direction.spec.ts` checks the core tokens, type roles, structural rules, signal colors, control treatment, and reduced-motion contract on both shipped routes. The audit protects the vocabulary, not pixel-perfect page snapshots.

## Extension rules

Before shipping a new page or interaction:

1. Start with the shared tokens, type roles, shell, and border grammar.
2. Choose one dominant signal color for each major section.
3. Identify the input, active state, evidence, and next action.
4. Add motion only where state changes.
5. Provide the textual equivalent before calling the interaction complete.
6. Verify keyboard operation, contrast, reduced motion, mobile reflow, links, and Lighthouse.

If a future unit needs to revise this contract, name that revision explicitly in `PROGRESS.md`, explain the product need in `DECISIONS.md`, and re-audit all shipped routes affected by the change.
