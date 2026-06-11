/**
 * AI 스튜디오 보정 — 사진 1장으로 스타일 4종 프로필 사진 생성 (gpt-image-2).
 *
 * 절대 원칙(trust-safety): 동일 인물 유지. 이목구비·골격·피부톤을 바꾸지 않는다.
 * 조명·배경·구도·색감만 스튜디오급으로 올린다. 검증 위원은 원본과 대조한다.
 */

/** 모든 스타일 프롬프트 앞에 붙는 공통 규칙 — 동일 인물 보존이 최우선. */
export const PHOTO_STUDIO_IDENTITY_RULES =
  'Re-shoot this exact person as a premium matchmaking profile portrait. ' +
  "CRITICAL: preserve the person's identity — keep face shape, eyes, nose, lips, " +
  'skin tone, hairstyle and body proportions exactly as in the source photo. ' +
  'Do not beautify, slim, retouch or alter any facial feature. The result must be ' +
  'instantly recognizable as the same person. Vertical 3:4 chest-up composition, ' +
  'photorealistic, natural skin texture, tasteful and understated. No text, no watermark.';

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
] as const;

export type PhotoStudioStyleId = (typeof PHOTO_STUDIO_STYLES)[number]['id'];

/** 업로드 원본 최대 크기 (서버·클라이언트 공통 검증) */
export const PHOTO_STUDIO_MAX_BYTES = 8 * 1024 * 1024;

/** 생성 결과 한 장 (b64 는 jpeg) */
export interface PhotoStudioImage {
  style: PhotoStudioStyleId;
  b64: string;
}
