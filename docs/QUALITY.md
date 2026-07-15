# Quality

## 전체 gate

```bash
pnpm check
```

`pnpm check`는 다음을 순서대로 실행한다.

1. ESLint strict rules
2. TypeScript strict typecheck
3. Vitest unit tests
4. Vite production build
5. Playwright browser tests

CI에서는 `VITE_EMBEDDING_MODE=mock`을 사용하며 모델을 다운로드하지 않는다.

## unit coverage

- input normalization, hash, variation seed
- seeded generator가 `Math.random`을 호출하지 않음
- cosine similarity와 dimension mismatch
- intent/archetype 분류와 낮은 confidence fallback
- intensity 0..1, polarity -1..1
- intent/structure compatibility
- finite primitive coordinates와 primitive density
- rotational symmetry unit count
- deterministic SVG snapshot hash
- script, foreignObject, user input markup 없음
- standalone serialization
- transparent PNG와 poster PNG mode

## E2E coverage

- 예제 버튼과 mock embedding 문양 생성
- variation
- pause/resume
- SVG download
- transparent PNG download
- poster PNG download
- local model error
- 320px viewport overflow
- reduced motion

## CI

GitHub Actions는 read-only contents permission으로 Linux Chromium에서 `pnpm check`를 실행한다. workflow는 model weight를 내려받지 않는다. dependency, lockfile, workflow, auth, security, infra 변경은 자가 개선 auto-merge 대상이 아니다.

## 구조 단순성

- production TypeScript 파일은 25개 이하를 목표로 한다.
- 함수 40줄, component 150줄, 파일 250줄, 중첩 3단계는 가이드다.
- 억지 분할보다 직접적인 pure function을 선택한다.
- no `any`, no global state library, no plugin system, no future framework.
- 새 dependency는 제품 목표에 꼭 필요한 경우만 허용한다.

변경을 마칠 때 새 interface/provider/factory/registry, 중복 state, 동적 markup 실행, client-side code generation이 생기지 않았는지 확인한다.

## 배포 품질

Vercel은 Vite static `dist`만 배포한다. no secrets, no API, no server function이다. 배포 전에 `pnpm build`와 브라우저 console error 0건을 확인한다.
