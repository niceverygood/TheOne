import Link from 'next/link';
import { listPendingMembers } from '@theone/db';
import { referralCodeFromSeq, REFERRAL_REWARD } from '@theone/shared';
import { getCurrentOperator, canReview, operatorRole } from '@/lib/operator';
import { ApproveButton } from './member-actions';

export const dynamic = 'force-dynamic';

const meta: React.CSSProperties = { fontSize: 11, color: '#8B8378' };

export default async function Members() {
  const op = await getCurrentOperator();
  const reviewer = canReview(op);
  const members = await listPendingMembers();

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
        <h1 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 24 }}>가입 심사</h1>
        <span style={meta}>{op ? `${op.name} · ${operatorRole(op)}` : '미인증'}</span>
      </div>
      <p style={{ ...meta, marginTop: 8, lineHeight: 1.6 }}>
        심사 대기(pending) {members.length}명. 통과 시 회원이 활성화되고, 추천인이 있으면{' '}
        {REFERRAL_REWARD.signupApprovedCredits}크레딧이 자동 지급됩니다.
      </p>

      <div style={{ marginTop: 24, borderTop: '1px solid #EDE8DE' }}>
        {members.length === 0 ? (
          <p style={{ ...meta, padding: '32px 0' }}>대기 중인 회원이 없습니다.</p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
                padding: '18px 0',
                borderBottom: '1px solid #EDE8DE',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>
                    {m.gender === 'male' ? '남' : '여'} · {m.jobCategory}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#B8956A' }}>
                    {referralCodeFromSeq(m.seq)}
                  </span>
                </div>
                <div style={{ ...meta, marginTop: 6 }}>
                  추천인:{' '}
                  {m.referredBy ? (
                    <span style={{ color: '#6B8E7F', fontFamily: 'monospace' }}>
                      {referralCodeFromSeq(m.referredBy.seq)}
                    </span>
                  ) : (
                    '없음'
                  )}
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10.5,
                    color: '#B5AFA4',
                    marginTop: 6,
                  }}
                >
                  {m.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                </div>
              </div>
              <ApproveButton userId={m.id} canReview={reviewer} />
            </div>
          ))
        )}
      </div>
    </main>
  );
}
