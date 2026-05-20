import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'THE ONE · APPLICATION ONLY';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** 잉크블랙 OG 이미지 — 골드/그라데이션 없이 코너 틱 + 통과율. */
export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0F1014',
        color: '#FAF7F2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 48,
          width: 40,
          height: 40,
          borderTop: '2px solid #B8956A',
          borderLeft: '2px solid #B8956A',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          right: 48,
          width: 40,
          height: 40,
          borderBottom: '2px solid #B8956A',
          borderRight: '2px solid #B8956A',
        }}
      />
      <div style={{ fontSize: 18, letterSpacing: 8, color: '#8B8378' }}>APPLICATION ONLY</div>
      <div style={{ fontSize: 96, fontWeight: 700, marginTop: 16 }}>THE ONE</div>
      <div style={{ fontSize: 24, color: '#B8956A', marginTop: 24 }}>가입 통과율 23%</div>
    </div>,
    { ...size },
  );
}
