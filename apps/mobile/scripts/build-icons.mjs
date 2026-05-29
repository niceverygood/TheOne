#!/usr/bin/env node
/**
 * 브랜드 SVG를 PNG로 변환. assets/brand/*.svg → assets/*.png
 *
 * 사용: node scripts/build-icons.mjs
 * 의존: sharp (devDep)
 *
 * SVG 텍스트 렌더링은 시스템에 폰트가 설치돼 있어야 정확하게 나옴. 운영 출시 전 디자이너가
 * Figma에서 다듬는 게 정석이지만, MVP는 이 자동 생성본으로도 심사 통과에 무리 없음.
 */
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = resolve(root, 'assets/brand');
const outDir = resolve(root, 'assets');

async function render(svgName, outName, size, opts = {}) {
  const svg = await readFile(resolve(brandDir, svgName));
  const pipeline = sharp(svg, { density: 384 }).resize(size, size, {
    fit: 'contain',
    background: opts.bg ?? { r: 15, g: 16, b: 20, alpha: 1 },
  });
  const buf = await pipeline.png({ compressionLevel: 9 }).toBuffer();
  const out = resolve(outDir, outName);
  await writeFile(out, buf);
  console.log(`✓ ${outName}  ${size}×${size}  ${(buf.length / 1024).toFixed(1)} KB`);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // iOS/공통 앱 아이콘 (알파 없는 정사각)
  await render('icon.svg', 'icon.png', 1024);

  // Android 적응형 foreground (안전영역 안에만 그림 + 알파 배경)
  await render('adaptive-foreground.svg', 'adaptive-icon.png', 1024, {
    bg: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  // 스플래시 (cover 모드 — 정사각 2400 큰 캔버스)
  await render('splash.svg', 'splash.png', 2400);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
