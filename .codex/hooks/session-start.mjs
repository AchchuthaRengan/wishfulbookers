import {
  collectPreflightFacts,
  evaluatePreflight,
  findRepositoryRoot,
} from "../../scripts/lib/preflight.ts";
import { emitHookOutput, readHookPayload, safeHookFailure } from "./io.mjs";

try {
  const payload = await readHookPayload();
  const root = findRepositoryRoot(
    typeof payload.cwd === "string" ? payload.cwd : process.cwd(),
  );
  const facts = collectPreflightFacts(root);
  const active = facts.activePlans[0];
  const result = evaluatePreflight(facts, "implement", active?.id);
  const issueCodes = result.issues.map((issue) => issue.reasonCode).join(", ");
  emitHookOutput({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext:
        result.state === "READY_TO_IMPLEMENT"
          ? `Navlands preflight is READY_TO_IMPLEMENT for ${result.planId}. Read the approved plan and scope sidecar before writing.`
          : `Navlands implementation preflight is ${result.state}. Run pnpm preflight for the consolidated prerequisites${issueCodes === "" ? "." : `: ${issueCodes}.`}`,
    },
  });
} catch {
  safeHookFailure(
    "preflight could not be evaluated; run pnpm preflight manually.",
  );
}
