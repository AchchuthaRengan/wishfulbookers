import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { runGit } from "./git.ts";

export type PreflightMode = "plan" | "implement" | "verify";
export type PreflightState =
  "READY_TO_PLAN" | "READY_TO_IMPLEMENT" | "READY_TO_VERIFY" | "BLOCKED";

export type PreflightCheck = {
  id: string;
  status: "PASS" | "FAIL";
  reasonCode?: string;
  message: string;
};

export type ActivePlanFact = {
  id: string;
  status: string;
  hasSidecar: boolean;
  hasEvidence: boolean;
};

export type PreflightFacts = {
  repositoryRoot: boolean;
  gitAvailable: boolean;
  requiredDocuments: boolean;
  nodeCompatible: boolean;
  packageManager: string | null;
  pnpmVersion: string | null;
  validationCommands: boolean;
  activePlans: ActivePlanFact[];
};

export type PreflightOutput = {
  schemaVersion: 1;
  state: PreflightState;
  requestedMode: PreflightMode;
  planId: string | null;
  checks: PreflightCheck[];
  issues: Array<{ reasonCode: string; message: string }>;
};

function check(
  checks: PreflightCheck[],
  id: string,
  condition: boolean,
  reasonCode: string,
  passMessage: string,
  failMessage: string,
): void {
  checks.push(
    condition
      ? { id, status: "PASS", message: passMessage }
      : { id, status: "FAIL", reasonCode, message: failMessage },
  );
}

export function evaluatePreflight(
  facts: PreflightFacts,
  requestedMode: PreflightMode,
  requestedPlanId?: string,
): PreflightOutput {
  const checks: PreflightCheck[] = [];
  check(
    checks,
    "repository-root",
    facts.repositoryRoot,
    "REPO_ROOT_MISSING",
    "Repository root is established.",
    "Run from the Navlands Git repository root.",
  );
  check(
    checks,
    "git",
    facts.gitAvailable,
    "GIT_STATE_UNAVAILABLE",
    "Git state is readable.",
    "Git state could not be read.",
  );
  check(
    checks,
    "control-documents",
    facts.requiredDocuments,
    "CONTROL_DOCUMENT_MISSING",
    "Required control documents exist.",
    "One or more required control documents are missing.",
  );
  check(
    checks,
    "node",
    facts.nodeCompatible,
    "NODE_VERSION_UNSUPPORTED",
    "Node 24 runtime is compatible.",
    "Use Node >=24 and <25.",
  );
  check(
    checks,
    "package-manager",
    facts.packageManager === "pnpm@11.9.0" && facts.pnpmVersion === "11.9.0",
    facts.packageManager !== "pnpm@11.9.0"
      ? "PNPM_REQUIRED"
      : "PNPM_VERSION_MISMATCH",
    "Direct pnpm@11.9.0 is active and pinned.",
    "Activate the pinned direct pnpm@11.9.0 package manager.",
  );

  const selected =
    requestedPlanId === undefined
      ? facts.activePlans[0]
      : facts.activePlans.find((plan) => plan.id === requestedPlanId);

  if (requestedMode === "plan") {
    check(
      checks,
      "single-active-plan",
      facts.activePlans.length === 0,
      "ACTIVE_PLAN_EXISTS",
      "No plan is active; planning may begin.",
      "Complete or block/archive the active plan before drafting another plan.",
    );
  } else {
    check(
      checks,
      "single-active-plan",
      facts.activePlans.length === 1,
      "PLAN_COUNT_INVALID",
      "Exactly one plan is active.",
      "Exactly one active plan is required.",
    );
    check(
      checks,
      "selected-plan",
      selected !== undefined,
      "PLAN_NOT_FOUND",
      "Requested plan is active.",
      "The requested plan is not the active plan.",
    );
    check(
      checks,
      "scope-sidecar",
      selected?.hasSidecar === true,
      "SCOPE_SIDECAR_MISSING",
      "Plan scope sidecar exists.",
      "The active plan requires a matching scope sidecar.",
    );
    check(
      checks,
      "plan-approval",
      selected?.status === "FOUNDER_PLAN_APPROVED" ||
        (requestedMode === "verify" && selected?.status === "COMPLETED"),
      "PLAN_NOT_APPROVED",
      "Plan status permits the requested work.",
      "Founder plan approval is required before implementation or verification.",
    );
  }

  if (requestedMode === "verify") {
    check(
      checks,
      "validation-commands",
      facts.validationCommands,
      "VERIFY_COMMANDS_MISSING",
      "Verification commands are configured.",
      "Required verification commands are missing.",
    );
    check(
      checks,
      "evidence-pack",
      selected?.hasEvidence === true,
      "EVIDENCE_PACK_MISSING",
      "The selected plan evidence pack exists.",
      "Create the selected plan evidence pack before verification.",
    );
  }

  const issues = checks
    .filter(
      (item): item is PreflightCheck & { reasonCode: string } =>
        item.status === "FAIL",
    )
    .map((item) => ({ reasonCode: item.reasonCode, message: item.message }));
  const state: PreflightState =
    issues.length > 0
      ? "BLOCKED"
      : requestedMode === "plan"
        ? "READY_TO_PLAN"
        : requestedMode === "implement"
          ? "READY_TO_IMPLEMENT"
          : "READY_TO_VERIFY";

  return {
    schemaVersion: 1,
    state,
    requestedMode,
    planId: selected?.id ?? requestedPlanId ?? null,
    checks,
    issues,
  };
}

function statusFromPlan(path: string): string {
  const match = /^Status:\s*(\S+)\s*$/mu.exec(readFileSync(path, "utf8"));
  return match?.[1] ?? "MISSING";
}

function detectPnpmVersion(root: string): string | null {
  const windows = process.platform === "win32";
  const direct = spawnSync(
    windows ? (process.env.ComSpec ?? "cmd.exe") : "pnpm",
    windows ? ["/d", "/s", "/c", "pnpm --version"] : ["--version"],
    {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
    },
  );
  return direct.status === 0 ? direct.stdout.trim() : null;
}

export function collectPreflightFacts(root: string): PreflightFacts {
  const repositoryRoot = existsSync(join(root, ".git"));
  const gitAvailable =
    repositoryRoot && runGit(root, ["rev-parse", "--show-toplevel"]).ok;
  const required = [
    "AGENTS.md",
    "docs/HARNESS.md",
    "docs/PLANS.md",
    "docs/STATUS.md",
    "docs/DECISIONS.md",
    "docs/KNOWN-ISSUES.md",
  ];
  const packagePath = join(root, "package.json");
  const packageJson = existsSync(packagePath)
    ? (JSON.parse(readFileSync(packagePath, "utf8")) as Record<string, unknown>)
    : {};
  const scripts =
    typeof packageJson.scripts === "object" && packageJson.scripts !== null
      ? (packageJson.scripts as Record<string, unknown>)
      : {};
  const plansDirectory = join(root, "docs", "plans", "active");
  const activePlans = existsSync(plansDirectory)
    ? readdirSync(plansDirectory)
        .filter((name) => /^PLAN-\d{3}-.+\.md$/u.test(name))
        .map((name) => {
          const id = /^(PLAN-\d{3})-/u.exec(name)?.[1] ?? basename(name, ".md");
          return {
            id,
            status: statusFromPlan(join(plansDirectory, name)),
            hasSidecar: existsSync(join(plansDirectory, `${id}.scope.json`)),
            hasEvidence: existsSync(join(root, "docs", "evidence", id)),
          };
        })
    : [];
  const [major = 0] = process.versions.node.split(".").map(Number);
  return {
    repositoryRoot,
    gitAvailable,
    requiredDocuments: required.every((path) => existsSync(join(root, path))),
    nodeCompatible: major === 24,
    packageManager:
      typeof packageJson.packageManager === "string"
        ? packageJson.packageManager
        : null,
    pnpmVersion: detectPnpmVersion(root),
    validationCommands:
      typeof scripts["verify:fast"] === "string" &&
      typeof scripts["verify:full"] === "string",
    activePlans,
  };
}

export function findRepositoryRoot(start: string): string {
  const git = runGit(start, ["rev-parse", "--show-toplevel"]);
  return git.ok ? resolve(git.stdout) : resolve(start);
}
