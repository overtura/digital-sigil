# Product

## 한 문장 정의

Digital Sigil은 사용자의 단어나 짧은 문구를 로컬 임베딩으로 해석하고, 제한된 의미 분류와 결정적 seed로 움직이는 추상 기하 SVG를 만드는 브라우저 전용 디지털 아트 도구다.

## 사용자 흐름

1. 사용자가 1자 이상 80자 이하의 단어나 짧은 문구를 입력한다.
2. 최초 실행이면 q8 모델 다운로드 진행률과 브라우저 캐시 안내를 본다.
3. 로컬 모델이 `SigilMeaning`을 분류한다.
4. 순수 함수가 `SigilPlan`과 geometry primitives를 만든다.
5. 사용자는 움직임을 멈추거나 재개하고, variation을 바꾼다.
6. standalone SVG, transparent PNG, poster PNG를 내려받는다.
7. 입력을 초기화해 새 문양을 만든다.

## 의미 모델

`SigilMeaning`에는 다음 네 필드만 있다.

- `intent`: protect, seek, create, transform, bind, release
- `archetype`: solar, lunar, celestial, organic, mechanical, void
- `intensity`: 0..1
- `polarity`: -1..1

한국어와 영어 anchor를 실제 embedding한 centroid가 저장소에 커밋되어 있다. 런타임에는 사용자 입력만 embedding하고 cosine similarity, score rounding, top margin을 확인한다. confidence가 낮으면 hash 기반 top-two 중 하나를 선택한다. free-form LLM과 LLM fallback은 없다.

## 표현 원칙

- 결과는 contemporary symbolic print, precision engraving, astronomical instrument에서 영감을 받은 추상 geometry다.
- 실제 종교 문양, rune, 신성 문자와 닮도록 의도하지 않는다.
- 제품은 초자연적 효능, 운세, 예언, 심리 또는 의료 진단을 주장하지 않는다.
- 결과 이름과 설명은 고정 template 및 label table에서 나온다.

## 제품 경계

Digital Sigil은 Vite static 앱이다. no server, no database, no API route, no serverless backend, no login, no account, no cloud collection이다. no remote AI API이며 사용자 입력은 외부로 전송하지 않는다.

초기 제품에는 Three.js, Next.js, SSR, global state library, Tailwind, shadcn, 범용 SVG editor, 자유 코드 생성, plugin grammar가 없다.

## 성공 기준

- 동일 input/variation은 동일 `SigilMeaning` 결정, `SigilPlan`, SVG를 만든다.
- 브라우저 UI가 모델 loading과 fallback을 명확히 설명한다.
- WebGPU가 없거나 실패하면 WASM으로 계속 동작한다.
- export가 animation 상태와 독립적이고 안전한 정적 SVG를 사용한다.
- keyboard, contrast, reduced motion, 320px에서 핵심 흐름이 유지된다.
