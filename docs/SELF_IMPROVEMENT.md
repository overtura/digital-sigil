# Self Improvement

## control plane

중앙 control plane은 공개 저장소 `okorion/self-improving-maintainer-bot`이다. Digital Sigil 저장소에는 중앙 봇을 vendor하지 않고 다음만 둔다.

- normal/major target profile
- docs QA eval
- 제품·구조·디자인·품질 문서
- PowerShell 실행 wrapper
- ignored local state cache

중앙 봇 위치는 다음 순서로 찾는다.

1. `SELF_IMPROVING_BOT_HOME`
2. `../self-improving-maintainer-bot`
3. `../../self-improving-maintainer-bot`
4. 없으면 프로젝트 바깥 sibling 경로에 clone

## cadence

GitHub의 successfully merged self-improvement PRs가 source of truth다. invocation count나 local state가 아니다. `codex/digital-sigil-improve` branch prefix 또는 안정적인 body marker가 있는 PR만 센다.

```text
merged #1: normal
merged #2: normal
merged #3: normal
merged #4: normal
merged #5: major
repeat
```

즉 four normal, one major cadence다. fifth merged self-improvement PR은 major다. major 후보가 실패, close, draft PR, proposal-only이면 successfully merged가 아니므로 major slot remains. major가 successfully merged될 때까지 다음 자동 실행도 major다.

수동 PR과 일반 maintenance PR은 세지 않는다. `maintainer-bot/local-state.json`은 cache only이며 GitHub merged history를 대체하지 않는다.

## profiles

`normal.json`:

- changeScale: normal
- scope: mixed
- improvementKind: auto
- Model: GPT-5.6 Thinking
- Reasoning level: High
- Mode: Goal
- budget: maxFiles 12, maxLines 400

normal은 사소한 변경만 뜻하지 않는다. 사용자에게 가장 가치 있는 작은 또는 중간 개선을 선택하고, invisible cleanup이나 docs-only 반복, 최근 PR 주제 반복을 피한다.

`major.json`:

- changeScale: major
- scope: mixed
- improvementKind: feat
- Model: GPT-5.6 Thinking
- Reasoning level: Very High
- Mode: Plan -> Goal
- budget: maxFiles 26, maxLines 1800

major는 one coherent vertical slice와 one product goal만 다룬다. 먼저 repository state, recent PRs, product docs, core flow를 읽고 같은 실행에서 계획, 구현, tests, browser verification까지 끝낸다. unrelated features를 묶거나 미래 framework를 만들지 않는다.

budget은 상한이지 목표가 아니다.

## risk와 publish

- R1 only: allow path 내부, deny path 없음, dependency/lock/build/workflow/auth/security/infra 변경 없음, 전체 gate와 Codex red-team PASS일 때 squash auto-merge 가능
- R2: draft PR, no auto-merge
- R3: proposal-only, no automatic publish

큰 기능도 R1 범위와 budget 안에서 모든 gate를 통과하면 auto-merge할 수 있다. 이를 위해 risk classifier, red-team, CI, review-response limit, merge conflict 검사, merge wait를 우회하거나 약화하지 않는다.

## commands

```bash
pnpm improve
pnpm improve:normal
pnpm improve:major
pnpm improve:dry
```

- `improve`: GitHub merged count로 cadence를 선택하고 안전 조건을 만족하면 auto-merge를 요청한다.
- `improve:normal`: scale만 normal로 override한다. risk model은 그대로다.
- `improve:major`: scale만 major로 override한다. risk model은 그대로다.
- `improve:dry`: profile parsing, cadence, budget, goal preview만 실행하고 Codex execution, commit, PR, publish, merge는 하지 않는다.

wrapper 순서:

1. working tree와 current branch 확인
2. 중앙 봇 발견 및 profile 동기화
3. GitHub CLI로 merged self-improvement PR 조회
4. normal 또는 major slot 결정
5. profile과 budget 출력
6. 중앙 봇 1회 loop 실행
7. publisher token 또는 명시적 local auth 사용
8. CI, risk, red-team, merge 상태 확인
9. merged cadence 재확인
10. slot, goal, PR, risk, verification, publish state, remaining risk 요약

publisher token이 없으면 로컬 명령은 `-AllowLocalPublisherAuth`로 현재 `gh` 인증을 명시적으로 사용할 수 있다. remote 또는 publisher 인증이 준비되지 않았을 때는 `pnpm improve:dry`까지만 실행한다.
