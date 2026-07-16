# Data invariant routes

- Naming, IDs, timestamps, money, path versions, lineage, sources, events,
  idempotency, and table families: `docs/DATA-MODEL.md`.
- RLS, deletion/tombstones, logging, credentials, and data minimization:
  `docs/SECURITY.md` and `docs/PRIVACY.md`.
- Migration, immutable history, safe fixtures, and mutation gates:
  `docs/HARNESS.md` `HARNESS-DATA-*`.
- Seed rights and deterministic fixtures: `docs/DATA-SEEDING.md`.

For each user-owned table, plan the schema, RLS allow/deny matrix, indexes,
forward migration, rollback/safe disable behavior, and evidence together. Use
synthetic data only and verify concrete query paths when scale warrants it.
