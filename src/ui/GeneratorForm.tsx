import type { FormEvent } from "react";

const EXAMPLES = ["고요한 용기", "새로운 길", "별빛의 기억", "create freely", "protect home", "release fear"];

type Props = {
  value: string;
  busy: boolean;
  statusText: string;
  progress: number;
  onChange: (value: string) => void;
  onGenerate: (value: string) => void;
};

export function GeneratorForm({ value, busy, statusText, progress, onChange, onGenerate }: Props) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onGenerate(value);
  };

  return (
    <section className="intro" aria-labelledby="page-title">
      <p className="eyebrow">LOCAL SEMANTIC INSTRUMENT · 01</p>
      <h1 id="page-title">Digital Sigil</h1>
      <p className="lede">
        한 단어의 방향과 온도를 읽어, 오직 당신의 브라우저 안에서 움직이는 추상 기하 문양으로 바꿉니다.
      </p>
      <form onSubmit={submit} className="generator-form">
        <label htmlFor="sigil-input">단어 또는 짧은 문구</label>
        <div className="input-row">
          <input
            id="sigil-input"
            value={value}
            maxLength={80}
            onChange={(event) => onChange(event.target.value)}
            placeholder="예: 고요한 용기"
            autoComplete="off"
            disabled={busy}
          />
          <button className="primary-button" type="submit" disabled={busy || !value.trim()}>
            {busy ? "해석 중" : "문양 생성"}
          </button>
        </div>
        <div className="examples" aria-label="예제 문구">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" onClick={() => onChange(example)} disabled={busy}>
              {example}
            </button>
          ))}
        </div>
      </form>
      <div className="model-status" role="status" aria-live="polite">
        <span className="status-mark" aria-hidden="true" />
        <div>
          <strong>{statusText}</strong>
          <p>최초 실행 시 q8 모델을 내려받아 브라우저 캐시에 보관합니다.</p>
        </div>
        {busy && <progress max="100" value={progress} aria-label="로컬 모델 준비 진행률" />}
      </div>
      <p className="privacy-note">
        <span aria-hidden="true">◇</span> 입력은 외부 API로 전송되지 않습니다. 모델 추론과 문양 생성은 이 기기에서만 실행됩니다.
      </p>
    </section>
  );
}
