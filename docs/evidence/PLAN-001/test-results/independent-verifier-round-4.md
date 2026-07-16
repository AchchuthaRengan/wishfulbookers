FAILED

Local blocker: the scope validator misses whitespace errors that exist only in the staged index.

### Reproduction

In an isolated temporary Git fixture:

1. A clean file was committed.
2. A version with trailing whitespace was staged.
3. Only the working-copy version was cleaned.
4. Results:

- `git diff --cached --check`: exit `2`, correctly reports trailing whitespace.
- `git diff --check`: exit `0`.
- `validateScope(root, "PLAN-001")`: incorrectly returns `ok: true` with no issue codes.

Cause: [scripts/lib/git.ts](D:\Navlands\Code\wishfulbookers\scripts\lib\git.ts:152) builds its isolated index from `HEAD`, then runs `git add -A` from the working tree. This discards staged-only blob content. A regression fixture covering this exact index/worktree divergence is required.

### Acceptance matrix

| Check | Result | Evidence |
|---|---|---|
| HARNESS-REQ-001 | PASS locally | Manifest, goals, agents, and six skills validate |
| HARNESS-REQ-002 | PASS locally | VERIFIED evidence is comprehensive/fail-closed; Stop hook uses authoritative validation |
| HARNESS-REQ-003 | PASS locally | v0.4 authority linking and plan contracts validate |
| HARNESS-VER-001 | FAIL | Fast lane passes a known invalid staged-index condition |
| HARNESS-VER-002 | FAIL | Full lane inherits the same scope-enforcement gap |
| HARNESS-VER-004 | NOT_PROVEN | Local zero-spend CI policy passes; hosted Actions has not run |
| Harness-only scope | FAIL | Actual staged scope is clean, but staged-only whitespace enforcement is bypassable |
| Independent review | FAILED | This round-4 verdict |

### Fresh command results

- Direct `pnpm`: `11.9.0`
- Frozen install: PASS
- Six official skill validators: 6/6 PASS
- Format, lint, strict typecheck, harness build: PASS
- Combined tests: 13 files, 54/54 PASS
- Fast lane: PASS, including 34/34 unit tests
- Full lane: PASS, including 34 unit + 20 integration tests
- Hook validator: PASS
- Implement preflight: `READY_TO_IMPLEMENT`
- Verify preflight: `READY_TO_VERIFY`
- Scope validator on current staged state: PASS
- Draft evidence validator: PASS
- `--require-verified`: expected exit `1`, `EVIDENCE_VERIFIED_REQUIRED`
- Current staged and worktree `git diff --check`: PASS
- Evidence records: 24 commands, 24 raw artifacts, zero command/exit/duration mismatches

The prior empty-VERIFIED evidence, unchanged-history scope, pnpm-version, and summary-only Stop-hook findings are closed. The `.gitattributes` rule is narrowly `*.md whitespace=-blank-at-eol`; Markdown hard breaks pass while blank-at-EOF and space-before-tab fixtures fail. The unresolved defect is specifically index-only whitespace.

### Scope and safety

- 158 staged paths; no forbidden product paths.
- Zero runtime dependencies; 11 harness-only development dependencies.
- No product/provider imports or network-call code.
- No Playground, auth, profile, database, migration, AI, payment, or deployment behavior.
- Secret/private-data validators pass; no live or paid service was called.
- Hosted CI remains pending.
- Draft evidence remains correctly `NOT_PROVEN`; its stored 52-test run predates the current 54-test staged suite and must be refreshed before VERIFIED.

### Staged-state integrity

Before and after verification:

- Status SHA-256: `2e9b3f23ac48fe2e86de9f8652f2de32add30625b3d402fd65ed6535e3b30abe`
- Index SHA-256: `405577bdd31e31dcb5f16a266a16e0ca390f3816a71cd741e2ff2660ba61377d`
- Cached diff hash: `d8c90e7d992320a9681b0927bbeed7000ccb6bee`
- Unstaged diff hash: `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391`
- Status count: 158 staged paths
- Only ignored `node_modules/` and `dist-harness/` were touched.

No shared-repository file, index entry, commit, evidence artifact, or remote state was changed.
