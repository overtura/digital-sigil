# Digital Sigil · 디지털 시길

Digital Sigil은 단어나 짧은 문구를 브라우저 안에서 의미 좌표로 해석하고, 같은 입력에 항상 같은 추상 기하 문양을 만드는 정적 React 앱입니다. 결과는 종교·주술 문양이 아니라 독자적인 디지털 아트입니다.

```text
문구 -> 로컬 임베딩 -> 의미 분류 -> 문양 계획
     -> 순수 기하 도형 -> SVG -> SVG / PNG
```

## 핵심 특성

- `Xenova/multilingual-e5-small` q8 임베딩을 Web Worker에서 실행합니다.
- WebGPU를 우선 사용하고 지원되지 않으면 WASM으로 전환합니다. 사용자 입력은 브라우저 밖으로 나가지 않습니다.
- 원격 AI API, 사용자 입력 전송, 서버, 데이터베이스가 없습니다.
- `hash(normalizedInput)`과 `hash(normalizedInput + ':' + variationIndex)`를 사용합니다. `Math.random`은 금지됩니다.
- AI는 의미만 분류하고 SVG, path, 좌표, 색상, CSS, HTML, 코드는 생성하지 않습니다.
- 독립형 SVG, 투명 PNG, 포스터 PNG를 내려받을 수 있습니다.
- 키보드 초점, 명도 대비, 동작 줄이기 설정, 320px 반응형 화면을 지원합니다.

## 실행

요구 환경은 Node.js 22.12 이상과 pnpm 10입니다.

```bash
pnpm install
pnpm dev
```

최초 문양 생성 때 브라우저가 Hugging Face에서 모델을 직접 내려받아 캐시합니다. 모델 가중치는 이 저장소나 Vercel 배포 산출물에 포함되지 않습니다.

기준점 중심 벡터를 다시 만들 때만 다음 개발 명령을 사용합니다. 이 명령은 로컬 모델 캐시를 사용하고 CI에서는 실행하지 않습니다.

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

`pnpm check`는 코드 검사, 엄격한 타입 검사, Vitest, 배포 빌드, Playwright 순서로 전체 검사를 실행합니다. CI에서는 결정적 모의 임베딩을 사용하므로 모델을 다운로드하지 않습니다.

## 정적 배포

[디지털 시길 웹 앱 열기](https://digital-sigil-okorions-projects.vercel.app/)

Vercel 설정은 `vercel.json`에 고정되어 있습니다.

- 프레임워크: Vite 정적 앱
- 출력 경로: `dist`
- API, 비밀값, 서버 함수 없음
- 모델 파일 미포함

Vercel에서 GitHub 저장소를 가져오고 기본 빌드 명령과 출력 경로를 그대로 사용하면 됩니다.

## 자가 개선

중앙 제어 저장소는 [`okorion/self-improving-maintainer-bot`](https://github.com/okorion/self-improving-maintainer-bot)이며 이 저장소에는 프로필, 평가 자료, 문서, 실행 스크립트만 둡니다.

```bash
pnpm improve          # 일반 개선 4회 후 주요 개선 1회
pnpm improve:normal   # 일반 개선 수동 실행
pnpm improve:major    # 주요 개선 수동 실행
pnpm improve:dry      # 게시하지 않고 목표 미리보기
```

자세한 실행 주기, R1 한정 자동 병합, R2 초안 PR, R3 제안 전용 정책은 [docs/SELF_IMPROVEMENT.md](docs/SELF_IMPROVEMENT.md)를 참고하세요.

## 제한

- 실제 종교 문양, 룬, 신성 문자, 운세, 예언, 진단을 제공하지 않습니다.
- 백엔드, 계정, 클라우드 갤러리, 범용 SVG 편집기, 임의 경로 스크립트, 플러그인 프레임워크가 없습니다.
- 분류는 제한된 `SigilMeaning` 기준점과 결정적 대체 경로를 사용하며 자유 형식 LLM이 아닙니다.
