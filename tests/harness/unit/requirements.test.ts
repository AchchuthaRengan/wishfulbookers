import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import { validateRequirementManifest } from "../../../scripts/lib/requirements.ts";

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

function copyRepository(): string {
  const destination = mkdtempSync(join(tmpdir(), "navlands-requirements-"));
  temporary.push(destination);
  const source = process.cwd();
  cpSync(source, destination, {
    recursive: true,
    filter: (path) => {
      const relative = path.slice(source.length).replaceAll("\\", "/");
      return !/(?:^|\/)(?:\.git|node_modules|dist-harness|coverage)(?:\/|$)/u.test(
        relative,
      );
    },
  });
  spawnSync("git", ["init", "-q"], { cwd: destination });
  spawnSync("git", ["add", "."], { cwd: destination });
  return destination;
}

describe("requirement manifest", () => {
  it("validates schema, sources, goals, globs, and orphan coverage", () => {
    expect(validateRequirementManifest(process.cwd()).ok).toBe(true);
  });

  it("rejects unknown goal IDs", () => {
    const root = copyRepository();
    const path = join(root, "requirements", "manifest.json");
    const content = readFileSync(path, "utf8").replace(
      "NAV-FEATURE-023",
      "NAV-FEATURE-999",
    );
    writeFileSync(path, content);
    expect(
      validateRequirementManifest(root).issues.map((issue) => issue.code),
    ).toContain("GOAL_ID_UNKNOWN");
  });
});
