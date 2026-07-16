import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validateCi } from "../../../scripts/lib/ci.ts";

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

describe("CI policy", () => {
  it("accepts the zero-spend pull-request workflow", () => {
    expect(validateCi(process.cwd()).ok).toBe(true);
  });

  it("rejects push triggers and unpinned actions", () => {
    const root = mkdtempSync(join(tmpdir(), "navlands-ci-"));
    temporary.push(root);
    const directory = join(root, ".github", "workflows");
    mkdirSync(directory, { recursive: true });
    const source = readFileSync(
      join(process.cwd(), ".github", "workflows", "verify.yml"),
      "utf8",
    );
    writeFileSync(
      join(directory, "verify.yml"),
      source
        .replace("  workflow_dispatch:", "  workflow_dispatch:\n  push:")
        .replace(/actions\/checkout@[0-9a-f]{40}/u, "actions/checkout@v4"),
    );
    const codes = validateCi(root).issues.map((issue) => issue.code);
    expect(codes).toContain("CI_TRIGGER_INVALID");
    expect(codes).toContain("CI_ACTION_UNPINNED");
  });
});
