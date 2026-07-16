# Verification matrix

- Fast lane: formatting, lint, strict types, unit/contract tests, skills,
  agents, hooks, plans, scope, secrets, requirements, and evidence integrity.
- Full lane: fast lane plus integration fixtures, compiled harness, and CI
  policy/control checks.
- Release lane: add only the plan-affected migration, source-rights, AI/cost,
  dependency, rendered-flow, accessibility, and founder approvals.

Use `PASS`, `FAIL`, or `NOT_PROVEN` per requirement and `VERIFIED`, `FAILED`, or
`NOT_PROVEN` for the pack. `NOT_APPLICABLE` is allowed only for command lanes,
with a reason; never turn it into requirement `PASS`. Require raw, sanitized,
path-referenced evidence, plan/commit consistency, writer/reviewer separation,
and any required founder approval.
