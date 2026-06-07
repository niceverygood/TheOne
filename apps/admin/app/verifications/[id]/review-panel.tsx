'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { REJECT_REASONS, type RejectReasonCode } from '@theone/shared';
import { approveAction, rejectAction } from '../actions';

export function ReviewPanel({
  applicationId,
  canReview,
}: {
  applicationId: string;
  canReview: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<'idle' | 'rejecting'>('idle');
  const [reasonCode, setReasonCode] = useState<RejectReasonCode>(REJECT_REASONS[0].code);
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!canReview) {
    return (
      <p style={{ fontSize: 12.5, color: '#A85547', marginTop: 16 }}>
        reviewer 이상 권한이 있어야 승인/반려할 수 있습니다. (현재 viewer)
      </p>
    );
  }

  const selected = REJECT_REASONS.find((r) => r.code === reasonCode)!;

  async function approve() {
    setError(null);
    setPending(true);
    try {
      const res = await approveAction(applicationId);
      if (res.ok) router.push('/verifications');
      else setError(res.message);
    } finally {
      setPending(false);
    }
  }

  async function submitReject() {
    setError(null);
    const reason =
      reasonCode === 'other' ? customReason : `${selected.label} — ${selected.message}`;
    setPending(true);
    try {
      const res = await rejectAction(applicationId, reason);
      if (res.ok) router.push('/verifications');
      else setError(res.message);
    } finally {
      setPending(false);
    }
  }

  const btn: React.CSSProperties = {
    padding: '11px 18px',
    fontSize: 13,
    border: '1px solid',
    cursor: 'pointer',
    borderRadius: 2,
  };

  return (
    <div style={{ marginTop: 24, borderTop: '1px solid #EDE8DE', paddingTop: 20 }}>
      {mode === 'idle' ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={approve}
            disabled={pending}
            style={{ ...btn, background: '#6B8E7F', color: '#fff', borderColor: '#6B8E7F' }}
          >
            {pending ? '처리 중…' : '승인 · 뱃지 부여'}
          </button>
          <button
            onClick={() => setMode('rejecting')}
            disabled={pending}
            style={{ ...btn, background: 'transparent', color: '#A85547', borderColor: '#A85547' }}
          >
            반려
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 11, color: '#8B8378', marginBottom: 8 }}>반려 사유</p>
          <select
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value as RejectReasonCode)}
            style={{
              width: '100%',
              padding: '9px 10px',
              border: '1px solid #EDE8DE',
              fontSize: 13,
            }}
          >
            {REJECT_REASONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
          {reasonCode === 'other' ? (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="상세 사유 입력"
              rows={3}
              style={{
                width: '100%',
                marginTop: 8,
                padding: 10,
                border: '1px solid #EDE8DE',
                fontSize: 13,
              }}
            />
          ) : (
            <p
              style={{
                fontSize: 12.5,
                color: '#1A1F2E',
                marginTop: 8,
                background: '#F5F1EA',
                padding: '10px 12px',
              }}
            >
              {selected.message}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              onClick={submitReject}
              disabled={pending}
              style={{ ...btn, background: '#A85547', color: '#fff', borderColor: '#A85547' }}
            >
              {pending ? '처리 중…' : '반려 확정'}
            </button>
            <button
              onClick={() => setMode('idle')}
              disabled={pending}
              style={{
                ...btn,
                background: 'transparent',
                color: '#8B8378',
                borderColor: '#EDE8DE',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
      {error && <p style={{ color: '#A85547', fontSize: 12, marginTop: 10 }}>{error}</p>}
    </div>
  );
}
