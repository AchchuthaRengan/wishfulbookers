#!/usr/bin/env node
import { findRepositoryRoot } from "./lib/preflight.ts";
import { printResult } from "./lib/result.ts";
import { validateSkills } from "./lib/skills.ts";

process.exit(
  printResult("skills", validateSkills(findRepositoryRoot(process.cwd()))),
);
