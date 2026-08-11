# THE ONE · 런칭 마케팅 자산

브랜드 진실의 원천(`packages/shared/src/tokens.ts` · `docs/reference/theone-standalone.html`)을
따라 제작한 앱 아이콘 + 인스타그램 첫 게시글(카드뉴스).

## 산출물

| 파일 | 용도 | 규격 |
|---|---|---|
| `app-icon.png` | 앱 아이콘 (T 모노그램) | 1024×1024 |
| `card-1-cover.png` | 카드뉴스 01 · 커버 | 1080×1080 |
| `card-2-concept.png` | 카드뉴스 02 · 컨셉 | 1080×1080 |
| `card-3-admission.png` | 카드뉴스 03 · 가입 심사(23%) | 1080×1080 |
| `card-4-verify.png` | 카드뉴스 04 · 4종 인증 | 1080×1080 |
| `card-5-cta.png` | 카드뉴스 05 · 큐레이션 + CTA | 1080×1080 |

원본 벡터는 `src/*.svg`. 텍스트·문구 수정은 SVG에서 하고 다시 렌더한다.

## 인스타그램 첫 게시글 가이드

- **포맷**: 정사각 캐러셀(1:1). 1→5 순서로 업로드.
- **추천 캡션**
  > 인생에 한 번뿐인 매칭. 결혼정보회사가 디지털로 옮긴다면.
  > 가입 심사 통과율 23%, 학력·재산·차량·부동산 4종 인증.
  > 무한 스와이프는 없습니다. 매일 단 한 명.
  > 웨이팅리스트 오픈 → 프로필 링크.
  > #더원 #theone #검증된만남
- CTA의 핸들/도메인(`@the.one` · `theone.kr`)은 확정값으로 교체 후 게시.

## 재생성

```bash
# 1) 브랜드 폰트를 FONT_DIR에 준비
#    Noto Serif KR / Playfair Display(+Italic) / JetBrains Mono / Inter / Pretendard Variable
# 2) 렌더 (의존성: @resvg/resvg-js)
FONT_DIR=/path/to/fonts node render.mjs
```

## 디자인 원칙 준수 체크

- 잉크블랙 `#0F1014` / 아이보리 `#FAF7F2` / 뮤트 샴페인 `#B8956A` / 검증 sage `#6B8E7F`
- 헤드라인 Noto Serif KR, 영문 보조 Playfair italic, 캡션 JetBrains Mono
- 카드 radius 2 이하(샤프) · 그림자 없음 · hairline border
- 금기 미사용: 골드 그라데이션/반짝임/하트/별 ✕, "프리미엄" 단어 ✕, 핑크·코랄·바이올렛 ✕, 무한 스와이프 연출 ✕, 외부 placeholder 이미지 ✕
