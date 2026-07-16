import { spawnSync } from "node:child_process";
import { findRepositoryRoot } from "../../scripts/lib/preflight.ts";
import { listPlanRecords } from "../../scripts/lib/plans.ts";
import { emitStopHookOutput, readHookPayload } from "./io.mjs";

const COMPLETION_BLOCK = {
  continue: false,
  stopReason:
    "Completion is not supported by a complete VERIFIED independent evidence pack.",
  systemMessage:
    "Navlands completion gate: run the authoritative evidence validator, persist independent VERIFIED evidence, or describe the result as NOT_PROVEN.",
};

function isExplicitCompletionClaim(message) {
  return new RegExp(
    [
      "(?:^|[.!?]\\s*)(?:complete|completed|done|finished|verified)(?:[.!?]|$)",
      "\\b(?:the\\s+)?(?:plan|implementation|task|work|harness|everything)\\s+(?:(?:is|was|has\\s+been)\\s+)?(?:now\\s+)?(?:complete|completed|done|finished|verified)\\b",
      "\\b(?:i|we)\\s+(?:have\\s+)?(?:completed|finished|verified)\\s+(?:the\\s+)?(?:plan|implementation|task|work|harness)\\b",
    ].join("|"),
    "iu",
  ).test(message);
}

function runVerifiedEvidenceValidator(root, planId) {
  if (!/^PLAN-\d{3}$/u.test(planId)) return false;
  const arguments_ = [
    "validate:evidence",
    "--",
    "--plan",
    planId,
    "--require-verified",
  ];
  const windows = process.platform === "win32";
  const result = spawnSync(
    windows ? (process.env.ComSpec ?? "cmd.exe") : "pnpm",
    windows ? ["/d", "/s", "/c", `pnpm ${arguments_.join(" ")}`] : arguments_,
    {
      cwd: root,
      encoding: "utf8",
      stdio: "ignore",
      timeout: 25_000,
      windowsHide: true,
    },
  );
  return result.status === 0 && result.error === undefined;
}

async function main() {
  const payload = await readHookPayload();
  const message =
    typeof payload.last_assistant_message === "string"
      ? payload.last_assistant_message
      : "";
  const explicitClaim = isExplicitCompletionClaim(message);

  let root;
  let activePlans;
  try {
    root = findRepositoryRoot(
      typeof payload.cwd === "string" ? payload.cwd : process.cwd(),
    );
    activePlans = listPlanRecords(root)
      .filter((record) => record.location === "active")
      .sort((left, right) => left.id.localeCompare(right.id));
  } catch {
    emitStopHookOutput(
      explicitClaim
        ? COMPLETION_BLOCK
        : {
            continue: true,
            systemMessage:
              "Navlands hook warning: repository plan state could not be checked; package and CI validators remain authoritative.",
          },
    );
    return;
  }

  const durableClaim = activePlans.some(
    (record) => record.status === "COMPLETED",
  );
  if (!explicitClaim && !durableClaim) {
    emitStopHookOutput({ continue: true });
    return;
  }
  if (activePlans.length !== 1) {
    emitStopHookOutput(COMPLETION_BLOCK);
    return;
  }
  const plan = activePlans[0];
  emitStopHookOutput(
    plan !== undefined && runVerifiedEvidenceValidator(root, plan.id)
      ? { continue: true }
      : COMPLETION_BLOCK,
  );
}

try {
  await main();
} catch {
  emitStopHookOutput(COMPLETION_BLOCK);
}
