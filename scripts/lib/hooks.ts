import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  failure,
  success,
  type ValidationIssue,
  type ValidationResult,
} from "./result.ts";

const EXPECTED: Record<string, string> = {
  SessionStart: "session-start.mjs",
  SubagentStart: "subagent-start.mjs",
  PostToolUse: "post-tool-use.mjs",
  Stop: "stop.mjs",
};
const HANDLER_FIELDS = new Set([
  "type",
  "command",
  "commandWindows",
  "timeout",
  "statusMessage",
]);

type HookHandler = Record<string, unknown>;
type HookGroup = { matcher?: string; hooks?: HookHandler[] };

export function validateHooks(root: string): ValidationResult {
  const path = join(root, ".codex", "hooks.json");
  if (!existsSync(path))
    return failure([
      { code: "HOOK_CONFIG_MISSING", message: ".codex/hooks.json is missing." },
    ]);
  const issues: ValidationIssue[] = [];
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  } catch {
    return failure([
      {
        code: "HOOK_CONFIG_INVALID_JSON",
        message: "hooks.json is invalid JSON.",
      },
    ]);
  }
  const hooks = parsed.hooks as Record<string, HookGroup[]> | undefined;
  if (
    hooks === undefined ||
    Object.keys(hooks).sort().join(",") !==
      Object.keys(EXPECTED).sort().join(",")
  ) {
    issues.push({
      code: "HOOK_EVENT_SET_INVALID",
      message:
        "Exactly SessionStart, SubagentStart, PostToolUse, and Stop are required.",
    });
  }
  for (const [event, adapter] of Object.entries(EXPECTED)) {
    const groups = hooks?.[event];
    const handlers = groups?.[0]?.hooks;
    if (
      !Array.isArray(groups) ||
      groups.length !== 1 ||
      !Array.isArray(handlers) ||
      handlers.length !== 1
    ) {
      issues.push({
        code: "HOOK_GROUP_INVALID",
        message: `${event} requires one command handler.`,
      });
      continue;
    }
    const handler = handlers[0];
    if (handler === undefined) continue;
    if (Object.keys(handler).some((field) => !HANDLER_FIELDS.has(field))) {
      issues.push({
        code: "HOOK_FIELD_UNSUPPORTED",
        message: `${event} uses an unsupported handler field.`,
      });
    }
    if (
      handler.type !== "command" ||
      typeof handler.command !== "string" ||
      typeof handler.commandWindows !== "string" ||
      typeof handler.timeout !== "number" ||
      !handler.command.includes(adapter) ||
      !handler.commandWindows.includes(adapter)
    ) {
      issues.push({
        code: "HOOK_HANDLER_INVALID",
        message: `${event} command handler is incomplete.`,
      });
    }
    if (!existsSync(join(root, ".codex", "hooks", adapter))) {
      issues.push({
        code: "HOOK_ADAPTER_MISSING",
        message: `${adapter} is missing.`,
      });
    } else if (event === "Stop") {
      const source = readFileSync(
        join(root, ".codex", "hooks", adapter),
        "utf8",
      );
      if (
        !source.includes("--require-verified") ||
        !source.includes("emitStopHookOutput")
      ) {
        issues.push({
          code: "STOP_HOOK_EVIDENCE_GATE_INVALID",
          message:
            "Stop must use the VERIFIED evidence mode and supported output adapter.",
        });
      }
    }
  }
  if (hooks?.PreToolUse !== undefined) {
    issues.push({
      code: "PRE_TOOL_BLOCK_PRETENSE",
      message: "Plan 001 must not pretend PreToolUse can block.",
    });
  }
  return issues.length === 0 ? success() : failure(issues);
}
