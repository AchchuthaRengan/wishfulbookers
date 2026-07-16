#!/usr/bin/env node
import { parseCommonArguments } from "./lib/args.ts";
import {
  executePackageScript,
  FAST_STEPS,
  FULL_ONLY_STEPS,
  runSequential,
} from "./lib/runner.ts";

const [lane, ...rest] = process.argv.slice(2);
const { planId } = parseCommonArguments(rest);
if (
  !new Set(["fast", "full"]).has(lane) ||
  planId === undefined ||
  !/^PLAN-\d{3}$/u.test(planId)
) {
  process.stderr.write("usage: verify.mjs fast|full --plan PLAN-NNN\n");
  process.exit(1);
}
const steps =
  lane === "fast" ? FAST_STEPS : [...FAST_STEPS, ...FULL_ONLY_STEPS];
const result = runSequential(steps, planId, (step, selectedPlan) => {
  process.stdout.write(`\n[${lane}] ${step.id}\n`);
  return executePackageScript(step, selectedPlan);
});
if (!result.ok)
  process.stderr.write(`Verification stopped at ${result.failedStep}.\n`);
process.exit(result.ok ? 0 : 1);
