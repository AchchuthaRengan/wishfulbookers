import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "navlands-evidence-cli-"));
  temporary.push(root);
  spawnSync("git", ["init", "-q"], { cwd: root });
  mkdirSync(join(root, "docs", "evidence"), { recursive: true });
  cpSync(
    join(process.cwd(), "docs", "evidence", "_template"),
    join(root, "docs", "evidence", "_template"),
    {
      recursive: true,
    },
  );
  mkdirSync(join(root, "docs", "plans", "active"), { recursive: true });
  writeFileSync(
    join(root, "docs", "plans", "active", "PLAN-001-test.md"),
    "# Plan 001 — Test\n\nStatus: FOUNDER_PLAN_APPROVED\nRequirement IDs: HARNESS-REQ-001\n",
  );
  mkdirSync(join(root, "requirements"), { recursive: true });
  cpSync(
    join(process.cwd(), "requirements", "manifest.json"),
    join(root, "requirements", "manifest.json"),
  );
  return root;
}

describe("evidence CLI", () => {
  it("creates, validates, refuses overwrite, and rejects traversal", () => {
    const root = fixture();
    const create = join(process.cwd(), "scripts", "create-evidence-pack.mjs");
    const validate = join(
      process.cwd(),
      "scripts",
      "validate-evidence-pack.mjs",
    );
    expect(
      spawnSync(process.execPath, [create, "PLAN-001"], { cwd: root }).status,
    ).toBe(0);
    expect(
      spawnSync(process.execPath, [validate, "--plan", "PLAN-001"], {
        cwd: root,
      }).status,
    ).toBe(0);
    const requireVerified = spawnSync(
      process.execPath,
      [validate, "--plan", "PLAN-001", "--require-verified"],
      { cwd: root, encoding: "utf8" },
    );
    expect(requireVerified.status).toBe(1);
    expect(requireVerified.stderr).toContain("EVIDENCE_VERIFIED_REQUIRED");
    expect(
      spawnSync(process.execPath, [validate, "--require-verified"], {
        cwd: root,
      }).status,
    ).toBe(1);
    expect(
      spawnSync(process.execPath, [create, "PLAN-001"], { cwd: root }).status,
    ).toBe(1);
    expect(
      spawnSync(process.execPath, [create, "../PLAN-001"], { cwd: root })
        .status,
    ).toBe(1);
  });
});
