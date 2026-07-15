import { describe, expect, it } from "vitest";
import { CENTROIDS, classifyMeaning, cosineSimilarity } from "../../src/ai/meaning";

describe("semantic classification", () => {
  it("calculates cosine similarity safely", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    expect(cosineSimilarity([1], [1, 0])).toBe(0);
  });

  it("recognizes an exact intent centroid and bounds numeric meaning", () => {
    const result = classifyMeaning("안전한 경계", CENTROIDS.intent.protect);
    expect(result.meaning.intent).toBe("protect");
    expect(result.meaning.intensity).toBeGreaterThanOrEqual(0);
    expect(result.meaning.intensity).toBeLessThanOrEqual(1);
    expect(result.meaning.polarity).toBeGreaterThanOrEqual(-1);
    expect(result.meaning.polarity).toBeLessThanOrEqual(1);
  });

  it("uses a deterministic top-two fallback at low confidence", () => {
    const flat = Array.from({ length: CENTROIDS.dimensions }, () => 0);
    expect(classifyMeaning("ambiguous signal", flat)).toEqual(
      classifyMeaning("ambiguous signal", flat),
    );
  });
});
