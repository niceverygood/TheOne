'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveMemberAction } from './actions';

export function ApproveButton({ userId, canReview }: { userId: string; canReview: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canReview) {
    return <span style={{ fontSize: 11.5, color: '#A85547' }}>reviewer 이상 권한 필요</span>;
  }

  async function approve() {
    setError(null);
    setPending(true);
    try {
      const res = await approveMemberAction(userId);
      if (res.ok) router.refresh();
      else setError(res.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
      <button
        onClick={approve}
        disabled={pending}
        style={{
          padding: '8px 14px',
          fontSize: 12.5,
          border: '1px solid #6B8E7F',
          background: '#6B8E7F',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: 2,
        }}
      >
        {pending ? '처리 중…' : '심사 통과(활성화)'}
      </button>
      {error && <span style={{ color: '#A85547', fontSize: 11.5 }}>{error}</span>}
    </div>
  );
}
