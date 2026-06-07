import {
  getFunnelOverview,
  getFunnelDaily,
  getFunnelByDimension,
  type FunnelDimension,
} from '@theone/db';
import { FunnelChart } from './funnel-chart';

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

interface DimOption {
  key: string;
  dimension: FunnelDimension;
  label: string;
}
const DEFAULT_DIM: DimOption = { key: 'campaign', dimension: 'utm_campaign', label: '캠페인' };
const DIM_OPTIONS: DimOption[] = [
  DEFAULT_DIM,
  { key: 'source', dimension: 'utm_source', label: '소스' },
  { key: 'content', dimension: 'utm_content', label: '소재(content)' },
  { key: 'medium', dimension: 'utm_medium', label: '매체(medium)' },
];

const DAYS_OPTIONS = [7, 14, 30];

function pct(n: number, d: number): string {
  if (!d) return '–';
  return `${Math.round((n / d) * 1000) / 10}%`;
}

export default async function FunnelPage({
  searchParams,
}: {
  searchParams: { days?: string; dim?: string };
}) {
  const days = DAYS_OPTIONS.includes(Number(searchParams.days)) ? Number(searchParams.days) : 14;
  const dimChoice = DIM_OPTIONS.find((d) => d.key === searchParams.dim) ?? DEFAULT_DIM;

  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // 내일 0시(오늘 포함)
  const from = new Date(to.getTime() - days * 86400000);

  const [overview, daily, byDimension] = await Promise.all([
    getFunnelOverview({ from, to }),
    getFunnelDaily({ from, to }),
    getFunnelByDimension({ from, to, dimension: dimChoice.dimension }),
  ]);

  // 퍼널 단계 — 방문 대비 막대 폭
  const stages = [
    {
      name: '방문 (page_view)',
      count: overview.pageView,
      step: null as string | null,
      color: '#8B8378',
    },
    {
      name: '폼 노출 (waitlist_view)',
      count: overview.waitlistView,
      step: pct(overview.waitlistView, overview.pageView),
      color: '#B8956A',
    },
    {
      name: '폼 시작 (waitlist_start)',
      count: overview.waitlistStart,
      step: pct(overview.waitlistStart, overview.waitlistView),
      color: '#6B8E7F',
    },
    {
      name: '가입 (waitlist_success)',
      count: overview.waitlistSuccess,
      step: pct(overview.waitlistSuccess, overview.waitlistStart),
      color: '#1A1F2E',
    },
  ];
  const maxCount = Math.max(overview.pageView, 1);

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <p style={{ ...label, textTransform: 'uppercase' }}>THE ONE · Operations</p>
          <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 26, marginTop: 4 }}>
            퍼널 분석
          </h1>
        </div>
        {/* 기간 선택 */}
        <div style={{ display: 'flex', gap: 6 }}>
          {DAYS_OPTIONS.map((d) => (
            <a
              key={d}
              href={`/funnel?days=${d}&dim=${dimChoice.key}`}
              style={{
                fontSize: 12.5,
                padding: '8px 14px',
                textDecoration: 'none',
                border: '1px solid #1A1F2E',
                color: d === days ? '#FAF7F2' : '#1A1F2E',
                background: d === days ? '#1A1F2E' : 'transparent',
              }}
            >
              {d}일
            </a>
          ))}
        </div>
      </div>

      {/* KPI 카드 */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 28 }}
      >
        <div style={card}>
          <div style={label}>방문(고유)</div>
          <div style={value}>{overview.pageView.toLocaleString()}</div>
        </div>
        <div style={card}>
          <div style={label}>가입 완료</div>
          <div style={value}>{overview.waitlistSuccess.toLocaleString()}</div>
        </div>
        <div style={card}>
          <div style={label}>전체 전환율</div>
          <div style={{ ...value, color: '#6B8E7F' }}>{overview.overallCvr}%</div>
        </div>
        <div style={card}>
          <div style={label}>중복 / 오류</div>
          <div style={{ ...value, fontSize: 20 }}>
            {overview.waitlistDuplicate.toLocaleString()} /{' '}
            {overview.waitlistError.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 퍼널 단계 막대 */}
      <div style={{ ...card, marginTop: 16, padding: '20px 18px' }}>
        <div style={{ ...label, marginBottom: 14 }}>전환 퍼널 ({days}일, 고유 방문자 기준)</div>
        {stages.map((s) => (
          <div key={s.name} style={{ marginBottom: 12 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              <span style={{ color: '#1A1F2E' }}>{s.name}</span>
              <span style={{ color: '#8B8378', fontFamily: 'JetBrains Mono, monospace' }}>
                {s.count.toLocaleString()}
                {s.step ? `  ·  ${s.step}` : ''}
              </span>
            </div>
            <div style={{ background: '#F5F1EA', height: 18 }}>
              <div
                style={{
                  width: `${Math.max((s.count / maxCount) * 100, s.count > 0 ? 1.5 : 0)}%`,
                  height: '100%',
                  background: s.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 일별 추이 */}
      <div style={{ ...card, marginTop: 16, padding: '20px 18px' }}>
        <div style={{ ...label, marginBottom: 10 }}>일별 단계 추이</div>
        <FunnelChart data={daily} />
      </div>

      {/* 차원별 분해 */}
      <div style={{ marginTop: 28, display: 'flex', gap: 6 }}>
        {DIM_OPTIONS.map((d) => (
          <a
            key={d.key}
            href={`/funnel?days=${days}&dim=${d.key}`}
            style={{
              fontSize: 12.5,
              padding: '7px 14px',
              textDecoration: 'none',
              border: '1px solid #EDE8DE',
              color: d.key === dimChoice.key ? '#FAF7F2' : '#1A1F2E',
              background: d.key === dimChoice.key ? '#B8956A' : 'transparent',
            }}
          >
            {d.label}
          </a>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          border: '1px solid #EDE8DE',
          background: '#fff',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr>
              <th style={th}>{dimChoice.label}</th>
              <th style={{ ...th, textAlign: 'right' }}>방문</th>
              <th style={{ ...th, textAlign: 'right' }}>폼 노출</th>
              <th style={{ ...th, textAlign: 'right' }}>폼 시작</th>
              <th style={{ ...th, textAlign: 'right' }}>가입</th>
              <th style={{ ...th, textAlign: 'right' }}>전환율</th>
            </tr>
          </thead>
          <tbody>
            {byDimension.length === 0 ? (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: '#8B8378' }} colSpan={6}>
                  데이터가 없습니다. (광고 트래픽 유입 후 표시)
                </td>
              </tr>
            ) : (
              byDimension.map((r) => (
                <tr key={r.dimension}>
                  <td style={td}>{r.dimension}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>
                    {r.pageView.toLocaleString()}
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>
                    {r.waitlistView.toLocaleString()}
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>
                    {r.waitlistStart.toLocaleString()}
                  </td>
                  <td
                    style={{ ...td, textAlign: 'right', fontFamily: 'monospace', color: '#1A1F2E' }}
                  >
                    {r.waitlistSuccess.toLocaleString()}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: 'right',
                      fontFamily: 'monospace',
                      color: '#6B8E7F',
                    }}
                  >
                    {r.cvr}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p style={{ ...label, marginTop: 10 }}>
        고유 방문자(visitor_id) 기준 · 전환 단계는 서버 기록(위변조 방지) · (direct)=광고 파라미터
        없음
      </p>
    </main>
  );
}
