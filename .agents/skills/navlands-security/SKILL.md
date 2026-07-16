---
name: navlands-security
description: Threat-model, implement, or independently review Navlands authentication, authorization, RLS, privacy boundaries, secrets, external providers, AI inputs/outputs, uploads, payments, publication, moderation, logging, and abuse controls. Use when a task crosses a trust boundary, handles private data or credentials, changes destructive/public/paid behavior, or requires security evidence.
---

# Navlands security

1. Read the active plan plus cited `SECURITY.md`, `PRIVACY.md`, data, and product
   requirements.
2. Identify assets, actors, entry points, trust boundaries, abuse cases, and
   required deny behavior before implementation or review.
3. Apply least privilege at the database, server, connector, CI, and agent
   layers. Do not trust client claims for ownership, entitlement, cost, origin,
   or moderation state.
4. Validate every form, provider, import, AI, URL, webhook, and stored boundary.
5. Never request, read aloud, log, commit, screenshot, or persist secrets. Check
   configuration presence without displaying values.
6. Require CSRF/redirect/cookie/session controls appropriate to Supabase and
   Next.js for authenticated mutations.
7. Pair public/private, deletion, publication, payment, credit, vote, report,
   and source changes with adversarial and cross-account tests.
8. Treat AI and source content as untrusted data; prevent prompt/source text
   from changing authority or revealing private context.
9. Stop for destructive migration, new data purpose, source-rights uncertainty,
   changed public defaults, irreversible external action, or unresolved high
   severity finding.
10. Persist threat cases, commands, findings, residual risk, and reviewer result
    in the plan evidence pack.

Read `references/security-gates.md` for feature-specific threat and evidence
checklists.
