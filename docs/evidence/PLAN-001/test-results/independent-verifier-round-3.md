NOT_PROVEN

LOCAL VERIFICATION PASS; HOSTED CI PENDING

Verifier: Codex `/root/round3_verifier`  
Branch: `agent/plan-001-harness`  
HEAD/base: `37f79f14c376afe067f2bd918c94471d11c2a8cd`

### Acceptance matrix

| Item | Result |
| --- | --- |
| HARNESS-REQ-001 | PASS locally |
| HARNESS-REQ-002 | PASS locally |
| HARNESS-REQ-003 | PASS locally |
| HARNESS-VER-001 | PASS locally |
| HARNESS-VER-002 | PASS locally |
| HARNESS-VER-004 | NOT_PROVEN — hosted Actions pending |
| Harness-only scope | PASS |
| Independent round-three review | PASS locally |

### Prior-finding closure

- Round-one empty-VERIFIED evidence, plan-diff scope, direct-pnpm, and raw-artifact findings remain closed.
- Round-two Stop-hook bypass is closed.
- The Stop hook invokes `pnpm validate:evidence -- --plan PLAN-001 --require-verified`; it does not trust the summary.
- Current `NOT_PROVEN` evidence is rejected with `EVIDENCE_VERIFIED_REQUIRED`.

### Fresh commands

All expected-pass commands exited 0:

- `git diff --check`
- `pnpm --version` → `11.9.0`
- `pnpm install --frozen-lockfile`
- Official skill validation: 6/6
- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` → 52/52
- `pnpm build:harness`
- `pnpm validate:hooks`
- Implement preflight → `READY_TO_IMPLEMENT`, no issues
- `pnpm validate:scope -- --plan PLAN-001`
- `pnpm validate:evidence -- --plan PLAN-001`
- `pnpm verify:fast -- --plan PLAN-001`
- `pnpm verify:full -- --plan PLAN-001` → 34 unit and 18 integration tests

Expected failure:

- `pnpm validate:evidence -- --plan PLAN-001 --require-verified` → exit 1, `EVIDENCE_VERIFIED_REQUIRED`

### Stop-hook adversarial results

The exact former exploit returned exit 0 with `continue:false` and only `continue`, `stopReason`, and `systemMessage`.

All also failed closed:

- missing pack;
- malformed JSON;
- `NOT_PROVEN`;
- empty `VERIFIED`;
- incomplete requirement coverage;
- invalid command reference;
- nonpassing command;
- same writer/reviewer;
- missing raw full-lane artifact;
- validator failure;
- unavailable direct pnpm;
- durable active `COMPLETED` plan with invalid evidence.

Positive controls passed:

- ordinary non-completion without evidence → `continue:true`;
- complete valid `VERIFIED` pack → `continue:true`;
- durable `COMPLETED` plan with valid evidence → `continue:true`.

### Evidence, scope, and safety

- All 24 command records match their raw artifacts’ exit codes and durations.
- Rounds 1/2 and red/green regression artifacts remain intact.
- All requirement and artifact references resolve.
- No product paths, runtime dependencies, provider dependencies, secrets, private production data, migrations, sources, live services, or paid calls were found.
- Product database/RLS, accessibility, AI, cost, and source-rights lanes remain correctly not applicable.

Git status was identical before and after verification: README modified plus the harness tree untracked; nothing staged, committed, or pushed. `HEAD` still equals `origin/main`. Only ignored `node_modules/` and `dist-harness/` artifacts were touched.

This local pass authorizes the draft-PR publication gate to obtain hosted CI evidence. It does not authorize `VERIFIED`, `COMPLETED`, or Plan 001 closure.
