import { getWaitlistStats, listWaitlist } from '@theone/db';
import { MALE_JOB_CATEGORIES, FEMALE_JOB_CATEGORIES } from '@theone/shared';
import { TrendChart } from './trend-chart';

export const dynamic = 'force-dynamic';

const JOB_LABEL = new Map<string, string>(
  [...MALE_JOB_CATEGORIES, ...FEMALE_JOB_CATEGORIES].map((c) => [c.id, c.kr]),
);
const jobLabel = (id: string) => JOB_LABEL.get(id) ?? id;

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

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: { job?: string; utm?: string };
}) {
  const [stats, rows] = await Promise.all([
    getWaitlistStats(),
    listWaitlist({ jobCategory: searchParams.job, utmSource: searchParams.utm }),
  ]);

  const ratio =
    stats.total > 0
      ? `${Math.round((stats.male / stats.total) * 100)} : ${Math.round((stats.female / stats.total) * 100)}`
      : '–';

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <p style={{ ...label, textTransform: 'uppercase' }}>THE ONE · Operations</p>
          <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 26, marginTop: 4 }}>
            웨이팅리스트
          </h1>
        </div>
        <a
          href="/waitlist/export"
          style={{
            fontSize: 12.5,
            border: '1px solid #1A1F2E',
            color: '#1A1F2E',
            padding: '9px 16px',
            textDecoration: 'none',
          }}
        >
          CSV 다운로드
        </a>
      </div>

      {/* 카드 4 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginTop: 28,
        }}
      >
        <div style={card}>
          <div style={label}>총 등록</div>
          <div style={value}>{stats.total.toLocaleString()}</div>
        </div>
        <div style={card}>
          <div style={label}>어제 등록</div>
          <div style={value}>{stats.yesterday.toLocaleString()}</div>
        </div>
        <div style={card}>
          <div style={label}>성비 (남:여)</div>
          <div style={value}>{ratio}</div>
        </div>
        <div style={card}>
          <div style={label}>최다 직군</div>
          <div style={{ ...value, fontSize: 20 }}>
            {stats.topJobCategory ? jobLabel(stats.topJobCategory.jobCategory) : '–'}
          </div>
        </div>
      </div>

      {/* 추이 차트 */}
      <div style={{ ...card, marginTop: 16, padding: '20px 18px' }}>
        <div style={{ ...label, marginBottom: 10 }}>최근 14일 일별 등록</div>
        <TrendChart data={stats.daily} />
      </div>

      {/* 필터 */}
      <form style={{ marginTop: 28, display: 'flex', gap: 8, alignItems: 'center' }}>
        <select
          name="job"
          defaultValue={searchParams.job ?? ''}
          style={{ fontSize: 12.5, padding: '8px 10px', border: '1px solid #EDE8DE' }}
        >
          <option value="">전체 직군</option>
          {[...new Set([...MALE_JOB_CATEGORIES, ...FEMALE_JOB_CATEGORIES].map((c) => c.id))].map(
            (id) => (
              <option key={id} value={id}>
                {jobLabel(id)}
              </option>
            ),
          )}
        </select>
        <input
          name="utm"
          placeholder="utm_source 필터"
          defaultValue={searchParams.utm ?? ''}
          style={{ fontSize: 12.5, padding: '8px 10px', border: '1px solid #EDE8DE' }}
        />
        <button
          type="submit"
          style={{
            fontSize: 12.5,
            padding: '8px 16px',
            background: '#1A1F2E',
            color: '#FAF7F2',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          적용
        </button>
      </form>

      {/* 테이블 */}
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
              <th style={th}>#</th>
              <th style={th}>이메일</th>
              <th style={th}>성별</th>
              <th style={th}>직군</th>
              <th style={th}>초대코드</th>
              <th style={th}>UTM</th>
              <th style={th}>등록일</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: '#8B8378' }} colSpan={7}>
                  등록 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.seq}>
                  <td style={{ ...td, fontFamily: 'monospace' }}>{r.seq}</td>
                  <td style={td}>{r.email}</td>
                  <td style={td}>{r.gender === 'male' ? '남' : '여'}</td>
                  <td style={td}>{jobLabel(r.jobCategory)}</td>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>
                    {r.referralCode ?? '–'}
                  </td>
                  <td style={{ ...td, fontSize: 11, color: '#8B8378' }}>{r.utmSource ?? '–'}</td>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>
                    {r.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p style={{ ...label, marginTop: 10 }}>최신순 · 최대 500건 · CSV는 ip_hash·UA 제외</p>
    </main>
  );
}
