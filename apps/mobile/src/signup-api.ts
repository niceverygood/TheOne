/**
 * 가입/인증 제출 클라이언트 — apps/web 의 /api/signup, /api/verification 호출.
 * 베이스는 EXPO_PUBLIC_API_BASE_URL (미설정 시 server reason 으로 실패 반환).
 */
import type {
  CurationCandidateMeta,
  CurationChemistry,
  CurationRateResult,
  BrowseMembersResult,
  CurationHistoryResult,
  CurationTodayResult,
  IntroSections,
  ManualIdentitySubmitResult,
  ProfileGenerateResult,
  SignupSubmitResult,
  VerificationSubmitResult,
  VerificationType,
} from '@theone/shared';
import { useSignup } from './store';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

/** 보호 API 호출용 Authorization 헤더. 세션 토큰 없으면 빈 객체. */
export function authHeader(): Record<string, string> {
  const token = useSignup.getState().sessionToken;
  return token ? { authorization: `Bearer ${token}` } : {};
}

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

export type LoginResult =
  | {
      ok: true;
      userId: string;
      status: string;
      gender: 'male' | 'female';
      token: string;
      isAdmin?: boolean;
    }
  | { ok: false; reason: 'not_member' | 'suspended' | 'invalid_token' | 'server' };

/**
 * 휴대폰 본인인증 로그인 — KCB/PortOne 결과의 봉인 토큰(idToken)으로 기존 회원 식별.
 * 비밀번호 없이 인증만으로 본인 계정에 진입한다(가입과 동일한 본인인증 재사용).
 */
export async function loginWithIdToken(idToken: string): Promise<LoginResult> {
  if (!API_BASE) return { ok: false, reason: 'server' };
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = (await res.json()) as LoginResult;
    return data;
  } catch {
    return { ok: false, reason: 'server' };
  }
}

/**
 * QA 검수용 남/여 테스트 계정 로그인 — 본인인증 없이 고정 시드 계정 세션 발급.
 * 로그인 화면 하단 안내문 롱프레스 → 숨김 메뉴에서만 호출된다.
 */
export async function testLogin(gender: 'male' | 'female'): Promise<LoginResult> {
  if (!API_BASE) return { ok: false, reason: 'server' };
  try {
    const res = await fetch(`${API_BASE}/api/auth/test-login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gender, secret: 'theone-qa-2026' }),
    });
    const data = (await res.json()) as LoginResult;
    return data;
  } catch {
    return { ok: false, reason: 'server' };
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
export async function fetchTodayCuration(_userId: string): Promise<CurationTodayResult> {
  if (!API_BASE) return { ok: false, reason: 'server', message: 'API 주소가 설정되지 않았습니다.' };
  try {
    const res = await fetch(`${API_BASE}/api/curation/today`, { headers: authHeader() });
    return (await res.json()) as CurationTodayResult;
  } catch {
    return { ok: false, reason: 'server', message: '네트워크 오류가 발생했어요.' };
  }
}

/**
 * 첫인상 별점 제출(1~5) — 3점 이상 = 호감. 응답의 photos 가 새 공개 단계 기준 사진 목록.
 */
export async function rateCuration(logId: string, rating: number): Promise<CurationRateResult> {
  if (!API_BASE) return { ok: false, reason: 'server', message: 'API 주소가 설정되지 않았습니다.' };
  try {
    const res = await fetch(`${API_BASE}/api/curation/rate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader() },
      body: JSON.stringify({ logId, rating }),
    });
    return (await res.json()) as CurationRateResult;
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
export async function fetchReceivedMatches(_userId: string): Promise<ReceivedMatch[]> {
  if (!API_BASE) return [];
  try {
    const res = await fetch(`${API_BASE}/api/match/received`, { headers: authHeader() });
    const d = (await res.json()) as { ok: boolean; matches?: ReceivedMatch[] };
    return d.ok && d.matches ? d.matches : [];
  } catch {
    return [];
  }
}

/** 받은 신청 수락/거절 — 수락 시 conversationId 반환. */
export async function respondToMatch(
  matchId: string,
  _userId: string,
  action: 'accept' | 'decline',
): Promise<{ ok: boolean; status?: 'accepted' | 'declined'; conversationId?: string | null }> {
  if (!API_BASE) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}/api/match/respond`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader() },
      body: JSON.stringify({ matchId, action }),
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
export async function fetchContactStatus(matchId: string, _userId: string): Promise<ContactStatus> {
  if (!API_BASE) return { ok: false };
  try {
    const res = await fetch(
      `${API_BASE}/api/contact/status?matchId=${encodeURIComponent(matchId)}`,
      { headers: authHeader() },
    );
    return (await res.json()) as ContactStatus;
  } catch {
    return { ok: false };
  }
}

/** 연락처 오픈 동의(요청) — 양측 동의 시 상대 번호 공개. */
export async function openContact(matchId: string, _userId: string): Promise<ContactStatus> {
  if (!API_BASE) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}/api/contact/open`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader() },
      body: JSON.stringify({ matchId }),
    });
    return (await res.json()) as ContactStatus;
  } catch {
    return { ok: false };
  }
}

export type ProfileFetchResult =
  | { ok: true; candidate: CurationCandidateMeta; chemistry: CurationChemistry | null }
  | { ok: false; reason?: string };

/** 특정 회원 1명의 프로필 상세 — 큐레이션·인박스에서 받은 candidateId 로 조회. */
export async function fetchProfile(userId: string): Promise<ProfileFetchResult> {
  if (!API_BASE) return { ok: false, reason: 'server' };
  try {
    const res = await fetch(`${API_BASE}/api/profile/${encodeURIComponent(userId)}`, {
      headers: authHeader(),
    });
    return (await res.json()) as ProfileFetchResult;
  } catch {
    return { ok: false, reason: 'server' };
  }
}

export type SendLetterResult =
  | { ok: true; matchId: string; spent: number; free: boolean }
  | { ok: false; reason: string };

/** 만남 신청서 발송 — 크레딧 차감(여성 무료) + Match(pending) 생성. */
export async function sendLetter(
  toId: string,
  letter: string,
  isSuper: boolean,
): Promise<SendLetterResult> {
  if (!API_BASE) return { ok: false, reason: 'server' };
  try {
    const res = await fetch(`${API_BASE}/api/letter/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader() },
      body: JSON.stringify({ toId, letter, isSuper }),
    });
    return (await res.json()) as SendLetterResult;
  } catch {
    return { ok: false, reason: 'server' };
  }
}

/** 크레딧 잔액 조회 — 신청서 작성 화면의 잔액·부족 안내에 사용. */
export async function fetchCreditBalance(): Promise<{ ok: boolean; balance: number }> {
  if (!API_BASE) return { ok: false, balance: 0 };
  try {
    const res = await fetch(`${API_BASE}/api/credits/balance`, { headers: authHeader() });
    const d = (await res.json()) as { ok: boolean; balance?: number };
    return { ok: !!d.ok, balance: d.balance ?? 0 };
  } catch {
    return { ok: false, balance: 0 };
  }
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}
export interface ChatPartner {
  id: string;
  jobCategory: string;
  jobDetail: string | null;
  region: string | null;
  photos: string[];
  badgeCount: number;
}
export type ChatMessagesResult =
  | { ok: true; messages: ChatMessage[]; partner: ChatPartner | null }
  | { ok: false; reason?: string };

/** 채팅 메시지 조회(폴링) — afterId 이후만 받아 누적한다. */
export async function fetchChatMessages(
  matchId: string,
  afterId?: string,
): Promise<ChatMessagesResult> {
  if (!API_BASE) return { ok: false, reason: 'server' };
  try {
    const q = afterId ? `?after=${encodeURIComponent(afterId)}` : '';
    const res = await fetch(`${API_BASE}/api/match/${encodeURIComponent(matchId)}/messages${q}`, {
      headers: authHeader(),
    });
    return (await res.json()) as ChatMessagesResult;
  } catch {
    return { ok: false, reason: 'server' };
  }
}

/** 채팅 메시지 전송. */
export async function sendChatMessage(
  matchId: string,
  text: string,
): Promise<{ ok: boolean; message?: ChatMessage }> {
  if (!API_BASE) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}/api/match/${encodeURIComponent(matchId)}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader() },
      body: JSON.stringify({ text }),
    });
    return (await res.json()) as { ok: boolean; message?: ChatMessage };
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
      headers: { 'content-type': 'application/json', ...authHeader() },
      body: JSON.stringify(args),
    });
    return (await res.json()) as VerificationSubmitResult;
  } catch {
    return { ok: false, reason: 'server', message: '네트워크 오류가 발생했어요.' };
  }
}

// ── 앱 내 관리자 화면(isAdmin 계정 전용) ──────────────────────────────

export interface AdminPendingMember {
  id: string;
  gender: 'male' | 'female';
  jobCategory: string;
  createdAt: string;
  referredBySeq: number | null;
}

/** 가입 심사 대기 목록. */
export async function fetchAdminMembers(): Promise<{ ok: boolean; members: AdminPendingMember[] }> {
  if (!API_BASE) return { ok: false, members: [] };
  try {
    const res = await fetch(`${API_BASE}/api/admin/mobile/members`, { headers: authHeader() });
    const d = (await res.json()) as { ok: boolean; members?: AdminPendingMember[] };
    return { ok: !!d.ok, members: d.members ?? [] };
  } catch {
    return { ok: false, members: [] };
  }
}

/** 가입 심사 승인. */
export async function approveAdminMember(userId: string): Promise<{ ok: boolean }> {
  if (!API_BASE) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}/api/admin/mobile/members/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader() },
      body: JSON.stringify({ userId }),
    });
    return (await res.json()) as { ok: boolean };
  } catch {
    return { ok: false };
  }
}

export interface AdminReportGroup {
  userId: string;
  gender: 'male' | 'female';
  jobCategory: string;
  status: string;
  suspendCount: number;
  count: number;
  categories: string[];
}

/** 미처리 신고 큐(피신고자별 누적). */
export async function fetchAdminReports(): Promise<{ ok: boolean; queue: AdminReportGroup[] }> {
  if (!API_BASE) return { ok: false, queue: [] };
  try {
    const res = await fetch(`${API_BASE}/api/admin/mobile/reports`, { headers: authHeader() });
    const d = (await res.json()) as { ok: boolean; queue?: AdminReportGroup[] };
    return { ok: !!d.ok, queue: d.queue ?? [] };
  } catch {
    return { ok: false, queue: [] };
  }
}

/** 신고 처리 — 일시정지/영구강퇴/복구. */
export async function moderateAdminReport(
  userId: string,
  action: 'suspend' | 'ban' | 'reinstate',
): Promise<{ ok: boolean }> {
  if (!API_BASE) return { ok: false };
  try {
    const res = await fetch(`${API_BASE}/api/admin/mobile/reports/moderate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader() },
      body: JSON.stringify({ userId, action }),
    });
    return (await res.json()) as { ok: boolean };
  } catch {
    return { ok: false };
  }
}

// ── 인증 심사(8종) — 앱 내 관리자 ────────────────────────────────────

export interface AdminVerificationItem {
  id: string;
  type: VerificationType;
  status: 'submitted' | 'reviewing';
  valueTier: string | null;
  gender: 'male' | 'female';
  jobCategory: string;
  submittedAt: string;
  /** SLA 마감(제출 + 24h) */
  slaDueAt: string;
  docLabels: string[];
}

export interface AdminVerificationStats {
  pending: number;
  /** SLA 마감 6h 이내 또는 초과 */
  urgent: number;
  approvedToday: number;
  rejectedToday: number;
}

export interface AdminVerificationDetail extends AdminVerificationItem {
  reviewedAt: string | null;
  rejectReason: string | null;
  /** 승인 시 회원에게 지급되는 크레딧 */
  rewardCredits: number;
  requiredDocs: string[];
  documents: { id: string; label: string; mime: string; size: number; uploadedAt: string }[];
}

const EMPTY_VERIFY_STATS: AdminVerificationStats = {
  pending: 0,
  urgent: 0,
  approvedToday: 0,
  rejectedToday: 0,
};

/** 인증 심사 대기열 + 현황(SLA 임박순). */
export async function fetchAdminVerifications(): Promise<{
  ok: boolean;
  stats: AdminVerificationStats;
  queue: AdminVerificationItem[];
}> {
  if (!API_BASE) return { ok: false, stats: EMPTY_VERIFY_STATS, queue: [] };
  try {
    const res = await fetch(`${API_BASE}/api/admin/mobile/verifications`, {
      headers: authHeader(),
    });
    const d = (await res.json()) as {
      ok: boolean;
      stats?: AdminVerificationStats;
      queue?: AdminVerificationItem[];
    };
    return { ok: !!d.ok, stats: d.stats ?? EMPTY_VERIFY_STATS, queue: d.queue ?? [] };
  } catch {
    return { ok: false, stats: EMPTY_VERIFY_STATS, queue: [] };
  }
}

/** 심사 상세 — 제출 서류 메타. 열람 사실은 서버에서 AccessLog 로 남는다. */
export async function fetchAdminVerificationDetail(
  id: string,
): Promise<AdminVerificationDetail | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/admin/mobile/verifications/${id}`, {
      headers: authHeader(),
    });
    const d = (await res.json()) as { ok: boolean; application?: AdminVerificationDetail };
    return d.ok && d.application ? d.application : null;
  } catch {
    return null;
  }
}

/** 심사 승인/반려. 반려는 표준 사유 코드로 — `other` 만 자유 입력. */
export async function reviewAdminVerification(args: {
  applicationId: string;
  action: 'approve' | 'reject';
  reasonCode?: string;
  reasonText?: string;
}): Promise<{ ok: boolean; rewardCredits?: number; reason?: string }> {
  if (!API_BASE) return { ok: false, reason: 'server' };
  try {
    const res = await fetch(`${API_BASE}/api/admin/mobile/verifications/review`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader() },
      body: JSON.stringify(args),
    });
    return (await res.json()) as { ok: boolean; rewardCredits?: number; reason?: string };
  } catch {
    return { ok: false, reason: 'server' };
  }
}

// ── 카드 도착 푸시 ────────────────────────────────────────────────
/**
 * Expo 푸시 토큰을 서버에 등록 — 12·15·20시 카드 도착 알림 수신용.
 * best-effort: 실패해도 앱 흐름을 막지 않는다(로컬 예약 알림이 보완).
 */
export async function registerPushToken(token: string | null): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}/api/push/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader() },
      body: JSON.stringify({ token }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── 지난 카드 ────────────────────────────────────────────────────
/**
 * 지난 카드 목록(최신순). cursor 는 이전 페이지의 nextCursor.
 * 새 후보를 만들지 않고 이미 소개된 이력만 되짚는다.
 */
export async function fetchCurationHistory(cursor?: string | null): Promise<CurationHistoryResult> {
  if (!API_BASE) return { ok: false, reason: 'server', message: 'API 주소가 설정되지 않았습니다.' };
  try {
    const qs = new URLSearchParams({ limit: '20' });
    if (cursor) qs.set('cursor', cursor);
    const res = await fetch(`${API_BASE}/api/curation/history?${qs.toString()}`, {
      headers: authHeader(),
    });
    return (await res.json()) as CurationHistoryResult;
  } catch {
    return { ok: false, reason: 'server', message: '네트워크 오류가 발생했어요.' };
  }
}

// ── 회원 둘러보기 ─────────────────────────────────────────────────
export interface BrowseQuery {
  cursor?: string | null;
  region?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  verifiedOnly?: boolean;
}

/** 회원 목록(최근 가입순, 커서 페이지네이션). 큐레이션과 별개 탐색 경로. */
export async function fetchBrowseMembers(q: BrowseQuery = {}): Promise<BrowseMembersResult> {
  if (!API_BASE) return { ok: false, reason: 'server', message: 'API 주소가 설정되지 않았습니다.' };
  try {
    const qs = new URLSearchParams({ limit: '20' });
    if (q.cursor) qs.set('cursor', q.cursor);
    if (q.region) qs.set('region', q.region);
    if (q.minAge != null) qs.set('minAge', String(q.minAge));
    if (q.maxAge != null) qs.set('maxAge', String(q.maxAge));
    if (q.verifiedOnly) qs.set('verifiedOnly', '1');
    const res = await fetch(`${API_BASE}/api/members/browse?${qs.toString()}`, {
      headers: authHeader(),
    });
    return (await res.json()) as BrowseMembersResult;
  } catch {
    return { ok: false, reason: 'server', message: '네트워크 오류가 발생했어요.' };
  }
}
