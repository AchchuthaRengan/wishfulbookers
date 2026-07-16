# Evidence — PLAN-001

Status: NOT_PROVEN
Plan: docs/plans/active/PLAN-001-repository-and-verification-harness.md
Commit: UNSET
Writer: Codex scoped writer
Independent reviewer: Codex `/root/independent_verifier` (round 1 FAILED) and
Codex `/root/round2_verifier` (round 2 FAILED), Codex `/root/round3_verifier`
(round 3 local PASS), Codex round 4 (FAILED), and Codex round 5 (local PASS)
Founder plan approval: APPROVED
Founder experience approval: NOT_REQUIRED

## Outcome

Implemented the private Node/TypeScript repository harness only: approved-plan
preflight, scope and secret controls, requirement traceability, native Codex
roles/hooks, six project-local skills, evidence tooling, deterministic test
lanes, and zero-spend pull-request CI policy. Round 5 independently confirmed
the round-4 repair locally. Hosted Actions and final closure remain pending, so
the durable verdict remains `NOT_PROVEN`.

## Scoped changes

Changes are confined to root repository controls/tool configuration,
`.agents/**`, `.codex/**`, `.github/workflows/verify.yml`, `docs/**`,
`requirements/**`, `scripts/**`, and `tests/harness/**`. No application,
Playground, auth/profile, database, AI, payment, provider, migration, or
deployment artifact was created.

## Acceptance result

Direct pnpm formatting, lint, strict typecheck, 34 unit cases, 21 integration
cases, 55 combined cases, harness compilation, six external skill validations,
and the plan/scope/secret/requirement/agent/hook/evidence/CI validators passed
locally. A focused 9-case scope regression includes the staged-index/worktree
divergence from round 4. The complete fast and full deterministic lanes also
passed; raw stdout/stderr, exit codes, durations, and redaction declarations
are persisted under `test-results/`. Results remain writer evidence until
independently rerun.

## Manual/user-flow evidence

The implement preflight CLI returned schema version 1 and
`READY_TO_IMPLEMENT` for PLAN-001. Product user-flow and rendered-screen checks
are `NOT_APPLICABLE` because this plan intentionally creates no product UI.

## Security, privacy, data, source-rights, cost, and accessibility impact

The repository contains synthetic validator fixtures only, scans intended text
and forbidden credential filenames, prints no secret values, grants write
access only to the implementer role, and uses no live/paid service or production
data. Database/RLS, source activation, product accessibility, AI/model cost,
and product build lanes are `NOT_APPLICABLE`, not reported as passes.

## Deviations

Independent verification round 1 failed because a structurally empty
`VERIFIED` evidence pack was accepted, plan-diff scope included unchanged
history, and the writer used Corepack pnpm 11.7 while direct pnpm 11.9 failed the
old engine contract. The contract is now direct `pnpm@11.9.0`; the original
writer logs remain as audit history, and repaired direct-command outputs plus
the round-1 report are stored under `test-results/`. The founder-approved source
`PLANS.md` had a stale v0.3 header, normalized to v0.4 as instructed.
The package engine was also aligned from an unnecessarily narrow Node 24.18
minimum to the approved Node 24 major contract; hosted CI remains pinned to
Node 24.18.0.
Independent verification round 2 confirmed the round-1 repairs, then failed
because the Stop hook trusted a summary-only `Status: VERIFIED` completion
claim. The repair adds an authoritative `--require-verified` validator mode,
fail-closed hook integration, and red/green isolated regressions. The round-2
report and both regression artifacts are retained under `test-results/`.
Independent verification round 3 passed locally and kept hosted CI pending.
Round 4 then found that the isolated intended-tree whitespace check could miss
an error present only in the real staged index when the worktree copy was
cleaned. The repair combines authoritative `git diff --cached --check` results
with the existing isolated intended-tree check, preserving untracked coverage.
Exact round-3 and round-4 reports and the repaired regression artifact are
retained under `test-results/`.
Independent verification round 5 passed the repaired staged-index enforcement,
the 55-test suite, the Stop-hook matrix, scope, safety, and evidence checks
locally. Its exact report is retained under `test-results/`; it does not prove
the first hosted Actions run.

## Final verification

Rounds 1, 2, and 4 failed; rounds 3 and 5 passed locally. The first hosted
GitHub Actions run and final founder closure remain pending. Local results do
not set requirement statuses to `PASS`, mark Plan 001 `COMPLETED`, or change
the overall `NOT_PROVEN` verdict.
