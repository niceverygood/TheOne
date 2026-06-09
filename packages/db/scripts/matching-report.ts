/**
 * 매칭 더미 시각 리포트 — 로컬 더미(dummy_*) 20명을 읽어
 * 실제 알고리즘으로 큐레이션/점수매트릭스를 계산하고 자체 SVG 아바타로 HTML 리포트를 생성.
 * 실행: cd packages/db && pnpm exec tsx scripts/matching-report.ts
 * 출력: <repo>/docs/matching-report.html
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from '../src/index';
import {
  scoreCandidate,
  isEligible,
  pickTodayCuration,
  ageFromBirth,
  type Candidate,
  type VerificationType,
} from '@theone/shared';

const C = {
  ink: '#0F1014',
  ink2: '#1A1F2E',
  ivory: '#FAF7F2',
  ivory2: '#F5F1EA',
  champ: '#B8956A',
  sage: '#6B8E7F',
  terra: '#A85547',
  hair: '#EDE8DE',
  gray: '#8B8378',
};
const BADGE_KR: Record<string, string> = {
  education: '학력',
  wealth: '재산',
  vehicle: '차량',
  realestate: '부동산',
};

type Loaded = { key: string; id: string; gender: string; job: string; cand: Candidate };

async function load(gender: 'male' | 'female'): Promise<Loaded[]> {
  const rows = await prisma.user.findMany({
    where: { email: { startsWith: 'dummy_' }, gender },
    include: { profile: { select: { region: true } }, badges: { select: { type: true } } },
  });
  return rows
    .filter((r) => r.birth)
    .map((r) => ({
      key: r.email!.replace('dummy_', '').replace('@theone.test', ''),
      id: r.id,
      gender: r.gender,
      job: r.jobCategory,
      cand: {
        region: r.profile?.region ?? '서울',
        age: ageFromBirth(r.birth!),
        badges: r.badges.map((b) => b.type) as VerificationType[],
      },
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

/** 온브랜드 모노그램 SVG 아바타 (실사 사진 교체 전 placeholder) */
function avatar(key: string, female: boolean): string {
  const bg = C.ink2;
  const accent = female ? C.champ : C.sage;
  return `<svg viewBox="0 0 100 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="120" fill="${bg}"/>
    <circle cx="50" cy="44" r="20" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.9"/>
    <circle cx="50" cy="38" r="8" fill="${accent}" opacity="0.55"/>
    <path d="M30 70 Q50 54 70 70 L70 120 L30 120 Z" fill="${accent}" opacity="0.18"/>
    <text x="50" y="104" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="${C.ivory}" letter-spacing="1">${key}</text>
  </svg>`;
}

function badgePills(badges: VerificationType[]): string {
  if (!badges.length) return `<span class="pill muted">미인증</span>`;
  return badges.map((b) => `<span class="pill">${BADGE_KR[b]}</span>`).join('');
}

function card(u: Loaded): string {
  return `<div class="card">
    <div class="ava">${avatar(u.key, u.gender === 'female')}</div>
    <div class="meta">
      <div class="key">${u.key} <span class="g ${u.gender}">${u.gender === 'female' ? '여' : '남'}</span></div>
      <div class="sub">${u.cand.region} · ${u.cand.age}세 · ${u.job}</div>
      <div class="pills">${badgePills(u.cand.badges)}</div>
    </div>
  </div>`;
}

function curationBlock(viewers: Loaded[], pool: Loaded[], title: string): string {
  const rows = viewers
    .map((v) => {
      const ranked = pool
        .map((p) => ({
          p,
          eligible: isEligible(v.cand, p.cand),
          score: scoreCandidate(v.cand, p.cand),
        }))
        .filter((r) => r.eligible)
        .sort((a, b) => b.score - a.score);
      const best = pickTodayCuration(
        v.cand,
        pool.map((p) => p.cand),
      );
      const chosen = best ? pool.find((p) => p.cand === best)! : null;
      const top = ranked
        .slice(0, 3)
        .map((r, i) => `<span class="${i === 0 ? 'win' : ''}">${r.p.key}:${r.score}</span>`)
        .join(' ');
      return `<tr>
        <td class="vk">${v.key}<br><span class="sub">${v.cand.region}·${v.cand.age}</span></td>
        <td class="arrow">→</td>
        <td>${chosen ? `<b>${chosen.key}</b> <span class="sub">${chosen.cand.region}·${chosen.cand.age}</span> <span class="score">${scoreCandidate(v.cand, chosen.cand)}점</span>` : `<span class="none">적격 후보 없음</span>`}</td>
        <td class="ranked">${top || '—'}</td>
      </tr>`;
    })
    .join('');
  return `<h2>${title}</h2>
    <table class="cur"><thead><tr><th>회원</th><th></th><th>오늘의 큐레이션 (최고점)</th><th>적격 상위3</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function matrix(males: Loaded[], females: Loaded[]): string {
  const head =
    `<th></th>` +
    females
      .map((f) => `<th>${f.key}<br><span class="sub">${f.cand.region}·${f.cand.age}</span></th>`)
      .join('');
  const body = males
    .map((m) => {
      const best = pickTodayCuration(
        m.cand,
        females.map((f) => f.cand),
      );
      const chosen = best ? females.find((f) => f.cand === best)! : null;
      const cells = females
        .map((f) => {
          const el = isEligible(m.cand, f.cand);
          const sc = scoreCandidate(m.cand, f.cand);
          const isWin = chosen && f.id === chosen.id;
          if (!el) return `<td class="cell off">·</td>`;
          return `<td class="cell ${isWin ? 'win' : ''}">${sc}</td>`;
        })
        .join('');
      return `<tr><th class="rk">${m.key}<br><span class="sub">${m.cand.region}·${m.cand.age}</span></th>${cells}</tr>`;
    })
    .join('');
  return `<h2>점수 매트릭스 (행=남 / 열=여, 하이라이트=큐레이션 선택, · =지역/나이 필터 탈락)</h2>
    <div class="mwrap"><table class="mtx"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

async function main() {
  const males = await load('male');
  const females = await load('female');
  if (!males.length || !females.length) {
    console.error('더미가 없습니다. 먼저 scripts/matching-dummy.ts 를 실행하세요.');
    process.exit(1);
  }

  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>THE ONE · 매칭 알고리즘 더미 검증 리포트</title>
<style>
  :root{color-scheme:light}
  *{box-sizing:border-box}
  body{margin:0;background:${C.ivory};color:${C.ink2};font-family:-apple-system,"Apple SD Gothic Neo",Pretendard,sans-serif;line-height:1.55}
  .wrap{max-width:1120px;margin:0 auto;padding:40px 24px 80px}
  .eyebrow{font-family:Georgia,serif;font-style:italic;color:${C.champ};font-size:14px}
  h1{font-family:"Noto Serif KR",Georgia,serif;font-size:30px;font-weight:700;margin:6px 0 2px}
  .lead{color:${C.gray};font-size:13.5px;margin-bottom:8px}
  .rules{background:${C.ivory2};border-left:2px solid ${C.champ};padding:12px 16px;font-size:12.5px;border-radius:2px;margin:18px 0 28px}
  h2{font-family:"Noto Serif KR",Georgia,serif;font-size:18px;margin:34px 0 14px;border-bottom:1px solid ${C.hair};padding-bottom:8px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
  .card{border:1px solid ${C.hair};border-radius:2px;overflow:hidden;background:#fff}
  .ava{aspect-ratio:5/6;background:${C.ink2}}
  .meta{padding:9px 11px}
  .key{font-weight:700;font-size:14px;display:flex;align-items:center;gap:6px}
  .g{font-size:10px;padding:1px 6px;border-radius:2px}
  .g.female{background:#f3e7d6;color:${C.champ}}
  .g.male{background:#e3ece8;color:${C.sage}}
  .sub{color:${C.gray};font-size:11px}
  .pills{margin-top:6px;display:flex;flex-wrap:wrap;gap:4px}
  .pill{font-size:10px;border:1px solid ${C.champ};color:${C.champ};padding:1px 6px;border-radius:2px}
  .pill.muted{border-color:${C.hair};color:${C.gray}}
  table{border-collapse:collapse;width:100%;font-size:12.5px}
  .cur td,.cur th{border-bottom:1px solid ${C.hair};padding:9px 8px;text-align:left;vertical-align:top}
  .cur th{color:${C.gray};font-weight:600;font-size:11px}
  .vk{font-weight:700}
  .arrow{color:${C.champ};width:20px}
  .score{color:${C.sage};font-weight:700}
  .none{color:${C.terra}}
  .ranked span{display:inline-block;margin-right:8px;color:${C.gray};font-variant-numeric:tabular-nums}
  .ranked .win{color:${C.ink2};font-weight:700}
  .mwrap{overflow-x:auto;border:1px solid ${C.hair};border-radius:2px}
  .mtx{font-size:11.5px;min-width:680px}
  .mtx th,.mtx td{border:1px solid ${C.hair};padding:6px 4px;text-align:center}
  .mtx thead th{background:${C.ivory2};color:${C.ink2};font-size:10.5px}
  .mtx .rk{background:${C.ivory2};text-align:left;padding-left:8px;white-space:nowrap}
  .cell{font-variant-numeric:tabular-nums;color:${C.ink2}}
  .cell.off{color:#cfc8ba}
  .cell.win{background:${C.sage};color:#fff;font-weight:700}
  .foot{margin-top:30px;color:${C.gray};font-size:11.5px}
</style></head><body><div class="wrap">
  <div class="eyebrow">Matching Engine v1 · Rule-based</div>
  <h1>매칭 알고리즘 더미 검증 리포트</h1>
  <div class="lead">더미 ${males.length}남 + ${females.length}여 · 실제 알고리즘(scoreCandidate / isEligible / pickTodayCuration)으로 계산</div>
  <div class="rules"><b>규칙</b> — 하드필터: 같은/인접 광역시도 + 나이 ±5세 · 점수: 같은지역 +30 / 인접 +12 / 나이근접 (5−|차|)×4 / 인증뱃지 겹침 ×8 / 상대 뱃지수 ×3</div>

  <h2>더미 프로필 (${males.length + females.length}명) · 아바타는 자체 SVG placeholder (GPT 실사 사진으로 교체 가능)</h2>
  <div class="grid">${[...males, ...females].map(card).join('')}</div>

  ${curationBlock(males, females, '남성 → 여성 큐레이션')}
  ${curationBlock(females, males, '여성 → 남성 큐레이션')}
  ${matrix(males, females)}

  <div class="foot">생성: THE ONE 매칭 검증 스크립트 · 더미는 로컬 DB 한정 · 실서비스 프로필 사진은 실제 인증 회원만(AI 가짜 인물 금지).</div>
</div></body></html>`;

  const outDir = join(process.cwd(), '..', '..', 'docs');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'matching-report.html');
  writeFileSync(outPath, html, 'utf8');
  console.log('생성됨:', outPath);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
