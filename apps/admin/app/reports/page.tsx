import { listReportQueue, AUTO_SUSPEND_THRESHOLD } from '@theone/db';
import { getCurrentOperator, operatorRole } from '@/lib/operator';
import { ReportActions } from './report-actions';

export const dynamic = 'force-dynamic';

const CATEGORY_KR: Record<string, string> = {
  fraud: '사기·금전요구',
  harassment: '성희롱·외설',
  external_contact: '외부 연락 유도',
  inappropriate_photo: '부적절한 사진',
  abuse: '비속어·모욕',
  impersonation: '사칭·가짜 프로필',
  no_show: '노쇼·약속위반',
  other: '기타',
};
const STATUS_KR: Record<string, string> = {
  active: '활동',
  suspended: '정지',
  withdrawn: '강퇴',
  pending: '대기',
};

const label: React.CSSProperties = { fontSize: 11, color: '#8B8378', letterSpacing: '0.04em' };

export default async function ReportsPage() {
  const [op, queue] = await Promise.all([getCurrentOperator(), listReportQueue()]);

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '48px 24px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <p style={{ ...label, textTransform: 'uppercase' }}>THE ONE · Trust &amp; Safety</p>
          <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 26, marginTop: 4 }}>
            신고 큐
          </h1>
        </div>
        <span style={label}>{op ? `${op.name} · ${operatorRole(op)}` : '미인증'}</span>
      </div>
      <p style={{ ...label, marginTop: 10 }}>
        누적 {AUTO_SUSPEND_THRESHOLD}회 미처리 신고 시 자동 일시정지. 누적순 정렬.
      </p>

      <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        {queue.length === 0 ? (
          <div
            style={{
              border: '1px solid #EDE8DE',
              background: '#fff',
              padding: 24,
              textAlign: 'center',
              color: '#8B8378',
              fontSize: 13,
            }}
          >
            미처리 신고가 없습니다.
          </div>
        ) : (
          queue.map((row) => (
            <div
              key={row.user.id}
              style={{ border: '1px solid #EDE8DE', background: '#fff', padding: 18 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {row.user.gender === 'male' ? '남' : '여'} · {row.user.jobCategory}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: row.user.status === 'active' ? '#6B8E7F' : '#A85547',
                        border: '1px solid currentColor',
                        padding: '1px 6px',
                        borderRadius: 2,
                      }}
                    >
                      {STATUS_KR[row.user.status] ?? row.user.status}
                    </span>
                    {row.user.suspendCount > 0 && (
                      <span style={{ fontSize: 10, color: '#8B8378' }}>
                        정지이력 {row.user.suspendCount}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Noto Serif KR', serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: row.count >= AUTO_SUSPEND_THRESHOLD ? '#A85547' : '#1A1F2E',
                      marginTop: 6,
                    }}
                  >
                    신고 {row.count}건
                  </div>
                </div>
                <ReportActions userId={row.user.id} status={row.user.status} />
              </div>
              <div
                style={{
                  marginTop: 12,
                  borderTop: '1px solid #F5F1EA',
                  paddingTop: 10,
                  display: 'grid',
                  gap: 6,
                }}
              >
                {row.reports.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
                  >
                    <span style={{ color: '#1A1F2E' }}>
                      {CATEGORY_KR[r.category] ?? r.category}
                      {r.detail ? ` · ${r.detail}` : ''}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#8B8378' }}>
                      {r.createdAt.toISOString().slice(0, 10)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
