#!/usr/bin/env node
import { parseCommonArguments } from "./lib/args.ts";
import { findRepositoryRoot } from "./lib/preflight.ts";
import { printResult } from "./lib/result.ts";
import { validateScope } from "./lib/scope.ts";

const { planId } = parseCommonArguments(process.argv.slice(2));
if (planId === undefined || !/^PLAN-\d{3}$/u.test(planId)) {
  process.stderr.write("scope: --plan PLAN-NNN is required\n");
  process.exit(1);
}
process.exit(
  printResult(
    "scope",
    validateScope(findRepositoryRoot(process.cwd()), planId),
  ),
);
