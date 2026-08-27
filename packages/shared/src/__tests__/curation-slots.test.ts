import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CARDS_PER_SLOT,
  DEFAULT_CURATION_SLOT_HOURS,
  normalizeCardsPerSlot,
  releasedCardCount,
  countdownTo,
  kstDayStart,
  kstHourToday,
  nextSlotAt,
  parseSlotHours,
  releasedSlotCount,
  slotLabel,
} from '../curation-slots';

/** KST 벽시계 시각을 실제(UTC) Date 로. 2026-08-11 12:00 KST = 03:00Z */
const kst = (h: number, m = 0, day = 11) => new Date(Date.UTC(2026, 7, day, h - 9, m, 0));

describe('큐레이션 슬롯 (12·15·20 KST)', () => {
  it('기본 슬롯은 12·15·20', () => {
    expect([...DEFAULT_CURATION_SLOT_HOURS]).toEqual([12, 15, 20]);
  });

  it('하루 경계는 KST 자정 — 서버가 UTC 라도 한국 날짜로 끊는다', () => {
    // 00:30 KST 는 전날 15:30Z. 그 시점의 '오늘 0시'는 같은 날 KST 자정이어야 한다.
    const at0030 = kst(0, 30);
    expect(kstDayStart(at0030).toISOString()).toBe('2026-08-10T15:00:00.000Z');
    // 23:59 KST 도 같은 날.
    expect(kstDayStart(kst(23, 59)).toISOString()).toBe('2026-08-10T15:00:00.000Z');
  });

  it('열린 슬롯 수: 12시 전 0 · 12시 1 · 15시 2 · 20시 3', () => {
    expect(releasedSlotCount(kst(11, 59))).toBe(0);
    expect(releasedSlotCount(kst(12, 0))).toBe(1);
    expect(releasedSlotCount(kst(14, 59))).toBe(1);
    expect(releasedSlotCount(kst(15, 0))).toBe(2);
    expect(releasedSlotCount(kst(19, 59))).toBe(2);
    expect(releasedSlotCount(kst(20, 0))).toBe(3);
    expect(releasedSlotCount(kst(23, 59))).toBe(3);
  });

  it('자정 직후에는 다시 0장 — 어제 카드가 오늘로 넘어오지 않는다', () => {
    expect(releasedSlotCount(kst(0, 1))).toBe(0);
  });

  it('다음 슬롯 시각', () => {
    expect(nextSlotAt(kst(9, 0)).toISOString()).toBe(kstHourToday(12, kst(9, 0)).toISOString());
    expect(nextSlotAt(kst(13, 0)).toISOString()).toBe(kstHourToday(15, kst(13, 0)).toISOString());
    // 20시 이후면 내일 12시
    expect(nextSlotAt(kst(21, 0)).toISOString()).toBe('2026-08-12T03:00:00.000Z');
  });

  it('카운트다운 HH:MM', () => {
    expect(countdownTo(kst(15, 0), kst(13, 30))).toBe('01:30');
    expect(countdownTo(kst(12, 0), kst(12, 0))).toBe('00:00');
    expect(countdownTo(kst(12, 0), kst(13, 0))).toBe('00:00'); // 지난 시각은 0
  });

  it('환경변수 파싱 — 무효값은 기본값으로', () => {
    expect(parseSlotHours('9,13,18')).toEqual([9, 13, 18]);
    expect(parseSlotHours('20,12,15,12')).toEqual([12, 15, 20]); // 정렬 + 중복 제거
    expect(parseSlotHours('')).toEqual([12, 15, 20]);
    expect(parseSlotHours('abc,99')).toEqual([12, 15, 20]);
    expect(parseSlotHours(undefined)).toEqual([12, 15, 20]);
  });

  it('슬롯 한 번에 2장 — 12시 전 0 · 12시 2 · 15시 4 · 20시 6', () => {
    expect(DEFAULT_CARDS_PER_SLOT).toBe(2);
    expect(releasedCardCount(kst(11, 59))).toBe(0);
    expect(releasedCardCount(kst(12, 0))).toBe(2);
    expect(releasedCardCount(kst(15, 0))).toBe(4);
    expect(releasedCardCount(kst(20, 0))).toBe(6);
    expect(releasedCardCount(kst(23, 59))).toBe(6);
  });

  it('슬롯당 장수는 조정 가능하고, 범위를 벗어나면 기본값', () => {
    expect(releasedCardCount(kst(20, 0), [12, 15, 20], 1)).toBe(3);
    expect(releasedCardCount(kst(20, 0), [12, 15, 20], 3)).toBe(9);
    expect(normalizeCardsPerSlot('2')).toBe(2);
    expect(normalizeCardsPerSlot(0)).toBe(DEFAULT_CARDS_PER_SLOT);
    expect(normalizeCardsPerSlot(99)).toBe(DEFAULT_CARDS_PER_SLOT);
    expect(normalizeCardsPerSlot(undefined)).toBe(DEFAULT_CARDS_PER_SLOT);
  });

  it('슬롯 표기', () => {
    expect(slotLabel(9)).toBe('09:00');
    expect(slotLabel(20)).toBe('20:00');
  });
});
