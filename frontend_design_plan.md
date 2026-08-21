# Frontend Design Plan: Cybersecurity Training Platform

## 1. Design goal

Design a frontend that makes API security learning feel **serious, understandable, safe, and motivating**. The interface should communicate the atmosphere of a high-tech system under controlled failure without making the learner feel lost inside a decorative cyberpunk screen. The visual language may be dystopian, but the learning experience must remain calm, structured, readable, and human.

The primary user is a learner who needs to understand what to do, why the exercise matters, what is permitted, whether the exploitation was verified, and how to recover safely. The secondary user is an operator or administrator who needs trustworthy evidence, clear system status, configuration visibility, and immediate awareness of unsafe or degraded conditions.

> **Core design principle:** Use the retro-futuristic aesthetic to create identity and atmosphere; use conventional interaction patterns to preserve clarity, trust, accessibility, and learning quality.

## 2. Human-centered design principles

| Principle | Frontend implication |
|---|---|
| Clarity before spectacle | Every screen has one primary task, one obvious next action, and a visible current state. Decorative noise must never compete with instructions or results. |
| Explain before exposing | Learners see the objective, authorization boundary, expected behavior, and safety conditions before they interact with a vulnerable endpoint. |
| Make progress tangible | Progress is represented through completed exercises, verified outcomes, learning milestones, and transfer readiness—not only a percentage. |
| Failure should teach | Error states explain what happened, what remains safe, and what the learner should try next. They never shame the learner or imply that an unsafe action is acceptable outside the isolated lab. |
| Evidence creates trust | Every verified result shows how it was determined, what evidence was captured, and whether the record is immutable. |
| Human control remains visible | Reset, pause, exit, recovery, and safety controls are always discoverable and never hidden behind decorative interactions. |
| Inclusive by default | Use strong contrast, readable type, keyboard support, reduced motion, non-color status indicators, clear focus states, and plain language alongside technical terms. |
| Authentic, not generic | Use a specific operational vocabulary, meaningful exercise scenarios, realistic status messages, and a distinctive layout rather than a collection of generic AI dashboard cards. |

## 3. Product experience structure

The frontend will be organized around five user questions:

1. **Where am I?** The current lab, exercise, role, environment, and safety status must be visible at all times.
2. **What am I learning?** Each exercise must state its vulnerability class, learning objective, realistic scenario, and expected observable outcome.
3. **What can I do safely?** The authorized target, permitted actions, reset behavior, and safety boundary must be clear before execution.
4. **Did I succeed?** The independent oracle must show verified, partially verified, failed, blocked, or not evaluated states without accepting learner self-report.
5. **What should I do next?** The interface must recommend the next exercise, remediation reading, or transfer assessment based on verified progress.

The primary navigation should use a persistent left rail on desktop and a bottom or drawer navigation on mobile. The main areas are **Dashboard**, **Exercises**, **Progress**, **Transfer Lab**, **Evidence**, and **Admin**. Admin must be visually and behaviorally separated from learner workflows.

## 4. User roles and journeys

### Learner journey

The learner enters the dashboard and immediately sees current progress, active exercise, safety status, recent verified activity, and the next recommended learning step. From the exercise catalog, the learner selects a vulnerability class and reads the scenario, objective, authorization boundary, and success criteria. The learner then opens the exercise workspace, follows the guided instructions, uses optional hints, performs the authorized test, and submits the request for oracle evaluation. The result screen explains the independently verified outcome, presents evidence metadata, and offers reset, retry, remediation, or next exercise actions.

### Operator journey

The operator opens the dashboard to confirm that the lab is isolated, healthy, and using the expected version and configuration. They review exercise runs, telemetry, failed safety checks, recovery status, and immutable evidence. When a negative test or degraded condition occurs, the operator sees the trigger, expected safe behavior, observed behavior, recovery action, recovery time, and residual-risk decision.

### Administrator journey

The administrator enters the Admin area to manage exercises, vulnerability labels, rubric anchors, KPI baselines, fixture versions, configuration manifests, and evidence exports. Administrative actions must show scope, affected version, confirmation requirements, and an audit entry. No screen may suggest that an immutable evidence record can be edited or deleted.

## 5. Visual direction: retro-futuristic system failure

### Color system

Use a deep black foundation rather than a flat dark gray. The primary text is warm white or cool white for long-form readability. Cyan and magenta are reserved for chromatic aberration, active states, links, highlights, and technical accents. Use a restrained amber for warnings and a controlled red for unsafe or blocked conditions. Do not use neon colors for every component; excessive neon reduces hierarchy and creates visual fatigue.

| Token role | Direction |
|---|---|
| Canvas | Near-black with subtle blue-violet undertone |
| Surface | Slightly lifted charcoal panels with a fine inner border |
| Primary text | High-contrast white |
| Secondary text | Muted cool gray, never too dim for body copy |
| Cyan accent | Verified, active, technical, or network-related status |
| Magenta accent | Progress, learning focus, or anomaly emphasis |
| Amber | Caution, incomplete evidence, or pending recovery |
| Red | Blocked action, unsafe condition, or failed guardrail |
| Green | Use sparingly for trusted recovery or all-clear states; never make green the only success signal |

### Typography

Use a strong modern sans-serif for headings and body text, paired with a monospace face for identifiers, API paths, timestamps, fixture IDs, status codes, and evidence hashes. Headings should be compact and assertive. Body text should be comfortable to read at normal size. Avoid using monospace for entire paragraphs because it harms comprehension.

### Texture and effects

Use faint scanlines, a low-opacity technical grid, occasional corner brackets, subtle noise, and restrained cyan/magenta edge offsets. Effects should sit behind content or on decorative labels. They must not reduce contrast, create motion sickness, or make small text blurry. Do not use full-screen glitch animation on page load. Use short, purposeful transitions only when a state changes.

### Shape language

Use rectangular panels with clipped corners, offset borders, small status tabs, thin technical dividers, and bracketed labels. Maintain consistent geometry so the interface feels engineered rather than randomly distressed. Buttons should remain conventional enough to identify immediately as buttons.

## 6. Dashboard screen plan

The Dashboard should answer the learner’s immediate needs within the first viewport.

| Region | Content and behavior |
|---|---|
| System header | Platform title, environment label, authenticated role, target isolation status, and a persistent safety indicator. |
| Progress summary | Overall verified progress, completed exercise count, current learning streak or recent activity, and readiness toward transfer assessment. |
| Current mission | The next exercise with vulnerability class, realistic scenario, estimated time, prerequisites, and a clear “Resume exercise” action. |
| KPI strip | The exact labels “transfer score”, “completion score”, “attack-path detection rate”, and “false-positive rate”, each with current value, comparison context, and a non-color status indicator. |
| Exercise path | A visual sequence showing completed, active, available, and locked exercises. The sequence must support keyboard navigation and provide text equivalents. |
| Recent verified runs | A short timeline showing timestamp, exercise, result, oracle status, and immutable evidence indicator. |
| Safety panel | “AUTHORIZED TARGET ONLY”, “RESET AVAILABLE”, version, fixture, and last recovery state. |

The dashboard should not show a dozen equal-weight cards. The current mission and verified progress should dominate. Telemetry and evidence should support the learner without overwhelming the first-time user.

## 7. Exercise catalog plan

The catalog will use a structured list or grid with strong filtering and clear vulnerability labels. Each exercise card must include the exercise title, vulnerability class, difficulty, learning objective, estimated time, completion state, prerequisite state, and whether it has been verified. Avoid using only abstract labels such as “Module 03”; pair each label with a plain-language explanation.

The four core exercise families are:

| Exercise family | Learner-facing framing |
|---|---|
| Broken object-level authorization | “Can a user access another tenant’s object?” |
| Broken function-level authorization | “Can a lower-privileged role invoke an administrative action?” |
| Mass assignment | “Which fields can a client change that the workflow should protect?” |
| Excessive data exposure | “Does the response reveal more data than the task requires?” |

Each card should distinguish **learn**, **practice**, **verified**, and **locked** states. The visual should not imply that exploiting a vulnerability is acceptable in a real environment; the card should state that the target is an isolated authorized training fixture.

## 8. Exercise workspace plan

The exercise workspace should use a two-column structure on desktop and a stacked structure on mobile. The left side contains the scenario, objective, guidance, hints, and safety boundary. The right side contains the request builder, response viewer, run controls, and verification result.

The workspace must include:

- A clear exercise title and vulnerability label.
- A short realistic scenario involving tenants, users, projects, or assets.
- A “Before you begin” block explaining the authorized target and expected safe behavior.
- Step-by-step instructions with collapsible hints that do not reveal everything by default.
- A request builder with visible method, path, headers, body, and fixture identifier.
- A response viewer with status, headers, body, and a plain-language interpretation.
- A primary action that starts an authorized run.
- A clearly separate reset action requiring confirmation.
- A verification panel controlled by the independent oracle.
- A recovery strip showing the last trusted state and whether reset is available.

The request builder should help learners understand the request, but it must not silently modify their input in a way that hides the underlying concept. Invalid requests should produce useful validation feedback rather than a blank error.

## 9. Progress tracking page plan

The Progress page should make learning growth visible without turning education into a competitive leaderboard. It should show:

- Verified completion by vulnerability class.
- Confidence or mastery indicators based on observable verified behavior, not self-report.
- A timeline of completed exercises and retries.
- Transfer readiness and whether the unfamiliar API partition is unlocked.
- Performance across the frozen rubric anchors.
- Hints used, with a non-punitive explanation of how hints affect the exercise record.
- Remediation recommendations based on failed oracle checks.
- A clear separation between training-api results and transfer-assessment results.

Progress charts must include text summaries, units, date ranges, and accessible data tables or expandable descriptions. Avoid decorative charts with no actionable meaning.

## 10. Transfer Lab screen plan

The Transfer Lab must visibly communicate that the target is a **separate unfamiliar API** reserved exclusively as the independent acceptance partition. The interface should not reuse the exact training-domain language, route names, or visual exercise sequence in a way that encourages memorization.

The screen should begin with an orientation panel explaining that the learner is applying a technique to a new domain. It should show the frozen rubric, current evaluation condition, permitted scope, and what evidence will be captured. The transfer result should show condition-wise scores, uncertainty or agreement information where applicable, and limitations. Do not display hidden acceptance answers before the learner attempts the task.

## 11. Evidence screen plan

Evidence should feel like a trustworthy audit record rather than a generic activity feed. Each record should show its immutable status and include fixture ID, preconditions, version, configuration, expected result, observed result, log reference, recovery time, and residual-risk decision.

The interface must state that evidence records cannot be altered after creation. If a correction is required, the UI should create a new superseding annotation or review record without changing the original event. Use a timeline or expandable record view with copyable identifiers, timestamps, and hash-like references. Provide filtering by exercise, fixture, version, AC-1 to AC-4, and NT-1 to NT-5.

## 12. Admin screen plan

The Admin area should use a dense but controlled information architecture. It should include separate sections for exercises, vulnerability classes, rubric definitions, KPI baselines, fixture/configuration versions, acceptance campaigns, and evidence manifests.

Every admin action must show:

- The object and version being changed.
- The reason or change note.
- The expected effect on acceptance evidence.
- A confirmation step for risky changes.
- The identity and timestamp of the actor.
- Whether the action is reversible or creates a new version.

The interface must never provide an edit or delete affordance for immutable run records. Instead, it should provide “create annotation”, “supersede configuration”, or “start new version” actions.

## 13. Acceptance and safety visibility

The frontend must reference the identifiers **AC-1**, **AC-2**, **AC-3**, and **AC-4** exactly, and must reference **NT-1**, **NT-2**, **NT-3**, **NT-4**, and **NT-5** exactly. These identifiers should appear in acceptance status components, evidence filters, run summaries, and the operator view.

The KPI labels must appear verbatim wherever reported: **transfer score**, **completion score**, **attack-path detection rate**, and **false-positive rate**. Each KPI needs a value, comparison baseline, target, condition, and status explanation.

The oracle result must be explicitly labeled as independently verified. The interface must not include a learner self-report field that feeds verification. Learners may optionally leave notes for reflection, but those notes must be labeled non-authoritative and must never alter oracle outcomes.

The five negative tests should have dedicated status rows and evidence detail views. The UI must communicate the expected safe behavior: deny or contain the unsafe action, preserve the last valid state, explain the decision, emit immutable evidence, revoke affected access or secrets where applicable, restore the trusted state, rerun the authorized test, and document residual exposure.

## 14. Accessibility and inclusive interaction requirements

Use semantic HTML, visible keyboard focus, logical tab order, descriptive labels, accessible dialogs, and proper heading hierarchy. Do not communicate status with color alone; pair color with text, icons, labels, or patterns. Ensure that scanlines, glitch effects, and chromatic offsets do not reduce text readability.

Support reduced motion by disabling non-essential animated noise, flicker, parallax, and glitch transitions. Avoid rapid flashing. Provide sufficient contrast for body text, status text, disabled states, form errors, and focus indicators. Ensure all charts and progress graphics have textual alternatives.

Use plain-language explanations alongside terms such as broken object-level authorization and mass assignment. Tooltips may provide deeper technical detail, but critical instructions cannot be tooltip-only. Error messages should explain the problem, its consequence, and the next safe action.

## 15. Responsive behavior

### Desktop

Use a persistent navigation rail and a spacious two-column exercise workspace. Keep evidence and telemetry visible as supporting context, not as a competing primary task.

### Tablet

Allow the navigation rail to collapse into a labeled drawer. Convert dense KPI strips into a two-by-two grid and stack the exercise workspace when the request builder becomes too narrow.

### Mobile

Use a compact header with the lab isolation status always visible, bottom navigation for primary sections, stacked exercise content, collapsible evidence details, and full-width primary actions. The reset and recovery actions must remain easy to reach without appearing adjacent enough to invite accidental activation.

## 16. Interaction and motion standards

Use motion to explain state changes, not to decorate every interaction. A verified result may use a brief cyan confirmation transition; a blocked or unsafe result may use a restrained red border and status change; a reset may show a clear progress state and then a trusted-state confirmation. Keep transitions short, interruptible, and disabled or reduced for users who prefer less motion.

Buttons should have clear labels such as “Run authorized test”, “Verify result”, “Show hint”, “Reset exercise”, “View evidence”, and “Open recovery details”. Do not use vague labels such as “Continue” when a more precise action is possible.

## 17. Content and microcopy standards

Use direct, calm language. Examples include:

> **Authorized lab target.** This exercise runs only against the isolated training fixture. Do not reuse these techniques against systems without explicit permission.

> **Verified by oracle.** Completion was determined from response assertions, authorization ground truth, and state-diff evidence. Learner self-report is not used.

> **Reset available.** The exercise can be restored to the last trusted state without changing prior immutable evidence.

> **Transfer partition.** This unfamiliar API is reserved for independent acceptance and is not a copy of the training target.

Avoid fear-based copy, exaggerated threat claims, fake user testimonials, fabricated ratings, and unexplained system-failure language that hides the actual state.

## 18. Frontend quality gates

| Gate | Required review |
|---|---|
| Information architecture | A first-time learner can identify the next exercise, target scope, safety condition, and progress state without assistance. |
| Visual hierarchy | The primary task dominates each screen; decorative effects never overpower instructions, controls, or evidence. |
| Accessibility | Keyboard-only navigation, focus visibility, contrast, reduced motion, screen-reader labels, status alternatives, and chart summaries are verified. |
| Safety | Target isolation, reset availability, recovery state, authorization warnings, and blocked-action explanations are visible at the point of need. |
| Oracle trust | Verification panels clearly state independent oracle logic and contain no learner self-report dependency. |
| Evidence | Run records expose immutable status and all required metadata without offering edit/delete controls. |
| Acceptance | AC-1 to AC-4 and NT-1 to NT-5 are visible in the correct operator and evidence contexts. |
| Responsive behavior | Dashboard, exercise workspace, progress, transfer, evidence, and admin views remain usable at desktop, tablet, and mobile widths. |
| Human review | At least one usability review is performed with a learner perspective and one operational review with an evidence/recovery perspective. |

## 19. Implementation order for the frontend

First establish the design tokens, typography, theme, navigation shell, and DashboardLayout. Next build the Dashboard and Exercise Catalog so the core learning loop has a coherent home. Then build the Exercise Workspace, including safe reset and oracle result states. After that, implement Progress, Transfer Lab, Evidence, and Admin views using the same state language and component primitives. Finally, add responsive refinements, accessibility passes, reduced-motion behavior, empty states, error states, loading states, and acceptance-visible states.

The frontend should be implemented from real domain objects and explicit states rather than placeholder cards. Before each screen is considered complete, verify its normal, empty, loading, error, blocked, partially verified, verified, degraded, and recovered states.

## 20. Definition of a good human-designed frontend

The result should feel distinctive without being confusing, technical without being hostile, and visually ambitious without sacrificing usability. A human-designed experience will show judgment in what it leaves out: no unnecessary dashboards, no meaningless charts, no decorative glitch over critical text, no excessive neon, no hidden safety rules, no fake progress, no invented reviews, and no ambiguous actions.

A learner should be able to answer, at every point: **what am I learning, what am I allowed to do, what happened, how was it verified, what evidence was captured, and what should I do next?** If the design consistently answers those questions, the frontend will support both the emotional atmosphere of the project and the engineering discipline required by its cybersecurity training mission.
