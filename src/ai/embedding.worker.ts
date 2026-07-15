/// <reference lib="webworker" />

import { env, pipeline, type ProgressInfo } from "@huggingface/transformers";
import { MODEL_ID, type EmbeddingBackend, type WorkerRequest, type WorkerResponse } from "./types";

type Extractor = (
  input: string,
  options: { pooling: "mean"; normalize: true },
) => Promise<{ tolist: () => number[][] }>;
type RuntimeBackend = Exclude<EmbeddingBackend, "mock">;

const context = self as unknown as DedicatedWorkerGlobalScope;
let extractor: Extractor | undefined;
let backend: RuntimeBackend | undefined;

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;
env.backends.onnx.logLevel = "error";

function post(message: WorkerResponse): void {
  context.postMessage(message);
}

function reportProgress(id: number, information: ProgressInfo): void {
  if ("progress" in information && typeof information.progress === "number") {
    post({ id, kind: "progress", progress: Math.round(information.progress) });
  }
}

async function createExtractor(id: number, device: RuntimeBackend): Promise<Extractor> {
  const result = await pipeline("feature-extraction", MODEL_ID, {
    device,
    dtype: "q8",
    session_options: { logSeverityLevel: 3 },
    progress_callback: (information) => reportProgress(id, information),
  });
  return result as unknown as Extractor;
}

async function ensureLoaded(id: number): Promise<RuntimeBackend> {
  if (extractor && backend) return backend;
  if ("gpu" in navigator) {
    try {
      extractor = await createExtractor(id, "webgpu");
      backend = "webgpu";
      return backend;
    } catch {
      extractor = undefined;
    }
  }
  extractor = await createExtractor(id, "wasm");
  backend = "wasm";
  return backend;
}

context.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  try {
    const activeBackend = await ensureLoaded(request.id);
    if (request.kind === "load") {
      post({ id: request.id, kind: "ready", backend: activeBackend });
      return;
    }
    const activeExtractor = extractor;
    if (!activeExtractor) throw new Error("The local model is not ready.");
    const output = await activeExtractor(`query: ${request.input}`, {
      pooling: "mean",
      normalize: true,
    });
    const values = output.tolist()[0];
    if (!values) throw new Error("The local model returned an empty embedding.");
    post({ id: request.id, kind: "embedding", backend: activeBackend, values });
  } catch (error) {
    post({
      id: request.id,
      kind: "error",
      message: error instanceof Error ? error.message : "Local model execution failed.",
    });
  }
};
