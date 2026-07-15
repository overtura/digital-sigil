export const MODEL_ID = "Xenova/multilingual-e5-small";

export type Intent =
  | "protect"
  | "seek"
  | "create"
  | "transform"
  | "bind"
  | "release";

export type Archetype =
  | "solar"
  | "lunar"
  | "celestial"
  | "organic"
  | "mechanical"
  | "void";

export type SigilMeaning = {
  intent: Intent;
  archetype: Archetype;
  intensity: number;
  polarity: number;
};

export type EmbeddingBackend = "webgpu" | "wasm" | "mock";

export type Analysis = {
  meaning: SigilMeaning;
  backend: EmbeddingBackend;
  confidence: number;
};

export type WorkerRequest =
  | { id: number; kind: "load" }
  | { id: number; kind: "embed"; input: string };

export type WorkerResponse =
  | { id: number; kind: "progress"; progress: number }
  | { id: number; kind: "ready"; backend: Exclude<EmbeddingBackend, "mock"> }
  | {
      id: number;
      kind: "embedding";
      backend: Exclude<EmbeddingBackend, "mock">;
      values: number[];
    }
  | { id: number; kind: "error"; message: string };
