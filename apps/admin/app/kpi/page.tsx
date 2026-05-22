import { getLaunchKpis } from '@theone/db';

export const dynamic = 'force-dynamic';

const label: React.CSSProperties = { fontSize: 11, color: '#8B8378', letterSpacing: '0.04em' };
const card: React.CSSProperties = {
  border: '1px solid #EDE8DE',
  background: '#fff',
  padding: '16px 18px',
};
const value: React.CSSProperties = {
  fontFamily: "'Noto Serif KR', serif",
  fontSize: 26,
  fontWeight: 700,
  color: '#1A1F2E',
  marginTop: 6,
};

export default async function KpiPage() {
  const k = await getLaunchKpis();
  const won = (n: number) => `${n.toLocaleString()}원`;

  const cards: [string, string, string?][] = [
    ['활동 회원', k.activeUsers.toLocaleString(), `전체 ${k.totalUsers.toLocaleString()}`],
    ['인증 완주율', `${k.verificationCompletionRate}%`, '1종 이상 승인'],
    [
      '첫 매칭까지',
      k.timeToFirstMatchHours == null ? '–' : `${k.timeToFirstMatchHours}h`,
      '중앙값',
    ],
    ['ARPU', won(k.arpu), `매출 ${won(k.revenueWon)}`],
    ['매칭 성사', k.matchesAccepted.toLocaleString(), undefined],
    ['신청서 발송', k.lettersSent.toLocaleString(), undefined],
    ['미처리 신고', k.openReports.toLocaleString(), '/reports'],
  ];

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '48px 24px 80px' }}>
      <p style={{ ...label, textTransform: 'uppercase' }}>THE ONE · Launch KPI</p>
      <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 26, marginTop: 4 }}>출시 KPI</h1>
      <p style={{ ...label, marginTop: 10 }}>
        출시 후 4주 핵심 지표. D1/D7 리텐션 정밀치는 PostHog 참조(ops-runbook.md).
      </p>
      <div
        style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}
      >
        {cards.map(([t, v, sub]) => (
          <div key={t} style={card}>
            <div style={label}>{t}</div>
            <div style={value}>{v}</div>
            {sub && <div style={{ ...label, marginTop: 4 }}>{sub}</div>}
          </div>
        ))}
      </div>
    </main>
  );
}
