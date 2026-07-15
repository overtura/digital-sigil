import type { Archetype, Intent, SigilMeaning } from "../ai/types";
import { createSeededRandom, getVariationSeed, hashString, normalizeInput } from "./seed";
import type {
  Core,
  Ornament,
  Palette,
  SigilPlan,
  Structure,
  Symmetry,
} from "./types";

export const STRUCTURES_BY_INTENT: Record<Intent, readonly Structure[]> = {
  protect: ["closed", "interlocking"],
  seek: ["radiating", "spiral"],
  create: ["branching", "radiating"],
  transform: ["spiral", "branching"],
  bind: ["interlocking", "closed"],
  release: ["radiating", "branching"],
};

const CORES: Record<Archetype, Core> = {
  solar: "star",
  lunar: "eye",
  celestial: "star",
  organic: "seed",
  mechanical: "gear",
  void: "void",
};
const PALETTES: Record<Archetype, readonly Palette[]> = {
  solar: ["obsidian-gold", "ivory-ink"],
  lunar: ["midnight-silver", "ivory-ink"],
  celestial: ["midnight-silver", "obsidian-gold"],
  organic: ["oxide-copper", "ivory-ink"],
  mechanical: ["obsidian-gold", "oxide-copper"],
  void: ["deep-crimson", "midnight-silver"],
};
const ORNAMENTS: readonly Ornament[] = [
  "dots",
  "abstract-marks",
  "arcs",
  "spikes",
  "satellites",
];
const SYMMETRIES: readonly Symmetry[] = [4, 5, 6, 8, 10, 12];

function pick<T>(items: readonly T[], random: () => number): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error("Cannot choose from an empty collection.");
  return item;
}

export function createSigilPlan(
  input: string,
  meaning: SigilMeaning,
  variation: number,
): SigilPlan {
  const normalized = normalizeInput(input);
  const seed = hashString(normalized);
  const random = createSeededRandom(getVariationSeed(normalized, variation));
  const ornamentCount = meaning.intensity > 0.72 ? 3 : 2;
  const availableOrnaments = [...ORNAMENTS];
  const ornaments: Ornament[] = [];
  while (ornaments.length < ornamentCount) {
    const index = Math.floor(random() * availableOrnaments.length);
    const selected = availableOrnaments.splice(index, 1)[0];
    if (selected) ornaments.push(selected);
  }

  return {
    seed,
    variation,
    meaning,
    symmetry: pick(SYMMETRIES, random),
    rings: 2 + Math.floor(random() * 4),
    core: CORES[meaning.archetype],
    structure: pick(STRUCTURES_BY_INTENT[meaning.intent], random),
    ornaments,
    palette: pick(PALETTES[meaning.archetype], random),
    motion: {
      rotation: 22 + Math.round(random() * 18),
      pulse: 5 + Math.round(random() * 4),
      orbit: 14 + Math.round(random() * 12),
    },
  };
}
