# Security gates

Route the affected surface to the authoritative sections in `docs/SECURITY.md`
and `docs/PRIVACY.md`:

- auth/session/redirect/CSRF and RLS authorization;
- secrets, private logging, consent, deletion, publication, and export;
- AI/source prompt injection, URL/import validation, and source rights;
- credit/payment idempotency, verified entitlements, and reconciliation;
- vote/report/moderation privacy, rate limits, and abuse quarantine;
- CI/deployment least privilege, zero-spend behavior, and incident readiness.

For each affected gate, record protected assets, attackers, entry points, deny
behavior, positive/negative tests, findings, residual risk, and reviewer result.
Stop on an unresolved high-severity issue or authority-changing decision.
