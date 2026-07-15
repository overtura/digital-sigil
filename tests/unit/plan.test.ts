import { describe, expect, it, vi } from "vitest";
import type { Intent, SigilMeaning } from "../../src/ai/types";
import { createSigilPlan, STRUCTURES_BY_INTENT } from "../../src/sigil/plan";

const meaning: SigilMeaning = {
  intent: "create",
  archetype: "organic",
  intensity: 0.72,
  polarity: 0.24,
};

describe("SigilPlan", () => {
  it("is stable for the same input and variation", () => {
    expect(createSigilPlan("새로운 정원", meaning, 0)).toEqual(
      createSigilPlan("새로운 정원", meaning, 0),
    );
  });

  it("changes variation details but preserves the base seed", () => {
    const first = createSigilPlan("새로운 정원", meaning, 0);
    const second = createSigilPlan("새로운 정원", meaning, 1);
    expect(second.seed).toBe(first.seed);
    expect(second).not.toEqual(first);
  });

  it("only creates structures compatible with each intent", () => {
    vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not run");
    });
    for (const intent of Object.keys(STRUCTURES_BY_INTENT) as Intent[]) {
      const plan = createSigilPlan(intent, { ...meaning, intent }, 3);
      expect(STRUCTURES_BY_INTENT[intent]).toContain(plan.structure);
    }
    vi.restoreAllMocks();
  });
});
