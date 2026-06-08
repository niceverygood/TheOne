'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveManualIdAction, rejectManualIdAction } from './actions';

export function ManualIdActions({
  requestId,
  canReview,
}: {
  requestId: string;
  canReview: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<'idle' | 'rejecting'>('idle');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!canReview) {
    return <span style={{ fontSize: 11.5, color: '#A85547' }}>reviewer 이상 권한 필요</span>;
  }

  const btn: React.CSSProperties = {
    padding: '8px 14px',
    fontSize: 12.5,
    border: '1px solid',
    cursor: 'pointer',
    borderRadius: 2,
  };

  async function approve() {
    setError(null);
    setPending(true);
    try {
      const res = await approveManualIdAction(requestId);
      if (res.ok) router.refresh();
      else setError(res.message);
    } finally {
      setPending(false);
    }
  }

  async function submitReject() {
    setError(null);
    setPending(true);
    try {
      const res = await rejectManualIdAction(requestId, reason);
      if (res.ok) router.refresh();
      else setError(res.message);
    } finally {
      setPending(false);
    }
  }

  if (mode === 'rejecting') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="반려 사유"
          style={{ padding: '7px 9px', border: '1px solid #EDE8DE', fontSize: 12.5, width: 200 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
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
            style={{ ...btn, background: 'transparent', color: '#8B8378', borderColor: '#EDE8DE' }}
          >
            취소
          </button>
        </div>
        {error && <span style={{ color: '#A85547', fontSize: 11.5 }}>{error}</span>}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={approve}
          disabled={pending}
          style={{ ...btn, background: '#6B8E7F', color: '#fff', borderColor: '#6B8E7F' }}
        >
          {pending ? '처리 중…' : '본인확인 완료'}
        </button>
        <button
          onClick={() => setMode('rejecting')}
          disabled={pending}
          style={{ ...btn, background: 'transparent', color: '#A85547', borderColor: '#A85547' }}
        >
          반려
        </button>
      </div>
      {error && <span style={{ color: '#A85547', fontSize: 11.5 }}>{error}</span>}
    </div>
  );
}
