// THE ONE · 마케팅 자산 렌더러 (SVG → PNG)
// 사용: node render.mjs  (의존성 @resvg/resvg-js, 폰트 디렉터리 FONT_DIR)
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, 'src');
const fontDir = process.env.FONT_DIR || '/tmp/fonts';

for (const file of readdirSync(srcDir).filter((f) => f.endsWith('.svg'))) {
  const svg = readFileSync(join(srcDir, file), 'utf8');
  const r = new Resvg(svg, {
    font: { fontDirs: [fontDir], loadSystemFonts: false, defaultFontFamily: 'Pretendard Variable' },
    fitTo: { mode: 'original' },
  });
  const out = join(here, file.replace(/\.svg$/, '.png'));
  writeFileSync(out, r.render().asPng());
  console.log('rendered', out);
}
