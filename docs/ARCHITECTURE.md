# Architecture

## 데이터 흐름

```text
normalized input
  -> feature-extraction worker
  -> embedding vector
  -> cosine against committed centroids
  -> SigilMeaning
  -> deterministic SigilPlan
  -> finite geometry primitives
  -> React SVG renderer / static serializer
  -> standalone SVG / Canvas PNG
```

서버 계층은 없다. static Vite 빌드의 브라우저 코드가 전부이며 no server, no database, no remote AI API다. no user input transmission을 유지한다.

## 로컬 embedding

- model: `Xenova/multilingual-e5-small`
- task: `feature-extraction`
- dtype: `q8`
- execution: Web Worker
- backend: WebGPU first, WASM fallback
- loading: lazy, progress callback, browser cache
- prompt convention: runtime은 `query:`, anchor generator는 `passage:` prefix

`src/ai/embedding.worker.ts`만 Transformers.js를 직접 호출한다. 모델은 text, SVG, path, coordinate, color, CSS, HTML, code를 만들 수 없다. CI와 E2E는 `VITE_EMBEDDING_MODE=mock`으로 같은 차원의 deterministic mock adapter를 사용해 모델을 다운로드하지 않는다.

## 의미 분류

`scripts/anchors.json`에는 각 intent와 archetype의 한국어·영어 anchor가 있다. `pnpm centroids`가 anchor를 embedding하고 평균·정규화해 `src/ai/centroids.json`을 갱신한다.

런타임 분류 순서는 다음과 같다.

1. cosine similarity 계산
2. 6자리 score rounding
3. score 내림차순 및 label 오름차순 tie-break
4. top margin 0.035 확인
5. 낮은 confidence이면 hash 기반 top-two fallback
6. intensity 0..1 및 polarity -1..1 clamp

dimension이 centroid와 다르면 생성하지 않고 오류를 표시한다.

## 결정적 plan

- base seed: `hash(normalizedInput)`
- variation seed: `hash(normalizedInput + ':' + variationIndex)`
- PRNG: 로컬 seeded generator
- forbidden: `Math.random`

intent별 structure compatibility table이 invalid combination을 막는다. archetype table이 core와 palette 후보를 제한하고, ornaments는 중복 없이 선택한다. AI는 plan 이후 계산에 관여하지 않는다.

## geometry와 SVG

`SigilPrimitive`는 circle, line, arc, path, dot의 제한된 union이다. `src/sigil/geometry/generate.ts`가 base unit을 만들고 rotational symmetry를 적용한다.

안전 불변식:

- fixed viewBox `0 0 640 640`
- 모든 coordinate와 radius는 finite
- 최소 stroke 1.4
- primitive 최대 180개
- seed 기반 id
- user input을 markup에 삽입하지 않음
- `dangerouslySetInnerHTML`, script, foreignObject 없음
- arbitrary path scripting 없음

화면용 React renderer는 CSS animation을 적용한다. `serializeSvg`는 style과 animation을 넣지 않는 정적 SVG를 별도로 만든다. 따라서 export는 pause 또는 motion 상태와 독립적이다.

## PNG

SVG가 source of truth다. PNG 변환에서만 browser Canvas를 제한적으로 사용한다.

- transparent PNG: 1600 × 1600, 투명 배경
- poster PNG: 2400 × 2400, palette 배경과 180px 여백

## 파일 경계

```text
src/app/                 React state machine and composition
src/ai/                  worker, client, centroids, classification
src/sigil/               seed, plan, geometry, React/static rendering
src/export/              Canvas conversion and downloads
src/ui/                  focused presentational components
src/styles/              tokens, layout, motion, responsive rules
```

global state library, event bus, dependency injection, provider registry, plugin system, barrel export가 없다. data table, discriminated union, switch, pure function을 우선한다.
