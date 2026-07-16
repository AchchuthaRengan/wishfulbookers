#!/usr/bin/env node
import { parseCommonArguments } from "./lib/args.ts";
import {
  collectPreflightFacts,
  evaluatePreflight,
  findRepositoryRoot,
} from "./lib/preflight.ts";

const argv = process.argv.slice(2);
const modeIndex = argv.findIndex(
  (value) => value === "--mode" || value.startsWith("--mode="),
);
let mode;
if (modeIndex >= 0) {
  const value = argv[modeIndex];
  mode = value.includes("=")
    ? value.slice(value.indexOf("=") + 1)
    : argv[modeIndex + 1];
}
if (!new Set(["plan", "implement", "verify"]).has(mode)) {
  process.stderr.write("preflight: --mode plan|implement|verify is required\n");
  process.exit(2);
}

const common = parseCommonArguments(argv);
const root = findRepositoryRoot(process.cwd());
const output = evaluatePreflight(
  collectPreflightFacts(root),
  mode,
  common.planId,
);
if (common.json) {
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
} else {
  process.stdout.write(`Preflight: ${output.state}\n`);
  for (const item of output.checks) {
    process.stdout.write(`${item.status} ${item.id}: ${item.message}\n`);
  }
  if (output.issues.length > 0) {
    process.stdout.write("Prerequisites:\n");
    for (const issue of output.issues) {
      process.stdout.write(`- ${issue.reasonCode}: ${issue.message}\n`);
    }
  }
}
process.exit(output.state === "BLOCKED" ? 2 : 0);
