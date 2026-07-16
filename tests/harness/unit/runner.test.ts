import { describe, expect, it } from "vitest";
import {
  runSequential,
  type VerificationStep,
} from "../../../scripts/lib/runner.ts";

const steps: VerificationStep[] = [
  { id: "one", script: "one" },
  { id: "two", script: "two" },
  { id: "three", script: "three" },
];

describe("verification runner", () => {
  it("runs deterministic steps sequentially", () => {
    const seen: string[] = [];
    const result = runSequential(steps, "PLAN-001", (step) => {
      seen.push(step.id);
      return 0;
    });
    expect(result.ok).toBe(true);
    expect(seen).toEqual(["one", "two", "three"]);
  });

  it("fails fast and propagates the failing exit code", () => {
    const seen: string[] = [];
    const result = runSequential(steps, "PLAN-001", (step) => {
      seen.push(step.id);
      return step.id === "two" ? 7 : 0;
    });
    expect(result.ok).toBe(false);
    expect(result.failedStep).toBe("two");
    expect(result.results.at(-1)?.exitCode).toBe(7);
    expect(seen).toEqual(["one", "two"]);
  });
});
