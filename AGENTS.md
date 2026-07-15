# Digital Sigil Agent Guide

## Product boundaries

- Keep the application browser-only: no server, database, API route, account, cloud collection, or remote AI API.
- Never transmit user input. `Xenova/multilingual-e5-small` runs locally in a Web Worker with WebGPU first and WASM fallback.
- Keep SVG as the source of truth. AI may classify meaning but must not generate SVG, paths, coordinates, color, CSS, HTML, or code.
- Do not imitate real religious symbols, runes, sacred writing, divination, prophecy, or diagnostic claims.
- Prefer direct pure functions and existing tables. Do not add a global state library, event bus, DI system, plugin system, barrel exports, arbitrary markup execution, or future-only abstraction.

## Self-improvement trigger

When the user says `자가개선 루프 실행해`, `자가 개선 루프 돌려줘`, or `self-improvement loop를 실행해`, do not ask a follow-up question. Read, in order:

1. `AGENTS.md`
2. `docs/SELF_IMPROVEMENT.md`
3. `docs/PRODUCT.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DESIGN.md`
6. `docs/QUALITY.md`

Then run `pnpm improve`. Do not force a small change or avoid a major slot. The GitHub merged-PR cadence selects the scale.

After the run, report only the selected slot, selected improvement goal, created PR, risk grade, verification result, auto-merge or draft/proposal state, and remaining risk.
