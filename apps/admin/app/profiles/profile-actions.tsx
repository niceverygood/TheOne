'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setStatusAction, deleteMemberAction } from './actions';

type Status = 'pending' | 'active' | 'suspended' | 'withdrawn';

const STATUS_LABEL: Record<Status, string> = {
  pending: '대기',
  active: '활성',
  suspended: '정지',
  withdrawn: '탈퇴',
};

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'active'
      ? '#6B8E7F'
      : status === 'suspended'
        ? '#A85547'
        : status === 'pending'
          ? '#B8956A'
          : '#8B8378';
  return (
    <span
      style={{
        fontSize: 11,
        color,
        border: `1px solid ${color}`,
        borderRadius: 2,
        padding: '2px 7px',
        whiteSpace: 'nowrap',
      }}
    >
      {STATUS_LABEL[(status as Status) ?? 'pending'] ?? status}
    </span>
  );
}

export function MemberControls({
  userId,
  status,
  canReview,
  withDelete = false,
}: {
  userId: string;
  status: string;
  canReview: boolean;
  withDelete?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canReview) {
    return <span style={{ fontSize: 11, color: '#A85547' }}>reviewer 권한 필요</span>;
  }

  async function run(fn: () => Promise<{ ok: boolean; message?: string }>, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fn();
      if (res.ok) router.refresh();
      else setError(res.message ?? '실패');
    } finally {
      setBusy(false);
    }
  }

  const btn = (label: string, onClick: () => void, kind: 'sage' | 'terra' | 'mute') => {
    const c = kind === 'sage' ? '#6B8E7F' : kind === 'terra' ? '#A85547' : '#8B8378';
    return (
      <button
        onClick={onClick}
        disabled={busy}
        style={{
          padding: '6px 11px',
          fontSize: 12,
          border: `1px solid ${c}`,
          background: '#fff',
          color: c,
          cursor: busy ? 'default' : 'pointer',
          borderRadius: 2,
          opacity: busy ? 0.5 : 1,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {status !== 'active' &&
          btn('활성화', () => run(() => setStatusAction(userId, 'active')), 'sage')}
        {status !== 'suspended' &&
          btn(
            '정지',
            () => run(() => setStatusAction(userId, 'suspended'), '이 회원을 정지할까요?'),
            'terra',
          )}
        {withDelete &&
          btn(
            '삭제',
            () =>
              run(
                () => deleteMemberAction(userId),
                '영구 삭제합니다. 되돌릴 수 없습니다. 진행할까요?',
              ),
            'terra',
          )}
      </div>
      {error && <span style={{ color: '#A85547', fontSize: 11 }}>{error}</span>}
    </div>
  );
}
