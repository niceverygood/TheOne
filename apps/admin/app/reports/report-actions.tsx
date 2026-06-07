'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { moderateAction } from './actions';

export function ReportActions({ userId, status }: { userId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run(action: 'suspend' | 'ban' | 'reinstate') {
    setErr(null);
    setPending(true);
    try {
      const res = await moderateAction(userId, action);
      if (res.ok) router.refresh();
      else setErr(res.message);
    } finally {
      setPending(false);
    }
  }

  const btn = (bg: string): React.CSSProperties => ({
    padding: '7px 12px',
    fontSize: 12,
    border: `1px solid ${bg}`,
    color: bg === 'transparent' ? '#8B8378' : '#fff',
    backgroundColor: bg,
    cursor: 'pointer',
    borderRadius: 2,
    opacity: pending ? 0.5 : 1,
  });

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {status !== 'suspended' && status !== 'withdrawn' && (
        <button disabled={pending} onClick={() => run('suspend')} style={btn('#B8956A')}>
          일시정지
        </button>
      )}
      <button disabled={pending} onClick={() => run('ban')} style={btn('#A85547')}>
        영구강퇴
      </button>
      {status !== 'active' && (
        <button disabled={pending} onClick={() => run('reinstate')} style={btn('transparent')}>
          복구
        </button>
      )}
      {err && <span style={{ color: '#A85547', fontSize: 11 }}>{err}</span>}
    </div>
  );
}
