# Navlands Harness Implementation Brief

Status: Ready for Codex implementation in the actual Navlands repository  
Version: 0.1.0  
Date: 2026-07-16  
Scope: Harness structure only; no Navlands product implementation

## 1. Outcome

Implement the native Codex project harness, project-local skills, prerequisite
gate, goal catalogs, evidence-pack template, deterministic validators, and
actual `pnpm` commands required before Plan 002 product work.

Do not create Playground, auth, profile, database, AI, payment, or other product
behavior in this harness task.

## 2. Required preflight

Before editing:

1. Confirm the actual Navlands repository root.
2. Inspect Git status and preserve unrelated work.
3. Confirm `pnpm` and remove neither npm artifacts nor user changes without
   explicit scope in the active plan.
4. Read root `AGENTS.md`, `docs/HARNESS.md`, `docs/PLANS.md`, `docs/STATUS.md`,
   `docs/DECISIONS.md`, `docs/KNOWN-ISSUES.md`, and the active harness plan.
5. Do not read the full product canon; this task creates no product behavior.
6. Stop if the repository or current Plan 001 state cannot be established.

## 3. Project-local skill rule

Create these as repository skills under `.agents/skills/`, not as personal or
global skills. Each skill must contain valid YAML frontmatter with only `name`
and `description`, remain concise, use imperative instructions, and load
references only when necessary. Add matching `agents/openai.yaml` metadata.

Validate every skill using the available Codex skill validator. Do not create
README, changelog, installation, or quick-reference files inside skills.

## 4. Skill: `navlands-plan`

### `.agents/skills/navlands-plan/SKILL.md`

```markdown
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
```

### Reference

`references/plan-contract.md` contains the canonical plan header, required
sections, valid statuses, preflight states, verification matrix, completion
formula, evidence path, amendment protocol, and archive rules from `PLANS.md`.
It links to authority; it does not copy product requirements.

## 5. Skill: `navlands-playground`

### `.agents/skills/navlands-playground/SKILL.md`

```markdown
---
name: navlands-playground
description: Build or review the Navlands Playground vertical career-path experience, provider-neutral path contracts, synthetic fixtures, semantic timeline/list, React Flow adapter, node interactions, comparison, progressive reveal, origin/source display, and responsive accessibility. Use for any `/playground` domain, application, fixture, UI, interaction, or test work.
---

# Navlands Playground

1. Read the active Playground plan plus cited `MOTHER.md`, `DESIGN.md`,
   `ARCHITECTURE.md`, screen-goal, and feature-goal sections only.
2. Keep the provider-neutral path model authoritative. Treat React Flow as a
   rendering adapter and render the same authorized view model as a semantic
   ordered list.
3. Keep domain rules out of React components and provider SDKs out of domain
   types.
4. Validate inputs and fixtures at runtime before domain use.
5. Use deterministic synthetic fixtures until the active plan explicitly
   enables repositories or live integrations.
6. Label fixture/demo content honestly and make no personalized recommendation
   claim before approved onboarding exists.
7. Preserve path length, transition-subnode, origin, constraint, source,
   progressive-reveal, reduced-motion, and accessibility invariants.
8. Implement loading, empty, recoverable error, keyboard, touch, narrow-screen,
   and no-motion behavior in the owning slice.
9. Stop for unresolved node geometry, motion, or mobile comparison decisions
   only when they materially affect the current slice; present rendered options
   for founder approval.
10. Run contract, unit, interaction, accessibility, visual, build, and full
    harness checks required by the plan and persist evidence.

Read `references/playground-invariants.md` for the approved invariant index and
`references/playground-visual-gate.md` before founder visual review.
```

### References

- `references/playground-invariants.md`: requirement-ID index and file/section
  routes for `NAV-PATH-*`, origin, comparison, constraints, source, and
  accessibility rules.
- `references/playground-visual-gate.md`: desktop/mobile breakpoints, required
  states, keyboard/touch checks, reduced motion, screenshot names, and founder
  questions. It must not invent unresolved visual values.

## 6. Skill: `navlands-frontend-taste`

### `.agents/skills/navlands-frontend-taste/SKILL.md`

```markdown
---
name: navlands-frontend-taste
description: Design, implement, or review a distinctive Navlands frontend screen using the approved calm document-like map aesthetic, semantic tokens, shadcn composition, responsive hierarchy, accessibility, motion restraint, complete system states, and founder visual approval. Use for any user-visible layout, component composition, Landing, Playground styling, profile surface, public artifact, or playful 404 work.
---

# Navlands frontend quality

1. Read the active screen goal, the relevant `DESIGN.md` sections, and the
   active plan. Do not load unrelated product documents.
2. Establish information hierarchy, primary action, responsive behavior, and
   all system states before decoration.
3. Use semantic design tokens only. Do not place raw product colors in feature
   components or communicate meaning by color alone.
4. Compose shadcn primitives instead of forking them casually. Keep product
   behavior in feature UI, not primitive components.
5. Preserve Navlands' map metaphor and calm document-like clarity while
   avoiding generic AI gradients, dashboard clutter, excessive cards, novelty
   motion, or copied competitor layouts.
6. Make hover behavior available through focus and touch; respect reduced
   motion and WCAG 2.2 AA targets.
7. Include polished loading, empty, error, denied, offline, and narrow-screen
   behavior owned by the screen.
8. Use Figma/design references only when connected and cited by the plan. Do
   not claim design-source verification from memory.
9. Use Vercel/browser previews for rendered review when available; never
   promote production without explicit approval.
10. Persist screenshots and accessibility evidence and request founder approval
    of the actual rendered screen before completion.

Read `references/visual-language.md` for approved visual principles and
`references/screen-review.md` before the final experience review.
```

### References

- `references/visual-language.md`: typography roles, spacing rhythm, semantic
  token policy, surface hierarchy, map metaphor, light/dark principles, motion,
  illustration, and anti-patterns. Exact unapproved values remain open.
- `references/screen-review.md`: desktop/mobile/state/accessibility/performance
  review and screenshot checklist.

## 7. Skill: `navlands-data-model`

### `.agents/skills/navlands-data-model/SKILL.md`

```markdown
---
name: navlands-data-model
description: Design, implement, migrate, or review Navlands Supabase/Postgres schemas, canonical career data, user paths, lineage, source provenance, credits, votes, reports, notifications, and RLS. Use for any database table, migration, constraint, index, transaction, idempotency, retention, seed, query, or authorization-policy change.
---

# Navlands data-model changes

1. Read the active plan, cited `DATA-MODEL.md`, `SECURITY.md`, `PRIVACY.md`, and
   applicable product requirements.
2. Define the invariant and threat cases before writing a migration.
3. Keep migrations forward-only, reviewable, and paired with rollback or safe
   disable behavior.
4. Add RLS policies and positive/negative cross-account tests in the same
   milestone as every user-owned table or storage bucket.
5. Use stable IDs, UTC timestamps, integer minor units, explicit versions, and
   append-only events where required.
6. Preserve original titles, origin, lineage, source versions, algorithm/model
   versions, and safe tombstones.
7. Enforce idempotency or natural uniqueness on retriable mutations.
8. Add indexes from concrete access paths and verify query plans when data size
   or latency risk justifies them.
9. Use synthetic seed/test data only; never copy production users, resumes,
   prompts, or credentials.
10. Run migration, rollback/dry-run, RLS, contract, integration, secret, and full
    harness checks and persist evidence.

Read `references/data-invariants.md` for the invariant and table-family index.
```

### Reference

`references/data-invariants.md` indexes naming, IDs, money, time, path versions,
lineage, source facts, events, idempotency, RLS, deletion, and query-plan gates.

## 8. Skill: `navlands-security`

### `.agents/skills/navlands-security/SKILL.md`

```markdown
---
name: navlands-security
description: Threat-model, implement, or independently review Navlands authentication, authorization, RLS, privacy boundaries, secrets, external providers, AI inputs/outputs, uploads, payments, publication, moderation, logging, and abuse controls. Use when a task crosses a trust boundary, handles private data or credentials, changes destructive/public/paid behavior, or requires security evidence.
---

# Navlands security

1. Read the active plan plus cited `SECURITY.md`, `PRIVACY.md`, data, and product
   requirements.
2. Identify assets, actors, entry points, trust boundaries, abuse cases, and
   required deny behavior before implementation or review.
3. Apply least privilege at the database, server, connector, CI, and agent
   layers. Do not trust client claims for ownership, entitlement, cost, origin,
   or moderation state.
4. Validate every form, provider, import, AI, URL, webhook, and stored boundary.
5. Never request, read aloud, log, commit, screenshot, or persist secrets. Check
   configuration presence without displaying values.
6. Require CSRF/redirect/cookie/session controls appropriate to Supabase and
   Next.js for authenticated mutations.
7. Pair public/private, deletion, publication, payment, credit, vote, report,
   and source changes with adversarial and cross-account tests.
8. Treat AI and source content as untrusted data; prevent prompt/source text
   from changing authority or revealing private context.
9. Stop for destructive migration, new data purpose, source-rights uncertainty,
   changed public defaults, irreversible external action, or unresolved high
   severity finding.
10. Persist threat cases, commands, findings, residual risk, and reviewer result
    in the plan evidence pack.

Read `references/security-gates.md` for feature-specific threat and evidence
checklists.
```

### Reference

`references/security-gates.md` indexes auth, RLS, secrets, privacy/logging,
publication/deletion, AI/source injection, credits/payments, moderation/abuse,
and deployment gates without duplicating `SECURITY.md`.

## 9. Skill: `navlands-verify`

### `.agents/skills/navlands-verify/SKILL.md`

```markdown
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
```

### Resources

- `references/verification-matrix.md`: fast/full/release lanes, feature-specific
  evidence selection, and status semantics.
- `scripts/create-evidence-pack.mjs`: accept one validated `PLAN-NNN` argument,
  refuse overwrite unless explicitly requested, and copy the repository
  evidence template without timestamps or secret values.
- `scripts/validate-evidence-pack.mjs`: validate required files/directories,
  JSON schemas, plan/commit consistency, requirement statuses, reviewer
  separation, founder approvals, artifact paths, and absence of obvious secrets.

## 10. Evidence template

Create this repository template:

```text
docs/evidence/_template/
├── summary.md
├── commands.json
├── requirements.json
├── test-results/
│   └── .gitkeep
├── screenshots/
│   └── .gitkeep
├── accessibility/
│   └── .gitkeep
├── security/
│   └── .gitkeep
└── known-risks.md
```

Never commit a literal reusable `PLAN-NNN` evidence directory. The creation
script copies `_template` to `docs/evidence/PLAN-NNN/` for an actual plan.

### `summary.md`

```markdown
# Evidence — PLAN-NNN

Status: NOT_PROVEN
Plan: docs/plans/active/PLAN-NNN-title.md
Commit: UNSET
Writer: UNSET
Independent reviewer: UNSET
Founder plan approval: UNSET
Founder experience approval: NOT_REQUIRED

## Outcome

## Scoped changes

## Acceptance result

## Manual/user-flow evidence

## Security, privacy, data, source-rights, cost, and accessibility impact

## Deviations

## Final verification
```

### `commands.json`

```json
{
  "schemaVersion": 1,
  "planId": "PLAN-NNN",
  "commit": "UNSET",
  "environment": "local|ci|preview",
  "commands": [
    {
      "id": "CMD-001",
      "command": "UNSET",
      "purpose": "UNSET",
      "status": "NOT_RUN",
      "exitCode": null,
      "durationMs": null,
      "artifactPaths": []
    }
  ]
}
```

Do not store full noisy output or secrets inside JSON. Persist useful raw output
as a referenced artifact only when it materially proves the result.

### `requirements.json`

```json
{
  "schemaVersion": 1,
  "planId": "PLAN-NNN",
  "commit": "UNSET",
  "requirements": [
    {
      "requirementId": "UNSET",
      "goalIds": [],
      "source": "UNSET",
      "status": "NOT_PROVEN",
      "verificationIds": [],
      "evidencePaths": [],
      "notes": ""
    }
  ]
}
```

Valid requirement statuses are `PASS`, `FAIL`, and `NOT_PROVEN`.

### `known-risks.md`

```markdown
# Known Risks — PLAN-NNN

## Unresolved

| Risk ID | Severity | Risk | User/system impact | Mitigation/owner | Release blocking |
| --- | --- | --- | --- | --- | --- |

## Accepted residual risk

| Risk ID | Approval | Rationale | Review trigger |
| --- | --- | --- | --- |
```

## 11. Native agent files

Create project-scoped `.codex/agents/*.toml` for architect, implementer,
test-designer, verifier, evidence-auditor, and design-reviewer. Configure model,
reasoning, sandbox, and developer instructions according to `docs/HARNESS.md`.
Keep architect/verifier/evidence/design-review roles read-only. Restrict the
implementer to the plan's workspace scope through instructions and hooks.

Set:

```toml
[agents]
max_threads = 3
max_depth = 1
```

## 12. Hooks and deterministic enforcement

Implement and test:

- plan-status and single-active-plan validation;
- preflight before scoped implementation;
- allowed-file-scope validation against Git diff;
- secret-pattern and forbidden-file checks;
- requirement-manifest integrity;
- evidence-pack schema validation;
- stop hook that rejects unsupported completion claims.

Hooks improve feedback but do not replace package scripts or CI. Run the same
validators through `pnpm verify:fast`/`pnpm verify:full` so a hook-trust or
client difference cannot bypass the gates.

## 13. Definition of done for this harness task

- All required folders and files exist in the actual Navlands repository.
- All six skills pass skill validation and have matching `agents/openai.yaml`.
- Evidence creation/validation scripts pass positive and negative tests.
- Preflight returns each supported state from deterministic fixtures.
- Plan/file-scope/secret/requirement validators have failing-case tests.
- Package manager and lockfile are consistently `pnpm`.
- `pnpm verify:full` passes from a clean install without production secrets,
  live AI calls, paid services, or production data.
- Hosted GitHub Actions runs the same command, or its approved deferral remains
  explicitly recorded as a release blocker.
- A separate read-only verifier reviews the diff and evidence.
- No product screen or feature was implemented.

## 14. Prompt for the next Codex turn

```text
Implement the Navlands repository harness only from
docs/HARNESS-IMPLEMENTATION-BRIEF.md.

First run preflight and inspect the actual repository, Git status, Plan 001,
package manager, and current verification commands. Do not implement Playground,
auth, profile, database, AI, payments, or any product behavior.

Create the native .codex agents, project-local .agents skills, prerequisite
gate, hooks, evidence template/scripts, goal files, missing control files, and
actual pnpm validation commands described in the brief. Use one scoped writer.
After implementation, run targeted and full deterministic checks, then use a
separate read-only verifier. Persist raw evidence under the active harness plan.

Do not request secrets. If a genuinely required input is missing, stop before
model fan-out and give me one consolidated prerequisite list. Ask for my
approval before changing product behavior, deleting user work, installing a
new provider, or performing an irreversible external action.
```
