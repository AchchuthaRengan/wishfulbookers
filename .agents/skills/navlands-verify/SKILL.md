---
name: navlands-verify
description: Independently verify a Navlands plan, code change, screen, feature, migration, or release against approved requirements and goals, deterministic commands, security/privacy/accessibility gates, rendered behavior, and persisted evidence. Use after implementation, before founder acceptance, when reviewing a completion claim, or when creating/validating a `docs/evidence/PLAN-NNN` pack.
---

# Navlands verification

1. Remain read-only except when writing the designated evidence pack.
2. Read the approved plan, changed files/diff, cited requirements and goals,
   and raw command artifacts. Do not inherit the writer's conclusion.
3. Reject verification when the plan was unapproved, scope is unclear, the
   writer reviewed itself, commands are missing, or evidence contains only a
   test name/completion claim.
4. Run targeted deterministic checks, then the plan's full lane. Never use live
   paid providers when fixtures are the approved verification surface.
5. Classify every requirement as `PASS`, `FAIL`, or `NOT_PROVEN`; never convert
   missing evidence into a pass.
6. Check scope drift, regressions, secret exposure, architecture boundaries,
   runtime validation, RLS/security, privacy, source rights, accessibility,
   responsive states, migrations, cost, and rollback as applicable.
7. Review the rendered user flow and screenshot/a11y evidence for user-visible
   work. Record founder experience approval separately from technical review.
8. Record blocking findings with file references, impact, reproduction, and the
   violated requirement. Do not implement the repair as verifier.
9. Validate the evidence pack schema and ensure artifacts contain no secrets or
   private production data.
10. Return `VERIFIED`, `FAILED`, or `NOT_PROVEN` and persist the result.

Use `scripts/create-evidence-pack.mjs` to initialize a pack and
`scripts/validate-evidence-pack.mjs` to validate it. Read
`references/verification-matrix.md` for lane selection and evidence rules.
