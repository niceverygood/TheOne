# Mobile Assets

`app.json`에서 참조하는 이미지 파일들. **MVP용 자동 생성본** 포함.

## 자동 생성 (v1.0 MVP)

`assets/brand/*.svg` → `assets/*.png` 변환:

```bash
cd apps/mobile
pnpm run build:icons
```

| 출력 | 크기 | 용도 |
|---|---|---|
| `icon.png` | 1024×1024 | iOS/Android 앱 아이콘 — 잉크블랙 배경 + hairline 액자 + "THE ONE" 워드마크 + 샴페인 T 모노그램 + "Application Only" 캡션 |
| `adaptive-icon.png` | 1024×1024 | Android 적응형 foreground — 투명 배경 + 중앙 안전영역(≈600px) 안에 T 모노그램만. 배경색은 `app.json` adaptiveIcon.backgroundColor (`#0F1014`) |
| `splash.png` | 2400×2400 | 스플래시 (resizeMode=cover) — Application Only + THE ONE + hairline + PASS RATE 23% |

소스 SVG는 `assets/brand/`:
- `icon.svg` — 아이콘 원본
- `adaptive-foreground.svg` — Android foreground 원본
- `splash.svg` — 스플래시 원본

## 디자인 원천

- 컬러: `packages/shared/src/tokens.ts` (잉크블랙 `#0F1014` · 샴페인 `#B8956A` · 아이보리 `#FAF7F2`)
- 타이포: Noto Serif KR(헤드라인) / Playfair Display italic(영문 보조) / JetBrains Mono(캡션)
- 출처: `docs/reference/theone-standalone.html` 스플래시 화면(통과율 23%)

## 금기 (CLAUDE.md §3) — SVG 수정 시 준수

- ❌ 골드 그라데이션·반짝임·별·하트
- ❌ 핑크·코랄·바이올렛
- ❌ "프리미엄" 단어 노출
- ❌ 카드 radius 12 이상, 박스 그림자

## v1.1 — 디자이너 정식 작업 시

자동 생성본은 출시 게이트 통과용 MVP. 정식 출시 안정화 단계에서 디자이너가 Figma로 다듬을 것:
- T 모노그램 커스텀 글리프(시스템 폰트 의존 제거)
- 다크/라이트 환경 별도 출력
- iOS App Store 마케팅 아이콘(웹 1024×1024 별도 권장)
- 스플래시 다해상도(splash@2x, splash@3x) — `expo-splash-screen` 자동 처리이긴 함
