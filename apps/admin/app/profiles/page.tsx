import Link from 'next/link';
import { listManagedMembers } from '@theone/db';
import { referralCodeFromSeq, ageFromBirth } from '@theone/shared';
import { getCurrentOperator, canReview, operatorRole } from '@/lib/operator';
import { StatusBadge, MemberControls } from './profile-actions';

export const dynamic = 'force-dynamic';

const meta: React.CSSProperties = { fontSize: 11, color: '#8B8378' };
type Status = 'pending' | 'active' | 'suspended' | 'withdrawn';

const FILTERS: { key: string; label: string; status?: Status }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '활성', status: 'active' },
  { key: 'pending', label: '대기', status: 'pending' },
  { key: 'suspended', label: '정지', status: 'suspended' },
  { key: 'withdrawn', label: '탈퇴', status: 'withdrawn' },
];

export default async function Profiles({
  searchParams,
}: {
  searchParams: { status?: string; gender?: string };
}) {
  const op = await getCurrentOperator();
  const reviewer = canReview(op);
  const statusFilter = FILTERS.find((f) => f.key === searchParams.status)?.status;
  const genderFilter =
    searchParams.gender === 'male' || searchParams.gender === 'female'
      ? searchParams.gender
      : undefined;
  const members = await listManagedMembers({ status: statusFilter, gender: genderFilter });

  return (
    <main style={{ maxWidth: 940, margin: '0 auto', padding: '48px 24px 80px' }}>
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
        <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 24 }}>회원 관리</h1>
        <span style={meta}>{op ? `${op.name} · ${operatorRole(op)}` : '미인증'}</span>
      </div>
      <p style={{ ...meta, marginTop: 8 }}>
        총 {members.length}명. 카드를 클릭하면 상세·사진을 봅니다.
      </p>

      {/* 필터 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => {
          const active = (searchParams.status ?? 'all') === f.key;
          const qs = new URLSearchParams();
          if (f.key !== 'all') qs.set('status', f.key);
          if (genderFilter) qs.set('gender', genderFilter);
          return (
            <Link
              key={f.key}
              href={`/profiles${qs.toString() ? `?${qs}` : ''}`}
              style={{
                fontSize: 12,
                padding: '5px 11px',
                borderRadius: 2,
                textDecoration: 'none',
                border: '1px solid #EDE8DE',
                background: active ? '#1A1F2E' : '#fff',
                color: active ? '#FAF7F2' : '#1A1F2E',
              }}
            >
              {f.label}
            </Link>
          );
        })}
        <span style={{ width: 1, background: '#EDE8DE', margin: '0 4px' }} />
        {[
          { key: undefined, label: '남녀' },
          { key: 'male', label: '남' },
          { key: 'female', label: '여' },
        ].map((g) => {
          const active = genderFilter === g.key;
          const qs = new URLSearchParams();
          if (searchParams.status && searchParams.status !== 'all')
            qs.set('status', searchParams.status);
          if (g.key) qs.set('gender', g.key);
          return (
            <Link
              key={g.label}
              href={`/profiles${qs.toString() ? `?${qs}` : ''}`}
              style={{
                fontSize: 12,
                padding: '5px 11px',
                borderRadius: 2,
                textDecoration: 'none',
                border: '1px solid #EDE8DE',
                background: active ? '#B8956A' : '#fff',
                color: active ? '#fff' : '#1A1F2E',
              }}
            >
              {g.label}
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 24, borderTop: '1px solid #EDE8DE' }}>
        {members.length === 0 ? (
          <p style={{ ...meta, padding: '32px 0' }}>해당하는 회원이 없습니다.</p>
        ) : (
          members.map((m) => {
            const photo = m.profile?.photos?.[0];
            const age = m.birth ? ageFromBirth(m.birth) : null;
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 0',
                  borderBottom: '1px solid #EDE8DE',
                }}
              >
                <Link href={`/profiles/${m.id}`} style={{ flexShrink: 0 }}>
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt=""
                      style={{
                        width: 56,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: '1px solid #EDE8DE',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 56,
                        height: 72,
                        borderRadius: 2,
                        border: '1px solid #EDE8DE',
                        background: '#F3EFE7',
                      }}
                    />
                  )}
                </Link>
                <Link
                  href={`/profiles/${m.id}`}
                  style={{ flex: 1, textDecoration: 'none', color: '#1A1F2E', minWidth: 0 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>
                      {m.gender === 'male' ? '남' : '여'}
                      {age ? ` · ${age}세` : ''} · {m.profile?.jobDetail || m.jobCategory}
                    </span>
                    <StatusBadge status={m.status} />
                  </div>
                  <div style={{ ...meta, marginTop: 5 }}>
                    {m.profile?.region ?? '지역 미상'}
                    {' · 뱃지 '}
                    {m._count.badges}개{' · '}
                    <span style={{ fontFamily: 'monospace', color: '#B8956A' }}>
                      {referralCodeFromSeq(m.seq)}
                    </span>
                  </div>
                </Link>
                <MemberControls userId={m.id} status={m.status} canReview={reviewer} />
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
