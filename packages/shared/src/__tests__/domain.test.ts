import { describe, expect, it } from 'vitest';
import { maskExternalContact } from '../masking';
import {
  ageEligible,
  badgeOverlap,
  isEligible,
  pickTodayCuration,
  regionEligible,
  scoreCandidate,
  type Candidate,
} from '../matching';
import { refundableAmount, getPackage, LETTER_COST } from '../credits';

describe('maskExternalContact', () => {
  it('마스킹: 휴대폰 번호', () => {
    const r = maskExternalContact('연락처 010-1234-5678 로 연락주세요');
    expect(r.masked).toBe(true);
    expect(r.kinds).toContain('phone');
    expect(r.text).not.toContain('1234-5678');
  });
  it('마스킹: 카톡 아이디', () => {
    const r = maskExternalContact('카톡 id: minjun92 추가해줘');
    expect(r.masked).toBe(true);
    expect(r.text).not.toContain('minjun92');
  });
  it('마스킹: 전각 숫자 우회', () => {
    const r = maskExternalContact('０１０１２３４５６７８');
    expect(r.masked).toBe(true);
  });
  it('일반 대화는 그대로', () => {
    const r = maskExternalContact('주말에 한남동 갤러리 갈래요?');
    expect(r.masked).toBe(false);
    expect(r.text).toBe('주말에 한남동 갤러리 갈래요?');
  });
});

describe('matching rules', () => {
  it('지역 인접', () => {
    expect(regionEligible('서울', '서울')).toBe(true);
    expect(regionEligible('서울', '경기')).toBe(true);
    expect(regionEligible('서울', '부산')).toBe(false);
  });
  it('나이 ±5', () => {
    expect(ageEligible(32, 37)).toBe(true);
    expect(ageEligible(32, 38)).toBe(false);
  });
  it('뱃지 겹침', () => {
    expect(badgeOverlap(['education', 'wealth'], ['wealth', 'vehicle'])).toBe(1);
  });
  it('하드 필터 + 점수: 같은 지역/뱃지 많은 후보가 우선', () => {
    const viewer: Candidate = { region: '서울', age: 32, badges: ['education', 'wealth'] };
    const near: Candidate = {
      region: '서울',
      age: 31,
      badges: ['education', 'wealth', 'realestate'],
    };
    const far: Candidate = { region: '부산', age: 31, badges: ['education'] };
    const adj: Candidate = { region: '경기', age: 35, badges: ['education'] };
    expect(isEligible(viewer, far)).toBe(false);
    const pick = pickTodayCuration(viewer, [adj, near]);
    expect(pick).toBe(near);
    expect(scoreCandidate(viewer, near)).toBeGreaterThan(scoreCandidate(viewer, adj));
  });
  it('적합 후보 없으면 null', () => {
    const viewer: Candidate = { region: '제주', age: 30, badges: [] };
    expect(pickTodayCuration(viewer, [{ region: '서울', age: 30, badges: [] }])).toBeNull();
  });
});

describe('credits & refund', () => {
  it('패키지 조회 + 신청서 비용', () => {
    expect(getPackage('c50')?.credits).toBe(260);
    expect(LETTER_COST.super).toBe(50);
  });
  it('7일 초과는 환불 0', () => {
    expect(
      refundableAmount({
        paidWon: 50000,
        baseCredits: 260,
        remainingCredits: 260,
        daysSinceCharge: 8,
      }),
    ).toBe(0);
  });
  it('미사용 전액 환불', () => {
    expect(
      refundableAmount({
        paidWon: 50000,
        baseCredits: 260,
        remainingCredits: 260,
        daysSinceCharge: 2,
      }),
    ).toBe(50000);
  });
  it('일부 사용 시 잔여분만', () => {
    // 260 중 60 사용 → 200 환불 대상, 단가 50000/260 ≈ 192.3 → floor(192.3*200)=38461
    expect(
      refundableAmount({
        paidWon: 50000,
        baseCredits: 260,
        remainingCredits: 200,
        daysSinceCharge: 1,
      }),
    ).toBe(38461);
  });
});
