/**
 * 매칭 알고리즘 더미 검증 — 10남 + 10여를 로컬 DB에 만들고
 * 실제 shared 알고리즘(scoreCandidate/isEligible/pickTodayCuration)으로 큐레이션을 돌린다.
 * 실행: cd packages/db && pnpm exec tsx scripts/matching-dummy.ts
 */
import { prisma } from '../src/index';
import {
  scoreCandidate,
  isEligible,
  pickTodayCuration,
  ageFromBirth,
  type Candidate,
  type VerificationType,
} from '@theone/shared';
import { getTodayCuration } from '../src/matching';

const Y = 2026; // 오늘 2026-06-07, 생일 01-01 → 나이 정확히 일치

type Spec = {
  key: string;
  gender: 'male' | 'female';
  region: string;
  age: number;
  job: string;
  badges: VerificationType[];
};

const MALES: Spec[] = [
  {
    key: 'M01',
    gender: 'male',
    region: '서울',
    age: 32,
    job: 'legal',
    badges: ['education', 'wealth', 'vehicle', 'realestate'],
  },
  {
    key: 'M02',
    gender: 'male',
    region: '서울',
    age: 35,
    job: 'finance',
    badges: ['education', 'wealth'],
  },
  {
    key: 'M03',
    gender: 'male',
    region: '경기',
    age: 30,
    job: 'medical',
    badges: ['wealth', 'realestate'],
  },
  { key: 'M04', gender: 'male', region: '부산', age: 38, job: 'corporate', badges: ['education'] },
  {
    key: 'M05',
    gender: 'male',
    region: '서울',
    age: 41,
    job: 'finance',
    badges: ['education', 'wealth', 'vehicle'],
  },
  { key: 'M06', gender: 'male', region: '인천', age: 29, job: 'tech', badges: [] },
  { key: 'M07', gender: 'male', region: '대구', age: 33, job: 'medical', badges: ['vehicle'] },
  {
    key: 'M08',
    gender: 'male',
    region: '서울',
    age: 36,
    job: 'legal',
    badges: ['education', 'realestate'],
  },
  {
    key: 'M09',
    gender: 'male',
    region: '경기',
    age: 28,
    job: 'corporate',
    badges: ['education', 'wealth', 'vehicle', 'realestate'],
  },
  { key: 'M10', gender: 'male', region: '제주', age: 40, job: 'accounting', badges: ['wealth'] },
];

const FEMALES: Spec[] = [
  {
    key: 'F01',
    gender: 'female',
    region: '서울',
    age: 31,
    job: 'medical',
    badges: ['education', 'wealth', 'vehicle', 'realestate'],
  },
  {
    key: 'F02',
    gender: 'female',
    region: '서울',
    age: 33,
    job: 'finance',
    badges: ['education', 'wealth'],
  },
  { key: 'F03', gender: 'female', region: '경기', age: 29, job: 'legal', badges: ['wealth'] },
  {
    key: 'F04',
    gender: 'female',
    region: '부산',
    age: 37,
    job: 'corporate',
    badges: ['education', 'realestate'],
  },
  { key: 'F05', gender: 'female', region: '서울', age: 30, job: 'medical', badges: ['education'] },
  {
    key: 'F06',
    gender: 'female',
    region: '인천',
    age: 34,
    job: 'finance',
    badges: ['vehicle', 'wealth'],
  },
  {
    key: 'F07',
    gender: 'female',
    region: '대구',
    age: 32,
    job: 'legal',
    badges: ['education', 'vehicle'],
  },
  {
    key: 'F08',
    gender: 'female',
    region: '서울',
    age: 39,
    job: 'accounting',
    badges: ['education', 'wealth', 'realestate'],
  },
  {
    key: 'F09',
    gender: 'female',
    region: '경기',
    age: 41,
    job: 'corporate',
    badges: ['realestate'],
  },
  { key: 'F10', gender: 'female', region: '제주', age: 28, job: 'medical', badges: ['education'] },
];

async function seedDummies() {
  await prisma.user.deleteMany({ where: { email: { startsWith: 'dummy_' } } });
  for (const s of [...MALES, ...FEMALES]) {
    await prisma.user.create({
      data: {
        email: `dummy_${s.key}@theone.test`,
        gender: s.gender,
        jobCategory: s.job,
        birth: new Date(`${Y - s.age}-01-01T00:00:00Z`),
        status: 'active',
        profile: { create: { region: s.region, photos: [] } },
        badges: {
          create: s.badges.map((t) => ({
            type: t,
            expiresAt: new Date(`${Y + 1}-01-01T00:00:00Z`),
          })),
        },
      },
    });
  }
}

type Loaded = { key: string; id: string; cand: Candidate };

async function loadDummies(gender: 'male' | 'female'): Promise<Loaded[]> {
  const rows = await prisma.user.findMany({
    where: { email: { startsWith: 'dummy_' }, gender },
    include: { profile: { select: { region: true } }, badges: { select: { type: true } } },
  });
  return rows
    .filter((r) => r.birth)
    .map((r) => ({
      key: r.email!.replace('dummy_', '').replace('@theone.test', ''),
      id: r.id,
      cand: {
        region: r.profile?.region ?? '서울',
        age: ageFromBirth(r.birth!),
        badges: r.badges.map((b) => b.type) as VerificationType[],
      },
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function fmt(c: Candidate) {
  return `${c.region}/${c.age}세/뱃지[${c.badges.join(',') || '없음'}]`;
}

function rankFor(viewer: Loaded, pool: Loaded[]) {
  return pool
    .map((p) => ({
      p,
      eligible: isEligible(viewer.cand, p.cand),
      score: scoreCandidate(viewer.cand, p.cand),
    }))
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score);
}

async function main() {
  console.log('▶ 더미 10남 + 10여 생성…');
  await seedDummies();
  const males = await loadDummies('male');
  const females = await loadDummies('female');
  console.log(`  생성: 남 ${males.length} / 여 ${females.length}\n`);

  for (const [label, viewers, pool] of [
    ['남성 → 여성', males, females],
    ['여성 → 남성', females, males],
  ] as const) {
    console.log(`══════════ ${label} 큐레이션 (실제 알고리즘) ══════════`);
    for (const v of viewers) {
      const ranked = rankFor(v, pool);
      const eligible = ranked.filter((r) => r.eligible);
      const best = pickTodayCuration(
        v.cand,
        pool.map((p) => p.cand),
      );
      const chosen = best ? pool.find((p) => p.cand === best)! : null;
      const ok = chosen && eligible[0] && chosen.id === eligible[0].p.id ? '✓' : '✗';
      console.log(`\n[${v.key}] ${fmt(v.cand)}`);
      if (!chosen) {
        console.log(`   → 적격 후보 없음 (지역/나이 필터 통과 0명)`);
        continue;
      }
      console.log(
        `   → 오늘의 큐레이션: ${chosen.key} (${fmt(chosen.cand)}) 점수 ${scoreCandidate(v.cand, chosen.cand)} ${ok} 최고점일치`,
      );
      const top3 = eligible
        .slice(0, 3)
        .map((r) => `${r.p.key}:${r.score}`)
        .join('  ');
      console.log(`     적격 ${eligible.length}명 상위: ${top3}`);
    }
    console.log('');
  }

  // DB 파이프라인 1건 — getTodayCuration 이 CurationLog 를 실제로 기록하는지
  console.log('══════════ DB 파이프라인 (getTodayCuration → CurationLog) ══════════');
  const sampleMale = males[0];
  // 깔끔한 더미-only 검증을 위해 이 viewer 의 기존 큐레이션 로그 제거
  await prisma.curationLog.deleteMany({ where: { userId: sampleMale.id } });
  const res = await getTodayCuration(sampleMale.id);
  if (res?.log) {
    const c = res.candidate;
    const isDummy = c?.email?.startsWith('dummy_');
    console.log(`[${sampleMale.key}] getTodayCuration → CurationLog 생성됨`);
    console.log(
      `   candidateId=${res.log.candidateId} action=${res.log.action} score=${res.log.score}`,
    );
    console.log(
      `   후보: ${isDummy ? c!.email!.replace('dummy_', '').replace('@theone.test', '') : '(시드 회원)'} ${c?.gender}`,
    );
    console.log(`   ※ 풀에는 시드 50명도 포함되므로 후보가 시드일 수 있음(파이프라인 동작 증명용)`);
  } else {
    console.log('   적격 후보 없음 → 로그 미생성');
  }

  console.log("\n✔ 완료. 정리하려면: DELETE FROM users WHERE email LIKE 'dummy_%';");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
