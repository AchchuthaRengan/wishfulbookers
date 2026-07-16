import { existsSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { isTextFile, listFilesRecursively, readText } from "./files.ts";
import { normalizeRepositoryPath } from "./glob.ts";
import {
  failure,
  success,
  type ValidationIssue,
  type ValidationResult,
} from "./result.ts";

const FORBIDDEN_NAMES = [
  /^\.env(?:\..+)?$/u,
  /^id_(?:rsa|dsa|ecdsa|ed25519)$/u,
  /credentials?\.json$/iu,
  /service[-_]?account.*\.json$/iu,
  /\.(?:pem|p12|pfx|key)$/iu,
];

const SECRET_PATTERNS: Array<{ code: string; expression: RegExp }> = [
  {
    code: "PRIVATE_KEY_MATERIAL",
    expression: new RegExp(
      [
        "-".repeat(5),
        "BEGIN",
        "(?: RSA| OPENSSH| EC)?",
        " PRIVATE KEY",
        "-".repeat(5),
      ].join(""),
      "u",
    ),
  },
  { code: "OPENAI_KEY_PATTERN", expression: /sk-[A-Za-z0-9_-]{20,}/u },
  { code: "GITHUB_TOKEN_PATTERN", expression: /gh[pousr]_[A-Za-z0-9]{20,}/u },
  { code: "AWS_ACCESS_KEY_PATTERN", expression: /AKIA[0-9A-Z]{16}/u },
  {
    code: "ASSIGNED_SECRET_PATTERN",
    expression:
      /(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["'][A-Za-z0-9_./+=-]{16,}["']/iu,
  },
];

export function scanTextForSecrets(
  text: string,
  path = "input",
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.expression.test(text)) {
      issues.push({
        code: pattern.code,
        message:
          "Potential secret material detected; value intentionally omitted.",
        path,
      });
    }
  }
  return issues;
}

export function validateSecrets(root: string): ValidationResult {
  if (!existsSync(root))
    return failure([
      {
        code: "REPOSITORY_MISSING",
        message: "Repository root does not exist.",
      },
    ]);
  const issues: ValidationIssue[] = [];
  for (const rawPath of listFilesRecursively(root)) {
    const path = normalizeRepositoryPath(rawPath);
    const name = basename(path);
    if (FORBIDDEN_NAMES.some((pattern) => pattern.test(name))) {
      issues.push({
        code: "FORBIDDEN_SECRET_FILE",
        message: "Credential-bearing file type is forbidden.",
        path,
      });
      continue;
    }
    const absolute = join(root, path);
    if (!isTextFile(path) || statSync(absolute).size > 1_000_000) continue;
    issues.push(...scanTextForSecrets(readText(absolute), path));
  }
  return issues.length === 0 ? success() : failure(issues);
}
