import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  scanTextForSecrets,
  validateSecrets,
} from "../../../scripts/lib/secrets.ts";

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

describe("secret validator", () => {
  it("accepts ordinary harness text", () => {
    expect(scanTextForSecrets("synthetic fixture with no credentials")).toEqual(
      [],
    );
  });

  it("detects generated secret-shaped samples without committing reusable values", () => {
    const prefix = ["g", "h", "p", "_"].join("");
    const sample = `${prefix}${"A".repeat(24)}`;
    expect(scanTextForSecrets(sample).map((issue) => issue.code)).toContain(
      "GITHUB_TOKEN_PATTERN",
    );
  });

  it("rejects forbidden credential filenames", () => {
    const directory = mkdtempSync(join(tmpdir(), "navlands-secret-"));
    temporary.push(directory);
    mkdirSync(join(directory, "config"), { recursive: true });
    writeFileSync(
      join(directory, "config", ".env.local"),
      "placeholder=true\n",
    );
    expect(
      validateSecrets(directory).issues.map((issue) => issue.code),
    ).toContain("FORBIDDEN_SECRET_FILE");
  });
});
