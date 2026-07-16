# Plan 001 — Repository and verification harness

Status: FOUNDER_PLAN_APPROVED  
Owner: Codex scoped writer  
Created: 2026-07-16  
Goal IDs: NAV-FEATURE-023  
Requirement IDs: HARNESS-REQ-001, HARNESS-REQ-002, HARNESS-REQ-003,
HARNESS-VER-001, HARNESS-VER-002, HARNESS-VER-004  
Relevant documents: `AGENTS.md`, `docs/HARNESS-IMPLEMENTATION-BRIEF.md`,
`docs/HARNESS.md`, `docs/PLANS.md`, `docs/FEATURE-GOALS.md`,
`docs/SECURITY.md`, `docs/PRIVACY.md`  
Scope sidecar: `docs/plans/active/PLAN-001.scope.json`  
Related ADRs: None  
Feature flag: None; harness controls only  
Explicit exclusions: Playground, application shell, Next.js, React, shadcn,
auth, profile, database, Supabase, AI, payments, providers, migrations,
deployment, and every other product behavior

## 1. User/system outcome

A clean checkout can deterministically establish whether Navlands harness work
is ready to plan, implement, or verify; constrain changes to an approved plan;
run the same zero-spend validation locally and in pull-request CI; and persist
independently reviewable evidence before any product implementation begins.

## 2. Context and invariants

- `NAV-FEATURE-023` requires clean-checkout reproduction, deterministic
  fixtures, independent review, and durable evidence.
- `HARNESS-REQ-001/002/003` require traceability, real evidence, and linked—not
  duplicated—authority.
- `HARNESS-VER-001/002/004` require fast/full offline lanes and zero-spend CI.
- One scoped writer owns repository mutations. Architect, test-designer,
  verifier, evidence-auditor, and design-reviewer remain read-only except for
  ignored temporary artifacts; the independent verifier may persist the
  designated evidence pack.
- Node 24 and direct `pnpm@11.9.0` are the only runtime/package-manager contract.
- No production secret, private user data, live provider, paid service, cloud
  database, or live AI call is required or permitted.

## 3. Scope and exclusions

Allowed work is limited to root repository controls/tool configuration,
`.agents/**`, `.codex/**`, `.github/workflows/verify.yml`, `docs/**`,
`requirements/**`, `scripts/**`, and `tests/harness/**`, as narrowed by the
scope sidecar.

Forbidden work includes every product route, component, domain module,
database/migration, provider client, auth/profile flow, Playground artifact,
payment/credit implementation, deployment target, environment credential, and
npm/yarn/bun lockfile. The package must have no runtime dependencies and no
product/provider development dependency.

## 4. Open questions and stop conditions

No product decision is required for this harness slice. Stop if the repository
identity changes, the plan loses founder approval, required source documents
become unavailable, unrelated user work overlaps the allowed paths, a secret or
private-data artifact is found, validation would require a paid/live service,
or implementation would cross the sidecar boundary. Expand scope only through
a recorded founder-approved amendment.

## 5. Milestones

### Milestone 1 — Deterministic repository controls

Outcome: The native Codex controls, local skills, plan/scope/requirement
contracts, preflight, validators, evidence tooling, tests, and CI policy operate
as one harness-only vertical slice.  
Requirement IDs: HARNESS-REQ-001, HARNESS-REQ-002, HARNESS-REQ-003,
HARNESS-VER-001, HARNESS-VER-002, HARNESS-VER-004  
Expected files: Only paths permitted by `PLAN-001.scope.json`  
Schema/data changes: Harness JSON schemas only; no product or database schema  
Security/privacy/source-rights impact: Least-privilege agents, secret/private
data scanning, synthetic fixtures, no external source activation  
Acceptance criteria: All rows in the verification matrix are independently
proven, and no product path/dependency exists  
Targeted validation: validator unit tests, external skill quick validation,
format, lint, typecheck, unit tests, and compiled harness check  
Broader validation: `pnpm verify:fast -- --plan PLAN-001` and
`pnpm verify:full -- --plan PLAN-001`  
Rollback/feature flag: Revert this harness-only branch; no product state or data
exists to migrate  
Stop conditions: The plan-level stop conditions above  
Status: IN_PROGRESS  
Evidence: `docs/evidence/PLAN-001/`

## 6. Verification matrix

| Requirement        | Automated/manual verification                                          | Status     | Evidence                                   |
| ------------------ | ---------------------------------------------------------------------- | ---------- | ------------------------------------------ |
| HARNESS-REQ-001    | Requirement manifest schema, goal/source/glob checks, orphan detection | NOT_PROVEN | `docs/evidence/PLAN-001/requirements.json` |
| HARNESS-REQ-002    | Evidence positive/negative tests and independent pack validation       | NOT_PROVEN | `docs/evidence/PLAN-001/requirements.json` |
| HARNESS-REQ-003    | Plan/reference validation and diff review for product-rule duplication | NOT_PROVEN | `docs/evidence/PLAN-001/requirements.json` |
| HARNESS-VER-001    | Fast lane from the pinned package manager                              | NOT_PROVEN | `docs/evidence/PLAN-001/commands.json`     |
| HARNESS-VER-002    | Full lane, integration fixtures, and harness compilation               | NOT_PROVEN | `docs/evidence/PLAN-001/commands.json`     |
| HARNESS-VER-004    | Workflow policy validator and frozen clean install contract            | NOT_PROVEN | `docs/evidence/PLAN-001/commands.json`     |
| Harness-only scope | Scope/dependency validator plus manual Git diff review                 | NOT_PROVEN | `docs/evidence/PLAN-001/summary.md`        |
| Independent review | Reviewer differs from writer and persists final verdict                | NOT_PROVEN | `docs/evidence/PLAN-001/summary.md`        |

Development completion: 0% (0/8 independently verified acceptance checks).

## 7. Rollback

Revert the Plan 001 branch or individual harness files. The slice creates no
user data, ledger, source lineage, published version, external resource, or
production deployment. Evidence remains append-only once a plan is completed.

## 8. Documentation impact and completion record

Install the approved canon under `docs/`, synchronize the v0.4 plan contract,
replace repository-placeholder status/command references with real harness
state, and preserve unresolved product questions unchanged. The independent
verifier records the final behavior, commands, deviations, security/data-rights
result, known limitations, and completion verdict. Hosted CI remains a release
blocker until a real run exists or the founder explicitly approves deferral.
