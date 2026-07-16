import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { runGit } from "./git.ts";
import { isSafeRelativePath, normalizeRepositoryPath } from "./glob.ts";
import { readRequirementManifest } from "./requirements.ts";
import {
  failure,
  success,
  type ValidationIssue,
  type ValidationResult,
} from "./result.ts";
import { scanTextForSecrets } from "./secrets.ts";

const PLAN_ID = /^PLAN-\d{3}$/u;
const REQUIRED_FILES = [
  "summary.md",
  "commands.json",
  "requirements.json",
  "known-risks.md",
];
const REQUIRED_DIRECTORIES = [
  "test-results",
  "screenshots",
  "accessibility",
  "security",
];
const SUMMARY_HEADINGS = [
  "## Outcome",
  "## Scoped changes",
  "## Acceptance result",
  "## Manual/user-flow evidence",
  "## Security, privacy, data, source-rights, cost, and accessibility impact",
  "## Deviations",
  "## Final verification",
];

type CommandEvidence = {
  schemaVersion: number;
  planId: string;
  commit: string;
  environment: string;
  commands: Array<{
    id: string;
    command: string;
    purpose: string;
    status: string;
    exitCode: number | null;
    durationMs: number | null;
    artifactPaths: string[];
  }>;
};

type RequirementEvidence = {
  schemaVersion: number;
  planId: string;
  commit: string;
  requirements: Array<{
    requirementId: string;
    goalIds: string[];
    source: string;
    status: string;
    verificationIds: string[];
    evidencePaths: string[];
    notes: string;
  }>;
};

export type EvidenceValidationOptions = {
  requireVerified?: boolean;
};

function assertPlanId(planId: string): void {
  if (!PLAN_ID.test(planId))
    throw new Error("Plan ID must match PLAN-NNN exactly.");
}

function summaryField(content: string, name: string): string | null {
  return new RegExp(`^${name}:\\s*(.+?)\\s*$`, "mu").exec(content)?.[1] ?? null;
}

function findActivePlan(
  root: string,
  planId: string,
): { path: string; content: string } {
  const directory = join(root, "docs", "plans", "active");
  const name = readdirSync(directory).find(
    (entry) => entry.startsWith(`${planId}-`) && entry.endsWith(".md"),
  );
  if (name === undefined) throw new Error(`${planId} is not active.`);
  const path = join(directory, name);
  return { path, content: readFileSync(path, "utf8") };
}

function replaceTokens(directory: string, token: string): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) replaceTokens(path, token);
    else if (entry.isFile()) {
      const content = readFileSync(path, "utf8");
      writeFileSync(path, content.replaceAll("PLAN-NNN", token), "utf8");
    }
  }
}

export function createEvidencePack(
  root: string,
  planId: string,
  force = false,
): string {
  assertPlanId(planId);
  const template = resolve(root, "docs", "evidence", "_template");
  const destination = resolve(root, "docs", "evidence", planId);
  const evidenceRoot = resolve(root, "docs", "evidence");
  if (
    !destination.startsWith(`${evidenceRoot}\\`) &&
    !destination.startsWith(`${evidenceRoot}/`)
  ) {
    throw new Error(
      "Evidence destination escaped the repository evidence root.",
    );
  }
  if (!existsSync(template)) throw new Error("Evidence template is missing.");
  if (existsSync(destination)) {
    if (!force)
      throw new Error(
        `${planId} evidence already exists; use --force to replace it.`,
      );
    rmSync(destination, { recursive: true, force: true });
  }
  mkdirSync(evidenceRoot, { recursive: true });
  cpSync(template, destination, { recursive: true, errorOnExist: true });
  replaceTokens(destination, planId);

  const activePlan = findActivePlan(root, planId);
  const planRelative = normalizeRepositoryPath(relative(root, activePlan.path));
  const approved = /^Status:\s*FOUNDER_PLAN_APPROVED\s*$/mu.test(
    activePlan.content,
  );
  const summaryPath = join(destination, "summary.md");
  let summary = readFileSync(summaryPath, "utf8");
  summary = summary
    .replace(
      `Plan: docs/plans/active/${planId}-title.md`,
      `Plan: ${planRelative}`,
    )
    .replace(
      "Founder plan approval: UNSET",
      `Founder plan approval: ${approved ? "APPROVED" : "UNSET"}`,
    );
  writeFileSync(summaryPath, summary, "utf8");

  const commandsPath = join(destination, "commands.json");
  const commands = JSON.parse(
    readFileSync(commandsPath, "utf8"),
  ) as CommandEvidence;
  commands.environment = "local";
  writeFileSync(commandsPath, `${JSON.stringify(commands, null, 2)}\n`, "utf8");

  const manifest = readRequirementManifest(root);
  const plannedIds = [
    ...activePlan.content.matchAll(/\bHARNESS-(?:REQ|VER)-\d{3}\b/gu),
  ].map((match) => match[0]);
  const selected = [...new Set(plannedIds)]
    .map((id) => manifest.requirements.find((entry) => entry.id === id))
    .filter((entry) => entry !== undefined);
  const requirements: RequirementEvidence = {
    schemaVersion: 1,
    planId,
    commit: "UNSET",
    requirements: selected.map((entry) => ({
      requirementId: entry.id,
      goalIds: entry.goalIds,
      source: entry.source,
      status: "NOT_PROVEN",
      verificationIds: [],
      evidencePaths: [],
      notes: "",
    })),
  };
  writeFileSync(
    join(destination, "requirements.json"),
    `${JSON.stringify(requirements, null, 2)}\n`,
    "utf8",
  );
  return destination;
}

function validateArtifactPath(
  root: string,
  pack: string,
  artifactPath: string,
  issues: ValidationIssue[],
): void {
  if (!isSafeRelativePath(artifactPath)) {
    issues.push({
      code: "EVIDENCE_ARTIFACT_PATH_UNSAFE",
      message: "Artifact path is unsafe.",
    });
    return;
  }
  const absolute = resolve(root, artifactPath);
  const packRoot = resolve(pack);
  if (
    !absolute.startsWith(`${packRoot}\\`) &&
    !absolute.startsWith(`${packRoot}/`)
  ) {
    issues.push({
      code: "EVIDENCE_ARTIFACT_OUTSIDE_PACK",
      message: "Artifact must remain inside its pack.",
      path: artifactPath,
    });
  } else if (!existsSync(absolute)) {
    issues.push({
      code: "EVIDENCE_ARTIFACT_MISSING",
      message: "Referenced artifact does not exist.",
      path: artifactPath,
    });
  }
}

function isNonemptyRawArtifact(
  root: string,
  pack: string,
  artifactPath: string,
): boolean {
  if (
    !isSafeRelativePath(artifactPath) ||
    !/\.(?:log|txt)$/iu.test(artifactPath)
  )
    return false;
  const absolute = resolve(root, artifactPath);
  const rawRoot = resolve(pack, "test-results");
  return (
    (absolute.startsWith(`${rawRoot}\\`) ||
      absolute.startsWith(`${rawRoot}/`)) &&
    existsSync(absolute) &&
    statSync(absolute).isFile() &&
    statSync(absolute).size > 0
  );
}

export function validateEvidencePack(
  root: string,
  packName: string,
  options: EvidenceValidationOptions = {},
): ValidationResult {
  const isTemplate = packName === "_template";
  if (!isTemplate && !PLAN_ID.test(packName)) {
    return failure([
      {
        code: "EVIDENCE_PACK_ID_INVALID",
        message: "Evidence directory must be PLAN-NNN.",
      },
    ]);
  }
  const pack = join(root, "docs", "evidence", packName);
  const issues: ValidationIssue[] = [];
  if (!existsSync(pack) || !statSync(pack).isDirectory()) {
    return failure([
      {
        code: "EVIDENCE_PACK_MISSING",
        message: `${packName} evidence pack is missing.`,
      },
    ]);
  }
  for (const name of REQUIRED_FILES) {
    if (!existsSync(join(pack, name)))
      issues.push({
        code: "EVIDENCE_FILE_MISSING",
        message: `${name} is required.`,
        path: packName,
      });
  }
  for (const name of REQUIRED_DIRECTORIES) {
    if (
      !existsSync(join(pack, name)) ||
      !statSync(join(pack, name)).isDirectory()
    ) {
      issues.push({
        code: "EVIDENCE_DIRECTORY_MISSING",
        message: `${name}/ is required.`,
        path: packName,
      });
    }
  }
  if (issues.length > 0) return failure(issues);

  const summaryPath = join(pack, "summary.md");
  const summary = readFileSync(summaryPath, "utf8");
  const expectedId = isTemplate ? "PLAN-NNN" : packName;
  if (!summary.startsWith(`# Evidence — ${expectedId}\n`)) {
    issues.push({
      code: "EVIDENCE_SUMMARY_ID_MISMATCH",
      message: "Summary title does not match pack.",
    });
  }
  for (const heading of SUMMARY_HEADINGS) {
    if (!summary.includes(heading))
      issues.push({
        code: "EVIDENCE_SUMMARY_SECTION_MISSING",
        message: `Missing ${heading}.`,
      });
  }
  const status = summaryField(summary, "Status");
  const planPath = summaryField(summary, "Plan");
  const summaryCommit = summaryField(summary, "Commit");
  const writer = summaryField(summary, "Writer");
  const reviewer = summaryField(summary, "Independent reviewer");
  const planApproval = summaryField(summary, "Founder plan approval");
  const experienceApproval = summaryField(
    summary,
    "Founder experience approval",
  );
  if (!new Set(["VERIFIED", "FAILED", "NOT_PROVEN"]).has(status ?? "")) {
    issues.push({
      code: "EVIDENCE_STATUS_INVALID",
      message: "Invalid summary status.",
    });
  }
  if (
    options.requireVerified === true &&
    !isTemplate &&
    status !== "VERIFIED"
  ) {
    issues.push({
      code: "EVIDENCE_VERIFIED_REQUIRED",
      message: "Completion requires a complete VERIFIED evidence pack.",
    });
  }
  if (!isTemplate && (planPath === null || !existsSync(join(root, planPath)))) {
    issues.push({
      code: "EVIDENCE_PLAN_MISSING",
      message: "Summary plan path does not exist.",
    });
  }

  let commands: CommandEvidence | null = null;
  let requirements: RequirementEvidence | null = null;
  try {
    commands = JSON.parse(
      readFileSync(join(pack, "commands.json"), "utf8"),
    ) as CommandEvidence;
    requirements = JSON.parse(
      readFileSync(join(pack, "requirements.json"), "utf8"),
    ) as RequirementEvidence;
  } catch {
    issues.push({
      code: "EVIDENCE_JSON_INVALID",
      message: "commands.json or requirements.json is invalid.",
    });
  }

  if (commands !== null && requirements !== null) {
    if (
      commands.schemaVersion !== 1 ||
      requirements.schemaVersion !== 1 ||
      commands.planId !== expectedId ||
      requirements.planId !== expectedId
    ) {
      issues.push({
        code: "EVIDENCE_PLAN_ID_MISMATCH",
        message: "Evidence JSON plan IDs/versions must match the pack.",
      });
    }
    if (
      commands.commit !== requirements.commit ||
      commands.commit !== summaryCommit
    ) {
      issues.push({
        code: "EVIDENCE_COMMIT_MISMATCH",
        message: "Summary and JSON commits must match.",
      });
    }
    if (
      !new Set(["local", "ci", "preview", "local|ci|preview"]).has(
        commands.environment,
      )
    ) {
      issues.push({
        code: "EVIDENCE_ENVIRONMENT_INVALID",
        message: "Invalid evidence environment.",
      });
    }
    const commandIds = new Set<string>();
    for (const command of commands.commands) {
      if (!/^CMD-\d{3}$/u.test(command.id) || commandIds.has(command.id)) {
        issues.push({
          code: "EVIDENCE_COMMAND_ID_INVALID",
          message: "Command IDs must be unique CMD-NNN values.",
        });
      }
      commandIds.add(command.id);
      if (
        !new Set(["PASS", "FAIL", "NOT_RUN", "NOT_APPLICABLE"]).has(
          command.status,
        )
      ) {
        issues.push({
          code: "EVIDENCE_COMMAND_STATUS_INVALID",
          message: `Invalid status for ${command.id}.`,
        });
      }
      if (command.status === "PASS" && command.exitCode !== 0) {
        issues.push({
          code: "EVIDENCE_COMMAND_RESULT_INCONSISTENT",
          message: `${command.id} PASS requires exitCode 0.`,
        });
      }
      for (const artifact of command.artifactPaths)
        validateArtifactPath(root, pack, artifact, issues);
    }

    const manifest = readRequirementManifest(root);
    const manifestRequirements = new Map(
      manifest.requirements.map((entry) => [entry.id, entry]),
    );
    const knownValidations = new Set(
      manifest.validations.map((entry) => entry.id),
    );
    const requirementIds = new Set<string>();
    for (const requirement of requirements.requirements) {
      if (requirementIds.has(requirement.requirementId)) {
        issues.push({
          code: "EVIDENCE_REQUIREMENT_DUPLICATE",
          message: `${requirement.requirementId} is duplicated.`,
        });
      }
      requirementIds.add(requirement.requirementId);
      const manifestEntry = manifestRequirements.get(requirement.requirementId);
      if (!isTemplate && manifestEntry === undefined) {
        issues.push({
          code: "EVIDENCE_REQUIREMENT_UNKNOWN",
          message: `${requirement.requirementId} is not in the manifest.`,
        });
      }
      if (!new Set(["PASS", "FAIL", "NOT_PROVEN"]).has(requirement.status)) {
        issues.push({
          code: "EVIDENCE_REQUIREMENT_STATUS_INVALID",
          message: `Invalid status for ${requirement.requirementId}.`,
        });
      }
      if (
        manifestEntry !== undefined &&
        (requirement.source !== manifestEntry.source ||
          requirement.goalIds.some((id) => !manifestEntry.goalIds.includes(id)))
      ) {
        issues.push({
          code: "EVIDENCE_REQUIREMENT_REFERENCE_MISMATCH",
          message: `${requirement.requirementId} does not match the manifest.`,
        });
      }
      for (const id of requirement.verificationIds) {
        const validReference =
          status === "VERIFIED"
            ? commandIds.has(id)
            : knownValidations.has(id) || commandIds.has(id);
        if (!validReference)
          issues.push({
            code: "EVIDENCE_VALIDATION_UNKNOWN",
            message: `${id} does not resolve to an allowed validation reference.`,
          });
      }
      for (const artifact of requirement.evidencePaths)
        validateArtifactPath(root, pack, artifact, issues);
    }

    if (status === "VERIFIED") {
      if (commands.commands.length === 0) {
        issues.push({
          code: "EVIDENCE_COMMANDS_EMPTY",
          message: "VERIFIED evidence requires at least one command result.",
        });
      }
      if (requirements.requirements.length === 0) {
        issues.push({
          code: "EVIDENCE_REQUIREMENTS_EMPTY",
          message:
            "VERIFIED evidence requires at least one requirement result.",
        });
      }
      if (!/^[0-9a-f]{40}$/u.test(summaryCommit ?? "")) {
        issues.push({
          code: "EVIDENCE_COMMIT_INVALID",
          message: "VERIFIED evidence requires a 40-hex commit.",
        });
      } else if (
        !runGit(root, [
          "merge-base",
          "--is-ancestor",
          summaryCommit ?? "",
          "HEAD",
        ]).ok
      ) {
        issues.push({
          code: "EVIDENCE_COMMIT_NOT_ANCESTOR",
          message: "Verified commit is not an ancestor of HEAD.",
        });
      }
      if (
        writer === null ||
        reviewer === null ||
        writer === "UNSET" ||
        reviewer === "UNSET" ||
        writer === reviewer
      ) {
        issues.push({
          code: "EVIDENCE_REVIEWER_NOT_INDEPENDENT",
          message:
            "VERIFIED evidence requires different writer and reviewer identities.",
        });
      }
      if (
        planApproval !== "APPROVED" ||
        !new Set(["APPROVED", "NOT_REQUIRED"]).has(experienceApproval ?? "")
      ) {
        issues.push({
          code: "EVIDENCE_APPROVAL_MISSING",
          message: "Required founder approvals are not recorded.",
        });
      }
      if (requirements.requirements.some((entry) => entry.status !== "PASS")) {
        issues.push({
          code: "EVIDENCE_REQUIREMENTS_NOT_PASSING",
          message: "Every requirement must PASS for VERIFIED.",
        });
      }
      if (
        commands.commands.some(
          (entry) => entry.status !== "PASS" || entry.exitCode !== 0,
        )
      ) {
        issues.push({
          code: "EVIDENCE_COMMANDS_NOT_PASSING",
          message: "Every command must PASS with exitCode 0 for VERIFIED.",
        });
      }
      if (commands.commands.some((entry) => entry.artifactPaths.length === 0)) {
        issues.push({
          code: "EVIDENCE_COMMAND_ARTIFACT_MISSING",
          message: "Every VERIFIED command requires an evidence artifact.",
        });
      }
      if (
        requirements.requirements.some(
          (entry) =>
            entry.verificationIds.length === 0 ||
            entry.verificationIds.some((id) => !commandIds.has(id)),
        )
      ) {
        issues.push({
          code: "EVIDENCE_REQUIREMENT_COMMAND_MISSING",
          message:
            "Every VERIFIED requirement must reference an existing command ID.",
        });
      }
      if (
        requirements.requirements.some(
          (entry) => entry.evidencePaths.length === 0,
        )
      ) {
        issues.push({
          code: "EVIDENCE_REQUIREMENT_ARTIFACT_MISSING",
          message: "Every VERIFIED requirement requires an evidence artifact.",
        });
      }

      const plannedRequirements =
        planPath === null || !existsSync(join(root, planPath))
          ? new Set<string>()
          : new Set(
              [
                ...readFileSync(join(root, planPath), "utf8").matchAll(
                  /\bHARNESS-(?:REQ|VER)-\d{3}\b/gu,
                ),
              ].map((match) => match[0]),
            );
      const evidencedRequirements = new Set(
        requirements.requirements.map((entry) => entry.requirementId),
      );
      if (
        plannedRequirements.size === 0 ||
        plannedRequirements.size !== evidencedRequirements.size ||
        [...plannedRequirements].some(
          (id) =>
            !evidencedRequirements.has(id) || !manifestRequirements.has(id),
        )
      ) {
        issues.push({
          code: "EVIDENCE_PLAN_REQUIREMENTS_INCOMPLETE",
          message:
            "VERIFIED evidence must represent every planned manifest requirement exactly once.",
        });
      }

      const expectedFullCommand = manifest.validations.find(
        (entry) => entry.id === "VAL-FULL",
      )?.command;
      const fullCommand = commands.commands.find(
        (entry) => entry.command === expectedFullCommand,
      );
      if (
        expectedFullCommand === undefined ||
        fullCommand === undefined ||
        fullCommand.status !== "PASS" ||
        fullCommand.exitCode !== 0 ||
        fullCommand.artifactPaths.length === 0 ||
        !fullCommand.artifactPaths.some((artifact) =>
          isNonemptyRawArtifact(root, pack, artifact),
        )
      ) {
        issues.push({
          code: "EVIDENCE_FULL_LANE_RAW_ARTIFACT_MISSING",
          message:
            "VERIFIED evidence requires the exact full-lane PASS command and a nonempty raw log.",
        });
      }
    }
    if (
      status === "FAILED" &&
      !commands.commands.some((entry) => entry.status === "FAIL") &&
      !requirements.requirements.some((entry) => entry.status === "FAIL")
    ) {
      issues.push({
        code: "EVIDENCE_FAILED_WITHOUT_FAILURE",
        message:
          "FAILED evidence must contain a failed command or requirement.",
      });
    }
  }

  for (const name of REQUIRED_FILES) {
    issues.push(
      ...scanTextForSecrets(
        readFileSync(join(pack, name), "utf8"),
        normalizeRepositoryPath(relative(root, join(pack, name))),
      ),
    );
  }
  return issues.length === 0 ? success() : failure(issues);
}

export function validateEvidence(
  root: string,
  selectedPlanId?: string,
  options: EvidenceValidationOptions = {},
): ValidationResult {
  const evidenceRoot = join(root, "docs", "evidence");
  if (existsSync(join(evidenceRoot, "PLAN-NNN"))) {
    return failure([
      {
        code: "LITERAL_EVIDENCE_PACK_FORBIDDEN",
        message: "Do not commit docs/evidence/PLAN-NNN.",
      },
    ]);
  }
  const packs =
    selectedPlanId === undefined
      ? readdirSync(evidenceRoot).filter(
          (name) => name === "_template" || PLAN_ID.test(name),
        )
      : ["_template", selectedPlanId];
  const issues = packs.flatMap(
    (pack) =>
      validateEvidencePack(root, pack, pack === "_template" ? {} : options)
        .issues,
  );
  return issues.length === 0 ? success() : failure(issues);
}
