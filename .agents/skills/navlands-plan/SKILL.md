---
name: navlands-plan
description: Plan or amend a Navlands implementation task using the approved canon, one-active-plan rule, goal IDs, prerequisite gates, scoped writer, independent reviewer, deterministic validation, and persisted evidence. Use when starting a screen or feature, converting a goal into an execution plan, revising scope after a blocker, or deciding whether implementation is ready to begin.
---

# Navlands planning

1. Run the plan preflight before loading broad context or spawning subagents.
2. Read `AGENTS.md`, `docs/HARNESS.md`, `docs/PLANS.md`, the selected goal entry,
   and only the authority sections cited by that goal.
3. Confirm that no other product plan is active.
4. State one smallest user/system outcome and explicit non-goals.
5. Map every behavior to requirement and goal IDs.
6. List allowed files/directories and forbidden adjacent changes.
7. List schema, security, privacy, source-rights, cost, credential, migration,
   feature-flag, and rollback effects.
8. Define targeted, full, user-flow, accessibility, visual, and manual checks
   proportionate to the task.
9. Assign one scoped writer and a separate read-only reviewer.
10. Mark real founder decisions as blockers. Do not convert technical choices
    into unnecessary founder questions.
11. Set status to `PLAN_DRAFTED`; do not implement until the required founder
    approval changes it to `FOUNDER_PLAN_APPROVED`.

Read `references/plan-contract.md` when creating or validating the plan file.
