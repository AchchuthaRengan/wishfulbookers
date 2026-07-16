#!/usr/bin/env node
import { parseCommonArguments } from "./lib/args.ts";
import { findRepositoryRoot } from "./lib/preflight.ts";
import { validatePlans } from "./lib/plans.ts";
import { printResult } from "./lib/result.ts";

const { planId } = parseCommonArguments(process.argv.slice(2));
const result = validatePlans(findRepositoryRoot(process.cwd()), planId);
process.exit(printResult("plans", result));
