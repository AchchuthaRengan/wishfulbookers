# Navlands Codex Harness Instructions

Status: Binding repository guidance  
Version: 0.4.0  
Date: 2026-07-16

## Mission

Build Navlands from the approved documents without silently substituting
generic career-product assumptions. Keep the user experience friendly while
enforcing complex rules in tested domain code.

## Authority order

Before planning or implementation, read:

1. SECURITY.md and applicable data-rights requirements;
2. MOTHER.md;
3. ALGORITHM.md for retrieval, generation, ranking, credits, votes, or money;
4. OPEN-QUESTIONS.md;
5. relevant child specifications;
6. the active execution plan.

GOAL.md explains intent but does not override requirements. When authorities
conflict, stop, report the exact conflict, and request founder resolution.

## Founder-approval boundary

Do not independently change:

- personas or MVP screens;
- origin labels or population behavior;
- path length/subnode limits;
- constraints, ranking weights, or thresholds;
- credit action costs, plan limits, or pricing;
- verification/proof behavior;
- public/private defaults;
- source permissions;
- progress behavior;
- launch-quality corridors.

Record unapproved behavior in OPEN-QUESTIONS.md. Reversible technical choices
are allowed only when they preserve the approved product.

## MVP invariants

- Employee only; English UI; globally available.
- Launch-quality corridors are support → software roles in product companies
  and QA → development.
- Lived, Curated, and AI populations never rank against one another.
- Curated is not Lived or verified.
- Never modify an origin path; create a version/fork.
- Never recommend without onboarding.
- Never silently relax must-match salary, location, or hard deadline.
- AI generates at most one successful path per generation event.
- Start/end count; normal 6–8; never more than 10 roles.
- At most three transition subnodes.
- Deterministic code applies final ordering.
- Pure retrieval/reranking and unchanged forks are free.
- Invalid AI output is refunded.
- Voting unlocks immediately after onboarding; no account-age wait.
- Curated auto-publication requires every transition to be source-backed;
  inferred salary requires Admin approval.
- Private paths cannot be shared until publication.
- No progress dashboard or verifier system.

## Harness engineering

The repository must make the correct workflow the easiest workflow:

- typed domain modules separate from UI;
- runtime schemas for forms, imports, AI, and external APIs;
- database migrations and RLS policies reviewed together;
- deterministic fixtures for ranking and source ingestion;
- idempotency helpers for mutations and AI operations;
- structured reason codes and version IDs;
- feature flags for AI, publication, Curated display, votes, and sources;
- one command for the full verification suite once scaffolded;
- the same command runs in free GitHub Actions CI with a zero-spend ceiling;
- a machine-readable requirement-to-validation manifest;
- versioned golden recommendation snapshots and movement diffs;
- seeded local/test fixtures containing no production data;
- documentation links in code near non-obvious product invariants.

Do not rely on an agent remembering an unwritten convention.

## Loop engineering

For every milestone:

1. Orient: read requirements, current plan, schema, and related tests.
2. State the smallest user/system outcome.
3. Add or identify a failing verification fixture.
4. Implement the smallest vertical slice.
5. Run targeted checks.
6. Repair immediately; do not stack known failures.
7. Run broader security, type, integration, accessibility, and build checks as
   applicable.
8. Review the diff for scope and product invariants.
9. Exercise the user flow or API contract.
10. Record evidence and update documentation.
11. Stop on founder-decision, rights, security, or destructive-data blockers.

No development calendar deadline overrides a failing gate. The active plan and
STATUS.md update engineering completion percentage from verified acceptance
checks; it never becomes a user career-progress feature.

## Engineering rules

- Strict TypeScript; avoid `any` at trusted boundaries.
- Domain rules must not live in React components.
- React Flow stays in a focused client adapter.
- Provide an accessible semantic path/list representation.
- Treat AI and imported content as untrusted.
- Use Supabase RLS on all user-owned records.
- Use integer money minor units and credit units.
- Use append-only event ledgers and immutable published versions.
- Make imports and mutations idempotent.
- Store algorithm, prompt, model, source, path, vote, and context versions.
- Never expose service-role keys or raw private data in logs.
- Preserve unrelated user work in a dirty worktree.

## Documentation change rule

If implementation requires behavior different from approved documents:

1. stop implementation;
2. describe the conflict and affected requirement IDs;
3. obtain founder approval;
4. update MOTHER.md or ALGORITHM.md first;
5. update dependent specifications and tests;
6. resume under a versioned plan.

## Required task contract

Every implementation task includes:

- Goal
- Requirement IDs
- Relevant documents
- Scope
- Explicit exclusions
- Acceptance criteria
- Validation commands
- Security/data-rights impact
- Stop conditions

If a missing item requires a product decision, ask rather than infer.

## Commands

Plan 001 provides a harness package only; there is no development server or
product build yet.

- format: `pnpm format` / `pnpm format:check`;
- lint: `pnpm lint`;
- type check: `pnpm typecheck`;
- harness unit/integration checks: `pnpm test:unit` / `pnpm test:integration`;
- compiled harness check: `pnpm build:harness`;
- plan preflight: `pnpm preflight -- --mode implement --plan PLAN-NNN`;
- fast verification: `pnpm verify:fast -- --plan PLAN-NNN`;
- full harness verification: `pnpm verify:full -- --plan PLAN-NNN`.

Product dev, production build, database/RLS, AI/data, accessibility, and E2E
commands are `NOT_APPLICABLE` until an approved product plan adds them. Never
report those lanes as passed merely because the harness passes.

## Completion report

Report outcome first, then:

- files changed;
- requirements satisfied;
- commands/tests and results;
- security/data-rights checks;
- documentation updated;
- unresolved risks and anything not verified.
