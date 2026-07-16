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
import { createEvidencePack } from "../../../scripts/lib/evidence.ts";

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "navlands-stop-hook-"));
  temporary.push(root);
  spawnSync("git", ["init", "-q"], { cwd: root });
  mkdirSync(join(root, ".codex"), { recursive: true });
  cpSync(
    join(process.cwd(), ".codex", "hooks"),
    join(root, ".codex", "hooks"),
    { recursive: true },
  );
  cpSync(join(process.cwd(), "scripts"), join(root, "scripts"), {
    recursive: true,
  });
  cpSync(join(process.cwd(), "requirements"), join(root, "requirements"), {
    recursive: true,
  });
  cpSync(join(process.cwd(), "package.json"), join(root, "package.json"));
  const packagePath = join(root, "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
    scripts: Record<string, string>;
  };
  const evidenceCli = join(
    process.cwd(),
    "scripts",
    "validate-evidence-pack.mjs",
  ).replaceAll("\\", "/");
  packageJson.scripts["validate:evidence"] = `node "${evidenceCli}"`;
  writeFileSync(packagePath, JSON.stringify(packageJson));
  mkdirSync(join(root, "docs", "evidence"), { recursive: true });
  cpSync(
    join(process.cwd(), "docs", "evidence", "_template"),
    join(root, "docs", "evidence", "_template"),
    { recursive: true },
  );
  mkdirSync(join(root, "docs", "plans", "active"), { recursive: true });
  writeFileSync(
    join(root, "docs", "plans", "active", "PLAN-001-test.md"),
    "# Plan 001 — Test\n\nStatus: FOUNDER_PLAN_APPROVED\nRequirement IDs: HARNESS-REQ-001\n",
  );
  return root;
}

function runStopHook(
  root: string,
  lastAssistantMessage: string,
  environment: NodeJS.ProcessEnv = process.env,
): { status: number | null; output: Record<string, unknown> } {
  const result = spawnSync(
    process.execPath,
    [join(root, ".codex", "hooks", "stop.mjs")],
    {
      cwd: root,
      input: JSON.stringify({
        hook_event_name: "Stop",
        cwd: root,
        last_assistant_message: lastAssistantMessage,
      }),
      encoding: "utf8",
      env: environment,
    },
  );
  const output = JSON.parse(result.stdout.trim()) as Record<string, unknown>;
  expect(
    Object.keys(output).every((key) =>
      new Set(["continue", "stopReason", "systemMessage"]).has(key),
    ),
  ).toBe(true);
  return {
    status: result.status,
    output,
  };
}

function commitFixture(root: string): string {
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
  writeFileSync(
    summaryPath,
    readFileSync(summaryPath, "utf8")
      .replace("Status: NOT_PROVEN", "Status: VERIFIED")
      .replace("Commit: UNSET", `Commit: ${commit}`)
      .replace("Writer: UNSET", "Writer: fixture-writer")
      .replace(
        "Independent reviewer: UNSET",
        "Independent reviewer: fixture-reviewer",
      ),
  );
  return pack;
}

function createValidVerifiedPack(root: string, commit: string): void {
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
  const requirement = manifest.requirements.find(
    (entry) => entry.id === "HARNESS-REQ-001",
  );
  const fullCommand = manifest.validations.find(
    (entry) => entry.id === "VAL-FULL",
  )?.command;
  expect(requirement).toBeDefined();
  expect(fullCommand).toBeDefined();
  const artifact = "docs/evidence/PLAN-001/test-results/full.log";
  writeFileSync(join(root, artifact), "full lane PASS\n");
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
          artifactPaths: [artifact],
        },
      ],
    }),
  );
  writeFileSync(
    join(pack, "requirements.json"),
    JSON.stringify({
      schemaVersion: 1,
      planId: "PLAN-001",
      commit,
      requirements: [
        {
          requirementId: requirement?.id,
          goalIds: requirement?.goalIds,
          source: requirement?.source,
          status: "PASS",
          verificationIds: ["CMD-001"],
          evidencePaths: [artifact],
          notes: "fixture",
        },
      ],
    }),
  );
}

describe("Stop hook evidence gate", () => {
  it("rejects a summary-only fake VERIFIED completion claim", () => {
    const root = fixture();
    const pack = join(root, "docs", "evidence", "PLAN-001");
    mkdirSync(pack, { recursive: true });
    writeFileSync(join(pack, "summary.md"), "Status: VERIFIED\n");

    const result = runStopHook(root, "The plan is complete.");
    expect(result.status).toBe(0);
    expect(result.output.continue).toBe(false);
  });

  it("allows a non-completion turn without requiring evidence", () => {
    const root = fixture();
    const result = runStopHook(root, "Paused for an independent review.");
    expect(result.status).toBe(0);
    expect(result.output.continue).toBe(true);
  });

  it("fails closed when a completion claim has no evidence pack", () => {
    const root = fixture();
    const result = runStopHook(root, "The plan is complete.");
    expect(result.status).toBe(0);
    expect(result.output.continue).toBe(false);
  });

  it("fails closed for malformed evidence", () => {
    const root = fixture();
    const pack = join(root, "docs", "evidence", "PLAN-001");
    mkdirSync(pack, { recursive: true });
    writeFileSync(join(pack, "summary.md"), "Status: VERIFIED\n");
    writeFileSync(join(pack, "commands.json"), "{");
    writeFileSync(join(pack, "requirements.json"), "{");
    const result = runStopHook(root, "The plan is complete.");
    expect(result.status).toBe(0);
    expect(result.output.continue).toBe(false);
  });

  it("rejects a valid NOT_PROVEN pack for a completion claim", () => {
    const root = fixture();
    createEvidencePack(root, "PLAN-001");
    const result = runStopHook(root, "The plan is complete.");
    expect(result.status).toBe(0);
    expect(result.output.continue).toBe(false);
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
    const result = runStopHook(root, "The plan is complete.");
    expect(result.status).toBe(0);
    expect(result.output.continue).toBe(false);
  });

  it("fails closed when the validator command fails", () => {
    const root = fixture();
    const commit = commitFixture(root);
    createValidVerifiedPack(root, commit);
    const packagePath = join(root, "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
      scripts: Record<string, string>;
    };
    packageJson.scripts["validate:evidence"] = "node missing-validator.mjs";
    writeFileSync(packagePath, JSON.stringify(packageJson));
    const result = runStopHook(root, "The plan is complete.");
    expect(result.status).toBe(0);
    expect(result.output.continue).toBe(false);
  });

  it("fails closed when direct pnpm is unavailable", () => {
    const root = fixture();
    const commit = commitFixture(root);
    createValidVerifiedPack(root, commit);
    const environment = { ...process.env, PATH: "" };
    const result = runStopHook(root, "The plan is complete.", environment);
    expect(result.status).toBe(0);
    expect(result.output.continue).toBe(false);
  });

  it("gates a durable COMPLETED status even without completion language", () => {
    const root = fixture();
    const plan = join(root, "docs", "plans", "active", "PLAN-001-test.md");
    writeFileSync(
      plan,
      readFileSync(plan, "utf8").replace(
        "Status: FOUNDER_PLAN_APPROVED",
        "Status: COMPLETED",
      ),
    );
    const result = runStopHook(root, "Paused for review.");
    expect(result.status).toBe(0);
    expect(result.output.continue).toBe(false);
  });

  it("continues only when a complete VERIFIED pack passes", () => {
    const root = fixture();
    const commit = commitFixture(root);
    createValidVerifiedPack(root, commit);
    const validation = spawnSync(
      process.execPath,
      [
        join(process.cwd(), "scripts", "validate-evidence-pack.mjs"),
        "--plan",
        "PLAN-001",
        "--require-verified",
      ],
      { cwd: root, encoding: "utf8" },
    );
    expect(validation.status, validation.stderr).toBe(0);
    const result = runStopHook(root, "The plan is complete.");
    expect(result.status).toBe(0);
    expect(result.output.continue).toBe(true);
  });
});
