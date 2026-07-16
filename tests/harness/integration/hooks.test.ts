import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function runHook(
  name: string,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const result = spawnSync(
    process.execPath,
    [join(process.cwd(), ".codex", "hooks", name)],
    {
      cwd: process.cwd(),
      input: JSON.stringify(payload),
      encoding: "utf8",
    },
  );
  expect(result.status).toBe(0);
  return JSON.parse(result.stdout.trim()) as Record<string, unknown>;
}

describe("hook payload adapters", () => {
  it("injects writer and read-only subagent context", () => {
    const writer = runHook("subagent-start.mjs", {
      hook_event_name: "SubagentStart",
      cwd: process.cwd(),
      agent_type: "implementer",
    });
    const reader = runHook("subagent-start.mjs", {
      hook_event_name: "SubagentStart",
      cwd: process.cwd(),
      agent_type: "verifier",
    });
    expect(JSON.stringify(writer)).toContain("sole scoped writer");
    expect(JSON.stringify(reader)).toContain("Remain read-only");
  });

  it("allows ordinary pauses but rejects unsupported completion claims", () => {
    expect(
      runHook("stop.mjs", {
        hook_event_name: "Stop",
        cwd: process.cwd(),
        last_assistant_message: "Paused for an independent review.",
      }).continue,
    ).toBe(true);
    expect(
      runHook("stop.mjs", {
        hook_event_name: "Stop",
        cwd: process.cwd(),
        last_assistant_message: "The plan is complete.",
      }).continue,
    ).toBe(false);
  });
});
