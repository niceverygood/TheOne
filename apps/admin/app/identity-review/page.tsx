import Link from 'next/link';
import { listManualIdReviewQueue, recordAccess } from '@theone/db';
import { getCurrentOperator, getClientIp, canReview, operatorRole } from '@/lib/operator';
import { ManualIdActions } from './review-actions';

export const dynamic = 'force-dynamic';

const meta: React.CSSProperties = { fontSize: 11, color: '#8B8378' };

const STATUS_KR: Record<string, string> = {
  pending: '대기',
  approved: '확인 완료',
  rejected: '반려',
};

export default async function IdentityReview() {
  const op = await getCurrentOperator();
  const reviewer = canReview(op);
  const requests = await listManualIdReviewQueue({ includeResolved: true });

  // 신분증(고유식별정보) 열람 기록 (privacy-design §2-4)
  if (op && requests.length) {
    await recordAccess({ operatorId: op.id, action: 'view_document', ip: getClientIp() });
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 80px' }}>
      <Link href="/" style={{ fontSize: 12.5, color: '#8B8378' }}>
        ← 운영 콘솔
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: 14,
        }}
      >
        <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 24 }}>수동 본인확인</h1>
        <span style={meta}>{op ? `${op.name} · ${operatorRole(op)}` : '미인증'}</span>
      </div>
      <p style={{ ...meta, marginTop: 8, lineHeight: 1.6 }}>
        본인 명의가 아닌 회원의 신분증 확인 요청입니다. 대기 {pendingCount}건. 신분증 사진은 암호화
        저장되며 확인 후 30일 안에 자동 파기됩니다.
      </p>

      <div style={{ marginTop: 24, borderTop: '1px solid #EDE8DE' }}>
        {requests.length === 0 ? (
          <p style={{ ...meta, padding: '32px 0' }}>대기 중인 요청이 없습니다.</p>
        ) : (
          requests.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
                padding: '18px 0',
                borderBottom: '1px solid #EDE8DE',
                opacity: r.status === 'pending' ? 1 : 0.55,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#1A1F2E' }}>
                    {r.phone}
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 10.5,
                      color: r.status === 'pending' ? '#B8956A' : '#8B8378',
                      border: '1px solid currentColor',
                      padding: '2px 6px',
                    }}
                  >
                    {STATUS_KR[r.status] ?? r.status}
                  </span>
                </div>
                <div style={{ ...meta, marginTop: 6 }}>
                  신분증: {reviewer ? r.idCardS3Key : '열람 권한 없음(viewer)'}
                </div>
                {r.note ? <div style={{ ...meta, marginTop: 4 }}>메모: {r.note}</div> : null}
                {r.rejectReason ? (
                  <div style={{ fontSize: 11.5, color: '#A85547', marginTop: 4 }}>
                    반려: {r.rejectReason}
                  </div>
                ) : null}
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10.5,
                    color: '#B5AFA4',
                    marginTop: 6,
                  }}
                >
                  {r.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                  {r.reviewer ? ` · ${r.reviewer.name}` : ''}
                </div>
              </div>
              {r.status === 'pending' ? (
                <ManualIdActions requestId={r.id} canReview={reviewer} />
              ) : null}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
