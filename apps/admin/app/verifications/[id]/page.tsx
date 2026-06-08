import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getApplication, recordAccess } from '@theone/db';
import { VERIFICATION_LABELS, VERIFY_REWARD_CREDITS } from '@theone/shared';
import { getCurrentOperator, getClientIp, canReview, operatorRole } from '@/lib/operator';
import { DocViewer } from '@/components/doc-viewer';
import { ReviewPanel } from './review-panel';

export const dynamic = 'force-dynamic';

const meta: React.CSSProperties = { fontSize: 11, color: '#8B8378' };
const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid #F5F1EA',
  fontSize: 13,
};

export default async function ReviewDetail({ params }: { params: { id: string } }) {
  const [op, app] = await Promise.all([getCurrentOperator(), getApplication(params.id)]);
  if (!app) notFound();

  const reviewer = canReview(op);

  // 열람 기록 (privacy-design §2-4): reviewer는 문서 열람, viewer는 메타 열람
  if (op) {
    await recordAccess({
      operatorId: op.id,
      action: reviewer ? 'view_document' : 'view_meta',
      applicationId: app.id,
      targetUserId: app.userId,
      documentId: app.documents[0]?.id,
      ip: getClientIp(),
    });
  }

  const watermark = `${op?.username ?? 'unknown'} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
  const statusKr =
    app.status === 'approved'
      ? '승인'
      : app.status === 'rejected'
        ? '반려'
        : app.status === 'reviewing'
          ? '검토중'
          : '제출됨';

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 80px' }}>
      <Link href="/verifications" style={{ fontSize: 12.5, color: '#8B8378' }}>
        ← 대기열
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: 14,
        }}
      >
        <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 24 }}>
          {VERIFICATION_LABELS[app.type].kr} 인증 심사
        </h1>
        <span style={meta}>{op ? `${op.name} · ${operatorRole(op)}` : '미인증'}</span>
      </div>

      <div
        style={{
          marginTop: 20,
          border: '1px solid #EDE8DE',
          background: '#fff',
          padding: '4px 16px',
        }}
      >
        <div style={row}>
          <span style={meta}>회원</span>
          <span style={{ fontFamily: 'monospace' }}>
            {app.user.gender === 'male' ? '남' : '여'} · {app.user.jobCategory}
          </span>
        </div>
        <div style={row}>
          <span style={meta}>가액 구간</span>
          <span>{app.valueTier ?? '–'}</span>
        </div>
        <div style={row}>
          <span style={meta}>상태</span>
          <span>{statusKr}</span>
        </div>
        <div style={row}>
          <span style={meta}>제출</span>
          <span style={{ fontFamily: 'monospace', fontSize: 11 }}>
            {app.submittedAt.toISOString().slice(0, 16).replace('T', ' ')}
          </span>
        </div>
        <div style={{ ...row, borderBottom: 'none' }}>
          <span style={meta}>SLA 마감</span>
          <span style={{ fontFamily: 'monospace', fontSize: 11 }}>
            {app.slaDueAt.toISOString().slice(0, 16).replace('T', ' ')}
          </span>
        </div>
      </div>

      {app.rejectReason && (
        <p
          style={{
            marginTop: 12,
            fontSize: 12.5,
            color: '#A85547',
            background: '#F5F1EA',
            padding: '10px 12px',
          }}
        >
          이전 반려: {app.rejectReason}
        </p>
      )}

      {/* 서류 뷰어 */}
      <h2 style={{ fontSize: 13, color: '#8B8378', marginTop: 24, marginBottom: 10 }}>
        제출 서류 {app.documents.length}건
      </h2>
      {reviewer ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {app.documents.map((d) => (
            <div key={d.id}>
              <div style={{ ...meta, marginBottom: 6 }}>
                {d.label} · {(d.size / 1024).toFixed(0)} KB · {d.mime}
              </div>
              <DocViewer label={d.label} watermark={watermark} />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 12.5, color: '#8B8378' }}>
          viewer 권한은 서류 메타데이터만 열람할 수 있습니다. (
          {app.documents.map((d) => d.label).join(', ')})
        </p>
      )}

      {(app.status === 'submitted' || app.status === 'reviewing') && (
        <ReviewPanel
          applicationId={app.id}
          canReview={reviewer}
          rewardCredits={VERIFY_REWARD_CREDITS[app.type]}
        />
      )}
    </main>
  );
}
