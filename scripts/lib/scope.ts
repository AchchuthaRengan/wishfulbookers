import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getGitFileInventory,
  getIntendedDiffWhitespaceIssues,
  GitInventoryError,
  type GitFileInventory,
} from "./git.ts";
import {
  isSafeRelativePath,
  matchesAnyGlob,
  matchesGlob,
  normalizeRepositoryPath,
} from "./glob.ts";
import {
  listPlanRecords,
  readScopeSidecar,
  type ScopeSidecar,
} from "./plans.ts";
import {
  failure,
  success,
  type ValidationIssue,
  type ValidationResult,
} from "./result.ts";

const FORBIDDEN_LOCKFILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
]);

function validateInventory(
  inventory: GitFileInventory,
  sidecar: ScopeSidecar,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [group, paths] of Object.entries(inventory)) {
    for (const rawPath of paths) {
      const path = normalizeRepositoryPath(rawPath);
      if (!isSafeRelativePath(path)) {
        issues.push({
          code: "SCOPE_PATH_TRAVERSAL",
          message: `${group} path is unsafe.`,
          path,
        });
        continue;
      }
      if (!matchesAnyGlob(path, sidecar.allowedPaths)) {
        issues.push({
          code: "SCOPE_PATH_NOT_ALLOWED",
          message: `${group} path is outside the approved plan.`,
          path,
        });
      }
      if (matchesAnyGlob(path, sidecar.forbiddenPaths)) {
        issues.push({
          code: "SCOPE_PATH_FORBIDDEN",
          message: `${group} path is explicitly forbidden.`,
          path,
        });
      }
      if (FORBIDDEN_LOCKFILES.has(path)) {
        issues.push({
          code: "PACKAGE_MANAGER_ARTIFACT_FORBIDDEN",
          message: "Only pnpm-lock.yaml is allowed.",
          path,
        });
      }
    }
  }
  return issues;
}

function dependencyIssues(
  root: string,
  sidecar: ScopeSidecar,
): ValidationIssue[] {
  const packagePath = join(root, "package.json");
  if (!existsSync(packagePath)) {
    return [
      { code: "PACKAGE_JSON_MISSING", message: "package.json is required." },
    ];
  }
  const manifest = JSON.parse(readFileSync(packagePath, "utf8")) as Record<
    string,
    unknown
  >;
  const issues: ValidationIssue[] = [];
  if (manifest.packageManager !== "pnpm@11.9.0") {
    issues.push({
      code: "PACKAGE_MANAGER_INVALID",
      message: "packageManager must be pnpm@11.9.0.",
      path: "package.json",
    });
  }
  const runtime = manifest.dependencies;
  if (
    runtime !== undefined &&
    typeof runtime === "object" &&
    runtime !== null &&
    Object.keys(runtime).length > 0
  ) {
    issues.push({
      code: "RUNTIME_DEPENDENCY_FORBIDDEN",
      message: "Plan 001 permits no runtime dependencies.",
      path: "package.json",
    });
  }
  for (const section of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    const entries = manifest[section];
    if (typeof entries !== "object" || entries === null) continue;
    for (const name of Object.keys(entries)) {
      if (
        sidecar.forbiddenDependencies.some((pattern) =>
          matchesGlob(name, pattern),
        )
      ) {
        issues.push({
          code: "PRODUCT_DEPENDENCY_FORBIDDEN",
          message: `${name} is outside the harness-only dependency boundary.`,
          path: `package.json#${section}`,
        });
      }
    }
  }
  return issues;
}

export function validateScopeWithInventory(
  root: string,
  sidecar: ScopeSidecar,
  inventory: GitFileInventory,
): ValidationResult {
  const issues = [
    ...validateInventory(inventory, sidecar),
    ...dependencyIssues(root, sidecar),
  ];
  return issues.length === 0 ? success() : failure(issues);
}

export function validateScope(root: string, planId: string): ValidationResult {
  const plan = listPlanRecords(root).find(
    (record) => record.id === planId && record.location === "active",
  );
  if (plan === undefined) {
    return failure([
      { code: "PLAN_NOT_ACTIVE", message: `${planId} is not active.` },
    ]);
  }
  if (!existsSync(plan.sidecarPath)) {
    return failure([
      {
        code: "SCOPE_SIDECAR_MISSING",
        message: `${planId} has no scope sidecar.`,
      },
    ]);
  }
  try {
    const sidecar = readScopeSidecar(plan.sidecarPath);
    const scopeResult = validateScopeWithInventory(
      root,
      sidecar,
      getGitFileInventory(root, sidecar.baseRef),
    );
    const whitespaceIssues = getIntendedDiffWhitespaceIssues(
      root,
      sidecar.baseRef,
    ).map((issue) => ({
      code: "SCOPE_DIFF_WHITESPACE_INVALID",
      message: `${issue.message} at line ${String(issue.line)}.`,
      path: normalizeRepositoryPath(issue.path),
    }));
    const issues = [...scopeResult.issues, ...whitespaceIssues];
    return issues.length === 0 ? success() : failure(issues);
  } catch (error) {
    if (error instanceof GitInventoryError) {
      return failure([{ code: error.code, message: error.message }]);
    }
    return failure([
      {
        code: "SCOPE_VALIDATION_ERROR",
        message:
          error instanceof Error ? error.message : "Scope validation failed.",
      },
    ]);
  }
}
