import Link from 'next/link';
import { listReviewQueue, getQueueStats } from '@theone/db';
import { VERIFICATION_LABELS, slaRemaining } from '@theone/shared';
import { getCurrentOperator, operatorRole } from '@/lib/operator';

export const dynamic = 'force-dynamic';

const card: React.CSSProperties = {
  border: '1px solid #EDE8DE',
  padding: '16px 18px',
  background: '#fff',
};
const label: React.CSSProperties = { fontSize: 11, color: '#8B8378', letterSpacing: '0.04em' };
const value: React.CSSProperties = {
  fontFamily: "'Noto Serif KR', serif",
  fontSize: 26,
  fontWeight: 700,
  color: '#1A1F2E',
  marginTop: 6,
};
const th: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  color: '#8B8378',
  fontWeight: 500,
  padding: '10px 12px',
  borderBottom: '1px solid #EDE8DE',
};
const td: React.CSSProperties = {
  fontSize: 12.5,
  color: '#1A1F2E',
  padding: '10px 12px',
  borderBottom: '1px solid #F5F1EA',
};

export default async function VerificationsQueue() {
  const op = await getCurrentOperator();
  const [stats, queue] = await Promise.all([getQueueStats(), listReviewQueue()]);

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <p style={{ ...label, textTransform: 'uppercase' }}>THE ONE · Verification Review</p>
          <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 26, marginTop: 4 }}>
            인증 심사 대기열
          </h1>
        </div>
        <span style={{ ...label }}>
          {op ? `${op.name} · ${operatorRole(op)}` : '미인증 운영자'}
        </span>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 28 }}
      >
        <div style={card}>
          <div style={label}>대기</div>
          <div style={value}>{stats.pending}</div>
        </div>
        <div style={{ ...card, borderColor: stats.urgent > 0 ? '#A85547' : '#EDE8DE' }}>
          <div style={label}>SLA 임박/초과</div>
          <div style={{ ...value, color: stats.urgent > 0 ? '#A85547' : '#1A1F2E' }}>
            {stats.urgent}
          </div>
        </div>
        <div style={card}>
          <div style={label}>오늘 승인</div>
          <div style={value}>{stats.approvedToday}</div>
        </div>
        <div style={card}>
          <div style={label}>오늘 반려</div>
          <div style={value}>{stats.rejectedToday}</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          border: '1px solid #EDE8DE',
          background: '#fff',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr>
              <th style={th}>인증</th>
              <th style={th}>회원</th>
              <th style={th}>가액구간</th>
              <th style={th}>서류</th>
              <th style={th}>상태</th>
              <th style={th}>SLA</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: '#8B8378' }} colSpan={7}>
                  대기 중인 신청이 없습니다.
                </td>
              </tr>
            ) : (
              queue.map((a) => {
                const rem = slaRemaining(a.slaDueAt);
                return (
                  <tr key={a.id}>
                    <td style={td}>{VERIFICATION_LABELS[a.type].kr}</td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>
                      {a.user.gender === 'male' ? '남' : '여'} · {a.user.jobCategory}
                    </td>
                    <td style={td}>{a.valueTier ?? '–'}</td>
                    <td style={td}>{a.documents.length}건</td>
                    <td style={td}>{a.status === 'reviewing' ? '검토중' : '제출됨'}</td>
                    <td
                      style={{
                        ...td,
                        color: rem.urgent ? '#A85547' : '#8B8378',
                        fontFamily: 'monospace',
                        fontSize: 11,
                      }}
                    >
                      {rem.text}
                    </td>
                    <td style={td}>
                      <Link
                        href={`/verifications/${a.id}`}
                        style={{ color: '#B8956A', fontSize: 12 }}
                      >
                        심사 →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
