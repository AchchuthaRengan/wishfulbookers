import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("repository validator CLIs", () => {
  it("reports implement readiness using schema version 1", () => {
    const result = spawnSync(
      process.execPath,
      [
        join(process.cwd(), "scripts", "preflight.mjs"),
        "--mode",
        "implement",
        "--plan",
        "PLAN-001",
        "--json",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(result.status).toBe(0);
    const output = JSON.parse(result.stdout) as {
      schemaVersion: number;
      state: string;
    };
    expect(output).toMatchObject({
      schemaVersion: 1,
      state: "READY_TO_IMPLEMENT",
    });
  });

  it("validates the current plan scope through the CLI", () => {
    const result = spawnSync(
      process.execPath,
      [
        join(process.cwd(), "scripts", "validate-scope.mjs"),
        "--plan",
        "PLAN-001",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(result.status, result.stderr).toBe(0);
  });
});
