import centroidsJson from "./centroids.json";
import type { Archetype, Intent, SigilMeaning } from "./types";
import { hashString, normalizeInput } from "../sigil/seed";

type CentroidStore = {
  model: string;
  dtype: "q8";
  dimensions: number;
  intent: Record<Intent, number[]>;
  archetype: Record<Archetype, number[]>;
};
type Ranked<T extends string> = { label: T; score: number };

export const INTENTS: readonly Intent[] = [
  "protect",
  "seek",
  "create",
  "transform",
  "bind",
  "release",
];
export const ARCHETYPES: readonly Archetype[] = [
  "solar",
  "lunar",
  "celestial",
  "organic",
  "mechanical",
  "void",
];
export const CENTROIDS = centroidsJson as CentroidStore;

const POLARITY: Record<Archetype, number> = {
  solar: 1,
  organic: 0.7,
  celestial: 0.35,
  lunar: -0.2,
  mechanical: -0.45,
  void: -1,
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number, places = 6): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function cosineSimilarity(left: readonly number[], right: readonly number[]): number {
  if (left.length === 0 || left.length !== right.length) return 0;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }
  const denominator = Math.sqrt(leftMagnitude * rightMagnitude);
  return denominator === 0 ? 0 : round(dot / denominator);
}

function rank<T extends string>(
  labels: readonly T[],
  vectors: Record<T, number[]>,
  embedding: readonly number[],
): Array<Ranked<T>> {
  return labels
    .map((label) => ({ label, score: cosineSimilarity(embedding, vectors[label]) }))
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));
}

function choose<T extends string>(ranked: Array<Ranked<T>>, seed: number): Ranked<T> {
  const first = ranked[0];
  if (!first) throw new Error("Meaning labels are not configured.");
  const second = ranked[1];
  if (!second || first.score - second.score >= 0.035) return first;
  return ranked[seed % 2] ?? first;
}

export function classifyMeaning(
  input: string,
  embedding: readonly number[],
  store: CentroidStore = CENTROIDS,
): { meaning: SigilMeaning; confidence: number } {
  if (embedding.length !== store.dimensions) {
    throw new Error(
      `Embedding dimension ${embedding.length} does not match centroid dimension ${store.dimensions}.`,
    );
  }
  const normalized = normalizeInput(input);
  const seed = hashString(normalized);
  const intentRanking = rank(INTENTS, store.intent, embedding);
  const archetypeRanking = rank(ARCHETYPES, store.archetype, embedding);
  const topIntent = intentRanking[0];
  const topArchetype = archetypeRanking[0];
  if (!topIntent || !topArchetype) throw new Error("Meaning rankings are empty.");
  const intent = choose(intentRanking, seed);
  const archetype = choose(archetypeRanking, seed >>> 1);
  const intentMargin = topIntent.score - (intentRanking[1]?.score ?? -1);
  const archetypeMargin = topArchetype.score - (archetypeRanking[1]?.score ?? -1);
  const weightedPolarity = archetypeRanking.reduce(
    (sum, item) => sum + item.score * POLARITY[item.label],
    0,
  );

  return {
    meaning: {
      intent: intent.label,
      archetype: archetype.label,
      intensity: round(
        clamp(0.32 + Math.abs(intent.score) * 0.38 + Math.min(normalized.length / 64, 1) * 0.3, 0, 1),
        4,
      ),
      polarity: round(clamp(weightedPolarity / ARCHETYPES.length, -1, 1), 4),
    },
    confidence: round(clamp((intentMargin + archetypeMargin) / 0.3, 0, 1), 4),
  };
}
