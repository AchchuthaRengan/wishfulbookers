import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  failure,
  success,
  type ValidationIssue,
  type ValidationResult,
} from "./result.ts";

export const REQUIRED_SKILLS = [
  "navlands-plan",
  "navlands-playground",
  "navlands-frontend-taste",
  "navlands-data-model",
  "navlands-security",
  "navlands-verify",
] as const;

const FORBIDDEN_SKILL_FILES = new Set([
  "README.md",
  "CHANGELOG.md",
  "INSTALLATION_GUIDE.md",
  "QUICK_REFERENCE.md",
]);

function frontmatter(content: string): Record<string, unknown> | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/u.exec(content);
  if (match?.[1] === undefined) return null;
  const parsed = parseYaml(match[1]) as unknown;
  return typeof parsed === "object" && parsed !== null
    ? (parsed as Record<string, unknown>)
    : null;
}

export function validateSkills(root: string): ValidationResult {
  const base = join(root, ".agents", "skills");
  const issues: ValidationIssue[] = [];
  if (!existsSync(base))
    return failure([
      {
        code: "SKILLS_DIRECTORY_MISSING",
        message: ".agents/skills is missing.",
      },
    ]);
  const actual = readdirSync(base)
    .filter((name) => statSync(join(base, name)).isDirectory())
    .sort();
  if (actual.join("\n") !== [...REQUIRED_SKILLS].sort().join("\n")) {
    issues.push({
      code: "SKILL_SET_INVALID",
      message: "Exactly the six approved Navlands skills are required.",
    });
  }

  for (const name of REQUIRED_SKILLS) {
    const directory = join(base, name);
    const skillPath = join(directory, "SKILL.md");
    const metadataPath = join(directory, "agents", "openai.yaml");
    if (!existsSync(skillPath) || !existsSync(metadataPath)) {
      issues.push({
        code: "SKILL_FILE_MISSING",
        message: `${name} requires SKILL.md and agents/openai.yaml.`,
      });
      continue;
    }
    const content = readFileSync(skillPath, "utf8");
    const metadata = frontmatter(content);
    if (
      metadata === null ||
      Object.keys(metadata).sort().join(",") !== "description,name"
    ) {
      issues.push({
        code: "SKILL_FRONTMATTER_INVALID",
        message: `${name} frontmatter must contain only name and description.`,
      });
    } else if (
      metadata.name !== name ||
      typeof metadata.description !== "string" ||
      metadata.description.trim().length < 25
    ) {
      issues.push({
        code: "SKILL_METADATA_INVALID",
        message: `${name} metadata does not match its purpose.`,
      });
    }
    for (const match of content.matchAll(/`(references\/[^`]+)`/gu)) {
      const reference = match[1];
      if (reference === undefined || !existsSync(join(directory, reference))) {
        issues.push({
          code: "SKILL_REFERENCE_MISSING",
          message: `${name} references a missing resource.`,
        });
      }
    }
    const openai = parseYaml(readFileSync(metadataPath, "utf8")) as Record<
      string,
      unknown
    >;
    if (
      Object.keys(openai).join(",") !== "interface" ||
      typeof openai.interface !== "object" ||
      openai.interface === null
    ) {
      issues.push({
        code: "SKILL_OPENAI_YAML_INVALID",
        message: `${name} openai.yaml must contain only interface.`,
      });
    } else {
      const fields = openai.interface as Record<string, unknown>;
      if (
        Object.keys(fields).sort().join(",") !==
        "default_prompt,display_name,short_description"
      ) {
        issues.push({
          code: "SKILL_INTERFACE_FIELDS_INVALID",
          message: `${name} interface fields are invalid.`,
        });
      }
      const short = fields.short_description;
      const prompt = fields.default_prompt;
      if (typeof short !== "string" || short.length < 25 || short.length > 64) {
        issues.push({
          code: "SKILL_SHORT_DESCRIPTION_INVALID",
          message: `${name} short_description must be 25-64 characters.`,
        });
      }
      if (
        typeof prompt !== "string" ||
        !prompt.includes(`$${name}`) ||
        !/[.!?]$/u.test(prompt)
      ) {
        issues.push({
          code: "SKILL_DEFAULT_PROMPT_INVALID",
          message: `${name} default_prompt must be one sentence naming $${name}.`,
        });
      }
    }
    for (const forbidden of FORBIDDEN_SKILL_FILES) {
      if (existsSync(join(directory, forbidden))) {
        issues.push({
          code: "SKILL_EXTRANEOUS_FILE",
          message: `${name}/${forbidden} is forbidden.`,
        });
      }
    }
  }
  return issues.length === 0 ? success() : failure(issues);
}
