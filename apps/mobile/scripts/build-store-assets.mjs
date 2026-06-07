#!/usr/bin/env node
/**
 * 두 앱스토어(Apple App Store / Google Play) 제출용 그래픽 자료를 한 번에 생성.
 * 기존 소스 재사용:
 *   - assets/brand/icon.svg            → 앱 아이콘 (Apple 1024, Google 512)
 *   - assets/store-screenshots/*.png   → iPhone 6.5"(1284×2778) 원본 스크린샷 5장
 *                                        (scripts/build-screenshots.mjs 가 목업에서 캡처한 것)
 * 출력: assets/store-assets/{apple,google}/...  (스토어별·규격별 폴더로 정리)
 *
 * 사용: node scripts/build-store-assets.mjs
 * 의존: sharp (devDep) — Playwright/Chromium 불필요(기존 스크린샷에서 파생)
 *
 * 규격 근거:
 *   Apple : 마케팅 아이콘 1024×1024(알파/투명 금지), iPhone 6.7"=1290×2796, 6.5"=1284×2778
 *   Google: 고해상도 아이콘 512×512, 피처그래픽 1024×500, 폰 스크린샷 9:16(1080×1920)
 *           ※ Play는 "긴 변 ≤ 짧은 변×2" 규칙 → 원본 2.16:1 을 9:16 캔버스로 letterbox
 */
import sharp from 'sharp';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = resolve(root, 'assets/brand');
const shotsDir = resolve(root, 'assets/store-screenshots');
const outDir = resolve(root, 'assets/store-assets');
const INK = { r: 15, g: 16, b: 20, alpha: 1 }; // 잉크블랙 — letterbox 이음새 없음

// 1024×500 피처 그래픽 (build-play-assets.mjs 와 동일 톤)
const featureSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500" width="1024" height="500">
  <rect width="1024" height="500" fill="#0F1014"/>
  <rect x="32" y="32" width="960" height="436" fill="none" stroke="#1F222B" stroke-width="2"/>
  <text x="512" y="150" font-family="'Playfair Display','Times New Roman',serif" font-style="italic"
        font-size="30" font-weight="400" letter-spacing="6" fill="#B8956A" text-anchor="middle">Application Only</text>
  <text x="512" y="270" font-family="'Noto Serif KR','Times New Roman',serif"
        font-size="104" font-weight="500" letter-spacing="28" fill="#FAF7F2" text-anchor="middle">THE ONE</text>
  <line x1="462" y1="312" x2="562" y2="312" stroke="#B8956A" stroke-width="2"/>
  <text x="512" y="372" font-family="'Noto Serif KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif"
        font-size="30" font-weight="400" letter-spacing="2" fill="#FAF7F2" fill-opacity="0.82" text-anchor="middle">검증된 사람만 만나는 인증 기반 매칭</text>
  <text x="512" y="430" font-family="'JetBrains Mono','Courier New',monospace"
        font-size="24" font-weight="400" letter-spacing="6" fill="#B8956A" text-anchor="middle">PASS RATE  23%</text>
</svg>`;

// SVG → 정사각 아이콘 PNG (alpha 옵션)
async function iconPng(svgBuf, size, { alpha }) {
  let img = sharp(svgBuf, { density: 384 }).resize(size, size, { fit: 'contain', background: INK });
  if (!alpha) img = img.flatten({ background: INK }); // Apple: 알파 제거
  return img.png({ compressionLevel: 9 }).toBuffer();
}

// 스크린샷을 목표 캔버스로 재배치 (잉크블랙 letterbox, 알파 제거)
async function shotPng(srcPath, w, h) {
  return sharp(srcPath)
    .resize(w, h, { fit: 'contain', background: INK })
    .flatten({ background: INK })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const kb = (b) => `${(b.length / 1024).toFixed(1)} KB`;

async function main() {
  const iconSvg = await readFile(resolve(brandDir, 'icon.svg'));
  const shots = (await readdir(shotsDir)).filter((f) => f.endsWith('.png')).sort();
  if (!shots.length) throw new Error('assets/store-screenshots 에 원본 스크린샷이 없습니다. 먼저 build-screenshots 실행.');

  // ── Apple App Store ─────────────────────────────────────────
  const apple67 = resolve(outDir, 'apple/iphone-6.7_1290x2796');
  const apple65 = resolve(outDir, 'apple/iphone-6.5_1284x2778');
  await mkdir(apple67, { recursive: true });
  await mkdir(apple65, { recursive: true });

  const appleIcon = await iconPng(iconSvg, 1024, { alpha: false });
  await writeFile(resolve(outDir, 'apple/AppIcon-1024.png'), appleIcon);
  console.log(`✓ apple/AppIcon-1024.png            1024×1024 (no-alpha)  ${kb(appleIcon)}`);

  for (const f of shots) {
    const a = await shotPng(resolve(shotsDir, f), 1290, 2796);
    await writeFile(resolve(apple67, f), a);
    const b = await shotPng(resolve(shotsDir, f), 1284, 2778);
    await writeFile(resolve(apple65, f), b);
  }
  console.log(`✓ apple/iphone-6.7_1290x2796/*.png   ${shots.length}장  1290×2796`);
  console.log(`✓ apple/iphone-6.5_1284x2778/*.png   ${shots.length}장  1284×2778`);

  // ── Google Play ────────────────────────────────────────────
  const gPhone = resolve(outDir, 'google/phone_1080x1920');
  await mkdir(gPhone, { recursive: true });

  const playIcon = await iconPng(iconSvg, 512, { alpha: false });
  await writeFile(resolve(outDir, 'google/play-icon-512.png'), playIcon);
  console.log(`✓ google/play-icon-512.png          512×512  ${kb(playIcon)}`);

  const feature = await sharp(Buffer.from(featureSvg), { density: 384 })
    .resize(1024, 500, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(resolve(outDir, 'google/feature-graphic-1024x500.png'), feature);
  console.log(`✓ google/feature-graphic-1024x500.png 1024×500  ${kb(feature)}`);

  for (const f of shots) {
    const g = await shotPng(resolve(shotsDir, f), 1080, 1920);
    await writeFile(resolve(gPhone, f), g);
  }
  console.log(`✓ google/phone_1080x1920/*.png       ${shots.length}장  1080×1920`);

  console.log(`\n완료 → assets/store-assets/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
