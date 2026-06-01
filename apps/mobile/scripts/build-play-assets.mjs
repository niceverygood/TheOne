#!/usr/bin/env node
/**
 * Google Play 필수 그래픽 자료 생성.
 *  - 512×512 하이레졸루션 아이콘 (assets/brand/icon.svg 재사용)
 *  - 1024×500 피처 그래픽 (브랜드 톤 신규 SVG)
 * 출력: assets/store/
 *
 * 사용: node scripts/build-play-assets.mjs
 * 의존: sharp (devDep)
 *
 * ⚠️ 텍스트는 시스템 폰트로 렌더된다(한글: Apple SD Gothic Neo 등). 출시 전 디자이너가
 *    Figma에서 다듬는 게 정석이지만, MVP 심사 통과에는 이 자동 생성본으로 충분.
 */
import sharp from 'sharp';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = resolve(root, 'assets/brand');
const outDir = resolve(root, 'assets/store');
// iOS 스크린샷(1284×2778, 2.16:1)은 Play의 "긴 변 ≤ 짧은 변×2" 규칙 위반 →
// 1242×2208(16:9)로 재캔버스. 잉크블랙 배경이라 이음새 없이 letterbox 된다.
const iosShotsDir = resolve(root, 'assets/store-screenshots');
const playShotsDir = resolve(outDir, 'android-screenshots');
const PLAY_W = 1242;
const PLAY_H = 2208;

// 1024×500 피처 그래픽 SVG (잉크블랙 + 샴페인 hairline, 세리프 워드마크)
const featureSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500" width="1024" height="500">
  <rect width="1024" height="500" fill="#0F1014"/>
  <rect x="32" y="32" width="960" height="436" fill="none" stroke="#1F222B" stroke-width="2"/>
  <text x="512" y="150"
        font-family="'Playfair Display','Times New Roman',serif" font-style="italic"
        font-size="30" font-weight="400" letter-spacing="6"
        fill="#B8956A" text-anchor="middle">Application Only</text>
  <text x="512" y="270"
        font-family="'Noto Serif KR','Times New Roman',serif"
        font-size="104" font-weight="500" letter-spacing="28"
        fill="#FAF7F2" text-anchor="middle">THE ONE</text>
  <line x1="462" y1="312" x2="562" y2="312" stroke="#B8956A" stroke-width="2"/>
  <text x="512" y="372"
        font-family="'Noto Serif KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif"
        font-size="30" font-weight="400" letter-spacing="2"
        fill="#FAF7F2" fill-opacity="0.82" text-anchor="middle">검증된 사람만 만나는 인증 기반 매칭</text>
  <text x="512" y="430"
        font-family="'JetBrains Mono','Courier New',monospace"
        font-size="24" font-weight="400" letter-spacing="6"
        fill="#B8956A" text-anchor="middle">PASS RATE  23%</text>
</svg>`;

async function main() {
  await mkdir(outDir, { recursive: true });

  // 512 하이레졸루션 아이콘 (알파 없는 정사각)
  const iconSvg = await readFile(resolve(brandDir, 'icon.svg'));
  const icon = await sharp(iconSvg, { density: 384 })
    .resize(512, 512, { fit: 'contain', background: { r: 15, g: 16, b: 20, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(resolve(outDir, 'play-icon-512.png'), icon);
  console.log(`✓ play-icon-512.png  512×512  ${(icon.length / 1024).toFixed(1)} KB`);

  // 1024×500 피처 그래픽 (density로 선명하게 렌더 후 정확한 치수로 리사이즈)
  const feature = await sharp(Buffer.from(featureSvg), { density: 384 })
    .resize(1024, 500, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(resolve(outDir, 'feature-graphic-1024x500.png'), feature);
  console.log(
    `✓ feature-graphic-1024x500.png  1024×500  ${(feature.length / 1024).toFixed(1)} KB`,
  );

  // Android 호환 스크린샷 (1242×2208, 16:9) — iOS 스크린샷 재캔버스
  await mkdir(playShotsDir, { recursive: true });
  const shots = (await readdir(iosShotsDir)).filter((f) => f.endsWith('.png')).sort();
  for (const f of shots) {
    const buf = await sharp(resolve(iosShotsDir, f))
      .resize(PLAY_W, PLAY_H, { fit: 'contain', background: { r: 15, g: 16, b: 20, alpha: 1 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(resolve(playShotsDir, f), buf);
    console.log(`✓ android-screenshots/${f.padEnd(20)} ${PLAY_W}×${PLAY_H}  ${(buf.length / 1024).toFixed(1)} KB`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
