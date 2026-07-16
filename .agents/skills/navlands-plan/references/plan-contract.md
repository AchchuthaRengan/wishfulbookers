# Plan contract

Use `docs/PLANS.md` as authority. A plan lives under `docs/plans/active/` with a
matching `PLAN-NNN.scope.json`; exactly one active plan is allowed.

Include the canonical header and sections for outcome, context/invariants,
scope/exclusions, stop conditions, milestones, verification matrix, rollback,
and documentation/completion impact. Use only `PLAN_DRAFTED`,
`FOUNDER_PLAN_APPROVED`, `BLOCKED`, or `COMPLETED`.

Run preflight until it returns the state required by the work. Map every
acceptance check to durable evidence under `docs/evidence/PLAN-NNN/`. Compute
engineering completion only from independently verified checks. Amend the plan
and scope sidecar before expanding work. Archive a plan and sidecar together
only after `VERIFIED` evidence and required founder approval exist.
