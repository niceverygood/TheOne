/**
 * 가입/인증 제출 클라이언트 — apps/web 의 /api/signup, /api/verification 호출.
 * 베이스는 EXPO_PUBLIC_API_BASE_URL (미설정 시 server reason 으로 실패 반환).
 */
import type {
  CurationTodayResult,
  IntroSections,
  ManualIdentitySubmitResult,
  ProfileGenerateResult,
  SignupSubmitResult,
  VerificationSubmitResult,
  VerificationType,
} from '@theone/shared';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface SubmitSignupArgs {
  gender: 'male' | 'female';
  jobCategory: string;
  birth?: string;
  phone?: string;
  email?: string;
  referralCode?: string;
  photoCount?: number;
  // 가입 설문(Phase 4)
  height?: number;
  residenceRegion?: string;
  activityRegion?: string;
  school?: string;
  hobbies?: string[];
  drinkingFrequency?: string;
  drinkingAmount?: string;
  smoking?: string;
  bodyType?: string;
  /** 가치관 설문 60문항 응답(Likert 1~5) — 매칭 케미 분석 입력 */
  surveyAnswers?: number[];
  introSections?: Partial<IntroSections>;
  /** 본인인증 봉인 토큰 (KCB 결과에서 받은 값 그대로) */
  idToken?: string;
}

export interface GenerateIntroArgs {
  gender: 'male' | 'female';
  jobCategory: string;
  age?: number;
  height?: number;
  residenceRegion?: string;
  activityRegion?: string;
  school?: string;
  hobbies?: string[];
  drinkingFrequency?: string;
  drinkingAmount?: string;
  smoking?: string;
  bodyType?: string;
}

/** AI 자기소개 생성 → 섹션 수신(키 없으면 서버가 템플릿 폴백). */
export async function generateProfileIntro(
  args: GenerateIntroArgs,
): Promise<ProfileGenerateResult> {
  if (!API_BASE) return { ok: false, reason: 'server', message: 'API 주소가 설정되지 않았습니다.' };
  try {
    const res = await fetch(`${API_BASE}/api/profile/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(args),
    });
    return (await res.json()) as ProfileGenerateResult;
  } catch {
    return { ok: false, reason: 'server', message: '네트워크 오류가 발생했어요.' };
  }
}

export interface SubmitManualIdentityArgs {
  name: string;
  phone: string;
  idCardS3Key: string;
  note?: string;
}

/** 본인 명의 아님 — 수동 본인인증 요청 제출 → 운영자 큐로 유입. */
export async function submitManualIdentity(
  args: SubmitManualIdentityArgs,
): Promise<ManualIdentitySubmitResult> {
  if (!API_BASE) return { ok: false, reason: 'server', message: 'API 주소가 설정되지 않았습니다.' };
  try {
    const res = await fetch(`${API_BASE}/api/identity/manual`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(args),
    });
    return (await res.json()) as ManualIdentitySubmitResult;
  } catch {
    return { ok: false, reason: 'server', message: '네트워크 오류가 발생했어요.' };
  }
}

/** 가입(step01~05) 제출 → userId 수신. */
export async function submitSignup(args: SubmitSignupArgs): Promise<SignupSubmitResult> {
  if (!API_BASE) return { ok: false, reason: 'server', message: 'API 주소가 설정되지 않았습니다.' };
  try {
    const res = await fetch(`${API_BASE}/api/signup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(args),
    });
    return (await res.json()) as SignupSubmitResult;
  } catch {
    return { ok: false, reason: 'server', message: '네트워크 오류가 발생했어요.' };
  }
}

/** 오늘의 큐레이션 1명 + 케미(가치관 일치도) 조회. API 미설정 시 server reason. */
export async function fetchTodayCuration(userId: string): Promise<CurationTodayResult> {
  if (!API_BASE) return { ok: false, reason: 'server', message: 'API 주소가 설정되지 않았습니다.' };
  try {
    const res = await fetch(`${API_BASE}/api/curation/today?userId=${encodeURIComponent(userId)}`);
    return (await res.json()) as CurationTodayResult;
  } catch {
    return { ok: false, reason: 'server', message: '네트워크 오류가 발생했어요.' };
  }
}

export interface ReceivedMatch {
  matchId: string;
  letter: string | null;
  isSuper: boolean;
  conversationId: string | null;
  from: {
    jobCategory: string;
    jobDetail: string | null;
    age: number | null;
    region: string | null;
    photos: string[];
    badgeCount: number;
  };
}

/** 받은 만남 신청 목록(대기중) — 인박스. */
export async function fetchReceivedMatches(userId: string): Promise<ReceivedMatch[]> {
  if (!API_BASE) return [];
  try {
    const res = await fetch(`${API_BASE}/api/match/received?userId=${encodeURIComponent(userId)}`);
    const d = (await res.json()) as { ok: boolean; matches?: ReceivedMatch[] };
    return d.ok && d.matches ? d.matches : [];
  } catch {
    return [];
  }
}

/** 받은 신청 수락/거절 — 수락 시 conversationId 반환. */
export async function respondToMatch(
  matchId: string,
  userId: string,
  action: 'accept' | 'decline',
): Promise<{ ok: boolean; status?: 'accepted' | 'declined'; conversationId?: string | null }> {
  if (!API_BASE) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}/api/match/respond`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ matchId, userId, action }),
    });
    return (await res.json()) as {
      ok: boolean;
      status?: 'accepted' | 'declined';
      conversationId?: string | null;
    };
  } catch {
    return { ok: false };
  }
}

export interface ContactStatus {
  ok: boolean;
  state?: 'none' | 'requested_by_me' | 'requested_by_them' | 'opened';
  otherPhone?: string | null;
  cost?: number;
  reason?: string;
}

/** 연락처 오픈 상태 조회. */
export async function fetchContactStatus(matchId: string, userId: string): Promise<ContactStatus> {
  if (!API_BASE) return { ok: false };
  try {
    const res = await fetch(
      `${API_BASE}/api/contact/status?matchId=${encodeURIComponent(matchId)}&userId=${encodeURIComponent(userId)}`,
    );
    return (await res.json()) as ContactStatus;
  } catch {
    return { ok: false };
  }
}

/** 연락처 오픈 동의(요청) — 양측 동의 시 상대 번호 공개. */
export async function openContact(matchId: string, userId: string): Promise<ContactStatus> {
  if (!API_BASE) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}/api/contact/open`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ matchId, userId }),
    });
    return (await res.json()) as ContactStatus;
  } catch {
    return { ok: false };
  }
}

export interface SubmitVerificationArgs {
  userId: string;
  type: VerificationType;
  valueTier?: string;
  documents: { s3Key: string; label: string; mime?: string; size?: number; sha256?: string }[];
}

/** 4종 인증 신청 제출 → applicationId 수신(운영자 심사 대기열로 유입). */
export async function submitVerification(
  args: SubmitVerificationArgs,
): Promise<VerificationSubmitResult> {
  if (!API_BASE) return { ok: false, reason: 'server', message: 'API 주소가 설정되지 않았습니다.' };
  try {
    const res = await fetch(`${API_BASE}/api/verification`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(args),
    });
    return (await res.json()) as VerificationSubmitResult;
  } catch {
    return { ok: false, reason: 'server', message: '네트워크 오류가 발생했어요.' };
  }
}
