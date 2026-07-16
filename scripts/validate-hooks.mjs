#!/usr/bin/env node
import { validateHooks } from "./lib/hooks.ts";
import { findRepositoryRoot } from "./lib/preflight.ts";
import { printResult } from "./lib/result.ts";

process.exit(
  printResult("hooks", validateHooks(findRepositoryRoot(process.cwd()))),
);
