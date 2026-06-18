/**
 * AI 스튜디오 보정 — 사진 1장으로 선택한 장면(기본 2종)의 프로필 사진 생성 (gpt-image-2).
 *
 * 절대 원칙(trust-safety): 동일 인물 유지. 이목구비·골격·피부톤을 바꾸지 않는다.
 * 조명·배경·구도·색감만 스튜디오급으로 올린다. 검증 위원은 원본과 대조한다.
 */

/** 모든 스타일 프롬프트 앞에 붙는 공통 규칙 — 동일 인물 보존 + 실사 사진 품질이 최우선. */
export const PHOTO_STUDIO_IDENTITY_RULES =
  'Re-shoot this exact person as a premium matchmaking profile portrait. ' +
  "CRITICAL: preserve the person's identity — keep face shape, eyes, nose, lips, " +
  'skin tone, hairstyle and body proportions exactly as in the source photo. ' +
  'Do not beautify, slim, retouch or alter any facial feature. The result must be ' +
  'instantly recognizable as the same person. Vertical 3:4 chest-up composition. ' +
  // 실사 강제 — AI 렌더/일러스트 톤 방지(image-2.0 실사 품질 목적).
  'PHOTOREALISM IS MANDATORY: this must look like a real photograph shot on a ' +
  'full-frame DSLR with an 85mm portrait lens, shallow depth of field, true-to-life ' +
  'lighting, natural skin with visible pores and fine texture, realistic hair strands. ' +
  'It must NOT look illustrated, painted, 3D-rendered, plasticky, airbrushed or ' +
  'over-smoothed. No beauty-filter look. High resolution, crisp focus on the eyes. ' +
  'Tasteful and understated. No text, no watermark.';

export const PHOTO_STUDIO_STYLES = [
  {
    id: 'studio',
    label: '클래식 스튜디오',
    prompt:
      'Clean studio backdrop in warm ivory, soft key light with gentle fill, ' +
      'medium-format camera look, subtle fine grain, quiet confidence.',
  },
  {
    id: 'natural',
    label: '내추럴 데일리',
    prompt:
      'Outdoor daylight on a calm tree-lined street, golden hour, shallow depth of field, ' +
      'relaxed candid posture, effortless natural mood.',
  },
  {
    id: 'business',
    label: '비즈니스 포트레이트',
    prompt:
      'Modern office or hotel lobby softly blurred in the background, attire kept from ' +
      'the source photo or a neutral dark knit, editorial corporate portrait lighting.',
  },
  {
    id: 'film',
    label: '필름 무드',
    prompt:
      '35mm film aesthetic, muted warm palette, soft window light interior, ' +
      'quiet sophisticated atmosphere, analog color grading.',
  },
  {
    id: 'cafe',
    label: '카페 라운지',
    prompt:
      'Warm minimalist cafe or hotel lounge, soft window light, a coffee cup nearby, ' +
      'smart-casual wardrobe, approachable and relaxed mood.',
  },
  {
    id: 'gallery',
    label: '갤러리',
    prompt:
      'Quiet contemporary art gallery, soft diffused lighting, neutral pale walls softly ' +
      'blurred behind, cultured and composed atmosphere.',
  },
  {
    id: 'travel',
    label: '여행 · 야외',
    prompt:
      'Scenic outdoor travel setting such as a seaside promenade or european-style old town, ' +
      'bright natural daylight, relaxed lifestyle mood.',
  },
  {
    id: 'evening',
    label: '와인바 저녁',
    prompt:
      'Intimate evening wine bar, warm dim tungsten light, calm and sophisticated, ' +
      'shallow depth of field with soft background bokeh.',
  },
  {
    id: 'active',
    label: '골프 · 액티브',
    prompt:
      'Bright outdoor sports-club setting such as a golf course or tennis court, tasteful ' +
      'polo or athleisure, healthy energetic mood, clean natural daylight.',
  },
  {
    id: 'rooftop',
    label: '루프탑 야경',
    prompt:
      'Rooftop terrace at dusk with a soft city-skyline bokeh behind, refined evening ' +
      'ambience, gentle warm light.',
  },
] as const;

export type PhotoStudioStyleId = (typeof PHOTO_STUDIO_STYLES)[number]['id'];

/**
 * 기본 생성 세트 — 장면 미선택(구버전 앱 호환) 시, 그리고 모바일 가입화면의
 * 초기 선택값으로 사용한다. 한 장당 생성이 오래 걸려(1~3분) 기본은 2종만 만든다.
 * 더 원하면 사용자가 직접 장면을 추가 선택(최대 PHOTO_STUDIO_MAX_SELECT)할 수 있다.
 */
export const PHOTO_STUDIO_DEFAULT_STYLE_IDS: PhotoStudioStyleId[] = ['studio', 'natural'];

/** 한 번에 생성 가능한 최대 장면 수 (함수 타임아웃·비용 보호). */
export const PHOTO_STUDIO_MAX_SELECT = 5;

/** 선택 id 목록을 유효·중복제거·상한 적용해 실제 생성할 스타일로 해석. 빈 입력은 기본 세트. */
export function resolvePhotoStudioStyles(
  ids?: readonly string[] | null,
): (typeof PHOTO_STUDIO_STYLES)[number][] {
  const wanted = (ids && ids.length ? ids : PHOTO_STUDIO_DEFAULT_STYLE_IDS).filter(
    (v, i, a) => a.indexOf(v) === i,
  );
  const picked = PHOTO_STUDIO_STYLES.filter((s) => wanted.includes(s.id));
  const resolved = picked.length
    ? picked
    : PHOTO_STUDIO_STYLES.filter((s) => PHOTO_STUDIO_DEFAULT_STYLE_IDS.includes(s.id));
  return resolved.slice(0, PHOTO_STUDIO_MAX_SELECT);
}

/**
 * 업로드 원본 최대 크기 (서버·클라이언트 공통 검증).
 * 서버 함수 페이로드 한도(~4.5MB)보다 낮게 잡는다 — 초과분은 플랫폼이 함수 진입 전
 * 막아 불투명한 413 을 내므로, 그 전에 우리 라우트가 깔끔한 too_large 로 거른다.
 * 클라이언트는 업로드 전 1280px 로 다운스케일하므로 실제로는 1MB 미만이다.
 */
export const PHOTO_STUDIO_MAX_BYTES = 4 * 1024 * 1024;

/** 생성 결과 한 장 — OpenAI 직통은 jpeg, OpenRouter 경유는 모델 반환 mime 그대로 */
export interface PhotoStudioImage {
  style: PhotoStudioStyleId;
  b64: string;
  mime: string;
}
