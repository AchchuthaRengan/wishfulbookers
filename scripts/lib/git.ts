import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";

export type GitResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
};

export class GitInventoryError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "GitInventoryError";
    this.code = code;
  }
}

export function runGit(root: string, args: string[]): GitResult {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    windowsHide: true,
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function zeroSeparated(value: string): string[] {
  return value.split("\0").filter((item) => item.length > 0);
}

function changedPaths(value: string): string[] {
  const tokens = zeroSeparated(value);
  const paths: string[] = [];
  for (let index = 0; index < tokens.length;) {
    const status = tokens[index];
    index += 1;
    if (status === undefined) break;
    const pathCount = /^[RC]/u.test(status) ? 2 : 1;
    for (let pathIndex = 0; pathIndex < pathCount; pathIndex += 1) {
      const path = tokens[index];
      index += 1;
      if (path === undefined) {
        throw new GitInventoryError(
          "SCOPE_GIT_DIFF_INVALID",
          "Git returned an incomplete name-status record.",
        );
      }
      paths.push(path);
    }
  }
  return [...new Set(paths)];
}

export type GitFileInventory = {
  committed: string[];
  staged: string[];
  unstaged: string[];
  untracked: string[];
};

export type GitWhitespaceIssue = {
  path: string;
  line: number;
  message: string;
};

function parseWhitespaceCheck(
  ok: boolean,
  stdout: string,
  unavailableCode: string,
  context: string,
): GitWhitespaceIssue[] {
  if (ok) return [];
  const issues = stdout
    .split(/\r?\n/u)
    .map((line) => /^(.+?):(\d+):\s+(.+)$/u.exec(line))
    .filter((match) => match !== null)
    .map((match) => ({
      path: match[1] ?? "unknown",
      line: Number(match[2] ?? 0),
      message: match[3] ?? "Whitespace error.",
    }));
  if (issues.length === 0) {
    throw new GitInventoryError(
      unavailableCode,
      `Git ${context} whitespace validation failed without safe diagnostics.`,
    );
  }
  return issues;
}

function uniqueWhitespaceIssues(
  issues: GitWhitespaceIssue[],
): GitWhitespaceIssue[] {
  return [
    ...new Map(
      issues.map((issue) => [
        `${issue.path}\0${String(issue.line)}\0${issue.message}`,
        issue,
      ]),
    ).values(),
  ];
}

function requiredGit(root: string, args: string[], code: string): GitResult {
  const result = runGit(root, args);
  if (!result.ok) {
    throw new GitInventoryError(
      code,
      `git ${args.join(" ")} failed without exposing repository data.`,
    );
  }
  return result;
}

export function getGitFileInventory(
  root: string,
  baseRef: string,
): GitFileInventory {
  requiredGit(
    root,
    ["rev-parse", "--verify", `${baseRef}^{commit}`],
    "SCOPE_BASE_REF_UNRESOLVED",
  );
  const committed = requiredGit(
    root,
    ["diff", "--name-status", "-z", "--find-renames", `${baseRef}...HEAD`],
    "SCOPE_COMMITTED_DIFF_UNAVAILABLE",
  );
  const staged = requiredGit(
    root,
    ["diff", "--cached", "--name-status", "-z", "--find-renames"],
    "SCOPE_STAGED_DIFF_UNAVAILABLE",
  );
  const unstaged = requiredGit(
    root,
    ["diff", "--name-status", "-z", "--find-renames"],
    "SCOPE_UNSTAGED_DIFF_UNAVAILABLE",
  );
  const untracked = requiredGit(
    root,
    ["ls-files", "--others", "--exclude-standard", "-z"],
    "SCOPE_UNTRACKED_FILES_UNAVAILABLE",
  );
  return {
    committed: changedPaths(committed.stdout),
    staged: changedPaths(staged.stdout),
    unstaged: changedPaths(unstaged.stdout),
    untracked: zeroSeparated(untracked.stdout),
  };
}

export function getIntendedDiffWhitespaceIssues(
  root: string,
  baseRef: string,
): GitWhitespaceIssue[] {
  const staged = runGit(root, ["diff", "--cached", "--check"]);
  const stagedIssues = parseWhitespaceCheck(
    staged.ok,
    staged.stdout,
    "SCOPE_STAGED_DIFF_CHECK_UNAVAILABLE",
    "staged-diff",
  );
  const temporary = mkdtempSync(join(tmpdir(), "navlands-git-index-"));
  const index = join(temporary, "index");
  const objectDirectory = join(temporary, "objects");
  mkdirSync(objectDirectory);
  try {
    const repositoryObjects = requiredGit(
      root,
      ["rev-parse", "--git-path", "objects"],
      "SCOPE_GIT_OBJECTS_UNAVAILABLE",
    ).stdout;
    const existingAlternates = process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES;
    const environment = {
      ...process.env,
      GIT_INDEX_FILE: index,
      GIT_OBJECT_DIRECTORY: objectDirectory,
      GIT_ALTERNATE_OBJECT_DIRECTORIES: [
        resolve(root, repositoryObjects),
        ...(existingAlternates === undefined ? [] : [existingAlternates]),
      ].join(delimiter),
    };
    const run = (args: string[]) =>
      spawnSync("git", ["-C", root, ...args], {
        encoding: "utf8",
        env: environment,
        windowsHide: true,
      });
    if (run(["read-tree", "HEAD"]).status !== 0) {
      throw new GitInventoryError(
        "SCOPE_TEMP_INDEX_UNAVAILABLE",
        "Git could not initialize the isolated intended-diff index.",
      );
    }
    if (run(["add", "-A", "--", "."]).status !== 0) {
      throw new GitInventoryError(
        "SCOPE_TEMP_INDEX_UPDATE_FAILED",
        "Git could not populate the isolated intended-diff index.",
      );
    }
    const checked = run(["diff", "--cached", "--check", baseRef]);
    const intendedIssues = parseWhitespaceCheck(
      checked.status === 0,
      checked.stdout.trim(),
      "SCOPE_DIFF_CHECK_UNAVAILABLE",
      "intended-diff",
    );
    return uniqueWhitespaceIssues([...stagedIssues, ...intendedIssues]);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

export function getAllIntendedFiles(root: string): string[] {
  const tracked = requiredGit(
    root,
    ["ls-files", "-z"],
    "GIT_TRACKED_FILES_UNAVAILABLE",
  );
  const untracked = requiredGit(
    root,
    ["ls-files", "--others", "--exclude-standard", "-z"],
    "GIT_UNTRACKED_FILES_UNAVAILABLE",
  );
  return [
    ...new Set([
      ...zeroSeparated(tracked.stdout),
      ...zeroSeparated(untracked.stdout),
    ]),
  ].sort();
}
