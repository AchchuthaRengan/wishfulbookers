# Navlands Engineering Harness

Status: Binding engineering control  
Version: 0.4.0  
Date: 2026-07-14

## 1. Purpose

The harness converts approved Navlands requirements into small, verifiable
software outcomes. It exists to stop product drift, silent AI assumptions,
unverified completion claims, and large batches of code that cannot be safely
reviewed.

`AGENTS.md` governs agent behavior. This file defines the repository controls
that make that behavior testable.

## 2. The Navlands rule

Build Navlands from its own product thesis:

> Help an employee understand, compare, adapt, and share role-to-role career
> routes without pretending that a route guarantees success.

Competitor parity is not a requirement. A competitor finding may create a
research note, but it may change product scope only through the founder change
protocol in `MOTHER.md`.

## 3. One work item at a time

Exactly one plan is active under `docs/plans/active/`. Every implementation
turn works only on its first incomplete milestone unless the plan explicitly
allows a parallel infrastructure repair.

Every task packet contains:

- goal and smallest user/system outcome;
- requirement IDs and authority links;
- included files and explicit exclusions;
- acceptance criteria;
- targeted and broader validation commands;
- security, privacy, source-rights, and migration effects;
- feature flag or rollback behavior;
- founder stop conditions.

## 4. Requirement traceability

### HARNESS-REQ-001 — No orphan implementation

Every implemented product behavior maps to an approved requirement ID in
`requirements/manifest.json`. Infrastructure behavior maps to a `HARNESS-*`
requirement in this file.

### HARNESS-REQ-002 — No pretend validation

A requirement is not `verified` until its listed automated checks pass or its
manual evidence is recorded. A test name alone is not evidence.

### HARNESS-REQ-003 — No duplicated authority

Plans and tests may link to approved behavior but cannot redefine it. When code
needs different behavior, stop and update `MOTHER.md` or `ALGORITHM.md` through
founder approval before implementation resumes.

## 5. Verification lanes

### HARNESS-VER-001 — Fast lane

The fast lane runs deterministic, offline checks suitable for every meaningful
change:

- formatting;
- lint;
- strict type checking;
- unit and contract tests;
- requirement-manifest integrity;
- architecture-boundary checks;
- repository secret-pattern checks.

### HARNESS-VER-002 — Full lane

The full lane includes the fast lane plus integration/RLS checks when present,
deterministic evaluation fixtures, accessibility checks, and a production
build.

### HARNESS-VER-003 — Release lane

The release lane adds migration dry-runs, source-rights review, AI/model cost
and quality evaluation when affected, dependency review, visual user-flow
verification, and founder sign-off.

### HARNESS-VER-004 — Zero-spend CI

Pull-request CI runs the full deterministic lane without paid APIs, production
secrets, production data, Supabase cloud projects, or live AI calls. AI,
source, time, ID, and market responses use versioned fixtures or fakes.

## 6. Architecture controls

### HARNESS-ARCH-001 — Domain isolation

Product rules live in typed domain modules. Domain code must not import React,
React Flow, Next.js request APIs, Supabase clients, or model-provider SDKs.

### HARNESS-ARCH-002 — Untrusted boundaries

Forms, environment variables, database records crossing trust boundaries,
source imports, and AI/provider outputs require runtime validation before
domain use.

### HARNESS-ARCH-003 — Lazy external clients

Database, payment, analytics, email, and model clients initialize only inside
explicit getters or request-scoped factories. Importing a module must never
require a production secret or network connection.

### HARNESS-ARCH-004 — Deterministic core

Ranking, constraint evaluation, origin classification, credit arithmetic,
vote folding, and path validation accept explicit versioned inputs. They do
not read the clock, random IDs, locale, environment variables, or networks
implicitly.

### HARNESS-ARCH-005 — Accessible graph twin

Every React Flow path experience must have a semantic list/tree equivalent
that supports keyboard use and can be tested without canvas geometry.

## 7. Data and mutation controls

### HARNESS-DATA-001 — RLS with schema

Every user-owned Supabase table ships with RLS policies and allow/deny tests in
the same milestone. A migration without its authorization evidence is
incomplete.

### HARNESS-DATA-002 — Idempotent mutations

Publication, forks, votes, reports, credit reservations, AI operations, and
imports use idempotency keys or natural uniqueness constraints appropriate to
the operation.

### HARNESS-DATA-003 — Immutable history

Published path versions and event ledgers are append-only. Corrections create
new versions or explicit reversal events; they do not rewrite history.

### HARNESS-DATA-004 — Safe fixtures

Local and CI fixtures contain synthetic data only. Production exports, raw
resumes, user prompts, and service credentials are forbidden.

## 8. AI and source controls

### HARNESS-AI-001 — Schema before prompt

An AI operation requires a versioned input/output contract, deterministic
validator, failure codes, token/cost ceiling, idempotency behavior, and fixture
suite before provider integration.

### HARNESS-AI-002 — Replayable evaluation

Prompt/model changes run recorded fixtures and produce a result diff. Final
ordering remains deterministic application code even when a bounded semantic
factor originates from AI.

### HARNESS-SOURCE-001 — Rights before activation

An imported source cannot become user-visible until its registry entry,
licence/permission evidence, provenance mapping, freshness rule, withdrawal
behavior, and validation result are recorded.

## 9. Evidence and completion

Each milestone evidence record contains:

- commands executed and exit results;
- acceptance checks passed/failed;
- manual flow or screenshot evidence when required;
- RLS/security/source-rights evidence when affected;
- requirement and documentation changes;
- unresolved risks;
- founder sign-off when required.

Engineering completion is:

```text
verified acceptance checks / total acceptance checks * 100
```

The percentage is reported only in the active plan and `STATUS.md`. It is not a
Navlands user-progress feature.

## 10. Stop conditions

Stop and ask the founder when work would change:

- MVP persona, surfaces, or public/private behavior;
- path labels, population allocation, length, or origin rules;
- constraint classes, ranking mathematics, or thresholds;
- credits, pricing, billing, votes, verification, or proof behavior;
- source permissions or user-data use;
- a destructive migration or irreversible external action.

Normal reversible engineering choices that preserve approved behavior do not
require a new founder questionnaire.

## 11. Anti-overengineering gate

Do not add a service, queue, agent, vector database, cache, abstraction,
provider, or deployment target until an active milestone has a verified need
for it. The MVP begins as a Next.js/Supabase modular monolith. The harness may
anticipate boundaries in interfaces and tests, but it may not prebuild unused
systems.
