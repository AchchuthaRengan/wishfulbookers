# Navlands Path and Ranking Algorithm

Status: Approved behavior with bounded open mathematics  
Version: 0.3.0  
Date: 2026-07-11  
Authority: MOTHER.md

## 1. Purpose

This document defines deterministic retrieval, path construction,
classification, constraint handling, ranking populations, display allocation,
votes, and AI charging. It does not invent unresolved weights.

## 2. Invariants

1. Saved onboarding is required.
2. Lived, Curated, and AI rank in separate populations.
3. A source label represents origin, not truth or success.
4. Original Lived and Curated paths are immutable; adaptations are forks.
5. AI creates paths; versioned code applies final ordering.
6. Fixed inputs and versions produce fixed results.
7. Must-match violations are never hidden.
8. One generation event yields at most one successful AI path.
9. Every high-level node is a role or role-like state.
10. More than ten high-level nodes is invalid.

## 3. Inputs

Required:

- current canonical role and original title;
- actual responsibilities;
- experience range;
- target canonical role;
- current and target salary range;
- location and its must/prefer behavior;
- two ordered priorities.

Progressive:

- education budget;
- weekly time;
- desired timeline;
- explicit hard deadline;
- relocation, employment, family, founder, or other material constraints.

Age is excluded from MVP ranking.

## 4. Request pipeline

### Step A — Context gate

If required onboarding is absent, stop, request it, persist it, and restart.

### Step B — Normalize

Map user titles, responsibilities, location, currency, and goal to versioned
Navlands canonical concepts. Preserve original user wording.

### Step C — Retrieve Lived

Retrieve exact full paths, compatible paths, and eligible adjacent segments.
Never merge creators.

### Step D — Retrieve Curated

Retrieve system Curated paths and source-backed transition components. Curated
is ranked only against Curated.

### Step E — Evaluate constraints

For every candidate persist:

- exact-match state;
- each satisfied constraint;
- each violated constraint;
- distance from each violated range;
- missing-data fields;
- whether inference could repair the gap.

Must-match:

- target salary;
- location when selected as must;
- an explicitly hard deadline.

Preference:

- education budget;
- desired timeline;
- location when selected as prefer.

### Step F — Rank each population

Within each origin population:

1. apply the first ordered priority;
2. apply the second only to candidates inside the approved comparability band;
3. apply approved deterministic factor components;
4. create tie groups instead of manufacturing a winner;
5. record reason codes and score components.

Fallback when priorities are skipped:

1. highest earning;
2. onboarding match.

The exact comparison band, tie tolerance, factor normalization, and weights are
open.

### Step G — Allocate Lived-side slots

This is allocation, not cross-population ranking:

```text
0 qualified Lived  -> 3 Curated
1 qualified Lived  -> 1 Lived + 2 Curated
2–9 qualified      -> 2 Lived + 1 Curated
10+ qualified      -> 3 Lived; Curated fallback/search only
```

When Curated inventory cannot fill an allocated slot, return what exists and
continue toward nearest/true-zero behavior. Never fabricate a placeholder.

Curated ranking chooses which Curated item fills its allocated slot. Lived
ranking chooses which Lived item fills its allocated slot.

The `10+` decision uses complete, public paths from distinct creators in the
same canonical start-role-family → target-role → country/remote corridor.

### Step H — Handle no exact result

If exact matches are empty:

1. return nearest alternatives;
2. list every mismatch;
3. permit filter editing;
4. offer Genie generation;
5. spend no units until the user approves generation.

If the nearest route violates at least three constraints, explicitly offer
existing-path adaptation or a full AI path.

### Step I — Reserve units

For an AI action, atomically reserve the applicable units with an idempotency
key. Retrieval, filter changes, and deterministic reranking bypass this step.

### Step J — Generate one AI path

AI may use:

- approved seeded role and transition data;
- permitted related Lived segments;
- approved APIs;
- permitted live information;
- user context and explicit answers.

It may create novel transitions but cannot represent them as source-backed.

### Step K — Validate

Reject the candidate when it has:

- schema failure;
- missing start or goal;
- a graph cycle;
- duplicate adjacent roles;
- more than ten roles;
- unexplained AI-added roles;
- unsupported money represented as fact;
- missing origin or source lineage;
- an undisclosed must-match violation;
- unsafe or disallowed content.

Invalid output is not displayed and the reservation is refunded.

### Step L — Classify AI origin

`AI · Curated` requires:

- every high-level role mapped to a canonical role; and
- at least half of adjacent transitions linked to a source-backed edge.

Otherwise use `AI · Inferred`.

Classification does not change merely because a user later follows or forks
the path.

### Step M — Present

Return exactly one successful path for the generation event. Show it beside up
to three Lived/Curated results. Refinement creates a new version of the active
AI path. A new full generation moves the former active path to Earlier
generations.

## 5. Path construction

### 5.1 High-level roles

- start and goal count;
- fewer than six is allowed;
- six to eight is preferred;
- nine or ten requires confirmation;
- more than ten fails validation.

### 5.2 Transition detail

Each adjacent role pair has at most three subnodes selected for usefulness,
not to maximize content volume.

### 5.3 Source composition

A path may combine permitted O*NET, Wikidata, NCO/NCS, company-framework,
salary, learning, and other records. Every fact retains per-node provenance.

When sources conflict, prefer location-specific and newer information for the
display candidate while retaining both source records internally. AI does not
silently choose a winner.

## 6. Match model

### 6.1 Candidate factor families

- role and goal compatibility;
- responsibility and skill similarity;
- ordered filter compatibility;
- salary compatibility and earning;
- education expense;
- location compatibility;
- desired duration;
- usable path detail;
- source and freshness state;
- vote factor;
- semantic factor values.

Collection-only in MVP:

- forks;
- saves;
- Helped Me;
- completion;
- outcomes.

### 6.2 Lower-strength factors

Approved at 50 percent strength relative to a corresponding full-strength
factor:

- current responsibility similarity;
- location when preference;
- saves when activated later;
- outcomes when activated later.

The numerical normalization remains open.

### 6.3 Detail

Detail means usable completeness, including clear transitions, bounded
milestones, working resources, money context, assumptions, missing-information
handling, and understandable decisions. Raw node count is not detail.

### 6.4 Match score

The score is a deterministic overall fit score. User-visible copy must never
call it likelihood, probability, certainty, or success chance.

## 7. Vote factor

### 7.1 Formula

```text
vote_factor = (U + 2) / (U + D + 4)
```

Examples:

| Eligible votes | Factor |
| --- | ---: |
| none | 0.500 |
| 1 up | 0.600 |
| 1 down | 0.400 |
| 5 up | 0.778 |
| 10 up, 2 down | 0.750 |
| 0 up, 5 down | 0.222 |

The formula shape is approved. Its weight inside the total score is open.

### 7.2 Eligibility

Use only the voter's latest live event when, at event time:

- onboarding was complete;
- voter was not the creator;
- event was not quarantined.

MVP has no account-age delay. Vote controls are disabled until onboarding
completes and unlock immediately afterward.

The creator endorsement is visible if product design chooses to show it but is
excluded from `U`; the tooltip explains this.

### 7.3 Rate limits and quarantine

- one live vote per user/path, changeable and retractable;
- no more than 20 vote actions per user per UTC day;
- per-IP soft limit of 40 per UTC day with log/challenge;
- if a path gains at least 11 votes in a rolling six-hour window and at least
  60 percent of those voters were under seven days old at event time, quarantine
  those events;
- quarantine is auditable and excluded from aggregates until Admin clears it.

### 7.4 Reciprocal rings

The job evaluates a user only after ten eligible votes. It looks for histories
whose votes overwhelmingly target no more than two creators and are
reciprocated. It only flags for Admin and never auto-penalizes.

### 7.5 Storage and recomputation

Fold append-only `vote_events` into versioned `path_vote_aggregates`. Ranking
reads aggregates only. A formula or eligibility change bumps
`algorithm_version` and recomputes.

## 8. Reports

Downvotes affect community rank. Reports create private moderation cases.

A downvote reason may prefill a report, but a report requires a separate user
confirmation. Reports have no direct score component in MVP. Admin action may
quarantine or remove a path, after which ranking recomputes without it.

Measure raw and upheld report rates separately.

## 9. Money algorithm

For each range persist:

- low and high;
- currency and period;
- gross/net semantics;
- location;
- role and seniority;
- source and last checked;
- observed, owner-provided, or inferred origin;
- assumptions.

Target salary remains must-match. Missing reliable market data creates `!` and
requires approval before AI inference. Founder personal salary and business
revenue are separate fields and comparisons.

## 10. Credits and usage windows

### 10.1 Action cost

| Action | Units |
| --- | ---: |
| Full generation/full rerun | 3 |
| Refinement | 1 |
| AI fork adaptation | 1 |
| Invalid output | 0 |
| Retrieval/rerank/manual fork | 0 |

Each base generated path permits at most three refinements.

### 10.2 Atomic lifecycle

```text
reserve -> invoke -> validate -> commit
                         \-> invalid -> refund
```

Every operation uses an idempotency key. A timeout remains reserved only until
the recovery job determines whether a valid generation was committed.

### 10.3 Provisional included allowances

- Free: 9u one-time.
- Plus: 15u/five-hour window and 75u/week.
- Pro: 30u/five-hour window and 150u/week.

The effective available allowance is the lower remaining window. Included
units do not roll over. Quantities remain subject to model-cost validation.

## 11. Output contract

Every recommendation stores or returns:

- recommendation and user-context snapshot IDs;
- origin type and label;
- source path/node IDs and fork lineage;
- canonical and displayed role nodes;
- transition subnodes;
- per-node provenance;
- constraint results and violations;
- missing fields;
- semantic factor values;
- deterministic factor components;
- vote aggregate and algorithm version;
- total match score and tie group;
- concise reason codes;
- salary/revenue origin and assumptions;
- source snapshot version;
- prompt/model version for AI;
- generation and validation timestamps.

See DATA-MODEL.md and AI-CONTRACTS.md.

## 12. Prohibited behavior

- Recommending without onboarding.
- Ranking unlike origin populations against one another.
- Treating popularity as truth.
- Treating Curated as human-lived or verified.
- Treating inferred money as observed.
- Removing AI or Curated lineage.
- Modifying original paths.
- Silently relaxing constraints.
- Charging for invalid output or deterministic reranking.
- Inventing unresolved weights.

## 13. Open mathematics

1. full factor set and numerical weights;
2. 50-percent-strength normalization;
3. first-priority comparison band;
4. tie tolerance and visible rounding;
5. vote-factor weight;
6. detail-score formula and caps;
7. recency treatment in ranking;
