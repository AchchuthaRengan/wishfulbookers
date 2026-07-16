import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isSafeRelativePath } from "./glob.ts";
import {
  failure,
  success,
  type ValidationIssue,
  type ValidationResult,
} from "./result.ts";

export const PLAN_STATUSES = [
  "PLAN_DRAFTED",
  "FOUNDER_PLAN_APPROVED",
  "BLOCKED",
  "COMPLETED",
] as const;

const REQUIRED_FIELDS = [
  "Status",
  "Owner",
  "Created",
  "Goal IDs",
  "Requirement IDs",
  "Relevant documents",
  "Scope sidecar",
  "Explicit exclusions",
];

const REQUIRED_HEADINGS = [
  "## 1. User/system outcome",
  "## 2. Context and invariants",
  "## 3. Scope and exclusions",
  "## 4. Open questions and stop conditions",
  "## 5. Milestones",
  "## 6. Verification matrix",
  "## 7. Rollback",
  "## 8. Documentation impact and completion record",
];

export type ScopeSidecar = {
  schemaVersion: number;
  planId: string;
  baseRef: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
  forbiddenDependencies: string[];
};

export type PlanRecord = {
  id: string;
  status: string;
  path: string;
  location: "active" | "completed";
  content: string;
  sidecarPath: string;
};

function parsePlanId(name: string): string | null {
  return /^(PLAN-\d{3})-.+\.md$/u.exec(name)?.[1] ?? null;
}

function field(content: string, name: string): string | null {
  return new RegExp(`^${name}:\\s*(.+?)\\s*$`, "mu").exec(content)?.[1] ?? null;
}

export function readScopeSidecar(path: string): ScopeSidecar {
  return JSON.parse(readFileSync(path, "utf8")) as ScopeSidecar;
}

export function listPlanRecords(root: string): PlanRecord[] {
  const records: PlanRecord[] = [];
  for (const location of ["active", "completed"] as const) {
    const directory = join(root, "docs", "plans", location);
    if (!existsSync(directory)) continue;
    for (const name of readdirSync(directory).sort()) {
      const id = parsePlanId(name);
      if (id === null) continue;
      const path = join(directory, name);
      records.push({
        id,
        status: field(readFileSync(path, "utf8"), "Status") ?? "MISSING",
        path,
        location,
        content: readFileSync(path, "utf8"),
        sidecarPath: join(directory, `${id}.scope.json`),
      });
    }
  }
  return records;
}

export function validatePlans(
  root: string,
  selectedPlanId?: string,
): ValidationResult<PlanRecord[]> {
  const issues: ValidationIssue[] = [];
  const records = listPlanRecords(root);
  const active = records.filter((record) => record.location === "active");
  if (active.length !== 1) {
    issues.push({
      code: "PLAN_COUNT_INVALID",
      message: "Exactly one active plan is required.",
    });
  }

  const counts = new Map<string, number>();
  for (const record of records)
    counts.set(record.id, (counts.get(record.id) ?? 0) + 1);
  for (const [id, count] of counts) {
    if (count > 1)
      issues.push({
        code: "PLAN_ID_DUPLICATE",
        message: `${id} is not unique.`,
      });
  }

  if (
    selectedPlanId !== undefined &&
    !active.some((record) => record.id === selectedPlanId)
  ) {
    issues.push({
      code: "PLAN_NOT_ACTIVE",
      message: `${selectedPlanId} is not the active plan.`,
    });
  }

  for (const record of records) {
    const relativePath = record.path
      .slice(root.length + 1)
      .replaceAll("\\", "/");
    if (
      !PLAN_STATUSES.includes(record.status as (typeof PLAN_STATUSES)[number])
    ) {
      issues.push({
        code: "PLAN_STATUS_INVALID",
        message: `Invalid status ${record.status}.`,
        path: relativePath,
      });
    }
    if (record.location === "active" && record.status === "COMPLETED") {
      issues.push({
        code: "COMPLETED_PLAN_ACTIVE",
        message: "Completed plans must be archived.",
        path: relativePath,
      });
    }
    if (record.location === "completed" && record.status !== "COMPLETED") {
      issues.push({
        code: "ARCHIVED_PLAN_INCOMPLETE",
        message: "Archived plans must be COMPLETED.",
        path: relativePath,
      });
    }
    for (const name of REQUIRED_FIELDS) {
      if (field(record.content, name) === null) {
        issues.push({
          code: "PLAN_FIELD_MISSING",
          message: `Missing ${name} field.`,
          path: relativePath,
        });
      }
    }
    for (const heading of REQUIRED_HEADINGS) {
      if (!record.content.includes(heading)) {
        issues.push({
          code: "PLAN_SECTION_MISSING",
          message: `Missing ${heading}.`,
          path: relativePath,
        });
      }
    }
    if (!existsSync(record.sidecarPath)) {
      issues.push({
        code: "SCOPE_SIDECAR_MISSING",
        message: "Matching scope sidecar is required.",
        path: relativePath,
      });
      continue;
    }
    try {
      const sidecar = readScopeSidecar(record.sidecarPath);
      const sidecarRelative = record.sidecarPath
        .slice(root.length + 1)
        .replaceAll("\\", "/");
      if (
        sidecar.schemaVersion !== 1 ||
        sidecar.planId !== record.id ||
        typeof sidecar.baseRef !== "string" ||
        sidecar.baseRef.trim() === ""
      ) {
        issues.push({
          code: "SCOPE_SIDECAR_MISMATCH",
          message: "Sidecar version/plan ID does not match.",
          path: sidecarRelative,
        });
      }
      for (const pattern of [
        ...sidecar.allowedPaths,
        ...sidecar.forbiddenPaths,
      ]) {
        if (!isSafeRelativePath(pattern)) {
          issues.push({
            code: "SCOPE_PATH_UNSAFE",
            message: `Unsafe scope pattern: ${pattern}`,
            path: sidecarRelative,
          });
        }
      }
    } catch {
      issues.push({
        code: "SCOPE_SIDECAR_INVALID",
        message: "Scope sidecar is not valid JSON.",
        path: relativePath,
      });
    }

    if (record.location === "completed") {
      const summary = join(root, "docs", "evidence", record.id, "summary.md");
      const verified =
        existsSync(summary) &&
        /^Status:\s*VERIFIED\s*$/mu.test(readFileSync(summary, "utf8"));
      if (!verified) {
        issues.push({
          code: "COMPLETED_EVIDENCE_UNVERIFIED",
          message: "Completed plan requires VERIFIED evidence.",
          path: relativePath,
        });
      }
    }
  }
  return issues.length === 0 ? success(records) : failure(issues);
}
