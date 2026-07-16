# Navlands MVP Data Model

Status: Logical schema baseline; SQL migrations not yet authored  
Version: 0.3.0  
Date: 2026-07-11

## 1. Conventions

- UUID primary keys unless a source requires a preserved external string ID.
- `created_at`, `updated_at`, and version fields use UTC.
- Published path versions and event ledgers are append-only.
- Soft state changes use explicit status; user erasure uses approved tombstones.
- Money stores integer minor units where currency permits, never float.
- Every user-owned table is covered by RLS.

## 2. Identity and onboarding

### profiles

`user_id`, display settings, locale, account state, onboarding completion time,
public-profile state.

### onboarding_profiles

Owner-only current role, responsibilities, experience range, target role,
salary ranges, location behavior, priority order, and version.

### user_context_snapshots

Immutable minimized input used for a recommendation/generation. Private to the
owner and authorized server processes.

### consent_events

Append-only user, purpose (`service_notice`, `engine_improvement`,
`path_publication`), policy version, grant/withdraw action, locale, time, and
request metadata required for audit.

### privacy_preferences

Current owner settings for optional improvement and email/push channels,
derived from events where appropriate.

## 3. Canonical graph

### roles

`id`, canonical title, family, seniority, locale, active state, taxonomy version.

### role_aliases

Alias text, locale, source mapping, canonical role ID, confidence/review state.

### skills and role_skills

Canonical skills and source-backed role relationships.

### transitions

From/to role, `source_backed | inferred`, active version, semantic rubric
version, and optional location/industry scope.

### transition_facts

Milestones, responsibilities, prerequisites, time/cost information, field-level
source assertions, and display eligibility.

## 4. Sources

### sources

Registry entry: owner, URL, licence evidence, permissions, attribution, cadence,
approval and removal state.

### source_versions

Version, acquired/check timestamps, checksum, private snapshot pointer when
permitted, importer version, activation state.

### source_records

Raw/normalized permitted fact reference with source version and external ID.

### provenance_links

Field-level link from role, transition, salary, learning item, or Curated node
to source record/version.

## 5. Paths

### paths

Owner/system owner, origin type (`lived`, `curated`, `ai_curated`,
`ai_inferred`), visibility, moderation state, active version, retirement state.

### path_versions

Immutable version, start/goal roles, title/summary, path completeness, source
snapshot, prompt/model version when AI, and creator context when permitted.

### path_nodes

Path version, order/branch coordinates, canonical role ID, displayed title,
origin lineage, salary/revenue reference, missing state.

### path_edges

Path version, from/to nodes, order/branch, transition reference, source-backed
state.

### path_subnodes

At most three per edge; milestone/decision/course/resource/guidance type and
provenance.

### path_forks

Origin path/version, fork path/version, fork type, creator, time, and immutable
origin metadata.

### path_tombstones

Non-identifying deleted origin ID/type and deletion state needed for lineage.

## 6. Recommendations and ranking

### recommendations

User/context snapshot, request type, algorithm version, generated time, exact or
nearest state, active AI result, and display allocation version.

### recommendation_candidates

Path/version, population, constraint result, semantic factor snapshot,
deterministic score components, vote aggregate version, total match score, tie
group, reason codes, and display slot.

### constraint_results

Constraint name/class, satisfied/missing/violated state, distance/range,
explanation code, and whether user approved inference/relaxation.

## 7. Votes and reports

### vote_events

Append-only event ID, path, voter, `up | down | retract`, eligibility facts at
event time, quarantine state/reason, optional reason, time, idempotency key.

A current-vote projection enforces one live vote per user/path.

### path_vote_aggregates

Path, U, D, Bayesian factor, algorithm version, computed time.

Creator endorsement is stored separately or explicitly flagged and excluded
from U.

### path_reports

Reporter, path/version, reason, private details, state, moderation result, and
timestamps. Enforce one open report per reporter/path/reason.

### moderation_actions

Actor, subject, action, reason, before/after state, and audit timestamp.

### notification_events

Owner, type, subject path/node/fork, actor visibility policy, grouping key,
channel eligibility, read state, and time. Saver/downvote/report actor identity
is never exposed through this projection.

## 8. Credits and AI operations

### plan_entitlements

User/plan, session and weekly unit limits, window rules, effective dates.

### usage_windows

User, plan, kind (`five_hour`, `weekly`), start/reset time, unit limit, consumed
and reserved units.

### credit_events

Append-only user, integer delta, reason, recommendation/operation reference,
time, idempotency key. Used for one-time grants, permanent purchased credits,
and adjustments.

### credit_reservations

Operation, user, units, source bucket, `reserved | committed | refunded |
expired`, idempotency key, timestamps.

### ai_operations

Request type, context snapshot, prompt/model version, status, reservation,
provider usage/cost, validation result, generated path/version, and failure
codes. Raw private prompts are not required for analytics logs.

## 9. Learning and salary

### salary_ranges

Role, seniority, location, currency, period, gross/net, low/high minor units,
statistic type, origin, source, reference period, last checked, assumptions.
Inferred Curated salary includes Admin review state/reviewer/time before display.

### founder_revenue_ranges

Separate from salary; business stage, geography/market, range, origin,
assumptions, and provenance.

### learning_resources

Provider, title, URL, type, price/currency, language/location, current state,
origin, source, last checked, affiliate state.

## 10. Completion and collection-only signals

### transition_events

Private owner event confirming a prior role when selecting a later role.

### path_signal_events

Append-only saves, forks, Helped Me, completion, and outcome events. They are
collection-only in MVP ranking.

## 11. Essential constraints

- no path version over ten high-level nodes;
- no edge over three subnodes;
- one latest live vote per user/path;
- no self vote in eligible aggregate;
- integer credit units and money minor units;
- origin lineage required for every fork/AI node;
- source-backed claim requires provenance;
- published version immutable;
- AI operation idempotency unique per user/key.

Enforce in both application validation and database constraints/triggers where
safe.

## 12. RLS ownership summary

- Private profiles, onboarding, contexts, drafts, events, and recommendations:
  owner only.
- Public path view: selected public fields only, preferably via secured views.
- Votes: voter may create/change own; public reads receive aggregates.
- Reports: reporter and moderators only; creator cannot read reporter identity.
- Credits/usage: owner read, server-only mutation.
- Sources/raw snapshots: server/admin only; permitted attribution facts public.
- Admin actions: privileged role plus audit.

SECURITY.md and migration tests are authoritative for actual policies.
