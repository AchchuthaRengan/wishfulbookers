# Navlands Screen Goals

Status: Delivery goal catalog; behavior remains governed by `MOTHER.md` and `DESIGN.md`  
Version: 0.4.0  
Date: 2026-07-16

## Usage

Activate one smallest usable screen outcome through a versioned plan. A screen
is not complete because its route renders. It must satisfy its product outcome,
all relevant states, accessibility, responsive behavior, independent review,
and founder experience approval.

## Screen catalog

| Goal ID | Route/surface | Goal | Ready to plan | Required founder approval |
| --- | --- | --- | --- | --- |
| NAV-SCREEN-001 | `/playground` | Let a user understand a career route, reveal next roles, inspect origins and trade-offs, and compare useful alternatives. | Yes, using synthetic fixtures | Node geometry, hierarchy, interactions, mobile behavior, visual tone |
| NAV-SCREEN-002 | `/sign-in`, `/sign-up`, recovery | Let a user enter or recover Navlands securely with minimal friction. | After Supabase configuration preflight | Final copy and live Google OAuth flow |
| NAV-SCREEN-003 | `/onboarding` | Collect only context that materially changes retrieval while making the user understand why it is needed. | After auth/profile schema plan | Field sequence, priority control, consent presentation |
| NAV-SCREEN-004 | `/profile`, `/profile/edit` | Let a user understand and control identity, career context, privacy, consent, and publication defaults. | After auth/RLS | Public/private field presentation and destructive actions |
| NAV-SCREEN-005 | `/saved` | Let a user return to saved and forked routes without turning Navlands into progress tracking. | After persistence | Information hierarchy and empty state |
| NAV-SCREEN-006 | `/usage` | Explain unit costs, remaining allowances, refunds, and reset times without dark patterns. | Blocked until unit/provider tests where affected | Pricing/allowance copy and payment actions |
| NAV-SCREEN-007 | `/notifications` | Show useful product, source, moderation, refund, and path-impact events without streaks or engagement spam. | After event model | Event categories, privacy, grouping, email opt-in |
| NAV-SCREEN-008 | `/paths/[slug]` | Present a shareable public career path with origin, sources, lineage, creator attribution, and safe actions. | After publication/lineage | Public information boundary and share experience |
| NAV-SCREEN-009 | `/people/[handle]` | Present a minimal public creator identity and published paths without exposing private profile context. | After publication/privacy model | Public fields and pseudonym/display behavior |
| NAV-SCREEN-010 | `/` | Explain the working product truthfully and move the right employee into Playground exploration. | After core Playground works | Positioning, hero, product demonstration, final visual direction |
| NAV-SCREEN-011 | `not-found.tsx` | Turn a dead route into a playful Navlands map moment with a clear route back. | After navigation language stabilizes | Concept, illustration/motion, final copy |
| NAV-SCREEN-012 | loading/error/empty/offline/denied states | Keep every important flow recoverable and understandable when data or services fail. | Alongside each owning screen | Destructive/retry copy and unrecoverable boundaries |
| NAV-SCREEN-013 | Internal Admin | Safely review role mappings, provisional roles, sources, inferred salary, reports, and failed processing without exposing unnecessary private data. | When the corresponding governed feature begins | Admin scope, roles, destructive actions, audit behavior |

## Required screen completion evidence

Every user-visible screen provides:

1. Route and component tests.
2. Happy, loading, empty, error, denied, and narrow-screen coverage where applicable.
3. Keyboard and screen-reader behavior.
4. Reduced-motion behavior where animation exists.
5. Mobile and desktop screenshots at approved breakpoints.
6. Browser console/network-error check.
7. Independent review against the active plan and `DESIGN.md`.
8. Founder approval of the actual rendered experience, not only source code.

## Explicit exclusions

Do not create Feed, Trending, Hot, Rising, generic global search, job marketplace,
employer, student, parent, verifier, portfolio, or progress-dashboard screens.
A role input/search inside Playground and a scoped Curated starting-points view
are not generic global discovery surfaces.
