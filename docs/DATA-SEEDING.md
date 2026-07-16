# Navlands Data Seeding and Source Policy

Status: Approved MVP baseline  
Version: 0.3.0  
Date: 2026-07-11

## 1. Objective

Seed enough permitted role, transition, salary, and learning data to make the
two software launch corridors useful before Lived supply exists. Seeding solves
content discovery cold start; it does not create or imitate Lived paths.

## 2. Launch coverage

- Global product availability, English first.
- Guaranteed-density corridors:
  - support roles → software roles in product companies;
  - QA roles → development roles.
- 50–100 canonical roles.
- 200–400 transition components.
- 20–30 internally reviewed Curated/reference ladders.

## 3. Source classes

| Source | MVP use | Rights rule |
| --- | --- | --- |
| O*NET downloadable database | Primary occupations, responsibilities, skills | Use published downloadable-data licence and attribution |
| Wikidata structured data | Aliases, hierarchy, identifiers | CC0 structured facts; retain source references |
| Wikipedia prose | Not copied into MVP data | Link only unless a deliberate CC BY-SA workflow is approved |
| NCS/NCO | India mapping after permission | Written permission or clearly documented reusable publication only |
| Lightcast | Not active | Add only after production/derivative/display rights are licensed |
| Progression.fyi | Discovery index | Never treat index presence as a licence |
| Company frameworks/blogs | Career levels and transitions | Explicit compatible commercial/open licence or written permission |
| Official salary sources | Location/occupation ranges | Per-source reuse and attribution review |
| Course providers | Learning resources | Public link/metadata only under approved terms |
| Personal profiles/social media | Excluded | No scraping without direct consent and approved rights |

## 4. Source registry gate

No acquisition job runs until a registry entry records:

- source ID, owner, canonical URL, and jurisdiction;
- acquisition method and authentication;
- licence or written permission evidence;
- commercial use, derivative, storage, snapshot, display, and redistribution
  permissions;
- required attribution;
- permitted fields;
- prohibited fields;
- refresh cadence and expected release cadence;
- robots/technical access requirements where relevant;
- takedown/removal contact;
- review owner and approval state.

An unknown permission is a deny state, not an assumed yes.

## 5. Acquisition and snapshot policy

### 5.1 Permitted full snapshot

For open/licensed sources allowing storage, keep a private versioned raw
snapshot with checksum, acquisition time, licence version, and importer version.

### 5.2 Metadata-only evidence

When full copying is not permitted, keep:

- source URL;
- retrieval timestamp;
- content hash where lawful/possible;
- licence evidence;
- normalized permitted facts;
- attribution text;
- transformation/import version.

Do not expose private snapshots as public documents.

## 6. Ingestion pipeline

```text
source registry approval
-> acquire
-> verify checksum/version
-> parse into source records
-> normalize to Navlands canonical IDs
-> deduplicate and preserve aliases
-> attach field-level provenance
-> validate licence/schema/ranges
-> founder/admin review full ladders
-> activate source version
-> rebuild affected graph/recommendations
```

Imports are idempotent. Reprocessing the same source version produces the same
normalized records and no duplicates.

## 7. Canonical model policy

Navlands owns permanent canonical role IDs. External IDs map to them and never
become database identity.

Role granularity is role + seniority by default. Preserve:

- source/original title;
- common aliases;
- canonical title;
- seniority;
- occupation family;
- industry context when material;
- locale/language;
- active/deprecated state.

Unknown roles enter a review queue; AI cannot directly mint production roles.

## 8. Transition components

A source-backed edge may originate from:

- explicit company/government ladder;
- strong responsibility and prerequisite-skill overlap under an approved
  deterministic/semantic rubric;
- permitted labor-market transition data.

AI semantic judgment alone creates an inferred edge, not a source-backed edge.

Store source facts and edges rather than one universal 6–8-node route. AI may
compose personalized paths from the graph. System Curated paths are reviewed,
versioned arrangements of these components.

## 9. Conflict handling

Do not overwrite disagreements. Store each source assertion. For display:

1. prefer the user's location;
2. prefer newer data when definitions are comparable;
3. preserve both values internally;
4. expose source/date;
5. use a wide range or missing state when reconciliation is unsafe.

AI is not authorized to silently adjudicate source rights or factual conflicts.

## 10. Salary foundation

Free official candidates:

- US BLS OEWS;
- Canada Job Bank/Open Government wages;
- UK ONS ASHE;
- Jobs and Skills Australia;
- Eurostat occupation earnings;
- India PLFS where sufficiently granular.

Every range records role, seniority where available, location, currency, period,
gross/net semantics, low/high, statistic type, source, reference period, and
last checked.

Coarse country data cannot be presented as precise city/seniority data. When no
reliable range exists, use `!` and obtain permission before AI inference.

## 11. Learning resources

Allow government, accredited, reputable commercial, and AI-discovered items.
Before display confirm:

- live URL;
- identifiable provider;
- current availability;
- price/free status where known;
- language/location applicability;
- milestone relevance;
- source and last checked.

AI-discovered items carry an origin label. Affiliate relationships do not
change ranking in MVP.

## 12. Freshness

| Record | Check cadence |
| --- | --- |
| Role taxonomy | Quarterly |
| Salary | Monthly or quarterly, bounded by source cadence |
| Company ladder | Six months |
| Course/resource | Monthly |
| Wikidata alias | Monthly |

`stale` means `next_check_at` passed without a successful check. Stale records
remain visible with `Last checked` unless withdrawn or materially unsafe. No
ranking penalty is active without founder approval.

## 13. Review and activation

Automated checks apply to every imported record:

- schema and required fields;
- registry permission;
- field-level provenance;
- duplicate/alias collision;
- numeric/currency/range sanity;
- URL protocol and reachability where relevant;
- source/version identity.

Founder/admin review is required for every full Curated/reference ladder.
Individual role facts may activate automatically after all checks pass.

Exception: an AI-assisted full Curated ladder may auto-publish when every role
is canonical, every transition is source-backed, and every automated
rights/provenance/schema/conflict check passes. Any inferred transition remains
an Admin draft. Inferred Curated salary always requires Admin approval before
display.

## 14. Withdrawal and rebuild

When rights change or removal is requested:

1. disable affected source version;
2. hide prohibited fields/snapshots;
3. identify dependent roles, edges, Curated paths, and recommendations;
4. rebuild or declassify dependent paths;
5. preserve only legally permitted audit/tombstone records;
6. record the action.

## 15. Cold-start acceptance

Use at least 100 fixed onboarding/goal fixtures. Data seeding passes when:

- 90% of launch-corridor fixtures retrieve one usable source-grounded route
  without AI failure;
- 70% return a top result satisfying the constraint thresholds associated with
  the fixture's two ordered priorities;
- all displayed facts have resolvable provenance;
- no fixture falsely labels source material as Lived or verified;
- difficult paths clearly separate source-backed and inferred transitions.

## 16. Open source decisions

- written NCS/NCO permission details;
- production salary-source entries per supported country;
- future Lightcast commercial terms;
- future company partnership/affiliate neutrality policy;
- exact taxonomy/edge semantic rubric;
- how country coverage quality is shown globally.
