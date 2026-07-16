# Navlands Milestone and Loop Plans

Status: Binding execution format  
Version: 0.4.0  
Date: 2026-07-16

## Purpose

Turn approved requirements into small, verifiable outcomes. Plans contain no
promised calendar deadlines. Sequence, gates, evidence, and blockers determine
progress.

## Plan locations and lifecycle

- Active plans: `docs/plans/active/`.
- Completed plans: `docs/plans/completed/`.
- Evidence: `docs/evidence/PLAN-NNN/`.
- Machine-readable scope: the JSON sidecar beside each plan.

Exactly one plan may be active. Infrastructure work may run beside later
product work only when the active plan explicitly permits it. Plan IDs are
unique across active and completed locations.

Valid statuses are:

- `PLAN_DRAFTED`: complete enough for founder review; implementation forbidden;
- `FOUNDER_PLAN_APPROVED`: founder-approved and eligible for implementation;
- `BLOCKED`: stopped on a recorded prerequisite or approval;
- `COMPLETED`: archived under `docs/plans/completed/` with `VERIFIED` evidence.

## Preflight states

Preflight emits exactly one state: `READY_TO_PLAN`, `READY_TO_IMPLEMENT`,
`READY_TO_VERIFY`, or `BLOCKED`. It returns exit code `0` only for a ready state
and `2` for blockers. Issues use stable reason codes and appear as one
consolidated prerequisite list. Preflight checks presence and policy without
printing secret values.

## Plan header

```md
# Plan NNN — Outcome

Status:
Owner:
Created:
Goal IDs:
Requirement IDs:
Relevant documents:
Scope sidecar:
Related ADRs:
Feature flag:
Explicit exclusions:
```

## Required sections

### 1. User/system outcome

State what becomes usable or verifiable, not merely which files will exist.

### 2. Context and invariants

Link exact requirements and copy only the invariants relevant to the work.

### 3. Scope and exclusions

List allowed path groups and forbidden adjacent behavior. The matching JSON
sidecar is authoritative for mechanical scope validation and must reject path
traversal, product directories, unrelated lockfiles, credentials, and provider
dependencies outside the approved plan.

### 4. Open questions and stop conditions

Identify founder, source-rights, security, data migration, and external-service
blockers. Never hide a product decision inside implementation notes.

### 5. Milestones

```md
## Milestone N — Name

Outcome:
Requirement IDs:
Expected files:
Schema/data changes:
Security/privacy/source-rights impact:
Acceptance criteria:
Targeted validation:
Broader validation:
Rollback/feature flag:
Stop conditions:
Status:
Evidence:
```

### 6. Verification matrix

| Requirement | Automated/manual verification | Status | Evidence |
| --- | --- | --- | --- |

Every requirement maps to evidence. Compilation or a test name alone is not
evidence. Requirement states in evidence are `PASS`, `FAIL`, or `NOT_PROVEN`.
The final plan verdict is `VERIFIED`, `FAILED`, or `NOT_PROVEN`.

### 6.1 Development completion percentage

```text
completion_percent = verified acceptance checks / total acceptance checks * 100
```

This is engineering-plan completion only and never appears as user career
progress. A check counts only with evidence. A milestone cannot reach 100%
until required founder approval and independent verification are recorded.

### 7. Rollback

Describe how to disable or reverse behavior without losing user data, ledger
events, source lineage, or published versions.

### 8. Documentation impact and completion record

Record authority, child-specification, ADR, status, commands, security and data
rights, known limitations, follow-up IDs, and the completion date.

## Scope sidecar contract

Each active plan has `PLAN-NNN.scope.json` containing `schemaVersion`,
`planId`, a resolvable `baseRef`, allowed path globs, forbidden path globs, and
forbidden dependencies. Scope validation evaluates only the committed
`baseRef...HEAD` diff, staged/unstaged changes, and untracked nonignored files;
unchanged repository history is not plan scope.
The sidecar ID must match the plan filename and evidence pack. Scope amendment
requires founder approval when it changes product behavior or expands the
approved boundary; record the amendment in the plan before further writes.

## Approval, evidence, and archive rules

One scoped writer implements a plan. A separate read-only reviewer independently
re-runs the required lane and owns the final evidence verdict. Review roles may
write only the designated evidence pack or ignored temporary/cache artifacts.
The writer and reviewer identities must differ for `VERIFIED` evidence.

To complete a plan, persist the evidence pack, set every required result, record
the independent reviewer, obtain any required founder experience approval, set
the verdict to `VERIFIED`, change the plan status to `COMPLETED`, and move both
the Markdown plan and sidecar together to `docs/plans/completed/`. Never archive
a `FAILED` or `NOT_PROVEN` plan.

## Operating loop

```text
orient -> test/fixture -> implement -> targeted verify -> repair
-> broad verify -> diff review -> user-flow verify -> evidence -> complete
```

Work only on the first incomplete milestone. Amend scope before pursuing an
adjacent capability.

## Initial development strategy

### Plan 001 — Repository and verification harness

- Create only the private Node/TypeScript harness, local skills, native agents,
  preflight, hooks, validators, evidence tooling, and zero-spend CI.
- Establish formatting, lint, strict type, unit, integration, compiled-harness,
  scope, secret, requirement, plan, agent, hook, skill, and evidence checks.
- Do not scaffold Next.js, React, Supabase, auth, database, AI, payments,
  deployment, or any product screen/behavior.

### Plan 002 — Identity, onboarding, and canonical roles

- Auth and RLS.
- Minimal employee onboarding and priority ordering.
- Canonical role/alias model with initial software roles.
- Private draft path.

### Plan 003 — Seed ingestion and Curated retrieval

- Source registry and O*NET/Wikidata permitted imports.
- Provenance, freshness, admin review, and Curated path model.
- Deterministic fixture retrieval and N=10 retirement logic.

### Plan 004 — Playground vertical slice

- React Flow graph adapter and accessible list.
- Role nodes, three-subnode transitions, zoom, progressive reveal.
- Filters, exact/nearest states, Sources drawer.

### Plan 005 — Publication, lineage, and public actions

- Publish/unpublish, minimal public artifact, save/share/fork.
- Tombstone deletion.
- Votes, reports, aggregates, and moderation baseline.

### Plan 006 — Ranking baseline

- Implement founder-approved factor weights only after `OPEN-QUESTIONS.md`
  blockers resolve.
- Deterministic snapshots, reason codes, ties, and population allocation.

### Plan 007 — Genie and credits

- AI gateway/contracts/evals.
- One-path generation, refinement, Earlier generations.
- Atomic units and provisional usage windows.

### Plan 008 — Launch evaluation and hardening

- 100+ fixtures and cold-start gates.
- Unknown-user usability sessions.
- Security, RLS, source-rights, accessibility, observability, and cost review.

Plans may be split further. They may not be collapsed to bypass a gate.
