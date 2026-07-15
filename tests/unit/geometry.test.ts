import { describe, expect, it } from "vitest";
import type { SigilMeaning } from "../../src/ai/types";
import { createSigilGeometry, hasFiniteCoordinates } from "../../src/sigil/geometry/generate";
import { createSigilPlan } from "../../src/sigil/plan";
import { serializeSvg } from "../../src/sigil/render/serialize";
import { hashString } from "../../src/sigil/seed";

const meaning: SigilMeaning = {
  intent: "protect",
  archetype: "celestial",
  intensity: 0.81,
  polarity: 0.2,
};
const plan = createSigilPlan("고요한 용기", meaning, 0);

describe("geometry and safe SVG", () => {
  it("emits finite, bounded primitives with rotational units", () => {
    const geometry = createSigilGeometry(plan);
    expect(hasFiniteCoordinates(geometry.primitives)).toBe(true);
    expect(geometry.primitives.length).toBeLessThanOrEqual(180);
    expect(geometry.primitives.filter((item) => item.kind === "line")).toHaveLength(
      plan.symmetry,
    );
  });

  it("serializes standalone SVG without executable markup", () => {
    const svg = serializeSvg(createSigilGeometry(plan), plan.palette);
    expect(svg.startsWith("<svg xmlns=")).toBe(true);
    expect(svg).not.toMatch(/<script|foreignObject|onload=/i);
    expect(svg).not.toContain("고요한 용기");
  });

  it("matches the deterministic SVG snapshot hash", () => {
    const svg = serializeSvg(createSigilGeometry(plan), plan.palette);
    expect(hashString(svg)).toBe(3_712_210_423);
  });
});
