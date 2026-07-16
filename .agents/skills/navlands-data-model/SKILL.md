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
