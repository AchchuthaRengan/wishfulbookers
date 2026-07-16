import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  validatePlans,
  type ScopeSidecar,
} from "../../../scripts/lib/plans.ts";
import { validateScopeWithInventory } from "../../../scripts/lib/scope.ts";

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

function root(): string {
  const path = mkdtempSync(join(tmpdir(), "navlands-plan-"));
  temporary.push(path);
  return path;
}

function planContent(status = "FOUNDER_PLAN_APPROVED"): string {
  return `# Plan 001 — Test

Status: ${status}
Owner: writer
Created: 2026-07-16
Goal IDs: NAV-FEATURE-023
Requirement IDs: HARNESS-REQ-001
Relevant documents: docs/HARNESS.md
Scope sidecar: docs/plans/active/PLAN-001.scope.json
Related ADRs: None
Feature flag: None
Explicit exclusions: Product behavior

## 1. User/system outcome
Test.
## 2. Context and invariants
Test.
## 3. Scope and exclusions
Test.
## 4. Open questions and stop conditions
Test.
## 5. Milestones
Test.
## 6. Verification matrix
Test.
## 7. Rollback
Test.
## 8. Documentation impact and completion record
Test.
`;
}

const sidecar: ScopeSidecar = {
  schemaVersion: 1,
  planId: "PLAN-001",
  baseRef: "HEAD",
  allowedPaths: ["docs/**", "package.json"],
  forbiddenPaths: ["src/app/**"],
  forbiddenDependencies: ["next"],
};

describe("plan and scope validators", () => {
  it("accepts one approved complete plan contract", () => {
    const directory = root();
    const active = join(directory, "docs", "plans", "active");
    mkdirSync(active, { recursive: true });
    writeFileSync(join(active, "PLAN-001-test.md"), planContent());
    writeFileSync(join(active, "PLAN-001.scope.json"), JSON.stringify(sidecar));
    expect(validatePlans(directory, "PLAN-001").ok).toBe(true);
  });

  it("rejects invalid plan status and missing sections", () => {
    const directory = root();
    const active = join(directory, "docs", "plans", "active");
    mkdirSync(active, { recursive: true });
    writeFileSync(
      join(active, "PLAN-001-test.md"),
      "# Plan\n\nStatus: MAYBE\n",
    );
    writeFileSync(join(active, "PLAN-001.scope.json"), JSON.stringify(sidecar));
    const codes = validatePlans(directory).issues.map((issue) => issue.code);
    expect(codes).toContain("PLAN_STATUS_INVALID");
    expect(codes).toContain("PLAN_SECTION_MISSING");
  });

  it("checks tracked, staged, unstaged, and untracked scope plus dependencies", () => {
    const directory = root();
    writeFileSync(
      join(directory, "package.json"),
      JSON.stringify({
        packageManager: "pnpm@11.9.0",
        devDependencies: { next: "1.0.0" },
      }),
    );
    const result = validateScopeWithInventory(directory, sidecar, {
      committed: ["docs/ok.md"],
      staged: ["src/app/page.tsx"],
      unstaged: ["outside.txt"],
      untracked: ["../escape"],
    });
    const codes = result.issues.map((issue) => issue.code);
    expect(codes).toContain("SCOPE_PATH_FORBIDDEN");
    expect(codes).toContain("SCOPE_PATH_NOT_ALLOWED");
    expect(codes).toContain("SCOPE_PATH_TRAVERSAL");
    expect(codes).toContain("PRODUCT_DEPENDENCY_FORBIDDEN");
  });
});
