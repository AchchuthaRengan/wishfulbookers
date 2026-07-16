import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import {
  createEvidencePack,
  validateEvidencePack,
} from "../../../scripts/lib/evidence.ts";

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "navlands-evidence-"));
  temporary.push(root);
  mkdirSync(join(root, "docs", "evidence"), { recursive: true });
  cpSync(
    join(process.cwd(), "docs", "evidence", "_template"),
    join(root, "docs", "evidence", "_template"),
    { recursive: true },
  );
  mkdirSync(join(root, "docs", "plans", "active"), { recursive: true });
  writeFileSync(
    join(root, "docs", "plans", "active", "PLAN-001-test.md"),
    `# Plan 001 — Test

Status: FOUNDER_PLAN_APPROVED
Requirement IDs: HARNESS-REQ-001, HARNESS-REQ-002, HARNESS-REQ-003, HARNESS-VER-001, HARNESS-VER-002, HARNESS-VER-004
`,
  );
  mkdirSync(join(root, "requirements"), { recursive: true });
  cpSync(
    join(process.cwd(), "requirements", "manifest.json"),
    join(root, "requirements", "manifest.json"),
  );
  return root;
}

function commitFixture(root: string): string {
  spawnSync("git", ["init", "-q"], { cwd: root });
  spawnSync("git", ["config", "user.email", "harness@example.invalid"], {
    cwd: root,
  });
  spawnSync("git", ["config", "user.name", "Harness Fixture"], {
    cwd: root,
  });
  spawnSync("git", ["add", "."], { cwd: root });
  spawnSync("git", ["commit", "-qm", "fixture"], { cwd: root });
  return spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).stdout.trim();
}

function markSummaryVerified(root: string, commit: string): string {
  const pack = join(root, "docs", "evidence", "PLAN-001");
  const summaryPath = join(pack, "summary.md");
  const summary = readFileSync(summaryPath, "utf8")
    .replace("Status: NOT_PROVEN", "Status: VERIFIED")
    .replace("Commit: UNSET", `Commit: ${commit}`)
    .replace("Writer: UNSET", "Writer: fixture-writer")
    .replace(
      "Independent reviewer: UNSET",
      "Independent reviewer: fixture-reviewer",
    );
  writeFileSync(summaryPath, summary);
  return pack;
}

describe("evidence packs", () => {
  it("creates a valid draft pack with manifest-backed requirements", () => {
    const root = fixture();
    createEvidencePack(root, "PLAN-001");
    expect(validateEvidencePack(root, "PLAN-001").ok).toBe(true);
  });

  it("refuses overwrite without explicit force", () => {
    const root = fixture();
    createEvidencePack(root, "PLAN-001");
    expect(() => createEvidencePack(root, "PLAN-001")).toThrow(/--force/u);
    expect(() => createEvidencePack(root, "PLAN-001", true)).not.toThrow();
  });

  it("rejects path traversal and unsupported verified claims", () => {
    const root = fixture();
    expect(() => createEvidencePack(root, "../PLAN-001")).toThrow(/PLAN-NNN/u);
    createEvidencePack(root, "PLAN-001");
    const summaryPath = join(
      root,
      "docs",
      "evidence",
      "PLAN-001",
      "summary.md",
    );
    writeFileSync(
      summaryPath,
      readFileSync(summaryPath, "utf8").replace(
        "Status: NOT_PROVEN",
        "Status: VERIFIED",
      ),
    );
    expect(
      validateEvidencePack(root, "PLAN-001").issues.map((issue) => issue.code),
    ).toContain("EVIDENCE_COMMIT_INVALID");
  });

  it("rejects VERIFIED evidence with empty command and requirement arrays", () => {
    const root = fixture();
    const commit = commitFixture(root);
    createEvidencePack(root, "PLAN-001");
    const pack = markSummaryVerified(root, commit);
    writeFileSync(
      join(pack, "commands.json"),
      JSON.stringify({
        schemaVersion: 1,
        planId: "PLAN-001",
        commit,
        environment: "local",
        commands: [],
      }),
    );
    writeFileSync(
      join(pack, "requirements.json"),
      JSON.stringify({
        schemaVersion: 1,
        planId: "PLAN-001",
        commit,
        requirements: [],
      }),
    );
    const result = validateEvidencePack(root, "PLAN-001");
    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "EVIDENCE_COMMANDS_EMPTY",
    );
    expect(result.issues.map((issue) => issue.code)).toContain(
      "EVIDENCE_REQUIREMENTS_EMPTY",
    );
  });

  it("rejects VERIFIED full-lane evidence without a nonempty raw log", () => {
    const root = fixture();
    const commit = commitFixture(root);
    createEvidencePack(root, "PLAN-001");
    const pack = markSummaryVerified(root, commit);
    const manifest = JSON.parse(
      readFileSync(join(root, "requirements", "manifest.json"), "utf8"),
    ) as {
      requirements: Array<{
        id: string;
        goalIds: string[];
        source: string;
      }>;
      validations: Array<{ id: string; command: string }>;
    };
    const fullCommand = manifest.validations.find(
      (entry) => entry.id === "VAL-FULL",
    )?.command;
    expect(fullCommand).toBeDefined();
    writeFileSync(
      join(pack, "commands.json"),
      JSON.stringify({
        schemaVersion: 1,
        planId: "PLAN-001",
        commit,
        environment: "local",
        commands: [
          {
            id: "CMD-001",
            command: fullCommand,
            purpose: "fixture full lane",
            status: "PASS",
            exitCode: 0,
            durationMs: 1,
            artifactPaths: [],
          },
        ],
      }),
    );
    const plannedIds = new Set([
      "HARNESS-REQ-001",
      "HARNESS-REQ-002",
      "HARNESS-REQ-003",
      "HARNESS-VER-001",
      "HARNESS-VER-002",
      "HARNESS-VER-004",
    ]);
    writeFileSync(
      join(pack, "requirements.json"),
      JSON.stringify({
        schemaVersion: 1,
        planId: "PLAN-001",
        commit,
        requirements: manifest.requirements
          .filter((entry) => plannedIds.has(entry.id))
          .map((entry) => ({
            requirementId: entry.id,
            goalIds: entry.goalIds,
            source: entry.source,
            status: "PASS",
            verificationIds: ["CMD-001"],
            evidencePaths: ["docs/evidence/PLAN-001/summary.md"],
            notes: "fixture",
          })),
      }),
    );

    expect(
      validateEvidencePack(root, "PLAN-001").issues.map((issue) => issue.code),
    ).toContain("EVIDENCE_FULL_LANE_RAW_ARTIFACT_MISSING");
  });
});
