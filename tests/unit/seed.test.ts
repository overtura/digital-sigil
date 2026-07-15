import { describe, expect, it, vi } from "vitest";
import { createSeededRandom, getVariationSeed, hashString, normalizeInput } from "../../src/sigil/seed";

describe("deterministic input seeds", () => {
  it("normalizes Unicode, casing, and whitespace", () => {
    expect(normalizeInput("  ＣＲＥＡＴＥ   새 길  ")).toBe("create 새 길");
  });

  it("keeps hashes and variations stable", () => {
    expect(hashString("고요한 용기")).toBe(hashString("고요한 용기"));
    expect(getVariationSeed("고요한 용기", 1)).not.toBe(getVariationSeed("고요한 용기", 2));
  });

  it("uses a seeded generator without Math.random", () => {
    vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not run");
    });
    const first = createSeededRandom(42);
    const second = createSeededRandom(42);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
    vi.restoreAllMocks();
  });
});
