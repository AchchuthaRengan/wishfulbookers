#!/usr/bin/env node
import { validateAgents } from "./lib/agents.ts";
import { findRepositoryRoot } from "./lib/preflight.ts";
import { printResult } from "./lib/result.ts";

process.exit(
  printResult("agents", validateAgents(findRepositoryRoot(process.cwd()))),
);
