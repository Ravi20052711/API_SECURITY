# Implementation Plan: API Security Learning Through a Deliberately Vulnerable Service

## 1. Goal and intended outcome

Build a complete, reproducible, deliberately vulnerable API training system that teaches API-security techniques through guided exercises with verifiable exploitation, then measures whether those techniques transfer to a separate unfamiliar API. The final result must be an operable engineering system—not an isolated notebook, model, dashboard, or library integration—and must be independently accepted under representative, boundary, and failure conditions.

The project will be delivered across two semesters. Semester VII will validate the problem, freeze the engineering contract, and establish the realistic vulnerable-API reference (O1/O2). Semester VIII will build and evaluate the guided-exercise contribution, integrate the full workflow, and complete independent transfer validation (O3/O4/O5).

## 2. Decisions and working assumptions

| Area | Planned decision or assumption |
|---|---|
| Training target | Use a version-pinned REST/HTTP API with realistic domain behavior, persistent state, authentication, authorization, and representative API vulnerability classes such as broken object-level authorization, broken function-level authorization, mass assignment/property-level authorization, and excessive data exposure. Final classes will be frozen after threat-model and feasibility review. |
| Technology | Prefer a small, documented service stack that supports fast fixture creation, deterministic tests, and clean-environment rebuilds; the exact language/framework will be selected through a documented trade-off. |
| Contribution | Implement guided exercises as a separate subsystem with learner instructions, controlled attack fixtures, expected outcomes, hints, scoring/completion rules, and an independent oracle that verifies exploitation without relying on learner self-report. |
| Transfer target | Reserve a second unfamiliar API and its acceptance fixtures before tuning the contribution. It must use a different domain and, where practical, different route/data naming so that success cannot depend on memorizing the training API. |
| Safety boundary | All testing will run only against isolated, synthetic, version-pinned services with explicit authorization. No uncontrolled offensive testing or production targets will be used. |
| Stakeholder | Before approval, confirm a named local problem owner or obtain a signed problem-validation record. If neither is available, rescope the project to a defensible educational/security-engineering problem. |
| Evidence | Treat the source-to-claim map, provenance manifest, versioned fixtures, immutable logs, independent oracle, raw results, configuration, and reproducibility package as first-class outputs throughout development. |
| Acceptance | Use the charter’s KPI thresholds and all five negative tests as release gates. A critical guardrail failure cannot be masked by an aggregate score. |

## 3. Phase 0 — approval and project setup

1. Identify the local beneficiary, operational decision owner, supervisor, and independent reviewer. Obtain the stakeholder validation record or reproduce the source claim with versioned evidence.
2. Convert the charter into a requirements traceability matrix mapping every functional requirement, non-functional requirement, KPI, acceptance condition, negative test, and deliverable to an implementation artifact and test.
3. Freeze the system boundary, authorized test scope, data-handling rules, ethical approval requirements, and stop conditions.
4. Assign named ownership across API/assets/evidence, security controls, integration/telemetry, and adversarial validation/recovery. Each member must own reviewable code and evidence.
5. Establish the version-controlled repository, issue tracker, coding standards, review workflow, evidence directory, configuration schema, secret-handling policy, and clean-environment build process.
6. Create an initial risk register and threat model covering trust boundaries, identities, roles, data exposure, state mutation, secrets, exercise content, telemetry, recovery, and misuse of the vulnerable service.

**Gate 1 exit evidence:** approved problem charter, stakeholder/source evidence, requirements and traceability matrix, scope and authorization record, architecture decision record, threat model, trust-boundary diagram, risk register, initial fixtures, allow/deny oracle design, and acceptance/test plan.

## 4. Phase 1 — Semester VII O2 reference and vertical slice

1. Select a realistic domain such as a small multi-tenant project or asset-management API, ensuring that vulnerable behaviors arise naturally from plausible workflows.
2. Compare at least two feasible reference approaches—for example, a deliberately vulnerable service built from a minimal framework versus a vulnerable fork/configuration of an existing training service. Evaluate realism, control over vulnerability classes, reproducibility, observability, safety isolation, maintenance cost, and licensing.
3. Record the trade-off and select one approach. Pin runtime, dependencies, database schema, seed data, service configuration, and test versions.
4. Implement the reference API with realistic authentication, roles, tenants, resources, workflows, validation, persistence, error handling, audit events, and resettable synthetic fixtures.
5. Implement and label the selected vulnerability classes. Keep intentionally vulnerable paths isolated from any management or infrastructure controls, and ensure the service can be reset to a trusted state.
6. Build the independent expected-result oracle. It must determine whether an authorized exercise achieved the intended controlled outcome, whether an unauthorized outcome occurred, and whether state/integrity guardrails were violated.
7. Add unit, contract, integration, and system tests for normal behavior, intended vulnerable behavior, denial behavior, state transitions, logging, reset, and resource use.
8. Add a one-command or one-test-run reference workflow that provisions the service, loads fixtures, executes approved exercises, collects telemetry, evaluates the oracle, and exports evidence.
9. Freeze the 0–100 rubrics for technique transfer, exercise completion, and realism before collecting O2 baselines. Define at least five observable criteria and named 0/50/80/100 anchors; use two independent raters and record agreement.
10. Measure O2 under the approved representative and failure conditions, including baseline scores, unsafe/unauthorized outcomes, attack-path detection/prevention, false positives, tail performance, and resource profile.

**Gate 2 exit evidence:** reproducible O2 reference, integrated vertical slice, executable fixtures, independent oracle, tests, baseline KPI values, resource profile, failure log, realism and exercise rubrics, and documented limitations.

## 5. Phase 2 — Semester VIII O3 guided-exercise contribution

1. Design the exercise model: objectives, prerequisites, learner instructions, setup/reset, hints, allowed actions, expected evidence, scoring/completion criteria, and remediation explanation.
2. Implement the exercise subsystem separately from the vulnerable API so that it can be enabled, disabled, versioned, tested, and compared independently.
3. Provide exercises that require pattern recognition and controlled exploitation rather than route memorization. Include object-level authorization, function-level authorization, mass assignment/property-level authorization, excessive data exposure, and any additional classes justified by the threat model.
4. Make exploitation verifiable through the independent oracle, state-diff checks, authorization ground truth, expected response assertions, and immutable run evidence. Do not require real secrets or harmful payloads.
5. Add learner/operator interfaces, progress state, reset controls, safety warnings, exercise configuration validation, and telemetry showing decisions, completion, failures, and recovery.
6. Reserve the unfamiliar-API acceptance partition and avoid tuning against it. Use separate development, validation, and final acceptance fixtures with provenance manifests and no information leakage.
7. Compare O3 with O2 under the same versions, workload, hardware/facility limits, evidence rules, and resource envelope. Run controlled experiments such as ablation of guidance, alternate hint levels, or exercise-order sensitivity, selecting the comparison that best isolates the contribution.
8. Repeat trials, report uncertainty and condition-wise failures, and trace every claim to raw evidence and an acceptance result.

**Gate 3 exit evidence:** candidate exercise subsystem, design rationale, baseline-versus-candidate comparison, controlled experiment/ablation, uncertainty and rater agreement, trade-offs, limitations, selected configuration, raw evidence, and claim-to-acceptance trace.

## 6. Phase 3 — O4 complete-system integration

1. Connect the reference API, exercise subsystem, transfer assessor, user/operator interface, configuration, telemetry, oracle, evidence store, and recovery controls through explicit interface contracts.
2. Validate configuration and inputs, including API schema/protocol, fixture IDs, versions, authorization scope, seeds, workload, and resource envelope.
3. Implement health indicators, audit logging, immutable evidence packaging, safe reset, degraded mode, and recovery procedures. Protect secrets and enforce least privilege.
4. Add integration and end-to-end tests for normal operation, invalid configuration, missing fixtures, unavailable dependencies, malformed API responses, oracle disagreement, telemetry failure, unauthorized paths, partial execution, and restart/recovery.
5. Demonstrate clean-environment rebuild and scripted execution from a pinned repository, including seed/configuration capture and deterministic artifact naming.
6. Verify that the integrated workflow can run from setup through guided exploitation, assessment, report generation, safe failure, restoration of the last trusted state, and rerun.

**Gate 4 exit evidence:** complete operable prototype, interface contracts, configuration and telemetry, degraded-mode demonstration, recovery proof, end-to-end evidence, and clean-environment rebuild record.

## 7. Phase 4 — O5 independent acceptance and transfer validation

1. Freeze code, configuration, versions, rubrics, workload, hardware/facility constraints, acceptance fixtures, and evaluation protocol before final runs.
2. Run AC-1 representative operation against the separate unfamiliar API. Measure technique transfer and exercise-related outcomes using the frozen rubric and independent raters.
3. Run AC-2 boundary and failure conditions, including toy services, implausible vulnerabilities, missing/invalid inputs, resource stress, partial service failure, and unavailable dependencies.
4. Run AC-3 independent acceptance with an isolated authorized environment, explicit allow/deny and attack-ground-truth oracles, immutable evidence, and an independent security/domain reviewer.
5. Run AC-4 with the frozen resource envelope and compare O2 and O3 without changing approved versions, workload, hardware/facility limits, or budget.
6. Execute NT-1 through NT-5. For every test, record fixture/sample ID, preconditions, versions/configuration, expected versus observed result, logs/measurements, recovery time, residual exposure, and reviewer decision.
7. Apply the pass/hold/revise rule: KPI targets and guardrails must pass, no critical unsafe or integrity-violating result is permitted, and any failed condition must lead to documented revision or an explicit project hold.
8. Obtain independent review and sign-off on the final validation report, reproducibility package, operating guide, limitations, residual risks, and ethical/safety boundary.

## 8. Evidence, documentation, and final deliverables

Maintain a manifest recording source URL and access date, license/permission, owner/custodian, fixture/sample identifiers, exclusions, transformations, configuration, and KPI purpose. Store raw results, logs, screenshots/video logs, test reports, environment metadata, hashes, and reviewer records alongside generated summaries.

| Deliverable | Planned contents |
|---|---|
| D1 | Approved problem charter, requirements, boundary, architecture, threat model, risk register, and source-to-claim map |
| D2 | Reproducible realistic vulnerable API, fixtures/protocol, oracle, tests, baseline results, and resource profile |
| D3 | Independently testable guided exercises, design rationale, comparative evidence, controlled experiment, trade-offs, and limitations |
| D4 | Integrated prototype with configuration, interfaces, telemetry, degraded operation, and recovery |
| D5 | Automated/documented acceptance harness for AC-1–AC-4, all KPIs, and NT-1–NT-5 |
| D6 | Versioned repository/protocol package, evidence manifest, installation and operating guide, API documentation, and rebuild instructions |
| D7 | Final report or paper, poster, portfolio case study, demonstration video, video logs, and individual contribution/viva evidence |

## 9. Verification and test strategy

Use a layered test pyramid: unit tests for vulnerability logic, authorization and rubric/oracle rules; contract tests for API and subsystem interfaces; integration tests for persistence, telemetry, configuration, and evidence; system tests for complete learner and operator workflows; and adversarial tests only against isolated authorized fixtures. Every test must identify its expected result and evidence artifact.

The KPI evaluation will report baseline, target, achieved value, sample/trial count, uncertainty, condition-wise values, resource cost, and guardrail status. The principal targets are: transfer, completion, and realism scores of at least 80/100 and at least five points above O2; attack-path detection/prevention at least O2 plus three percentage points or within one point with at least 20% improvement in the primary resource KPI; and false-positive rate no more than 80% of O2 with no critical condition worse than reference. Unsafe or unauthorized outcomes must be zero under the applicable guardrail.

## 10. Schedule and review cadence

| Period | Milestone |
|---|---|
| Weeks 1–3 | Stakeholder/problem validation, source-to-claim map, scope, ethics, team roles |
| Weeks 4–6 | Architecture alternatives, threat model, risk register, technology and fixture decisions |
| Weeks 7–12 | O2 reference API, vulnerabilities, oracle, tests, reset/recovery, vertical slice |
| Weeks 13–14 | Rubric freeze, O2 baseline campaign, Semester VII Gate 2 review |
| Semester VIII Weeks 1–4 | Guided-exercise design and independent subsystem implementation |
| Weeks 5–8 | O3 comparison, ablation/sensitivity study, uncertainty analysis, Gate 3 review |
| Weeks 9–11 | Full integration, telemetry, degraded mode, recovery, clean rebuild |
| Weeks 12–14 | Frozen AC-1–AC-4 and NT-1–NT-5 acceptance campaign, independent review |
| Final weeks | Final report, poster, demonstration, reproducibility package, viva evidence, Gate 4/final gate |

Hold weekly engineering reviews, biweekly evidence reviews, and a formal gate review at each O1–O5 milestone. Any change to scope, vulnerability classes, acceptance fixtures, resource envelope, or KPI rubric requires a recorded change decision and impact assessment.

## 11. Open risks and mitigations

| Risk | Mitigation and decision point |
|---|---|
| No named local stakeholder or problem-validation evidence | Resolve before Gate 1; otherwise rescope or stop. |
| Transfer test contaminated by tuning or memorization | Reserve unfamiliar API and acceptance fixtures before O3; enforce independent partition and manifest review. |
| Vulnerabilities become toy or implausible | Use realistic domain workflows, conduct realism review, and include NT-1/NT-2 as mandatory failure tests. |
| Learners achieve completion without transferable understanding | Use observable rubrics, independent raters, unfamiliar API evaluation, and controlled guidance ablation. |
| Unsafe testing or accidental exposure | Isolate targets, use synthetic data, explicit authorization, least privilege, secrets protection, and deny-by-default controls. |
| Recovery restores availability but not security state | Verify revocation, trusted-state restoration, authorization state, audit completeness, and rerun proof in NT-4. |
| Reproducibility failure | Pin dependencies, automate setup/reset/run/export, capture configuration and seeds, and test from a clean environment before final acceptance. |
| Scope exceeds a 3–4 person capstone | Freeze a small number of vulnerability classes and one unfamiliar API; defer production certification, universal generalization, and unattended operation. |

## 12. Definition of done

The project is complete only when the final system demonstrates the full workflow, the O2 reference and O3 contribution are separately measurable, transfer is tested on an unfamiliar API, AC-1 through AC-4 and NT-1 through NT-5 have complete evidence, KPI targets and guardrails pass or are explicitly held/revised, an independent reviewer accepts the result, and D1–D7 are reproducible from the versioned package in a clean authorized environment.
