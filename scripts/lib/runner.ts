import { spawnSync } from "node:child_process";

export type VerificationStep = {
  id: string;
  script: string;
  planAware?: boolean;
};

export type StepResult = {
  id: string;
  exitCode: number;
};

export type RunnerResult = {
  ok: boolean;
  results: StepResult[];
  failedStep: string | null;
};

export type StepExecutor = (step: VerificationStep, planId: string) => number;

export function runSequential(
  steps: VerificationStep[],
  planId: string,
  execute: StepExecutor,
): RunnerResult {
  const results: StepResult[] = [];
  for (const step of steps) {
    const exitCode = execute(step, planId);
    results.push({ id: step.id, exitCode });
    if (exitCode !== 0) return { ok: false, results, failedStep: step.id };
  }
  return { ok: true, results, failedStep: null };
}

export function executePackageScript(
  step: VerificationStep,
  planId: string,
): number {
  const npmExecPath = process.env.npm_execpath;
  const scriptArguments = ["run", step.script];
  if (step.planAware === true) scriptArguments.push("--", "--plan", planId);
  const result =
    npmExecPath === undefined
      ? spawnSync(
          process.platform === "win32" ? "pnpm.cmd" : "pnpm",
          scriptArguments,
          {
            stdio: "inherit",
            windowsHide: true,
          },
        )
      : spawnSync(process.execPath, [npmExecPath, ...scriptArguments], {
          stdio: "inherit",
          windowsHide: true,
        });
  return result.status ?? 1;
}

export const FAST_STEPS: VerificationStep[] = [
  { id: "format", script: "format:check" },
  { id: "lint", script: "lint" },
  { id: "typecheck", script: "typecheck" },
  { id: "unit", script: "test:unit" },
  { id: "skills", script: "validate:skills" },
  { id: "agents", script: "validate:agents" },
  { id: "hooks", script: "validate:hooks" },
  { id: "plans", script: "validate:plans", planAware: true },
  { id: "scope", script: "validate:scope", planAware: true },
  { id: "secrets", script: "validate:secrets" },
  { id: "requirements", script: "validate:requirements" },
  { id: "evidence", script: "validate:evidence", planAware: true },
];

export const FULL_ONLY_STEPS: VerificationStep[] = [
  { id: "integration", script: "test:integration" },
  { id: "build-harness", script: "build:harness" },
  { id: "ci", script: "validate:ci" },
];
