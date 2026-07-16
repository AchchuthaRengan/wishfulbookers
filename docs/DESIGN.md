# Navlands MVP Design Specification

Status: Approved interaction baseline; visual styling requires prototypes  
Version: 0.3.0  
Date: 2026-07-11  
Authority: MOTHER.md

## 1. Experience objective

The user should understand a path before understanding Navlands. Complexity
belongs in progressive disclosure, not onboarding forms or ranking controls.

The first session should produce this sequence:

```text
Tell us where you are -> See your map -> Reveal where it leads
-> Compare realistic options -> Save, fork, publish, or ask Genie
```

## 2. Design principles

1. Plain-language labels and sentences.
2. One primary action per state.
3. Ask for extra context at the moment it matters.
4. Keep origin labels visible without turning the UI into warnings.
5. Show exact constraint misses numerically.
6. Preserve a usable list representation beside the graph for accessibility.
7. Never make the user configure ranking weights.
8. Keep destructive, paid, and public actions explicit.

## 3. MVP navigation

Primary destinations:

- Playground;
- Profile;
- Saved paths;
- Public path/profile artifact;
- Usage;
- Notifications.

Admin destinations are separate and role-protected.

Feed, Trending, Hot, Rising, global search, rich portfolio, marketplace, and
other personas are absent. A scoped `Curated starting points` link in results
lists corridor-relevant Curated paths, including retired ones.

## 4. Onboarding

### 4.1 Initial steps

Start with a clear service-data notice, then collect in short cards rather than
one long form:

1. Current role and actual responsibilities.
2. Experience range.
3. Target role.
4. Current and target annual gross salary ranges.
5. Location and relocation/work-location choice.
6. Two ordered priorities.

`Not sure` is allowed for relocation, experience precision, and responsibility
detail. It is not allowed for current role, target role, target salary, or
location. Ask at most one material follow-up for missing responsibility detail.

Optional engine-improvement consent is separate. Public-path consent appears
only when publishing and can be managed later from Profile.

### 4.2 Priority ordering

Show an order-list card with two selections. Copy:

`What should Navlands protect first?`

Examples: salary, time, education cost, location, role similarity. Explain that
the first priority is considered before the second. Do not show percentages.

### 4.3 Private path draft

After onboarding:

- construct the user's current private path;
- show it before asking to publish;
- use guided highlights for reveal, fork, filters, and Genie;
- keep `Publish` available independently of recommendations.

## 5. Playground

### 5.1 Layout

- Vertical role timeline is the central surface.
- Start role is visually grounded at the bottom; target is above.
- Zoom is semantic:
  - L0 shows role dots and the path spine for orientation;
  - L1 shows complete role cards;
  - L2 expands source-backed transitions inline into up to three subnodes with
    source chips. Inferred transitions remain compact and open in the detail
    panel.
- Genie prompt bar remains reachable without covering the graph.
- Filter and priority controls open in a compact sheet/panel.

### 5.2 Nodes

Collapsed role node shows:

- role title and seniority;
- origin label;
- estimated time band when available;
- salary/revenue band when applicable;
- `!` for required missing information.

Expanded transition shows no more than three milestones/resources and its
source chips.

### 5.3 Progressive reveal

Desktop hover or keyboard focus reveals a partially visible next node. Mobile
uses tap. The user can continue revealing until the target is visible without
selecting the intermediate role.

Reduced-motion mode uses opacity and expansion instead of animated movement.

### 5.4 Origin labels

- `Lived`
- `Curated — built from public sources`
- `AI · Curated`
- `AI · Inferred`

Curated cards are visually separated under `Curated starting points` on the
Lived side. Curated must not look like a user testimonial.

## 6. Comparison

### 6.1 Desktop

Lived side displays up to three allocated Lived/Curated cards. AI side displays
one active AI path. The origins are not assigned a shared rank.

Compare:

- one concise deterministic ranking reason on the result card;
- match score with `Fit, not success chance` explanation;
- role count;
- estimated time range;
- education cost range;
- salary or founder revenue possibility;
- location behavior;
- top two priority results;
- explicit mismatches.

### 6.2 Narrow screens

Preserve side-by-side meaning with a synchronized two-card compare carousel,
not separate origin tabs. The current pair shares a compare header; swiping the
Lived card does not change the active AI card.

An accessible `Compare as list` view is always available.

### 6.3 AI generation history

Only one AI path is active. Refinement versions it. Full regeneration puts the
previous path in `Earlier generations`. Earlier items show prompt summary,
created time, and origin label.

## 7. Filters and constraints

Each filter communicates its class:

- `Must match`
- `Prefer`

Location lets the user choose. Education budget and desired timeline default to
Prefer. Target salary is Must match. A deadline becomes Must match only after
the user selects `This deadline cannot be exceeded`.

Nearest alternatives show mismatch chips such as:

- `₹3L below your target`
- `Outside selected country`
- `About 4–7 months beyond preference`

Money uses the user's locale conventions and always shows an absolute delta
plus direction.

## 8. Empty and failure states

### 8.1 No exact paths

> No path matches all your choices yet. See the nearest paths and what they
> miss, or use one Genie wish to create a path around your constraints.

Actions:

- `See nearest paths`
- `Generate with Genie · 1 wish`
- `Change filters`

### 8.2 Invalid AI output

> Genie couldn't create a valid path this time. Your units were returned.

Offer retry and edit-context actions. Do not show malformed partial output as a
complete path.

### 8.3 Missing information

`!` means `Information needed`, never fake or unsafe. Opening it shows why the
field matters and the choices: add value, allow inference, or leave missing.

### 8.4 Three-violation choice

When the selected nearest route violates at least three constraints, show each
violation and distance, then:

- `Adapt this path · 1 unit`
- `Generate a new path · 3 units`

Dismissing preserves nearest alternatives. Reserve no units until confirmation.

## 9. Actions

Every public path supports:

- save;
- fork;
- share;
- upvote/downvote;
- report;
- inspect sources;
- inspect lineage.

An unchanged manual fork is free. An AI adaptation previews `Costs 1 unit`
before confirmation.

Private paths do not produce share links. `Share` routes through the publication
preview. Unlisted private sharing is post-MVP.

The Sources drawer lists attribution, `Last checked`, and every node backed by
each source. Open it from a source chip or `Inspect sources`.

## 10. Votes and reports

Vote copy uses `Community signal`, never verified or proven. If the displayed
up count includes creator endorsement, the tooltip says:

> Includes creator endorsement. Creator votes do not affect ranking.

Vote controls are disabled until onboarding completes and unlock immediately
afterward. MVP has no account-age waiting period.

Downvote may request an optional reason. It may offer to create a report, but
the user must confirm separately.

Report lives in the overflow menu and supports inaccurate, outdated, spam,
privacy/impersonation, harmful, copyright/source, and other.

## 11. Usage UI

Show:

- action cost before invoking Genie;
- refund event after invalid output.

Free shows `X of 9 units remaining · one-time grant` without reset copy. Paid
plans show five-hour and weekly balances with their reset times.

Describe 3 units as one wish where helpful, but keep the integer-unit balance
visible for 1-unit refinements.

## 12. Publication and deletion

Publishing is an explicit confirmation with a preview of public fields. Private
goals, salary preferences, and constraints remain private unless deliberately
added.

Deletion explains that the path and identifying content disappear while forks
may show `Original path removed` with non-identifying lineage.

## 13. Notifications

The in-app activity surface may show missing-information requests, moderation
outcomes, refunds, opted-in usage resets, source-withdrawal notices, forks of
the user's public path, grouped upvotes, and node changes made in public forks
originating from the user's path.

Downvotes/reports never reveal their actor. Saves remain private. Email/push is
opt-in and reserved for important events. No streaks or generic re-engagement.

## 14. Accessibility acceptance criteria

- Every graph action is keyboard reachable.
- The entire path is available as semantic ordered content.
- Origin and mismatch meaning do not depend on color.
- Hover behavior has focus and touch equivalents.
- Reduced motion is respected.
- Screen readers announce node position, branch state, origin, and constraint
  status.
- Target size and contrast meet WCAG 2.2 AA.

## 15. Visual direction and prototype decisions

Use a calm, document-like Claude/Notion aesthetic on shadcn. Light and dark
themes ship in MVP. Components use semantic tokens only; raw colors are banned.
Origin and state never depend on color alone.

- exact node geometry and density at each zoom level;
- graph motion and branch reveal timing;
- narrow-screen synchronized comparison;
- `!` icon appearance;
- priority-card drag versus tap controls;
- source-chip density.

Prototype tests may choose presentation details but must preserve the behavior
in this document.
