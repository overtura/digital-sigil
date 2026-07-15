export function normalizeInput(input: string): string {
  return input.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase();
}

export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (const character of input) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function getVariationSeed(input: string, variation: number): number {
  return hashString(`${normalizeInput(input)}:${variation}`);
}

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
