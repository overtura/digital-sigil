import centroids from "./centroids.json";
import type { EmbeddingBackend, WorkerResponse } from "./types";
import { createSeededRandom, hashString, normalizeInput } from "../sigil/seed";

type WorkerSuccess = Extract<WorkerResponse, { kind: "ready" | "embedding" }>;
type WorkerPayload = { kind: "load" } | { kind: "embed"; input: string };
type PendingRequest = {
  resolve: (response: WorkerSuccess) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: number) => void;
};

let worker: Worker | undefined;
let requestId = 0;
const pending = new Map<number, PendingRequest>();
const mockMode = import.meta.env.VITE_EMBEDDING_MODE === "mock";

function deterministicEmbedding(input: string): number[] {
  const random = createSeededRandom(hashString(normalizeInput(input)));
  const values = Array.from({ length: centroids.dimensions }, () => random() * 2 - 1);
  const magnitude = Math.hypot(...values) || 1;
  return values.map((value) => value / magnitude);
}

function getWorker(): Worker {
  if (typeof Worker === "undefined") {
    throw new Error("이 브라우저는 로컬 모델 worker를 지원하지 않습니다.");
  }
  if (worker) return worker;
  worker = new Worker(new URL("./embedding.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    const request = pending.get(response.id);
    if (!request) return;
    if (response.kind === "progress") {
      request.onProgress?.(response.progress);
      return;
    }
    pending.delete(response.id);
    if (response.kind === "error") {
      request.reject(new Error(response.message));
      return;
    }
    request.resolve(response);
  };
  worker.onerror = () => {
    for (const request of pending.values()) {
      request.reject(new Error("로컬 모델 worker를 시작하지 못했습니다."));
    }
    pending.clear();
    worker = undefined;
  };
  return worker;
}

function request(
  message: WorkerPayload,
  onProgress?: (progress: number) => void,
): Promise<WorkerSuccess> {
  const activeWorker = getWorker();
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress });
    activeWorker.postMessage({ ...message, id });
  });
}

export async function loadEmbeddingModel(
  onProgress?: (progress: number) => void,
): Promise<EmbeddingBackend> {
  if (mockMode) {
    onProgress?.(100);
    return "mock";
  }
  const response = await request({ kind: "load" }, onProgress);
  return response.backend;
}

export async function embedText(
  input: string,
): Promise<{ values: number[]; backend: EmbeddingBackend }> {
  if (mockMode) {
    if (new URLSearchParams(window.location.search).get("embedding") === "error") {
      throw new Error("테스트용 로컬 모델 오류입니다.");
    }
    return { values: deterministicEmbedding(input), backend: "mock" };
  }
  const response = await request({ kind: "embed", input });
  if (response.kind !== "embedding") {
    throw new Error("The worker did not return an embedding.");
  }
  return { values: response.values, backend: response.backend };
}
