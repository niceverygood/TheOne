import 'server-only';
import type { Gender } from '@theone/shared';
import { hashCi, isAdultByBirth, type IdentityVerifyResult } from './portone-identity';

/**
 * KCB OkCert3 휴대폰 본인확인 — Next.js ↔ identity-kcb(Java) 중계.
 *
 * KCB 모듈은 상주 Java 서버(services/identity-kcb)에서만 동작한다(Vercel 불가).
 * 이 파일은 그 서버를 서버-투-서버(Bearer)로 호출하는 신뢰 클라이언트다.
 *
 *  - startKcbVerification(): START → { txSeqNo, popupUrl }  (앱/웹이 popupUrl 을 WebView/팝업으로 연다)
 *  - fetchKcbResult(txSeqNo): RESULT 조회 → 신원 확정(성인/CI해시). 원본 CI/DI 는 절대 클라이언트로 내보내지 않는다.
 *
 * KCB_SERVICE_URL / KCB_SHARED_SECRET 미설정 시 mock(성인 통과)으로 동작 — 데모/스토어 심사용.
 */

const SERVICE_URL = process.env.KCB_SERVICE_URL; // 예: https://identity.theone.kr
const SHARED_SECRET = process.env.KCB_SHARED_SECRET ?? '';

export interface KcbStartResult {
  ok: boolean;
  txSeqNo?: string;
  /** 사용자가 WebView/팝업으로 열어야 할 부트스트랩 URL */
  popupUrl?: string;
  reason?: string; // not_configured | start_failed | network
  rsltCd?: string;
}

interface JavaVerifiedIdentity {
  txSeqNo: string;
  name: string;
  birthday: string; // YYYYMMDD
  sexCd: string; // M | F
  ntvFrnrCd: string; // L | F
  telComCd: string; // 01~06
  telNo: string;
  ci: string;
  di: string;
  returnMsg?: string;
}

function bearer(): HeadersInit {
  return { Authorization: `Bearer ${SHARED_SECRET}`, 'content-type': 'application/json' };
}

function mapGender(sexCd?: string): Gender | undefined {
  if (sexCd === 'M') return 'male';
  if (sexCd === 'F') return 'female';
  return undefined;
}

/** KCB 통신사 코드 → 표시명 */
const TELCO: Record<string, string> = {
  '01': 'SKT',
  '02': 'KT',
  '03': 'LGU+',
  '04': '알뜰폰(SKT)',
  '05': '알뜰폰(KT)',
  '06': '알뜰폰(LGU+)',
};

/** YYYYMMDD → YYYY-MM-DD */
function toIsoBirth(yyyymmdd?: string): string | undefined {
  if (!yyyymmdd || yyyymmdd.length !== 8) return undefined;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

/** 본인확인 거래 시작 — Java 서비스의 /kcb/start 호출 */
export async function startKcbVerification(returnMsg?: string): Promise<KcbStartResult> {
  if (!SERVICE_URL || !SHARED_SECRET) {
    // mock — 데모: 가짜 txSeqNo + 자체 안내 페이지 없이 클라이언트가 mock 결과로 진행
    return { ok: true, txSeqNo: `mock-${Date.now()}`, popupUrl: '', reason: 'mock' };
  }
  try {
    const res = await fetch(`${SERVICE_URL}/kcb/start`, {
      method: 'POST',
      headers: bearer(),
      body: JSON.stringify({ returnMsg: returnMsg ?? '' }),
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => ({}))) as Partial<KcbStartResult>;
    if (!res.ok || !data.ok) {
      return { ok: false, reason: 'start_failed', rsltCd: data.rsltCd };
    }
    return { ok: true, txSeqNo: data.txSeqNo, popupUrl: data.popupUrl };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

/** 본인확인 결과 조회 — Java 서비스의 /kcb/result/{txSeqNo} 호출 후 신원 확정 */
export async function fetchKcbResult(txSeqNo: string): Promise<IdentityVerifyResult> {
  if (!SERVICE_URL || !SHARED_SECRET) {
    // mock — portone mock 과 동일 인물/성인 통과
    return {
      ok: true,
      status: 'VERIFIED',
      name: '김민준',
      birth: '1992-03-14',
      gender: 'male',
      phone: '01012345678',
      carrier: 'SKT',
      isForeigner: false,
      isAdult: true,
      ciHash: hashCi('mock-ci-0000'),
      mock: true,
    };
  }
  try {
    const res = await fetch(`${SERVICE_URL}/kcb/result/${encodeURIComponent(txSeqNo)}`, {
      method: 'POST',
      headers: bearer(),
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, status: `http_${res.status}`, mock: false };
    const c = (await res.json()) as JavaVerifiedIdentity;
    const birth = toIsoBirth(c.birthday);
    const isAdult = birth ? isAdultByBirth(birth) : false;
    return {
      ok: true,
      status: 'VERIFIED',
      name: c.name,
      birth,
      gender: mapGender(c.sexCd),
      phone: c.telNo,
      carrier: TELCO[c.telComCd] ?? c.telComCd,
      isForeigner: c.ntvFrnrCd === 'F',
      isAdult,
      // 원본 CI 는 즉시 단방향 해시. di 는 응답에 포함하지 않는다(서버 내부 dedupe 용).
      ciHash: c.ci ? hashCi(c.ci) : undefined,
      mock: false,
    };
  } catch {
    return { ok: false, status: 'error', mock: false };
  }
}
