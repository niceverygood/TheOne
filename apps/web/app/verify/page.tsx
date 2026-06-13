import type { Metadata } from 'next';
import { prisma, getUserVerifications } from '@theone/db';
import { VERIFICATION_LABELS, type VerificationType } from '@theone/shared';

export const dynamic = 'force-dynamic';

// 내부 인증 현황(실데이터) 화면 — 색인 금지.
export const metadata: Metadata = {
  title: '인증 현황',
  robots: { index: false, follow: false },
};

const TYPES: VerificationType[] = ['education', 'wealth', 'vehicle', 'realestate'];

type Pill = { bg: string; fg: string; txt: string };
const NONE_PILL: Pill = { bg: 'transparent', fg: '#8B8378', txt: '미인증' };
const badge = (state: string): Pill => {
  const map: Record<string, Pill> = {
    approved: { bg: '#6B8E7F', fg: '#FAF7F2', txt: '승인됨' },
    reviewing: { bg: 'transparent', fg: '#B8956A', txt: '심사중' },
    submitted: { bg: 'transparent', fg: '#B8956A', txt: '제출됨' },
    rejected: { bg: 'transparent', fg: '#A85547', txt: '반려' },
    none: NONE_PILL,
  };
  return map[state] ?? NONE_PILL;
};

async function loadDemo() {
  try {
    const user = await prisma.user.findFirst({
      where: { status: 'active' },
      orderBy: { createdAt: 'asc' },
    });
    if (!user) return null;
    const v = await getUserVerifications(user.id);
    return { user, ...v };
  } catch {
    return null; // DB 미연결(데모 빌드)
  }
}

export default async function VerifyHub() {
  const data = await loadDemo();
  const statusByType = new Map<string, string>();
  if (data) {
    for (const a of data.applications)
      if (!statusByType.has(a.type)) statusByType.set(a.type, a.status);
    for (const b of data.badges) statusByType.set(b.type, 'approved');
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FAF7F2', color: '#1A1F2E' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '64px 24px 80px' }}>
        <p
          style={{
            fontFamily: 'var(--font-sans-en)',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#8B8378',
          }}
        >
          Verifications
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif-kr)',
            fontSize: 27,
            fontWeight: 700,
            marginTop: 8,
          }}
        >
          추가 인증
        </h1>
        <p style={{ fontSize: 13, color: '#8B8378', marginTop: 8, lineHeight: 1.6 }}>
          인증할수록 신뢰도가 올라갑니다. 관리자가 직접 검토하며, 매칭 상대에게는 뱃지만 노출됩니다.
        </p>

        <div style={{ marginTop: 24, borderTop: '1px solid #EDE8DE' }}>
          {TYPES.map((t) => {
            const st = statusByType.get(t) ?? 'none';
            const b = badge(st);
            return (
              <div
                key={t}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 0',
                  borderBottom: '1px solid #EDE8DE',
                }}
              >
                <div>
                  <div
                    style={{ fontFamily: 'var(--font-sans-en)', fontSize: 11, color: '#8B8378' }}
                  >
                    {VERIFICATION_LABELS[t].en}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>
                    {VERIFICATION_LABELS[t].kr}
                  </div>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: b.bg,
                    border: `1px solid ${b.fg}`,
                    color: b.fg,
                    padding: '5px 11px',
                    borderRadius: 2,
                    fontFamily: 'monospace',
                    fontSize: 11,
                  }}
                >
                  {b.txt}
                </span>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 11.5, color: '#8B8378', marginTop: 24, lineHeight: 1.6 }}>
          {data
            ? `데모: ${data.user.email ?? data.user.id} 기준 현황입니다.`
            : 'DB 연결 후 시드 사용자 기준 현황이 표시됩니다.'}
          <br />
          실제 서류 제출은 회원 본인인증(Phase 4) 연결 후 활성화됩니다. 업로드는 presigned URL로
          S3에 직접 전송되어 KMS 암호화 저장되며, 검토 완료 30일 후 자동 파기됩니다.
        </p>
      </div>
    </main>
  );
}
