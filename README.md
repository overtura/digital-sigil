# Digital Sigil

Digital Sigil은 단어나 짧은 문구를 브라우저 안에서 의미 좌표로 해석하고, 같은 입력에 항상 같은 추상 기하 문양을 만드는 정적 React 앱입니다. 결과는 종교·주술 문양이 아니라 독자적인 디지털 아트입니다.

```text
phrase -> local embedding -> SigilMeaning -> SigilPlan
       -> pure geometry primitives -> SVG -> SVG / PNG
```

## 핵심 특성

- `Xenova/multilingual-e5-small` q8 임베딩을 Web Worker에서 실행합니다.
- WebGPU first, WASM fallback 순서이며 사용자 입력은 never leaves the browser입니다.
- no remote AI API, no user input transmission, no server, no database 구조입니다.
- `hash(normalizedInput)`과 `hash(normalizedInput + ':' + variationIndex)`를 사용합니다. `Math.random`은 금지됩니다.
- AI는 의미만 분류하고 SVG, path, 좌표, 색상, CSS, HTML, 코드는 생성하지 않습니다.
- standalone SVG, transparent PNG, poster PNG를 내려받을 수 있습니다.
- keyboard focus, contrast, reduced motion, 320px 반응형 UI를 지원합니다.

## 실행

요구 환경은 Node.js 22.12 이상과 pnpm 10입니다.

```bash
pnpm install
pnpm dev
```

최초 문양 생성 때 브라우저가 Hugging Face에서 모델을 직접 내려받아 캐시합니다. 모델 가중치는 이 저장소나 Vercel 배포 산출물에 포함되지 않습니다.

anchor centroid를 다시 만들 때만 다음 개발 명령을 사용합니다. 이 명령은 로컬 모델 캐시를 사용하고 CI에서는 실행하지 않습니다.

```bash
pnpm centroids
```

## 검증

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm check
```

`pnpm check`는 lint, strict typecheck, Vitest, production build, Playwright 순서로 전체 gate를 실행합니다. CI에서는 deterministic mock embedding을 사용하므로 모델을 다운로드하지 않습니다.

## 정적 배포

Vercel 설정은 `vercel.json`에 고정되어 있습니다.

- framework: Vite static
- output: `dist`
- no API, no secrets, no server function
- 모델 파일 미포함

Vercel에서 GitHub 저장소를 Import하고 기본 Build Command와 Output Directory를 그대로 사용하면 됩니다.

## 자가 개선

중앙 control plane은 [`okorion/self-improving-maintainer-bot`](https://github.com/okorion/self-improving-maintainer-bot)이며 이 저장소에는 profile, eval, 문서, 실행 wrapper만 둡니다.

```bash
pnpm improve          # four normal, one major cadence
pnpm improve:normal   # manual normal override
pnpm improve:major    # manual major override
pnpm improve:dry      # goal preview, no publish
```

자세한 cadence, R1 only auto-merge, R2 draft PR, R3 proposal-only 정책은 [docs/SELF_IMPROVEMENT.md](docs/SELF_IMPROVEMENT.md)를 참고하세요.

## 제한

- 실제 종교 문양, rune, 신성 문자, 운세, 예언, 진단을 제공하지 않습니다.
- backend, 계정, cloud gallery, 범용 SVG editor, arbitrary path scripting, plugin framework가 없습니다.
- 분류는 제한된 `SigilMeaning` anchor와 deterministic fallback을 사용하며 free-form LLM이 아닙니다.
