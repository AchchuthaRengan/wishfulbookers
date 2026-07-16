#!/usr/bin/env node
import { findRepositoryRoot } from "./lib/preflight.ts";
import { validateRequirementManifest } from "./lib/requirements.ts";
import { printResult } from "./lib/result.ts";

process.exit(
  printResult(
    "requirements",
    validateRequirementManifest(findRepositoryRoot(process.cwd())),
  ),
);
