/**
 * 가입/인증 제출 클라이언트 — apps/web 의 /api/signup, /api/verification 호출.
 * 베이스는 EXPO_PUBLIC_API_BASE_URL (미설정 시 server reason 으로 실패 반환).
 */
import type {
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
  /** 본인인증 봉인 토큰 (KCB 결과에서 받은 값 그대로) */
  idToken?: string;
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
