import { describe, expect, it } from 'vitest';
import { maskExternalContact } from '../masking';
import {
  ageEligible,
  badgeOverlap,
  isEligible,
  matchReasons,
  pickTodayCuration,
  regionEligible,
  scoreCandidate,
  type Candidate,
} from '../matching';
import { refundableAmount, getPackage, LETTER_COST } from '../credits';
import { VERIFY_REWARD_CREDITS, VERIFICATION_LABELS, REQUIRED_DOCS } from '../verification';
import { verificationTypeSchema, signupInputSchema } from '../schemas';
import { referralCodeFromSeq, referralSeqFromCode } from '../referral';

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

describe('matchReasons (큐레이션 사유)', () => {
  it('같은 지역·비슷한 나이·뱃지 겹침 → 문장 3개, 숫자 점수 비노출', () => {
    const rs = matchReasons(
      { region: '서울', age: 34, badges: ['education', 'job'] },
      { region: '서울', age: 32, badges: ['education', 'job', 'wealth'] },
    );
    expect(rs).toHaveLength(3);
    expect(rs[0]).toContain('같은 생활권');
    expect(rs.join('')).toContain('학력');
    for (const r of rs) expect(r).not.toMatch(/\d+%|점/);
  });
  it('인접 지역·뱃지 무겹침이면 후보 뱃지 수 기반 문구', () => {
    const rs = matchReasons(
      { region: '서울', age: 30, badges: [] },
      { region: '경기', age: 34, badges: ['education', 'wealth', 'realestate'] },
    );
    expect(rs.some((r) => r.includes('생활권이 가까워'))).toBe(true);
    expect(rs.some((r) => r.includes('3종 인증'))).toBe(true);
  });
  it('근거 없으면 빈 배열(억지 사유 생성 금지)', () => {
    const rs = matchReasons(
      { region: '서울', age: 30, badges: [] },
      { region: '부산', age: 45, badges: [] },
    );
    expect(rs).toHaveLength(0);
  });
});

describe('credits & refund', () => {
  it('패키지 조회 + 신청서 비용', () => {
    expect(getPackage('c180')?.credits).toBe(180);
    expect(getPackage('c180')?.appleProductId).toBe('kr.theone.app.c180');
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

describe('verification (8종 + 보상)', () => {
  const ALL_TYPES = verificationTypeSchema.options;

  it('인증 타입은 8종', () => {
    expect(ALL_TYPES).toHaveLength(8);
    expect(ALL_TYPES).toContain('income');
    expect(ALL_TYPES).toContain('family_wealth');
  });

  it('모든 타입에 라벨·서류·보상이 정의됨', () => {
    for (const t of ALL_TYPES) {
      expect(VERIFICATION_LABELS[t]?.kr).toBeTruthy();
      expect(REQUIRED_DOCS[t]?.length).toBeGreaterThan(0);
      expect(VERIFY_REWARD_CREDITS[t]).toBeGreaterThan(0);
    }
  });

  it('보상은 타입별 차등 (집안자산/명성이 가장 높음)', () => {
    expect(VERIFY_REWARD_CREDITS.education).toBe(30);
    expect(VERIFY_REWARD_CREDITS.income).toBe(50);
    expect(VERIFY_REWARD_CREDITS.family_wealth).toBe(80);
    expect(VERIFY_REWARD_CREDITS.reputation).toBe(80);
  });
});

describe('referral code', () => {
  it('seq ↔ code 라운드트립', () => {
    for (const seq of [1, 42, 142, 9999, 100000]) {
      expect(referralSeqFromCode(referralCodeFromSeq(seq))).toBe(seq);
    }
  });
  it('소문자·공백 허용', () => {
    const code = referralCodeFromSeq(142);
    expect(referralSeqFromCode(`  ${code.toLowerCase()} `)).toBe(142);
  });
  it('형식/체크섬 위반은 null', () => {
    expect(referralSeqFromCode('THE-0142-XX')).toBeNull(); // tail 불일치
    expect(referralSeqFromCode('NOPE')).toBeNull();
    expect(referralSeqFromCode('THE-0000-2')).toBeNull(); // seq 0
  });
});

describe('signupInputSchema', () => {
  const base = { gender: 'male' as const, jobCategory: 'finance' };

  it('사진 2장 미만은 거부', () => {
    expect(signupInputSchema.safeParse({ ...base, photoCount: 1 }).success).toBe(false);
    expect(signupInputSchema.safeParse({ ...base, photoCount: 2 }).success).toBe(true);
  });

  it('프로필 상세 필드를 수용', () => {
    const r = signupInputSchema.safeParse({
      ...base,
      photoCount: 2,
      height: 178,
      residenceRegion: 'seoul',
      hobbies: ['travel', 'golf'],
      introSections: { about: '안녕하세요' },
    });
    expect(r.success).toBe(true);
  });
});
