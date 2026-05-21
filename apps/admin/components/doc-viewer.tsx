'use client';

import { useEffect, useRef } from 'react';

/**
 * 인증 서류 뷰어 — 워터마크(운영자 ID + 시각) 강제, 다운로드·우클릭·드래그 차단
 * (verification-sop §5-1 / privacy-design §2-4).
 * 실제 이미지/PDF는 presigned URL로 로드(여기서는 placeholder 박스).
 */
export function DocViewer({ label, watermark }: { label: string; watermark: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const block = (e: Event) => e.preventDefault();
    el.addEventListener('contextmenu', block);
    el.addEventListener('dragstart', block);
    return () => {
      el.removeEventListener('contextmenu', block);
      el.removeEventListener('dragstart', block);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        border: '1px solid #EDE8DE',
        background: '#F5F1EA',
        height: 360,
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* 서류 placeholder */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8B8378',
          fontSize: 13,
        }}
      >
        {label} · 보안 뷰어 (다운로드·우클릭 차단)
      </div>
      {/* 워터마크 타일 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent 0 120px, rgba(168,85,71,0.04) 120px 240px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          gap: 0,
          opacity: 0.5,
        }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            style={{
              transform: 'rotate(-30deg)',
              color: 'rgba(26,31,46,0.18)',
              fontFamily: 'monospace',
              fontSize: 11,
              padding: '24px 28px',
              whiteSpace: 'nowrap',
            }}
          >
            {watermark}
          </span>
        ))}
      </div>
    </div>
  );
}
