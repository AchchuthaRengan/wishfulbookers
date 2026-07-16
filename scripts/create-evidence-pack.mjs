#!/usr/bin/env node
import { parseCommonArguments } from "./lib/args.ts";
import { createEvidencePack } from "./lib/evidence.ts";
import { findRepositoryRoot } from "./lib/preflight.ts";

const args = parseCommonArguments(process.argv.slice(2));
if (
  args.positionals.length !== 1 ||
  !/^PLAN-\d{3}$/u.test(args.positionals[0] ?? "")
) {
  process.stderr.write("usage: create-evidence-pack.mjs PLAN-NNN [--force]\n");
  process.exit(1);
}
try {
  const destination = createEvidencePack(
    findRepositoryRoot(process.cwd()),
    args.positionals[0],
    args.force,
  );
  process.stdout.write(`Created ${destination}\n`);
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Evidence creation failed."}\n`,
  );
  process.exit(1);
}
