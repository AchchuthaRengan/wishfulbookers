# Navlands

Navlands is currently at the repository-harness milestone. This branch contains
only deterministic planning, scope, evidence, and verification controls. It
does not contain an application shell or product behavior.

## Harness commands

Use Node 24 and the pinned direct `pnpm@11.9.0` package manager.

```text
pnpm install --frozen-lockfile
pnpm preflight -- --mode implement --plan PLAN-001
pnpm validate:evidence -- --plan PLAN-001 --require-verified
pnpm verify:fast -- --plan PLAN-001
pnpm verify:full -- --plan PLAN-001
```

`verify:full` proves harness readiness only. Product build, database/RLS,
accessibility, and AI checks remain `NOT_APPLICABLE` until an approved product
plan introduces those surfaces.

Project-local Codex hooks provide early feedback only after repository trust is
granted. On an explicit completion claim, the Stop hook fails closed unless the
active plan passes the authoritative evidence validator in
`--require-verified` mode. The direct package commands and CI validators remain
authoritative regardless of hook trust or client support.
