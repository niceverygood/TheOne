/**
 * Phase 0 운영 콘솔 홈 (스켈레톤).
 * Phase 1: /admin/waitlist (리스트 + CSV 다운로드)
 * Phase 3: 인증 심사 대기열, 워터마크 문서 뷰어, 승인/반려, AccessLog
 */
const queues = [
  { href: '/waitlist', label: '웨이팅리스트', phase: 'Phase 1', ready: true },
  { href: '/funnel', label: '퍼널 분석 (광고 전환)', phase: 'Phase 1', ready: true },
  { href: '/verifications', label: '인증 심사 대기열', phase: 'Phase 3', ready: false },
  { href: '/reports', label: '신고 큐 / 강퇴', phase: 'Phase 5', ready: false },
];

export default function AdminHome() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
      <p
        style={{
          fontSize: 11,
          letterSpacing: '0.18em',
          color: '#8B8378',
          textTransform: 'uppercase',
        }}
      >
        THE ONE · Operations
      </p>
      <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 28, marginTop: 8 }}>
        운영 콘솔
      </h1>
      <div style={{ marginTop: 32, borderTop: '1px solid #EDE8DE' }}>
        {queues.map((q) =>
          q.ready ? (
            <a
              key={q.href}
              href={q.href}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 0',
                borderBottom: '1px solid #EDE8DE',
                textDecoration: 'none',
                color: '#1A1F2E',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 500 }}>{q.label} →</span>
              <span
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#B8956A' }}
              >
                {q.phase}
              </span>
            </a>
          ) : (
            <div
              key={q.href}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 0',
                borderBottom: '1px solid #EDE8DE',
                opacity: 0.5,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 500 }}>{q.label}</span>
              <span
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#B8956A' }}
              >
                {q.phase}
              </span>
            </div>
          ),
        )}
      </div>
    </main>
  );
}
