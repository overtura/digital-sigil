# Design

## 방향

Digital Sigil은 contemporary symbolic print와 precision engraving을 결합한 밝은 편집 인쇄물처럼 보여야 한다. 문양은 astronomical instrument의 정밀함을 갖되 실제 종교나 고대 문자를 모방하지 않는다.

핵심 인상은 quiet and precise다. 결과 문양이 화면의 명확한 중심이고, 주변 UI는 넓은 negative space와 얇은 측정선으로 물러난다.

## 토큰

기본 palette:

- paper `#f4efdf`
- paper deep `#e9e1cd`
- ink `#15201d`
- ink soft `#53605a`
- copper `#9a6b38`
- focus `#8a4d28`

배경은 warm ivory, 본문은 deep ink, accent는 제한된 copper다. neon purple/blue, AI gradient, 과도한 glass, glow, robot, brain, circuit, game item card를 사용하지 않는다.

## 타이포그래피

- 큰 제목과 결과 이름: Georgia 기반 serif
- UI와 한국어 본문: system sans, Pretendard 또는 Noto Sans KR fallback
- plate 번호와 상태: system monospace

가짜 고대 문자나 장식 전용 unreadable font는 사용하지 않는다.

## 상호작용

- 모든 control은 native button, input, details를 사용한다.
- `:focus-visible`은 3px 고대비 outline을 표시한다.
- disabled 상태는 opacity와 cursor를 함께 바꾼다.
- 상태 변화는 `role=status`, 오류는 `role=alert`로 알린다.
- SVG에는 `role=img`, title, 한국어 aria-label이 있다.
- pause는 animation-play-state를 멈춘다.
- reduced motion에서는 animation을 사실상 비활성화한다.

## 반응형

- desktop: 설명과 결과 plate의 2-column editorial layout
- tablet 이하 940px: 1-column
- mobile 620px 이하: form과 결과 metadata를 세로 배치
- 최소 검증 폭: 320px

화면 폭과 관계없이 horizontal overflow가 없어야 하고, 문양 export 버튼은 wrap되어 접근 가능해야 한다.
