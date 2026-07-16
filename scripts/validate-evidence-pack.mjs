#!/usr/bin/env node
import { parseCommonArguments } from "./lib/args.ts";
import { validateEvidence } from "./lib/evidence.ts";
import { findRepositoryRoot } from "./lib/preflight.ts";
import { printResult } from "./lib/result.ts";

const { planId, requireVerified } = parseCommonArguments(process.argv.slice(2));
if (planId !== undefined && !/^PLAN-\d{3}$/u.test(planId)) {
  process.stderr.write("evidence: --plan must match PLAN-NNN\n");
  process.exit(1);
}
if (requireVerified && planId === undefined) {
  process.stderr.write(
    "evidence: --require-verified requires --plan PLAN-NNN\n",
  );
  process.exit(1);
}
process.exit(
  printResult(
    "evidence",
    validateEvidence(findRepositoryRoot(process.cwd()), planId, {
      requireVerified,
    }),
  ),
);
