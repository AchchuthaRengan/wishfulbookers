# Navlands Feature Goals

Status: Delivery goal catalog; detailed rules remain in authoritative specifications  
Version: 0.4.0  
Date: 2026-07-16

## Feature catalog

| Goal ID | Feature | Outcome | Current gate |
| --- | --- | --- | --- |
| NAV-FEATURE-001 | Design system | Semantic tokens and composable primitives produce a distinctive, calm, map-like product across light/dark and responsive states. | Playground prototypes resolve remaining visual questions |
| NAV-FEATURE-002 | Path domain model | A provider-neutral, immutable, typed career-path contract represents roles, transitions, origin, lineage, constraints, sources, and versions. | Ready with synthetic fixtures |
| NAV-FEATURE-003 | Graph + accessible twin | React Flow and the semantic ordered list render the same authorized view model without domain rules inside UI components. | Ready with synthetic fixtures |
| NAV-FEATURE-004 | Playground interaction | Reveal, zoom, inspect, compare, filter, and origin/source actions remain understandable by mouse, keyboard, touch, and screen reader. | Visual prototype decisions recorded during implementation |
| NAV-FEATURE-005 | Authentication | Supabase email/password and Google OAuth establish secure sessions and recovery without leaking secrets. | Supabase project and Google provider configuration required only for live integration |
| NAV-FEATURE-006 | Authorization/RLS | Every private user-owned row and storage object denies cross-account access by default. | Schema plan, migrations, and allow/deny tests required together |
| NAV-FEATURE-007 | Profile/onboarding | Store the minimum approved user context, priorities, consent, and privacy settings required for retrieval. | Auth/RLS and approved field flow |
| NAV-FEATURE-008 | Canonical roles | Preserve original titles while mapping role aliases to stable canonical identities and provisional-review states. | Initial taxonomy/source plan |
| NAV-FEATURE-009 | Retrieval | Retrieve Lived and Curated populations separately and classify exact, nearest, or true-zero results. | Source registry and fixture contracts |
| NAV-FEATURE-010 | Constraint evaluation | Apply must/prefer rules without silent relaxation and emit explicit mismatch reason codes. | Ready for approved existing rules |
| NAV-FEATURE-011 | Ranking/allocation | Produce deterministic within-population order and Lived-side slot allocation with replayable snapshots. | Blocked by `OQ-RANK-*` for final mathematics |
| NAV-FEATURE-012 | Sources/provenance | Activate only permitted facts with source, licence, freshness, withdrawal, and affected-node evidence. | O*NET/Wikidata registry ready; other sources gated individually |
| NAV-FEATURE-013 | Save/fork/version/lineage | Preserve origin and immutable versions while allowing safe manual or AI-assisted adaptation. | Path persistence and RLS |
| NAV-FEATURE-014 | Publication/public artifacts | Publish explicitly selected fields and keep private context private; support safe unpublish/deletion tombstones. | Privacy, moderation, and lineage tests |
| NAV-FEATURE-015 | Genie AI | Return one bounded candidate, validate it, classify origin, preserve assumptions, and fail/refund safely. | Blocked by AI rubric/provider evaluation and contracts/evals |
| NAV-FEATURE-016 | Credits/usage | Reserve, commit, refund, and display integer units atomically and idempotently. | Provider cost tests before final included quantities |
| NAV-FEATURE-017 | Payments/entitlements | Derive entitlements from verified server/webhook state and isolate payment providers. | India Razorpay plan; pricing and global provider gates remain |
| NAV-FEATURE-018 | Votes/reports/moderation | Separate community usefulness from private reports and apply deterministic abuse controls. | Ready only with event, rate-limit, privacy, and admin evidence |
| NAV-FEATURE-019 | Notifications | Deliver approved useful events while protecting saver, voter, and reporter privacy. | Event model and preference controls |
| NAV-FEATURE-020 | Privacy/deletion/export | Honor purpose-specific consent, private defaults, safe logs, deletion, tombstones, and applicable exports. | Legal review before paid public launch where required |
| NAV-FEATURE-021 | Observability/analytics | Measure product and system outcomes with version/correlation IDs without logging raw private context. | Event schema and consent review |
| NAV-FEATURE-022 | Administration | Provide least-privilege review for mappings, sources, salary inference, moderation, and failures with auditable decisions. | Built alongside governed features, never as an unscoped dashboard |
| NAV-FEATURE-023 | Release harness | Reproduce verification from clean checkout using zero-spend CI, deterministic fixtures, independent review, and persisted evidence. | Plan 001 hosted-CI evidence pending |

## Feature completion rule

A feature completes only when:

- every implemented behavior maps to approved requirement and goal IDs;
- data/API/AI boundaries use runtime validation;
- migrations include rollback and RLS evidence when applicable;
- targeted and full deterministic gates pass;
- security, privacy, accessibility, source-rights, and cost effects are recorded;
- an independent reviewer returns no blocking finding;
- required founder behavior/experience approval is recorded;
- evidence is stored under `docs/evidence/PLAN-NNN/`.

Open-question gates block only the dependent behavior. They must not block
unrelated fixture-backed Playground, layout, accessibility, or harness work.
