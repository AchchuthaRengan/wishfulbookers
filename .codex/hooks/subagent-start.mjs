import { emitHookOutput, readHookPayload, safeHookFailure } from "./io.mjs";

try {
  const payload = await readHookPayload();
  const role =
    typeof payload.agent_type === "string" ? payload.agent_type : "unknown";
  const context =
    role === "implementer"
      ? "You are the sole scoped writer. Write only after approved-plan preflight and only inside the active scope sidecar; never self-approve evidence."
      : "Remain read-only. You may create only ignored temporary/cache artifacts while running checks; do not edit repository or evidence files. Return findings to the scoped writer.";
  emitHookOutput({
    hookSpecificOutput: {
      hookEventName: "SubagentStart",
      additionalContext: `Navlands role ${role}: ${context}`,
    },
  });
} catch {
  safeHookFailure("scoped subagent context could not be loaded.");
}
