#!/usr/bin/env node
import { validateCi } from "./lib/ci.ts";
import { findRepositoryRoot } from "./lib/preflight.ts";
import { printResult } from "./lib/result.ts";

process.exit(printResult("ci", validateCi(findRepositoryRoot(process.cwd()))));
