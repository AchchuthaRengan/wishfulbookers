#!/usr/bin/env node
import { findRepositoryRoot } from "./lib/preflight.ts";
import { printResult } from "./lib/result.ts";
import { validateSecrets } from "./lib/secrets.ts";

process.exit(
  printResult("secrets", validateSecrets(findRepositoryRoot(process.cwd()))),
);
