# Navlands Decision Log

Status: Active append-only decision index  
Version: 0.1.0  
Date: 2026-07-16

Detailed product authority remains in `MOTHER.md`, `ALGORITHM.md`, and related
specifications. This file records implementation-facing founder decisions so
agents do not reopen them without contradictory evidence.

| Decision ID | Date | Decision | Effect |
| --- | --- | --- | --- |
| NAV-DEC-001 | 2026-07-16 | Use **Approved plan + scoped writer + independent reviewer + deterministic gates + persisted evidence** as the binding harness rule. | No self-approved or evidence-free completion |
| NAV-DEC-002 | 2026-07-16 | Build the synthetic fixture-backed Playground before auth/profile. | Engineering order changes; production onboarding requirement does not |
| NAV-DEC-003 | 2026-07-16 | Use `pnpm` as the only package manager. | Remove/avoid npm lockfile and convert old command wording |
| NAV-DEC-004 | 2026-07-16 | Run prerequisite preflight before expensive planning, subagents, or integration. | Missing inputs stop early with one consolidated checklist |
| NAV-DEC-005 | 2026-07-16 | Never provide secrets or OAuth tokens in chat. Configure credentials in approved local/provider secret stores. | Preflight checks presence only and never displays values |
| NAV-DEC-006 | 2026-07-16 | Use Sol for difficult planning, Terra for scoped implementation/semantic review, and Luna for structured evidence auditing. | Model cost follows task risk; Luna cannot approve critical semantics alone |
| NAV-DEC-007 | 2026-07-16 | Keep subagent depth at one, no automatic agent fan-out for small work, and one writer for overlapping files. | Reduces token waste and write conflicts |
| NAV-DEC-008 | 2026-07-16 | Build the final Landing after the core Playground is real; include a playful 404 and complete system states. | Marketing reflects shipped truth rather than imagined behavior |

## Change rule

Do not edit an old row to hide history. Add a superseding decision with the old
decision ID, rationale, affected requirements, and founder approval.
