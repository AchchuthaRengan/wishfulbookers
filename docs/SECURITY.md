# Navlands MVP Security, Privacy, and Data-Rights Specification

Status: Required implementation baseline  
Version: 0.3.0  
Date: 2026-07-11

## 1. Protected assets

- account and authentication data;
- onboarding responsibilities, salary, location, constraints, and private goal;
- private paths and transition events;
- public path ownership and edit authority;
- source snapshots and licence records;
- AI prompts, outputs, and provider credentials;
- vote, report, moderation, and credit integrity;
- billing and entitlement state when introduced.

## 2. Trust boundaries

Treat browsers, AI output, imported data, external links, webhook payloads, and
background-job messages as untrusted. Only server-side services using validated
inputs may mutate protected records.

## 3. Authentication and authorization

- Supabase Auth is the identity source.
- Every user-owned table has RLS enabled before production data exists.
- Private records are owner-only by default.
- Public visibility is an explicit state transition.
- Admin/moderator access uses separate roles and audited server functions.
- Service-role credentials never reach browser bundles.
- Object Storage paths are protected by ownership/publication policies.

RLS tests must prove both allowed access and cross-user denial.

## 4. Data minimization

- Collect only fields required by approved onboarding or progressive prompts.
- Do not request proof, certificate secrets, government identifiers, employer
  email access, or family-member identity.
- Separate public path fields from private constraints and goals.
- Send AI only the minimum context required for the current generation.
- Logs use IDs and reason codes rather than raw user text.

## 5. Publication safety

Before publication show exactly which role titles, descriptions, dates,
companies, artifacts, and salary values become public. Private salary targets,
family/employment constraints, and hidden goals remain private unless added
explicitly.

Allow preview, cancel, unpublish, and deletion.

Private paths cannot produce share links in MVP.

## 5.1 Consent integrity

- Version every service notice, optional improvement consent, and publication
  consent.
- Store purpose-specific grant/withdrawal events.
- Do not bundle optional engine improvement into service access.
- Enforce withdrawal in future processing jobs, not only in the UI.
- Restrict consent mutation to the owner and audited server functions.

## 6. Deletion and tombstones

Deletion removes identity and user-authored content from the origin path and
search index. Retain only non-identifying IDs and origin type needed to keep
fork lineage structurally valid.

Forks must remove copied identifying text from the deleted origin while
preserving independently authored content. Backups follow a documented
retention/expiry process rather than immediate unsafe physical mutation.

## 7. AI security

- Never place secrets or service credentials in prompts.
- Source and user text are data, never instructions.
- Delimit untrusted context and ignore embedded prompt injection.
- Require runtime schema validation and domain validation.
- Constrain external link protocols and sanitize rendered content.
- Do not let models set score, charge, entitlement, source licence, publication,
  or moderation state.
- Record model and prompt versions without logging unnecessary private content.
- Refund invalid output atomically.

## 8. Source and copyright controls

Every source registry entry records owner, URL, acquisition method, licence,
commercial/derivative/storage/redistribution permission, attribution text,
refresh cadence, and removal contact.

- Full snapshots only when permitted.
- Otherwise store URL, timestamp, hash, licence evidence, and permitted facts.
- Publicly readable is not assumed reusable.
- Disable and rebuild dependencies when rights change.
- No LinkedIn, résumé, personal biography, or social-profile scraping without
  direct consent and approved rights.

## 9. Vote and report abuse

- Unique latest live vote per user/path.
- Eligibility requires completed onboarding; MVP has no account-age delay.
- User and IP rate limits.
- Deterministic brigade quarantine.
- Admin-only release of quarantined events.
- Reports private from creators and other users.
- No reporter identity exposed to the reported creator.
- Moderation actions and reason codes are auditable.

Reciprocal-ring analysis starts after ten eligible votes and remains Admin
flag-only.

## 10. Credit and billing integrity

- Integer units only.
- Append-only usage events plus atomic reservations.
- Idempotency key prevents double charge.
- Server calculates action cost; client copy is informational.
- Invalid output refunds automatically.
- Entitlements come from verified server state/webhooks, never client claims.
- Reconciliation jobs detect negative, duplicate, or stuck reservations.

## 11. Application security baseline

- Secure, HTTP-only, same-site cookies according to Supabase guidance.
- CSRF protection for cookie-authenticated mutations.
- Strict Content Security Policy compatible with required graph and analytics
  assets.
- Output escaping and sanitized rich text.
- URL allow-listing for redirects and external resource fetches.
- File type, size, content, and malware checks for future uploads.
- Rate limits on auth, generation, publication, voting, reports, and sharing.
- Dependency and secret scanning in CI.
- No production secrets in `.env.example`, prompts, fixtures, or logs.

## 12. Availability and cost abuse

- Per-user and plan usage windows.
- Global provider spend guardrail.
- Generation timeout and circuit breaker.
- Queue concurrency limits.
- Cached source retrieval; no open proxy behavior.
- Graceful disable flag for Genie while normal retrieval remains available.

## 13. Security verification gates

Before beta:

1. RLS matrix passes for every table and storage bucket.
2. Cross-account path, profile, vote, report, and credit attacks fail.
3. Prompt-injection fixtures cannot change output contract or reveal secrets.
4. Invalid outputs never debit units.
5. Duplicate requests cannot double-charge or double-vote.
6. Deleted/unpublished paths disappear from unauthorized reads and search.
7. Source removal disables affected data and triggers rebuild.
8. Logs contain no sampled raw private onboarding or prompt content.

## 14. Incident readiness

Maintain auditable security events, credential rotation procedures, source
disable switches, AI provider disable switch, user notification capability,
and a documented triage owner. Exact legal retention and breach-notification
requirements must be confirmed for launch jurisdictions before processing paid
users.
