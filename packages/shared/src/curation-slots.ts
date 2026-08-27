/**
 * 큐레이션 발송 슬롯 — 하루 3회, 한 번에 한 장.
 *
 * 무한 스와이프를 하지 않는 것이 더원의 방식이므로, 카드는 "오늘 몇 장"이 아니라
 * "정해진 시각에 한 장"으로 도착한다. 기본 12:00 / 15:00 / 20:00 (한국시간).
 *
 * 서버는 UTC 로 돌기 때문에 하루 경계와 슬롯 시각을 모두 KST 기준으로 계산한다.
 * (서버 로컬시간을 쓰면 한국 사용자의 하루가 09:00 에 바뀐다.)
 */

/** 한국 표준시 오프셋(분). KST 는 서머타임이 없어 고정값으로 충분하다. */
const KST_OFFSET_MIN = 9 * 60;
const MS_PER_MIN = 60_000;

/** 기본 슬롯 시각(KST 기준 시). */
export const DEFAULT_CURATION_SLOT_HOURS = [12, 15, 20] as const;

/** 슬롯 한 번에 도착하는 카드 장수. 기본 2장 — 12·15·20시 × 2 = 하루 6장. */
export const DEFAULT_CARDS_PER_SLOT = 2;

/** 슬롯당 장수 정규화 — 1~10 사이 정수만, 벗어나면 기본값. */
export function normalizeCardsPerSlot(v: unknown): number {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) && n >= 1 && n <= 10 ? n : DEFAULT_CARDS_PER_SLOT;
}

/** 슬롯 시각 목록을 정규화 — 0~23 정수만, 오름차순, 중복 제거. */
export function normalizeSlotHours(hours: readonly number[]): number[] {
  const ok = hours.map((h) => Math.trunc(h)).filter((h) => Number.isFinite(h) && h >= 0 && h <= 23);
  return [...new Set(ok)].sort((a, b) => a - b);
}

/** "12,15,20" 형태의 환경변수 파싱. 비었거나 전부 무효면 기본값. */
export function parseSlotHours(raw: string | undefined | null): number[] {
  if (!raw) return [...DEFAULT_CURATION_SLOT_HOURS];
  const parsed = normalizeSlotHours(raw.split(',').map((v) => Number(v.trim())));
  return parsed.length ? parsed : [...DEFAULT_CURATION_SLOT_HOURS];
}

/** now(UTC) 를 KST 벽시계로 옮긴 Date. getHours() 등이 KST 값을 준다. */
function toKstWallClock(now: Date): Date {
  return new Date(now.getTime() + KST_OFFSET_MIN * MS_PER_MIN);
}

/** KST 기준 '오늘 0시'에 해당하는 실제 시각(UTC Date). */
export function kstDayStart(now: Date = new Date()): Date {
  const k = toKstWallClock(now);
  const midnightKstWall = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate());
  return new Date(midnightKstWall - KST_OFFSET_MIN * MS_PER_MIN);
}

/** KST 기준 오늘의 특정 시(hour)에 해당하는 실제 시각(UTC Date). */
export function kstHourToday(hour: number, now: Date = new Date()): Date {
  return new Date(kstDayStart(now).getTime() + hour * 60 * MS_PER_MIN);
}

/**
 * 지금까지 열린 슬롯 수 — 오늘 이 회원이 받을 수 있는 카드의 최대 장수.
 * 12:00 이전이면 0, 12:00~15:00 이면 1, 20:00 이후면 3.
 */
export function releasedSlotCount(
  now: Date = new Date(),
  hours: readonly number[] = DEFAULT_CURATION_SLOT_HOURS,
): number {
  const slots = normalizeSlotHours(hours);
  const day = kstDayStart(now).getTime();
  const minutesIntoDay = (now.getTime() - day) / MS_PER_MIN;
  return slots.filter((h) => minutesIntoDay >= h * 60).length;
}

/**
 * 다음 카드가 도착하는 시각. 오늘 남은 슬롯이 있으면 그 시각,
 * 오늘 다 열렸으면 내일 첫 슬롯.
 */
export function nextSlotAt(
  now: Date = new Date(),
  hours: readonly number[] = DEFAULT_CURATION_SLOT_HOURS,
): Date {
  const slots = normalizeSlotHours(hours);
  if (!slots.length) return new Date(kstDayStart(now).getTime() + 24 * 60 * MS_PER_MIN);
  const day = kstDayStart(now).getTime();
  const minutesIntoDay = (now.getTime() - day) / MS_PER_MIN;
  const upcoming = slots.find((h) => minutesIntoDay < h * 60);
  if (upcoming !== undefined) return new Date(day + upcoming * 60 * MS_PER_MIN);
  return new Date(day + 24 * 60 * MS_PER_MIN + slots[0]! * 60 * MS_PER_MIN);
}

/**
 * 지금까지 열린 카드 장수 — 열린 슬롯 수 × 슬롯당 장수.
 * 12시 전 0장 · 12시 2장 · 15시 4장 · 20시 6장(기본값 기준).
 */
export function releasedCardCount(
  now: Date = new Date(),
  hours: readonly number[] = DEFAULT_CURATION_SLOT_HOURS,
  perSlot: number = DEFAULT_CARDS_PER_SLOT,
): number {
  return releasedSlotCount(now, hours) * normalizeCardsPerSlot(perSlot);
}

/** 슬롯 시각 표기 — "12:00". 화면·푸시 문구에 그대로 쓴다. */
export function slotLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/** 남은 시간 HH:MM — 다음 카드까지의 카운트다운. 음수는 00:00. */
export function countdownTo(target: Date, now: Date = new Date()): string {
  const mins = Math.max(0, Math.floor((target.getTime() - now.getTime()) / MS_PER_MIN));
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}
