#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const separator = process.argv.indexOf("--");
const outputIndex = process.argv.indexOf("--output");
const outputArgument =
  outputIndex >= 0 && outputIndex + 1 < process.argv.length
    ? process.argv[outputIndex + 1]
    : undefined;
const command = separator >= 0 ? process.argv[separator + 1] : undefined;
const commandArguments =
  separator >= 0 ? process.argv.slice(separator + 2) : [];

if (outputArgument === undefined || command === undefined) {
  process.stderr.write(
    "usage: capture-command.mjs --output docs/evidence/PLAN-NNN/test-results/name.log -- command [args...]\n",
  );
  process.exit(1);
}

const output = resolve(root, outputArgument);
const repositoryPath = relative(root, output).replaceAll("\\", "/");
if (
  !/^docs\/evidence\/PLAN-\d{3}\/test-results\/[a-z0-9][a-z0-9._-]*\.log$/u.test(
    repositoryPath,
  )
) {
  process.stderr.write(
    "output must be a .log file inside docs/evidence/PLAN-NNN/test-results\n",
  );
  process.exit(1);
}

const windowsPnpm = process.platform === "win32" && command === "pnpm";
if (
  windowsPnpm &&
  [command, ...commandArguments].some(
    (value) => !/^[a-zA-Z0-9@._:/\\=-]+$/u.test(value),
  )
) {
  process.stderr.write(
    "pnpm command arguments contain unsupported characters\n",
  );
  process.exit(1);
}
const executable = windowsPnpm ? (process.env.ComSpec ?? "cmd.exe") : command;
const executableArguments = windowsPnpm
  ? ["/d", "/s", "/c", [command, ...commandArguments].join(" ")]
  : commandArguments;
const startedAt = new Date().toISOString();
const started = process.hrtime.bigint();
const result = spawnSync(executable, executableArguments, {
  cwd: root,
  encoding: "utf8",
  env: process.env,
  maxBuffer: 64 * 1024 * 1024,
  shell: false,
  windowsHide: true,
});
const durationMs = Number((process.hrtime.bigint() - started) / 1_000_000n);
const exitCode = result.status ?? 1;
const renderedCommand = [command, ...commandArguments]
  .map((value) => JSON.stringify(value))
  .join(" ");
const log = [
  `COMMAND: ${renderedCommand}`,
  `STARTED_AT_UTC: ${startedAt}`,
  "STDOUT:",
  result.stdout ?? "",
  "STDERR:",
  result.stderr ?? result.error?.message ?? "",
  `EXIT_CODE: ${exitCode}`,
  `DURATION_MS: ${durationMs}`,
  "REDACTIONS: NONE",
  "",
].join("\n");

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, log, "utf8");
process.stdout.write(log);
process.exit(exitCode);
