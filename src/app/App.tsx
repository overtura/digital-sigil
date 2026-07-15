import { useState } from "react";
import { useSigilMachine, type AppStatus } from "./useSigilMachine";
import { GeneratorForm } from "../ui/GeneratorForm";
import { ResultPanel } from "../ui/ResultPanel";

const STATUS_TEXT: Record<AppStatus, string> = {
  idle: "로컬 모델 대기 중",
  "model-downloading": "로컬 모델을 준비하는 중",
  "model-ready": "로컬 모델 준비 완료",
  analyzing: "문구의 의미 좌표를 분석하는 중",
  generating: "기하 문양을 구성하는 중",
  complete: "문양 생성 완료",
  unsupported: "이 브라우저에서는 로컬 모델을 실행할 수 없음",
  error: "생성 과정에서 문제가 발생함",
};

export function App() {
  const [input, setInput] = useState("");
  const [paused, setPaused] = useState(false);
  const machine = useSigilMachine();
  const busy = ["model-downloading", "analyzing", "generating"].includes(machine.status);
  const reset = () => {
    machine.reset();
    setInput("");
    setPaused(false);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">본문으로 바로가기</a>
      <header className="site-header">
        <a className="wordmark" href="#main-content" aria-label="디지털 시길 처음으로">DS<span>○</span></a>
        <p>의미 기하 연구</p>
        <span className="local-badge">로컬 · 비공개</span>
      </header>
      <main id="main-content" className="workspace" aria-busy={busy}>
        <GeneratorForm
          value={input}
          busy={busy}
          progress={machine.progress}
          statusText={STATUS_TEXT[machine.status]}
          onChange={setInput}
          onGenerate={(value) => void machine.generate(value)}
        />
        <ResultPanel
          result={machine.result}
          paused={paused}
          onPause={() => setPaused((value) => !value)}
          onVary={() => void machine.vary()}
          onReset={reset}
        />
      </main>
      {machine.error && <p className="global-error" role="alert">{machine.error}</p>}
      <footer>
        <p>추상 디지털 아트 도구이며 종교·주술·예언·진단을 제공하지 않습니다.</p>
        <p>SVG 원본 · 서버 없음 · 계정 없음</p>
      </footer>
    </div>
  );
}
