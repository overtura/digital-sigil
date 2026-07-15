import { useCallback, useState } from "react";
import { embedText, loadEmbeddingModel } from "../ai/embeddingClient";
import { classifyMeaning } from "../ai/meaning";
import type { Analysis, EmbeddingBackend } from "../ai/types";
import { createSigilGeometry } from "../sigil/geometry/generate";
import { createSigilPlan } from "../sigil/plan";
import { normalizeInput } from "../sigil/seed";
import type { SigilGeometry, SigilPlan } from "../sigil/types";

export type AppStatus =
  | "idle"
  | "model-downloading"
  | "model-ready"
  | "analyzing"
  | "generating"
  | "complete"
  | "unsupported"
  | "error";

export type SigilResult = {
  input: string;
  analysis: Analysis;
  plan: SigilPlan;
  geometry: SigilGeometry;
};

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export function useSigilMachine() {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [backend, setBackend] = useState<EmbeddingBackend>();
  const [result, setResult] = useState<SigilResult>();
  const [error, setError] = useState("");

  const generate = useCallback(async (rawInput: string) => {
    const input = normalizeInput(rawInput);
    if (!input || input.length > 80) {
      setError("1자 이상 80자 이하의 단어나 짧은 문구를 입력해 주세요.");
      setStatus("error");
      return;
    }
    setError("");
    try {
      setStatus("model-downloading");
      const loadedBackend = await loadEmbeddingModel(setProgress);
      setBackend(loadedBackend);
      setStatus("model-ready");
      await nextFrame();
      setStatus("analyzing");
      const embedded = await embedText(input);
      const classified = classifyMeaning(input, embedded.values);
      setStatus("generating");
      await nextFrame();
      const plan = createSigilPlan(input, classified.meaning, 0);
      setResult({
        input,
        analysis: { ...classified, backend: embedded.backend },
        plan,
        geometry: createSigilGeometry(plan),
      });
      setStatus("complete");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "문양 생성에 실패했습니다.";
      setError(message);
      setStatus(message.includes("worker를 지원하지") ? "unsupported" : "error");
    }
  }, []);

  const vary = useCallback(async () => {
    if (!result) return;
    setStatus("generating");
    await nextFrame();
    const variation = result.plan.variation + 1;
    const plan = createSigilPlan(result.input, result.analysis.meaning, variation);
    setResult({ ...result, plan, geometry: createSigilGeometry(plan) });
    setStatus("complete");
  }, [result]);

  const reset = useCallback(() => {
    setResult(undefined);
    setError("");
    setProgress(0);
    setStatus(backend ? "model-ready" : "idle");
  }, [backend]);

  return { status, progress, backend, result, error, generate, vary, reset };
}
