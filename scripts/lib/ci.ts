import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  failure,
  success,
  type ValidationIssue,
  type ValidationResult,
} from "./result.ts";

type WorkflowStep = { uses?: string; run?: string };
type WorkflowJob = {
  "runs-on"?: string;
  "timeout-minutes"?: number;
  steps?: WorkflowStep[];
};

export function validateCi(root: string): ValidationResult {
  const path = join(root, ".github", "workflows", "verify.yml");
  if (!existsSync(path))
    return failure([
      { code: "CI_WORKFLOW_MISSING", message: "verify.yml is missing." },
    ]);
  const content = readFileSync(path, "utf8");
  const workflow = parseYaml(content) as Record<string, unknown>;
  const issues: ValidationIssue[] = [];
  const triggers = workflow.on as Record<string, unknown> | undefined;
  if (
    triggers === undefined ||
    Object.keys(triggers).sort().join(",") !== "pull_request,workflow_dispatch"
  ) {
    issues.push({
      code: "CI_TRIGGER_INVALID",
      message: "CI must run only on pull_request and workflow_dispatch.",
    });
  }
  const permissions = workflow.permissions as
    Record<string, unknown> | undefined;
  if (
    permissions === undefined ||
    Object.keys(permissions).join(",") !== "contents" ||
    permissions.contents !== "read"
  ) {
    issues.push({
      code: "CI_PERMISSIONS_INVALID",
      message: "CI permissions must be contents: read only.",
    });
  }
  const concurrency = workflow.concurrency as
    Record<string, unknown> | undefined;
  if (
    concurrency?.["cancel-in-progress"] !== true ||
    typeof concurrency.group !== "string"
  ) {
    issues.push({
      code: "CI_CONCURRENCY_INVALID",
      message: "CI must cancel superseded runs.",
    });
  }
  const jobs = workflow.jobs as Record<string, WorkflowJob> | undefined;
  if (jobs === undefined || Object.keys(jobs).join(",") !== "verify") {
    issues.push({
      code: "CI_JOB_SET_INVALID",
      message: "CI must contain only the verify job.",
    });
  }
  const job = jobs?.verify;
  if (
    job?.["runs-on"] !== "ubuntu-latest" ||
    typeof job["timeout-minutes"] !== "number" ||
    job["timeout-minutes"] > 20
  ) {
    issues.push({
      code: "CI_JOB_POLICY_INVALID",
      message: "Verify must use Ubuntu with a bounded timeout.",
    });
  }
  const steps = job?.steps ?? [];
  for (const step of steps) {
    if (
      step.uses !== undefined &&
      !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+@[0-9a-f]{40}$/u.test(step.uses)
    ) {
      issues.push({
        code: "CI_ACTION_UNPINNED",
        message: `${step.uses} is not pinned to an immutable commit.`,
      });
    }
  }
  const commands = steps.flatMap((step) =>
    step.run === undefined ? [] : [step.run],
  );
  for (const required of [
    "corepack prepare pnpm@11.9.0 --activate",
    "pnpm install --frozen-lockfile",
    "pnpm verify:full -- --plan PLAN-001",
  ]) {
    if (!commands.includes(required))
      issues.push({
        code: "CI_COMMAND_MISSING",
        message: `Missing exact CI command: ${required}`,
      });
  }
  if (
    /\$\{\{\s*secrets\./u.test(content) ||
    /supabase|openai|stripe|razorpay|wrangler/iu.test(content)
  ) {
    issues.push({
      code: "CI_EXTERNAL_SERVICE_FORBIDDEN",
      message: "Zero-spend CI must not use secrets or product providers.",
    });
  }
  return issues.length === 0 ? success() : failure(issues);
}
