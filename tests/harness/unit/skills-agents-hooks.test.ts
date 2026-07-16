import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validateAgents } from "../../../scripts/lib/agents.ts";
import { validateHooks } from "../../../scripts/lib/hooks.ts";
import { validateSkills } from "../../../scripts/lib/skills.ts";

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

describe("skill, agent, and hook controls", () => {
  it("accepts the approved project-local controls", () => {
    expect(validateSkills(process.cwd()).ok).toBe(true);
    expect(validateAgents(process.cwd()).ok).toBe(true);
    expect(validateHooks(process.cwd()).ok).toBe(true);
  });

  it("rejects a missing skill and agent", () => {
    const root = mkdtempSync(join(tmpdir(), "navlands-controls-"));
    temporary.push(root);
    cpSync(join(process.cwd(), ".agents"), join(root, ".agents"), {
      recursive: true,
    });
    cpSync(join(process.cwd(), ".codex"), join(root, ".codex"), {
      recursive: true,
    });
    rmSync(join(root, ".agents", "skills", "navlands-plan"), {
      recursive: true,
    });
    rmSync(join(root, ".codex", "agents", "architect.toml"));
    expect(validateSkills(root).issues.map((issue) => issue.code)).toContain(
      "SKILL_SET_INVALID",
    );
    expect(validateAgents(root).issues.map((issue) => issue.code)).toContain(
      "AGENT_SET_INVALID",
    );
  });

  it("rejects a Stop hook that bypasses authoritative VERIFIED evidence", () => {
    const root = mkdtempSync(join(tmpdir(), "navlands-controls-"));
    temporary.push(root);
    cpSync(join(process.cwd(), ".codex"), join(root, ".codex"), {
      recursive: true,
    });
    const stop = join(root, ".codex", "hooks", "stop.mjs");
    writeFileSync(
      stop,
      readFileSync(stop, "utf8").replace("--require-verified", "--schema-only"),
    );
    expect(validateHooks(root).issues.map((issue) => issue.code)).toContain(
      "STOP_HOOK_EVIDENCE_GATE_INVALID",
    );
  });
});
