import { useState } from "react";
import { downloadPng, downloadSvg, type PngMode } from "../export/exportImage";
import { SigilSvg } from "../sigil/render/SigilSvg";
import type { SigilResult } from "../app/useSigilMachine";

const INTENT_NAMES = {
  protect: "보호",
  seek: "탐색",
  create: "창조",
  transform: "변화",
  bind: "연결",
  release: "해방",
} as const;
const ARCHETYPE_NAMES = {
  solar: "태양",
  lunar: "달",
  celestial: "천체",
  organic: "유기",
  mechanical: "기계",
  void: "공백",
} as const;

type Props = {
  result?: SigilResult;
  paused: boolean;
  onPause: () => void;
  onVary: () => void;
  onReset: () => void;
};

export function ResultPanel({ result, paused, onPause, onVary, onReset }: Props) {
  const [exportState, setExportState] = useState<"idle" | "exporting" | "error">("idle");
  if (!result) {
    return (
      <section className="result-shell result-shell--empty" aria-label="문양 결과 영역">
        <div className="empty-orbit" aria-hidden="true"><span /></div>
        <p>문구의 의미 좌표가 이곳에서 형태를 얻습니다.</p>
        <small>결정적 · 추상 · 비공개</small>
      </section>
    );
  }

  const { plan, geometry, analysis } = result;
  const baseName = `digital-sigil-${plan.seed.toString(16)}-v${plan.variation}`;
  const title = `${INTENT_NAMES[analysis.meaning.intent]}의 ${ARCHETYPE_NAMES[analysis.meaning.archetype]} 형상`;
  const exportPng = async (mode: PngMode) => {
    setExportState("exporting");
    try {
      await downloadPng(geometry, plan.palette, mode, `${baseName}-${mode}.png`);
      setExportState("idle");
    } catch {
      setExportState("error");
    }
  };

  return (
    <section className="result-shell" aria-labelledby="result-title">
      <div className="plate-index" aria-hidden="true">도판 {String(plan.variation + 1).padStart(2, "0")}</div>
      <div className="sigil-stage"><SigilSvg geometry={geometry} plan={plan} paused={paused} /></div>
      <div className="result-copy">
        <div>
          <p className="eyebrow">생성된 문양</p>
          <h2 id="result-title">{title}</h2>
        </div>
        <dl>
          <div><dt>의도</dt><dd>{INTENT_NAMES[analysis.meaning.intent]}</dd></div>
          <div><dt>원형</dt><dd>{ARCHETYPE_NAMES[analysis.meaning.archetype]}</dd></div>
          <div><dt>변형</dt><dd>{plan.variation + 1}</dd></div>
          <div><dt>연산</dt><dd>{analysis.backend.toUpperCase()}</dd></div>
        </dl>
      </div>
      <div className="result-actions" aria-label="문양 작업">
        <button type="button" onClick={onPause}>{paused ? "움직임 재개" : "움직임 멈춤"}</button>
        <button type="button" onClick={onVary}>다른 변형</button>
        <button type="button" onClick={() => downloadSvg(geometry, plan.palette, `${baseName}.svg`)}>SVG</button>
        <button type="button" disabled={exportState === "exporting"} onClick={() => void exportPng("transparent")}>투명 PNG</button>
        <button type="button" disabled={exportState === "exporting"} onClick={() => void exportPng("poster")}>포스터 PNG</button>
        <button type="button" onClick={onReset}>입력 초기화</button>
      </div>
      {exportState === "error" && <p className="export-error" role="alert">PNG 내보내기에 실패했습니다.</p>}
      <details className="seed-details"><summary>생성 정보</summary><code>시드 {plan.seed} · 신뢰도 {analysis.confidence.toFixed(2)}</code></details>
    </section>
  );
}
