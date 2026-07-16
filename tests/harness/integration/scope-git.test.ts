import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import { validateScope } from "../../../scripts/lib/scope.ts";

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

function fixture(baseRef = "HEAD"): string {
  const root = mkdtempSync(join(tmpdir(), "navlands-scope-git-"));
  temporary.push(root);
  mkdirSync(join(root, "docs", "plans", "active"), { recursive: true });
  mkdirSync(join(root, "legacy"), { recursive: true });
  writeFileSync(
    join(root, "legacy", "existing.txt"),
    "unchanged historical file\n",
  );
  writeFileSync(join(root, "docs", "allowed.txt"), "clean baseline\n");
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ packageManager: "pnpm@11.9.0" }),
  );
  writeFileSync(
    join(root, "docs", "plans", "active", "PLAN-001-test.md"),
    "# Plan 001 — Scope fixture\n\nStatus: FOUNDER_PLAN_APPROVED\n",
  );
  writeFileSync(
    join(root, "docs", "plans", "active", "PLAN-001.scope.json"),
    JSON.stringify({
      schemaVersion: 1,
      planId: "PLAN-001",
      baseRef,
      allowedPaths: [".gitattributes", "docs/**", "package.json"],
      forbiddenPaths: ["legacy/**"],
      forbiddenDependencies: [],
    }),
  );
  spawnSync("git", ["init", "-q"], { cwd: root });
  spawnSync("git", ["config", "user.email", "harness@example.invalid"], {
    cwd: root,
  });
  spawnSync("git", ["config", "user.name", "Harness Fixture"], {
    cwd: root,
  });
  spawnSync("git", ["add", "."], { cwd: root });
  spawnSync("git", ["commit", "-qm", "baseline"], { cwd: root });
  return root;
}

describe("Git plan-diff scope inventory", () => {
  it("ignores unchanged forbidden history and accepts an allowed changed doc", () => {
    const root = fixture();
    writeFileSync(join(root, "docs", "allowed.md"), "allowed plan change\n");
    expect(validateScope(root, "PLAN-001").ok).toBe(true);
  });

  it("rejects an actually changed forbidden file", () => {
    const root = fixture();
    writeFileSync(join(root, "legacy", "existing.txt"), "changed by plan\n");
    expect(
      validateScope(root, "PLAN-001").issues.map((issue) => issue.code),
    ).toContain("SCOPE_PATH_FORBIDDEN");
  });

  it("rejects whitespace errors in an allowed untracked file", () => {
    const root = fixture();
    writeFileSync(
      join(root, "docs", "untracked.txt"),
      "trailing whitespace  \n",
    );
    expect(
      validateScope(root, "PLAN-001").issues.map((issue) => issue.code),
    ).toContain("SCOPE_DIFF_WHITESPACE_INVALID");
  });

  it("rejects whitespace present only in the staged index", () => {
    const root = fixture();
    const allowed = join(root, "docs", "allowed.txt");
    writeFileSync(allowed, "staged trailing whitespace  \n");
    expect(
      spawnSync("git", ["add", "--", "docs/allowed.txt"], { cwd: root }).status,
    ).toBe(0);
    writeFileSync(allowed, "clean baseline\n");

    expect(
      spawnSync("git", ["diff", "--cached", "--check"], { cwd: root }).status,
    ).toBe(2);
    expect(spawnSync("git", ["diff", "--check"], { cwd: root }).status).toBe(0);
    expect(
      validateScope(root, "PLAN-001").issues.map((issue) => issue.code),
    ).toContain("SCOPE_DIFF_WHITESPACE_INVALID");
  });

  it("preserves Markdown hard breaks without suppressing other whitespace classes", () => {
    const root = fixture();
    writeFileSync(
      join(root, ".gitattributes"),
      "*.md whitespace=-blank-at-eol\n",
    );
    const markdown = join(root, "docs", "allowed.md");
    writeFileSync(markdown, "intentional hard break  \nnext line\n");
    expect(validateScope(root, "PLAN-001").ok).toBe(true);

    writeFileSync(markdown, "intentional hard break  \nnext line\n\n");
    expect(
      validateScope(root, "PLAN-001").issues.map((issue) => issue.code),
    ).toContain("SCOPE_DIFF_WHITESPACE_INVALID");

    writeFileSync(markdown, " \tspace before tab\n");
    expect(
      validateScope(root, "PLAN-001").issues.map((issue) => issue.code),
    ).toContain("SCOPE_DIFF_WHITESPACE_INVALID");
  });

  it("fails closed when the configured base ref cannot resolve", () => {
    const root = fixture("missing-base-ref");
    expect(
      validateScope(root, "PLAN-001").issues.map((issue) => issue.code),
    ).toContain("SCOPE_BASE_REF_UNRESOLVED");
  });
});
