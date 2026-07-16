# Navlands MVP Evaluation Specification

Status: Required before AI/retrieval beta  
Version: 0.3.0  
Date: 2026-07-11

## 1. Evaluation set

Maintain at least 100 versioned onboarding/goal fixtures:

- dense support → product-software transitions;
- dense QA → development transitions;
- country and remote variants;
- salary, location, budget, timeline, and hard-deadline conflicts;
- missing market data;
- short valid paths and paths requiring 6–8 roles;
- difficult novel paths such as Farmer → Tech Founder;
- adversarial prompt/source text;
- source conflicts and stale data.

Fixtures contain no real private user data and use:

```text
{ id, onboarding_json, priorities, constraint_expectations, assertions[] }
```

Assertions test properties, not exact generated prose.

### Evaluation tiers

- T1 contract/schema fixtures run in local full validation and free CI.
- T2 contains the 100+ corridor fixtures and runs in scheduled validation and
  before release/model changes.
- T3 contains prompt injection, forbidden claims, source attacks, and hard
  budget-cap failures; it runs with T1 and before prompt/model activation.

## 2. Retrieval checks

- correct population separation;
- deterministic order for fixed versions;
- exact versus nearest classification;
- complete mismatch explanations;
- Lived/Curated slot allocation;
- N=10 Curated retirement behavior;
- source attribution and withdrawal behavior.

## 3. AI checks

- exactly one path candidate;
- start and goal preserved;
- role count and transition limits;
- acyclic graph;
- valid canonical/source IDs;
- correct AI · Curated threshold;
- explicit assumptions and must-match violations;
- money and founder-revenue separation;
- no success or verification claims;
- prompt injection resistance.
- hard budget-cap abort and refund.

## 4. Vote and credit checks

- Bayesian examples match approved values;
- self/ineligible/quarantined votes excluded;
- vote changes fold to latest live event;
- at least-11/rolling-six-hour brigade rule deterministic;
- duplicate AI requests cannot double-charge;
- invalid output refunds;
- reranking and manual forks remain free;
- refinement cap enforced per base path.

## 5. Security checks

- RLS allow/deny matrix;
- report privacy;
- unpublished path isolation;
- source snapshot access;
- deletion/tombstone behavior;
- no secrets/private text in logs;
- unsafe external URLs rejected.

## 6. Usability checks

With unknown users, verify they can explain:

- what Lived, Curated, AI · Curated, and AI · Inferred mean;
- why a nearest path is not exact;
- which next role and main milestone they would inspect;
- what one wish/refinement costs;
- how to publish or keep a draft private.

## 7. Release gates

- 90% of launch-corridor fixtures return one usable source-grounded route;
- 70% return a top result satisfying the constraint thresholds associated with
  the fixture's two ordered priorities;
- zero critical origin/constraint/money-label violations;
- zero cross-account data leaks;
- zero invalid-output charges;
- all public seeded facts have source provenance;
- accessibility checks pass for graph and list experiences.

Provider/model, prompt, algorithm, or source-version changes rerun affected
fixtures before activation.

## 8. Traceability and golden snapshots

A machine-readable manifest maps every implemented requirement ID to one or
more validations. The local/full validation command checks for orphaned
implemented requirements without depending on test-name text.

Golden recommendation snapshots store context hash, algorithm version, source
snapshot, ordered results, and score components. Rank-affecting changes bump
the algorithm version and produce a reviewed movement diff.
