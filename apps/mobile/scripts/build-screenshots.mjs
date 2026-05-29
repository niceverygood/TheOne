#!/usr/bin/env node
/**
 * App Store 스크린샷 5장을 docs/reference/theone-standalone.html 목업에서 자동 캡처.
 *
 * iPhone 6.5" Pro Max 기준 1284×2778 PNG. App Store Connect 업로드용.
 * store-listing.md §3에 정의된 5장 매핑:
 *   1. 01        Splash + Application Gate (브랜드 인상)
 *   2. 09-hub    추가 인증 허브 (인증 4종 차별점)
 *   3. 03        오늘의 큐레이션 (핵심 경험)
 *   4. 03b       만남 신청서 (골드스푼식)
 *   5. 07        케미 분석 리포트 (신뢰감)
 *
 * 사용: node scripts/build-screenshots.mjs
 * 의존: playwright, sharp (devDep)
 *
 * 목업이 .design-canvas.state.json을 fetch하므로 file:// 대신 로컬 HTTP 서버로 서빙.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, extname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mockupDir = resolve(root, '../../docs/reference/mockup');
const outDir = resolve(root, 'assets/store-screenshots');

const TARGET_W = 1284;
const TARGET_H = 2778;
const ART_W = 375;
const ART_H = 812;
const DSF = Math.max(TARGET_W / ART_W, TARGET_H / ART_H) + 0.1;

// label 텍스트로 찾음 (DCArtboard가 id를 DOM에 안 넣고 label만 .dc-artboard-label에 렌더)
const SHOTS = [
  { match: 'Splash · Application Gate', file: '1-splash.png' },
  { match: '추가 인증 허브', file: '2-verifications.png' },
  { match: '오늘의 큐레이션', file: '3-curation.png' },
  { match: '만남 신청서', file: '4-letter.png' },
  { match: '케미 분석 리포트', file: '5-chemistry.png' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};

function startServer(rootDir) {
  return new Promise((resolveServer) => {
    const server = createServer((req, res) => {
      let p = decodeURIComponent((req.url ?? '/').split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const filePath = resolve(rootDir, '.' + p);
      try {
        statSync(filePath);
        res.writeHead(200, {
          'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
          'access-control-allow-origin': '*',
        });
        createReadStream(filePath).pipe(res);
      } catch {
        // .design-canvas.state.json 같이 없는 파일은 빈 JSON 응답
        if (filePath.endsWith('.json')) {
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end('{}');
          return;
        }
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolveServer({ server, url: `http://127.0.0.1:${port}/index.html` });
    });
  });
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const { server, url } = await startServer(mockupDir);
  console.log(`Mockup server: ${url}`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: ART_W, height: ART_H },
    deviceScaleFactor: DSF,
  });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    console.log(`[browser ${m.type()}]`, m.text());
  });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  console.log('Waiting for in-browser Babel to compile and React to render…');
  await page.waitForFunction(
    () => document.querySelectorAll('[id]').length > 10,
    { timeout: 60000 },
  );
  await page.waitForTimeout(3000);

  const found = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    const rootHTML = (document.getElementById('root')?.innerHTML ?? '').slice(0, 800);
    return { count: all.length, sample: all.slice(0, 40), rootHTML };
  });
  console.log(`DOM IDs found: ${found.count}.`);
  console.log('Sample IDs:', found.sample);
  console.log('Root snippet:', found.rootHTML);

  for (const shot of SHOTS) {
    // label 텍스트가 있는 artboard 찾고, 같은 artboard 내 PhoneFrame(.o-frame) 캡처
    const label = page.locator('.dc-artboard-label', { hasText: shot.match }).first();
    const exists = await label.count();
    if (!exists) {
      console.warn(`✗ "${shot.match}" not found, skipping`);
      continue;
    }
    const artboard = label.locator('xpath=ancestor::*[contains(@class,"dc-artboard")][1]');
    const phoneFrame = artboard.locator('.o-frame').first();
    await phoneFrame.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const raw = await phoneFrame.screenshot({ type: 'png' });
    const buf = await sharp(raw)
      .resize(TARGET_W, TARGET_H, {
        fit: 'contain',
        background: { r: 15, g: 16, b: 20, alpha: 1 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const out = resolve(outDir, shot.file);
    await sharp(buf).toFile(out);
    console.log(
      `✓ ${shot.file.padEnd(22)} ${shot.match.padEnd(28)} ${TARGET_W}×${TARGET_H}  ${(buf.length / 1024).toFixed(1)} KB`,
    );
  }

  await browser.close();
  server.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
