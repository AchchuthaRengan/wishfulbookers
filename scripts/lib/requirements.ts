import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Ajv } from "ajv";
import fg from "fast-glob";
import { getAllIntendedFiles } from "./git.ts";
import { isSafeRelativePath, matchesAnyGlob } from "./glob.ts";
import {
  failure,
  success,
  type ValidationIssue,
  type ValidationResult,
} from "./result.ts";

export type RequirementEntry = {
  id: string;
  source: string;
  goalIds: string[];
  implementationGlobs: string[];
  validationIds: string[];
  validationGlobs: string[];
};

export type RequirementManifest = {
  schemaVersion: number;
  goalCatalogs: string[];
  validations: Array<{ id: string; command: string }>;
  requirements: RequirementEntry[];
};

function headingAnchor(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^#+\s*/u, "")
    .replace(/[^a-z0-9\s-]/gu, "")
    .replace(/\s+/gu, "-")
    .replace(/-+/gu, "-");
}

function validateSource(root: string, source: string): boolean {
  const [path, anchor] = source.split("#");
  if (path === undefined || anchor === undefined) return false;
  try {
    const content = readFileSync(join(root, path), "utf8");
    return content
      .split(/\r?\n/u)
      .filter((line) => /^#{1,6}\s+/u.test(line))
      .some((line) => headingAnchor(line) === anchor);
  } catch {
    return false;
  }
}

export function readRequirementManifest(root: string): RequirementManifest {
  return JSON.parse(
    readFileSync(join(root, "requirements", "manifest.json"), "utf8"),
  ) as RequirementManifest;
}

export function validateRequirementManifest(
  root: string,
): ValidationResult<RequirementManifest> {
  const issues: ValidationIssue[] = [];
  let manifest: RequirementManifest;
  try {
    manifest = readRequirementManifest(root);
    const schema = JSON.parse(
      readFileSync(join(root, "requirements", "manifest.schema.json"), "utf8"),
    ) as object;
    const ajv = new Ajv({ allErrors: true, strict: true });
    if (!ajv.validate(schema, manifest)) {
      issues.push({
        code: "REQUIREMENT_SCHEMA_INVALID",
        message: ajv.errorsText(ajv.errors, { separator: "; " }),
        path: "requirements/manifest.json",
      });
    }
  } catch (error) {
    return failure([
      {
        code: "REQUIREMENT_MANIFEST_UNREADABLE",
        message:
          error instanceof Error
            ? error.message
            : "Manifest could not be read.",
      },
    ]);
  }

  const requirementIds = new Set<string>();
  const validationIds = new Set(manifest.validations.map((entry) => entry.id));
  const goalIds = new Set<string>();
  for (const catalog of manifest.goalCatalogs) {
    try {
      const content = readFileSync(join(root, catalog), "utf8");
      for (const match of content.matchAll(
        /\bNAV-(?:FEATURE|SCREEN)-\d{3}\b/gu,
      ))
        goalIds.add(match[0]);
    } catch {
      issues.push({
        code: "GOAL_CATALOG_MISSING",
        message: "Goal catalog is missing.",
        path: catalog,
      });
    }
  }

  for (const entry of manifest.requirements) {
    if (requirementIds.has(entry.id)) {
      issues.push({
        code: "REQUIREMENT_ID_DUPLICATE",
        message: `${entry.id} is duplicated.`,
      });
    }
    requirementIds.add(entry.id);
    if (!validateSource(root, entry.source)) {
      issues.push({
        code: "REQUIREMENT_SOURCE_INVALID",
        message: `Source/anchor not found: ${entry.source}`,
      });
    }
    for (const goalId of entry.goalIds) {
      if (!goalIds.has(goalId))
        issues.push({
          code: "GOAL_ID_UNKNOWN",
          message: `${goalId} is not in a goal catalog.`,
        });
    }
    for (const validationId of entry.validationIds) {
      if (!validationIds.has(validationId)) {
        issues.push({
          code: "VALIDATION_ID_UNKNOWN",
          message: `${validationId} is not declared.`,
        });
      }
    }
    for (const pattern of [
      ...entry.implementationGlobs,
      ...entry.validationGlobs,
    ]) {
      if (!isSafeRelativePath(pattern)) {
        issues.push({
          code: "REQUIREMENT_GLOB_UNSAFE",
          message: `Unsafe glob ${pattern}.`,
        });
      } else if (
        fg.sync(pattern, {
          cwd: root,
          dot: true,
          onlyFiles: true,
          ignore: ["node_modules/**", ".git/**", "dist-harness/**"],
        }).length === 0
      ) {
        issues.push({
          code: "REQUIREMENT_GLOB_EMPTY",
          message: `Glob matches no file: ${pattern}`,
        });
      }
    }
  }

  const coverageGlobs = manifest.requirements.flatMap(
    (entry) => entry.implementationGlobs,
  );
  for (const path of getAllIntendedFiles(root)) {
    if (!matchesAnyGlob(path, coverageGlobs)) {
      issues.push({
        code: "ORPHAN_HARNESS_FILE",
        message: "File is not mapped to a requirement.",
        path,
      });
    }
  }

  return issues.length === 0 ? success(manifest) : failure(issues);
}
