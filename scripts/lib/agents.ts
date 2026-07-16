import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseToml } from "smol-toml";
import {
  failure,
  success,
  type ValidationIssue,
  type ValidationResult,
} from "./result.ts";

const EXPECTED = {
  architect: { model: "gpt-5.6-sol", reasoning: "xhigh", sandbox: "read-only" },
  implementer: {
    model: "gpt-5.6-terra",
    reasoning: "high",
    sandbox: "workspace-write",
  },
  "test-designer": {
    model: "gpt-5.6-terra",
    reasoning: "high",
    sandbox: "read-only",
  },
  verifier: { model: "gpt-5.6-terra", reasoning: "high", sandbox: "read-only" },
  "evidence-auditor": {
    model: "gpt-5.6-luna",
    reasoning: "high",
    sandbox: "read-only",
  },
  "design-reviewer": {
    model: "gpt-5.6-terra",
    reasoning: "high",
    sandbox: "read-only",
  },
} as const;

export function validateAgents(root: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const configPath = join(root, ".codex", "config.toml");
  if (!existsSync(configPath))
    return failure([
      {
        code: "CODEX_CONFIG_MISSING",
        message: ".codex/config.toml is missing.",
      },
    ]);
  const config = parseToml(readFileSync(configPath, "utf8")) as Record<
    string,
    unknown
  >;
  const agents = config.agents as Record<string, unknown> | undefined;
  const features = config.features as Record<string, unknown> | undefined;
  if (agents?.max_threads !== 3 || agents.max_depth !== 1) {
    issues.push({
      code: "AGENT_LIMITS_INVALID",
      message: "Agent limits must be max_threads=3 and max_depth=1.",
    });
  }
  if (features?.hooks !== true)
    issues.push({
      code: "HOOK_FEATURE_DISABLED",
      message: "Project-local hooks must be enabled.",
    });

  const directory = join(root, ".codex", "agents");
  const files = existsSync(directory)
    ? readdirSync(directory).filter((name) => name.endsWith(".toml"))
    : [];
  if (
    files.sort().join(",") !==
    Object.keys(EXPECTED)
      .map((name) => `${name}.toml`)
      .sort()
      .join(",")
  ) {
    issues.push({
      code: "AGENT_SET_INVALID",
      message: "Exactly the six approved native agents are required.",
    });
  }
  for (const [name, expected] of Object.entries(EXPECTED)) {
    const path = join(directory, `${name}.toml`);
    if (!existsSync(path)) continue;
    const parsed = parseToml(readFileSync(path, "utf8")) as Record<
      string,
      unknown
    >;
    if (
      parsed.name !== name ||
      typeof parsed.description !== "string" ||
      typeof parsed.developer_instructions !== "string" ||
      parsed.model !== expected.model ||
      parsed.model_reasoning_effort !== expected.reasoning ||
      parsed.sandbox_mode !== expected.sandbox
    ) {
      issues.push({
        code: "AGENT_CONFIG_INVALID",
        message: `${name}.toml does not match the approved role.`,
      });
    }
    if (
      name === "test-designer" &&
      !String(parsed.developer_instructions).includes("only specify tests")
    ) {
      issues.push({
        code: "TEST_DESIGNER_SCOPE_INVALID",
        message: "Test designer must specify tests only.",
      });
    }
    if (
      name !== "implementer" &&
      !String(parsed.developer_instructions).toLowerCase().includes("read-only")
    ) {
      issues.push({
        code: "READ_ONLY_AGENT_INVALID",
        message: `${name} must explicitly remain read-only.`,
      });
    }
  }
  return issues.length === 0 ? success() : failure(issues);
}
