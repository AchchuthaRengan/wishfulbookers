import { describe, expect, it } from "vitest";
import {
  evaluatePreflight,
  type PreflightFacts,
  type PreflightMode,
} from "../../../scripts/lib/preflight.ts";

function facts(overrides: Partial<PreflightFacts> = {}): PreflightFacts {
  return {
    repositoryRoot: true,
    gitAvailable: true,
    requiredDocuments: true,
    nodeCompatible: true,
    packageManager: "pnpm@11.9.0",
    pnpmVersion: "11.9.0",
    validationCommands: true,
    activePlans: [],
    ...overrides,
  };
}

describe("preflight evaluator", () => {
  it("returns every supported ready state", () => {
    expect(evaluatePreflight(facts(), "plan").state).toBe("READY_TO_PLAN");
    const approved = {
      id: "PLAN-001",
      status: "FOUNDER_PLAN_APPROVED",
      hasSidecar: true,
      hasEvidence: true,
    };
    expect(
      evaluatePreflight(
        facts({ activePlans: [approved] }),
        "implement",
        "PLAN-001",
      ).state,
    ).toBe("READY_TO_IMPLEMENT");
    expect(
      evaluatePreflight(
        facts({ activePlans: [approved] }),
        "verify",
        "PLAN-001",
      ).state,
    ).toBe("READY_TO_VERIFY");
  });

  it.each([
    ["plan", { repositoryRoot: false }, "REPO_ROOT_MISSING"],
    ["plan", { gitAvailable: false }, "GIT_STATE_UNAVAILABLE"],
    ["plan", { requiredDocuments: false }, "CONTROL_DOCUMENT_MISSING"],
    ["plan", { nodeCompatible: false }, "NODE_VERSION_UNSUPPORTED"],
    ["plan", { packageManager: "npm@1" }, "PNPM_REQUIRED"],
    ["plan", { pnpmVersion: "11.7.0" }, "PNPM_VERSION_MISMATCH"],
    [
      "plan",
      {
        activePlans: [
          {
            id: "PLAN-001",
            status: "PLAN_DRAFTED",
            hasSidecar: true,
            hasEvidence: false,
          },
        ],
      },
      "ACTIVE_PLAN_EXISTS",
    ],
    ["implement", { activePlans: [] }, "PLAN_COUNT_INVALID"],
    [
      "implement",
      {
        activePlans: [
          {
            id: "PLAN-002",
            status: "FOUNDER_PLAN_APPROVED",
            hasSidecar: true,
            hasEvidence: false,
          },
        ],
      },
      "PLAN_NOT_FOUND",
    ],
    [
      "implement",
      {
        activePlans: [
          {
            id: "PLAN-001",
            status: "FOUNDER_PLAN_APPROVED",
            hasSidecar: false,
            hasEvidence: false,
          },
        ],
      },
      "SCOPE_SIDECAR_MISSING",
    ],
    [
      "implement",
      {
        activePlans: [
          {
            id: "PLAN-001",
            status: "PLAN_DRAFTED",
            hasSidecar: true,
            hasEvidence: false,
          },
        ],
      },
      "PLAN_NOT_APPROVED",
    ],
    [
      "verify",
      {
        validationCommands: false,
        activePlans: [
          {
            id: "PLAN-001",
            status: "FOUNDER_PLAN_APPROVED",
            hasSidecar: true,
            hasEvidence: true,
          },
        ],
      },
      "VERIFY_COMMANDS_MISSING",
    ],
    [
      "verify",
      {
        activePlans: [
          {
            id: "PLAN-001",
            status: "FOUNDER_PLAN_APPROVED",
            hasSidecar: true,
            hasEvidence: false,
          },
        ],
      },
      "EVIDENCE_PACK_MISSING",
    ],
  ] as Array<[PreflightMode, Partial<PreflightFacts>, string]>)(
    "blocks %s with stable reason %s",
    (mode, overrides, reasonCode) => {
      const output = evaluatePreflight(facts(overrides), mode, "PLAN-001");
      expect(output.state).toBe("BLOCKED");
      expect(output.issues.map((issue) => issue.reasonCode)).toContain(
        reasonCode,
      );
    },
  );
});
