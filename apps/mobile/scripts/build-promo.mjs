#!/usr/bin/env node
/**
 * App Store / Google Play 소개(프로모) 이미지 5장 생성.
 *
 * build-screenshots.mjs 가 만든 순수 디바이스 목업(assets/store-screenshots/*.png)을
 * 잉크블랙 캔버스 위에 얹고, 상단에 캡션(에디토리얼 헤드라인 + 서브카피)을 합성한다.
 * store-listing.md §3 의 5장 캡션 매핑을 따른다.
 *
 * 출력: 1290×2796 PNG (App Store 6.9"/6.7" · Google Play phone 모두 허용 규격).
 *
 * 디자인 원칙(CLAUDE.md): 잉크블랙 #0F1014 · 아이보리 · 뮤트 샴페인.
 *   헤드라인 Noto Serif KR / 본문 Pretendard. 골드 그라데이션·하트·그림자 금지.
 *
 * 사용: node scripts/build-promo.mjs
 * 의존: @resvg/resvg-js, sharp (devDep)
 *   Noto Serif KR(Bold) OTF 는 없으면 자동 캐시 다운로드(.cache/fonts).
 */
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { get } from 'node:https';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = resolve(root, 'assets/store-screenshots');
const outDir = resolve(root, 'assets/store-promo');
const fontDir = resolve(root, 'assets/fonts');
const cacheDir = resolve(root, '.cache/fonts');

// ─── 캔버스 / 레이아웃 ────────────────────────────────────────────────
const W = 1290;
const H = 2796;
const ML = 112; // 좌측 거터
const DEV_W = 940; // 디바이스 목업 너비
const DEV_TOP = 724; // 디바이스 상단 y

const INK = '#0F1014';
const IVORY = '#FAF7F2';
const CHAMPAGNE = '#B8956A';
const GRAY = '#B5AFA4';
const HAIR = '#2A2D36';

// ─── 슬라이드 정의 (store-listing.md §3) ─────────────────────────────
const SLIDES = [
  {
    src: '1-splash.png',
    out: '1-the-one.png',
    eyebrow: 'THE ONE · APPLICATION ONLY',
    head: ['인생에 한 번뿐인', '매칭'],
    sub: '심사를 통과한 23%만 입회합니다',
  },
  {
    src: '2-verifications.png',
    out: '2-verified.png',
    eyebrow: 'VERIFIED · 인증 4종',
    head: ['학력·재산·차량', '부동산까지 검증'],
    sub: '운영자가 직접 검토해 뱃지를 부여합니다',
  },
  {
    src: '3-curation.png',
    out: '3-curation.png',
    eyebrow: 'EVERY DAY · 오늘의 큐레이션',
    head: ['매일 단 한 명을', '정성껏 추천'],
    sub: '가치관 60문항 기반, 하루 한 분 큐레이션',
  },
  {
    src: '4-letter.png',
    out: '4-letter.png',
    eyebrow: 'SINCERITY · 만남 신청서',
    head: ['가벼운 호감 대신', '진심을 씁니다'],
    sub: '신청서를 써서 마음을 전하는 만남',
  },
  {
    src: '5-chemistry.png',
    out: '5-chemistry.png',
    eyebrow: 'CHEMISTRY · 케미 리포트',
    head: ['가치관이 얼마나', '맞는지 본다'],
    sub: '결혼관·라이프스타일·감정 케미 분석',
  },
];

const SERIF_URL =
  'https://github.com/notofonts/noto-cjk/raw/main/Serif/SubsetOTF/KR/NotoSerifKR-Bold.otf';

function escapeXml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c],
  );
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function download(url, dest, redirects = 0) {
  return new Promise((res, rej) => {
    get(url, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        if (redirects > 5) return rej(new Error('too many redirects'));
        r.resume();
        return res(download(r.headers.location, dest, redirects + 1));
      }
      if (r.statusCode !== 200) return rej(new Error(`HTTP ${r.statusCode} for ${url}`));
      const f = createWriteStream(dest);
      r.pipe(f);
      f.on('finish', () => f.close(() => res()));
      f.on('error', rej);
    }).on('error', rej);
  });
}

async function resolveSerif() {
  const local = resolve(fontDir, 'NotoSerifKR-Bold.otf');
  if (await exists(local)) return local;
  await mkdir(cacheDir, { recursive: true });
  const cached = resolve(cacheDir, 'NotoSerifKR-Bold.otf');
  if (!(await exists(cached))) {
    console.log('· Noto Serif KR 없음 → 다운로드…');
    await download(SERIF_URL, cached);
  }
  return cached;
}

function captionSvg(slide) {
  const eyeY = 196;
  const ruleY = 222;
  const h1Y = 356;
  const h2Y = 470;
  const subY = 600;
  const [l1, l2] = slide.head;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="${ML}" y="${eyeY}" font-family="Pretendard Variable" font-size="30" font-weight="600"
        letter-spacing="6" fill="${CHAMPAGNE}">${escapeXml(slide.eyebrow)}</text>
  <rect x="${ML}" y="${ruleY}" width="68" height="3" fill="${CHAMPAGNE}"/>
  <text x="${ML}" y="${h1Y}" font-family="Noto Serif KR" font-size="98" font-weight="700"
        fill="${IVORY}" letter-spacing="-2">${escapeXml(l1)}</text>
  ${
    l2
      ? `<text x="${ML}" y="${h2Y}" font-family="Noto Serif KR" font-size="98" font-weight="700"
        fill="${IVORY}" letter-spacing="-2">${escapeXml(l2)}</text>`
      : ''
  }
  <text x="${ML}" y="${subY}" font-family="Pretendard Variable" font-size="38" font-weight="400"
        letter-spacing="-1" fill="${GRAY}">${escapeXml(slide.sub)}</text>
  <text x="${W - ML}" y="${H - 52}" text-anchor="end" font-family="Pretendard Variable"
        font-size="26" font-weight="500" letter-spacing="4" fill="#4A4D56">더원 · THE ONE</text>
</svg>`;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const serifPath = await resolveSerif();
  const pretendardPath = resolve(fontDir, 'PretendardVariable.ttf');
  const fontFiles = [serifPath, pretendardPath];

  // 디바이스 목업 리사이즈 (가로 DEV_W, 비율 유지)
  for (const s of SLIDES) {
    const devBuf = await sharp(resolve(srcDir, s.src))
      .resize({ width: DEV_W })
      .png()
      .toBuffer();
    const devMeta = await sharp(devBuf).metadata();
    const devLeft = Math.round((W - DEV_W) / 2);

    // 캡션 레이어 (투명 배경) → PNG
    const svg = captionSvg(s);
    const resvg = new Resvg(svg, {
      background: 'rgba(0,0,0,0)',
      font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Pretendard Variable' },
    });
    const capPng = resvg.render().asPng();

    const out = resolve(outDir, s.out);
    await sharp({
      create: { width: W, height: H, channels: 4, background: INK },
    })
      .composite([
        { input: devBuf, left: devLeft, top: DEV_TOP },
        { input: capPng, left: 0, top: 0 },
      ])
      .png({ compressionLevel: 9 })
      .toFile(out);

    console.log(
      `✓ ${s.out.padEnd(18)} ${W}×${H}  device ${DEV_W}×${devMeta.height}@${devLeft},${DEV_TOP}`,
    );
  }
  console.log(`\n출력: ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
