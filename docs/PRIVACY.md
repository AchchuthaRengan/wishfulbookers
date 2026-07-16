# Navlands MVP Privacy Specification

Status: Approved product baseline; launch legal review required  
Version: 0.3.0  
Date: 2026-07-11  
Authority: MOTHER.md and SECURITY.md

## 1. Principles

- Collect only data needed to create, compare, save, and publish paths.
- Explain each purpose in plain language.
- Separate required service processing from optional engine improvement.
- Keep paths and goals private until the user deliberately publishes.
- Make withdrawal and deletion understandable and accessible.
- Do not use privacy consent as a condition for unrelated optional features.

## 2. Signup notice

Before onboarding data collection, show a concise service-data notice covering:

- account operation;
- path matching and recommendation generation;
- security and abuse prevention;
- storage of private drafts and preferences;
- links to detailed policy and privacy controls.

Where consent is the applicable basis, record the exact notice/policy version,
purpose, time, locale, and withdrawal state.

## 3. Optional engine improvement

Using private onboarding/path content to improve prompts, models, datasets, or
evaluations is off by default and requires a separate opt-in. Product analytics
should use minimized reason codes and buckets without raw private text whenever
possible.

Withdrawal stops future optional use. Already aggregated or legally retained
records follow the reviewed policy applicable at launch.

## 4. Publication consent

Publication consent is requested only when publishing. Preview every field that
will become public, including role titles, descriptions, companies, dates,
artifacts, and any salary information.

Private salary goals, family/employment constraints, hidden goals,
responsibilities not selected for publication, and private events remain
private.

Private paths have no share link in MVP. Sharing routes through publication.

## 5. Privacy controls

Profile provides:

- current notice/consent choices;
- engine-improvement opt-in/out;
- public-path inventory;
- unpublish and delete actions;
- account-data access/export request entry;
- correction and grievance/contact entry;
- email/push notification preferences.

Withdrawal must be no harder than opt-in.

## 6. AI and providers

Send only minimized context needed for the action. Do not use user data for
provider training when a supported provider control can disable it. Record the
provider/model contract and applicable data-handling configuration.

Never include secrets, unrelated profiles, private artifacts, or another
person's private path.

## 7. Public and source data

Publicly readable career data is not automatically reusable. Source snapshots,
personal profiles, company frameworks, and salary sources follow
DATA-SEEDING.md and source-registry permissions.

Do not scrape named personal histories or social profiles without direct
consent and approved rights.

## 8. Notifications

In-app activity may include approved path events. Downvote/report actors and
savers remain private. Email/push is opt-in, important-event only, and cannot
be used for streaks or generic re-engagement.

## 9. Retention and deletion

Define retention per record class before beta. User deletion removes identity
and authored content from active systems while preserving only permitted
non-identifying tombstones needed for lineage. Backups expire through a
documented schedule.

Source/licence audit evidence, security logs, billing records, and legal holds
may require separate reviewed retention periods.

## 10. Incident response

Maintain detection, containment, investigation, affected-record mapping,
contact ownership, and regulator/user notification procedures.

Do not hard-code an unsourced generic breach deadline. At launch, legal review
must map actual operating countries and effective law—including staged Indian
DPDP provisions—to the incident runbook.

## 11. Children

The MVP Employee persona is intended for adults. Child/student accounts are not
supported. Age is not a ranking factor, but signup policy and age handling must
be legally reviewed before global beta.

## 12. Launch gate

Before beta:

- approve the public privacy notice and terms;
- complete a data inventory and processor list;
- test consent versioning/withdrawal;
- test publication preview and private-field exclusion;
- test access, correction, unpublish, and deletion flows;
- approve retention schedule and incident runbook;
- review launch jurisdictions with qualified counsel.
