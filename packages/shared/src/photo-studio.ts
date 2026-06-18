/**
 * AI 스튜디오 보정 — 사진 1장으로 선택한 장면(기본 2종)의 프로필 사진 생성 (gpt-image-2).
 *
 * 절대 원칙(trust-safety): 동일 인물 유지. 이목구비·골격·피부톤을 바꾸지 않는다.
 * 조명·배경·구도·색감만 스튜디오급으로 올린다. 검증 위원은 원본과 대조한다.
 */

/** 모든 스타일 프롬프트 앞에 붙는 공통 규칙 — 동일 인물 보존 + 실사 품질 + 샷 다양성. */
export const PHOTO_STUDIO_IDENTITY_RULES =
  'Re-photograph this exact person for a premium matchmaking profile. ' +
  "CRITICAL — IDENTITY LOCK: keep the person's face shape, eyes, nose, lips, jawline, " +
  'skin tone, hairstyle and body proportions exactly as in the source photo. Do not ' +
  'beautify, slim, de-age, retouch or alter any facial feature — the result must be ' +
  'instantly recognizable as the same person. ' +
  // 핵심: 포즈/구도/표정/시선/앵글은 장면 지시를 그대로 따른다 — 동일 포즈 복제 금지.
  'COMPOSITION & VARIETY: do NOT copy the source pose. Follow the exact pose, camera ' +
  'angle, crop, gaze direction and expression described in the scene below, so a set of ' +
  'these photos reads like a real, varied photoshoot — never the same frontal chest-up ' +
  'pose merely recolored. Natural relaxed body language; hands may be visible. Vertical 3:4 frame. ' +
  // 실사 강제 — AI 렌더/일러스트 톤 방지(image-2.0 실사 품질 목적).
  'PHOTOREALISM IS MANDATORY: this must look like a real photograph shot on a ' +
  'full-frame DSLR with an 85mm portrait lens, shallow depth of field, true-to-life ' +
  'lighting, natural skin with visible pores and fine texture, realistic hair strands. ' +
  'It must NOT look illustrated, painted, 3D-rendered, plasticky, airbrushed or ' +
  'over-smoothed. No beauty-filter look. High resolution, crisp focus on the eyes. ' +
  'Tasteful and understated. No text, no watermark.';

// 각 스타일 = 장면 + "고유한 샷(포즈·앵글·크롭·시선·표정)". 세트로 찍으면 서로 확연히 다르게.
export const PHOTO_STUDIO_STYLES = [
  {
    id: 'studio',
    label: '클래식 스튜디오',
    prompt:
      'SHOT: seated upright facing the camera, relaxed shoulders, calm closed-mouth ' +
      'confident smile, eye-level, waist-up centered. SCENE: clean warm-ivory studio ' +
      'backdrop, soft key light with gentle fill, medium-format look, subtle fine grain.',
  },
  {
    id: 'natural',
    label: '내추럴 데일리',
    prompt:
      'SHOT: three-quarter turn, walking casually and glancing back toward the camera ' +
      'mid-stride, light natural laugh, looser half-body crop with headroom. SCENE: ' +
      'tree-lined street at golden hour, strong shallow depth of field, effortless mood.',
  },
  {
    id: 'business',
    label: '비즈니스 포트레이트',
    prompt:
      'SHOT: standing tall at a slight angle, one hand in pocket, assured direct gaze, ' +
      'slightly low camera angle, head-and-shoulders. SCENE: modern office or hotel ' +
      'lobby softly blurred, neutral dark knit or crisp shirt, editorial corporate light.',
  },
  {
    id: 'film',
    label: '필름 무드',
    prompt:
      'SHOT: seated by a window in near profile, gaze drifting outside, contemplative ' +
      'unsmiling, off-center tight crop with negative space. SCENE: 35mm film aesthetic, ' +
      'muted warm palette, soft directional window light, analog color grading.',
  },
  {
    id: 'cafe',
    label: '카페 라운지',
    prompt:
      'SHOT: leaning forward on a cafe table with both forearms, hands near a coffee cup, ' +
      'caught mid-laugh looking slightly off-camera, close candid crop. SCENE: warm ' +
      'minimalist cafe, soft window light, smart-casual wardrobe, approachable mood.',
  },
  {
    id: 'gallery',
    label: '갤러리',
    prompt:
      'SHOT: standing side-on viewing artwork, head turned back over the shoulder toward ' +
      'the camera, composed faint smile, three-quarter body. SCENE: quiet contemporary ' +
      'gallery, soft diffused light, pale walls blurred behind, cultured atmosphere.',
  },
  {
    id: 'travel',
    label: '여행 · 야외',
    prompt:
      'SHOT: outdoors looking into the distance away from the camera, chin slightly up, ' +
      'wind lightly in the hair, wide relaxed upper-body framing. SCENE: seaside ' +
      'promenade or old-town street, bright natural daylight, lifestyle travel mood.',
  },
  {
    id: 'evening',
    label: '와인바 저녁',
    prompt:
      'SHOT: seated at a bar in three-quarter turn toward the camera, one hand resting ' +
      'near a wine glass, soft warm intimate smile, close crop. SCENE: dim tungsten ' +
      'light, sophisticated evening ambience, soft background bokeh.',
  },
  {
    id: 'active',
    label: '골프 · 액티브',
    prompt:
      'SHOT: dynamic outdoor moment, mid-motion with hand on hip and weight shifted, ' +
      'bright energetic open smile, eye-level half-body. SCENE: golf course or tennis ' +
      'court, tasteful polo or athleisure, healthy mood, clean natural daylight.',
  },
  {
    id: 'rooftop',
    label: '루프탑 야경',
    prompt:
      'SHOT: leaning forearms on a rooftop railing, upper body turned back toward the ' +
      'camera, relaxed evening calm, waist-up with the skyline behind. SCENE: rooftop ' +
      'terrace at dusk, soft city-skyline bokeh, gentle warm light.',
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
