# Navlands Known Issues

Status: Active engineering issue register  
Version: 0.1.0  
Date: 2026-07-16

`OPEN-QUESTIONS.md` contains unresolved product decisions. This file contains
known implementation, evidence, environment, or documentation defects.

## Active

| Issue ID | Severity | Issue | Blocked scope | Required resolution |
| --- | --- | --- | --- | --- |
| NAV-KI-001 | High | Plan 001 passes its writer-run local full lane, but the first real hosted GitHub Actions run is still unproven. | Clean Plan 001 closure | Run hosted CI or explicitly defer it to the release gate with founder approval |
| NAV-KI-003 | Medium | Browser visual verification was previously unavailable because Chrome could not be obtained. | Visual completion claims | Run browser/a11y/visual checks on the connected development machine or CI |
| NAV-KI-004 | Medium | Playground geometry, motion, mobile comparison, `!`, and source-chip density remain prototype decisions. | Final Playground visual approval | Resolve incrementally through rendered founder review; do not block path-contract work |
| NAV-KI-005 | Medium | Supabase/Google/Vercel configuration availability is not proven in the actual repository environment. | Only dependent live integrations | Run plan-specific preflight; never request secret values in chat |
| NAV-KI-006 | High | Plan 001 round-two verification closed the round-one blockers but found that the Stop hook trusted a summary-only VERIFIED claim. The writer repair is present but not independently rechecked. | Plan 001 completion | Run a fresh read-only round-three verification and persist its verdict |

## Resolved in documentation version 0.4+

| Issue | Resolution |
| --- | --- |
| `DECISIONS.md` and `KNOWN-ISSUES.md` missing | Created |
| Actual Navlands repository was not attached | Attached `AchchuthaRengan/wishfulbookers`, created the approved Plan 001 branch, and reproduced the local harness checks |
| Auth-first plan sequence conflicted with founder's Playground-first build order | Plans reordered while preserving production onboarding rules |
| Mixed `npm`/`pnpm` guidance | `pnpm` is binding; actual scripts still require repository verification |
| `STATUS.md` claimed 0% while Plan 001 reported 89% | Status now separates reported local evidence from independently verified evidence |
| AI provider selection appeared to block all coding | Gate narrowed to AI-dependent work only |

## Update rule

Add an issue as soon as a known failure is intentionally carried forward. Move
it to the resolved table only when reproducible evidence or an approved
decision proves closure.
