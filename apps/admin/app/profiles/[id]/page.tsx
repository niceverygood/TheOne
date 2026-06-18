import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getManagedMember } from '@theone/db';
import { referralCodeFromSeq, ageFromBirth, VERIFICATION_LABELS } from '@theone/shared';
import { getCurrentOperator, canReview } from '@/lib/operator';
import { StatusBadge, MemberControls } from '../profile-actions';

export const dynamic = 'force-dynamic';

const meta: React.CSSProperties = { fontSize: 11, color: '#8B8378' };
const label: React.CSSProperties = { fontSize: 11, color: '#8B8378', marginBottom: 3 };
const value: React.CSSProperties = { fontSize: 14, color: '#1A1F2E' };

function Field({ k, v }: { k: string; v?: string | number | null }) {
  if (v === null || v === undefined || v === '') return null;
  return (
    <div>
      <div style={label}>{k}</div>
      <div style={value}>{v}</div>
    </div>
  );
}

export default async function MemberDetail({ params }: { params: { id: string } }) {
  const op = await getCurrentOperator();
  const reviewer = canReview(op);
  const m = await getManagedMember(params.id);
  if (!m) notFound();

  const p = m.profile;
  const age = m.birth ? ageFromBirth(m.birth) : null;
  const intro = (p?.introSections ?? null) as { about?: string; idealType?: string } | null;
  const photos = p?.photos ?? [];

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
      <Link href="/profiles" style={{ fontSize: 12.5, color: '#8B8378' }}>
        ← 회원 관리
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginTop: 14,
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 24 }}>
              {m.gender === 'male' ? '남' : '여'}
              {age ? ` · ${age}세` : ''} · {p?.jobDetail || m.jobCategory}
            </h1>
            <StatusBadge status={m.status} />
          </div>
          <div style={{ ...meta, marginTop: 6, fontFamily: 'monospace' }}>
            {referralCodeFromSeq(m.seq)} · {m.email ?? '이메일 없음'} ·{' '}
            {m.createdAt.toISOString().slice(0, 10)}
          </div>
        </div>
        <MemberControls userId={m.id} status={m.status} canReview={reviewer} withDelete />
      </div>

      {/* 사진 */}
      <div style={{ marginTop: 24 }}>
        <div style={label}>사진 {photos.length}장</div>
        {photos.length === 0 ? (
          <p style={meta}>등록된 사진이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
            {photos.map((src: string, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`photo-${i}`}
                style={{
                  width: 200,
                  height: 267,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid #EDE8DE',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 뱃지 */}
      <div style={{ marginTop: 28 }}>
        <div style={label}>인증 뱃지 {m.badges.length}개</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          {m.badges.length === 0 ? (
            <span style={meta}>없음</span>
          ) : (
            m.badges.map((b) => (
              <span
                key={b.type}
                style={{
                  fontSize: 12,
                  color: '#6B8E7F',
                  border: '1px solid #6B8E7F',
                  borderRadius: 2,
                  padding: '3px 9px',
                }}
              >
                {VERIFICATION_LABELS[b.type as keyof typeof VERIFICATION_LABELS]?.kr ?? b.type}
              </span>
            ))
          )}
        </div>
      </div>

      {/* 프로필 필드 */}
      <div
        style={{
          marginTop: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 18,
          borderTop: '1px solid #EDE8DE',
          paddingTop: 24,
        }}
      >
        <Field k="직군" v={m.jobCategory} />
        <Field k="직업 상세" v={p?.jobDetail} />
        <Field k="학교" v={p?.school} />
        <Field k="키" v={p?.height ? `${p.height}cm` : null} />
        <Field k="거주지역" v={p?.residenceRegion ?? p?.region} />
        <Field k="활동지역" v={p?.activityRegion} />
        <Field k="체형" v={p?.bodyType} />
        <Field k="음주 빈도" v={p?.drinkingFrequency} />
        <Field k="음주량" v={p?.drinkingAmount} />
        <Field k="흡연" v={p?.smoking} />
        <Field k="MBTI" v={p?.mbti} />
        <Field k="크레딧" v={m.credit?.balance ?? 0} />
        <Field k="취미" v={p?.hobbies?.length ? p.hobbies.join(', ') : null} />
        <Field
          k="가치관 설문"
          v={p?.surveyAnswers?.length ? `${p.surveyAnswers.length}문항 응답` : '미응답'}
        />
      </div>

      {/* 자기소개 */}
      {(p?.bio || intro?.about || intro?.idealType) && (
        <div style={{ marginTop: 24, borderTop: '1px solid #EDE8DE', paddingTop: 24 }}>
          <Field k="한 줄 소개" v={p?.bio} />
          {intro?.about && (
            <div style={{ marginTop: 14 }}>
              <Field k="자기소개" v={intro.about} />
            </div>
          )}
          {intro?.idealType && (
            <div style={{ marginTop: 14 }}>
              <Field k="이상형" v={intro.idealType} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
