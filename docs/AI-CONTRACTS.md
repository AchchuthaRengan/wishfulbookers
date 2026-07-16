# Navlands AI Contracts

Status: Logical contract baseline  
Version: 0.3.0  
Date: 2026-07-11

## 1. Boundary

AI returns candidate data only. It cannot assign the final rank, charge units,
publish, mark verification, approve a source licence, or mutate an origin path.

## 2. Full path candidate

Required logical shape:

```ts
type AiPathCandidate = {
  schemaVersion: string
  startRoleId: string
  goalRoleId: string
  roles: Array<{
    tempId: string
    canonicalRoleId: string | null
    displayTitle: string
    sourceRecordIds: string[]
    rationale: string
  }>
  transitions: Array<{
    fromTempId: string
    toTempId: string
    sourceEdgeIds: string[]
    inferred: boolean
    subnodes: Array<{
      type: 'milestone' | 'decision' | 'course' | 'resource' | 'guidance'
      label: string
      sourceRecordIds: string[]
    }>
  }>
  constraintResults: Array<{
    key: string
    status: 'satisfied' | 'violated' | 'missing'
    explanation: string
  }>
  assumptions: string[]
  salaryRanges: AiMoneyRange[]
  revenueRanges: AiMoneyRange[]
}
```

Runtime implementation may refine field names but cannot weaken the contract.

## 3. Money range

```ts
type AiMoneyRange = {
  subject: 'salary' | 'business_revenue'
  lowMinor: number
  highMinor: number
  currency: string
  period: 'hour' | 'month' | 'year'
  grossNet: 'gross' | 'net' | 'unknown'
  origin: 'source_backed' | 'owner_provided' | 'inferred'
  locationId: string | null
  sourceRecordIds: string[]
  assumptions: string[]
}
```

Founder salary and revenue cannot share one object with ambiguous subject.

## 4. Validation sequence

1. Parse strict schema.
2. Validate supplied IDs against context allow-lists.
3. Confirm start and goal.
4. Confirm path is acyclic and adjacent nodes differ.
5. Apply role count and three-subnode limits.
6. Validate money ranges and labels.
7. Confirm must-match violations are declared.
8. Confirm lineage/source fields.
9. Run safety and prohibited-claim checks.
10. Classify AI · Curated or AI · Inferred in deterministic code.

Any failure rejects the complete candidate for display and triggers refund.

## 5. Deterministic origin classification

```text
known_role_ratio = canonical-mapped roles / total roles
source_edge_ratio = source-backed transitions / total transitions

AI · Curated when known_role_ratio = 1 and source_edge_ratio >= 0.5
AI · Inferred otherwise
```

The model may propose source IDs; code validates them and calculates ratios.

## 6. Refinement contract

Refinement returns the complete proposed new version plus:

- base path/version ID;
- requested change summary;
- retained node IDs;
- added/removed/reordered node IDs;
- changed assumptions and constraint results.

Application code verifies that the base belongs to the user and has fewer than
three prior refinements.

## 7. Semantic factor contract

Only named, bounded fields from an approved rubric may be returned. Each value
includes reason codes and referenced input spans/source IDs. No generic
free-form `qualityScore` is allowed.

The exact rubric remains an open question and must be versioned before ranking
implementation.

## 8. Failure codes

At minimum:

- provider_timeout;
- provider_unavailable;
- invalid_serialization;
- invalid_schema;
- invalid_role_count;
- graph_cycle;
- duplicate_adjacent_role;
- unknown_source_id;
- undisclosed_constraint_violation;
- invalid_money_claim;
- unsafe_content;
- prompt_injection_detected;
- budget_exceeded;
- persistence_failure.

Failure codes power refund, retry, analytics, and evaluation without exposing
raw private prompts.

## 9. Idempotency

The same user/action idempotency key returns the committed result or current
operation state. It cannot create a second provider call or debit.

## 10. Live information

Live retrieval is off unless the generation flow explicitly enables an
approved source connector and records user approval, source URL/ID, access time,
and permitted use. Search text is not automatically trustworthy or reusable.
