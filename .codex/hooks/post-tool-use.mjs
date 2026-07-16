import { findRepositoryRoot } from "../../scripts/lib/preflight.ts";
import { listPlanRecords } from "../../scripts/lib/plans.ts";
import { validateScope } from "../../scripts/lib/scope.ts";
import { validateSecrets } from "../../scripts/lib/secrets.ts";
import { emitHookOutput, readHookPayload, safeHookFailure } from "./io.mjs";

try {
  const payload = await readHookPayload();
  const root = findRepositoryRoot(
    typeof payload.cwd === "string" ? payload.cwd : process.cwd(),
  );
  const plan = listPlanRecords(root).find(
    (record) => record.location === "active",
  );
  if (plan === undefined) {
    emitHookOutput({
      systemMessage: "Navlands scope feedback: no active plan is available.",
    });
  } else {
    const scope = validateScope(root, plan.id);
    const secrets = validateSecrets(root);
    const codes = [...scope.issues, ...secrets.issues].map(
      (issue) => issue.code,
    );
    emitHookOutput(
      codes.length === 0
        ? {}
        : {
            systemMessage: `Navlands post-tool feedback found policy issues (${[...new Set(codes)].join(", ")}). Run the authoritative validators; no secret values were printed.`,
          },
    );
  }
} catch {
  safeHookFailure(
    "post-tool feedback could not run; package validators remain authoritative.",
  );
}
