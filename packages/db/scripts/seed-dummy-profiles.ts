/**
 * 시드 더미 회원 (로컬) — 실사 AI 사진(marketing/dummy-accounts/{id}-{1,2,3}.jpg)을 가진
 * 남2 + 여5 를 로컬 DB 에 생성한다. 데이터/로직은 @theone/db seed-data 공용.
 *
 * 사진은 data URI 로 Profile.photos 에 저장(로컬 — 프로덕션도 동일 방식).
 * 실행: cd packages/db && pnpm exec tsx scripts/seed-dummy-profiles.ts
 * 정리: DELETE FROM users WHERE email LIKE 'seed_%@theone.app';
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma, SEED_PERSONAS, upsertSeedMember } from '../src/index';

const HERE = dirname(fileURLToPath(import.meta.url));
const IMG_DIR = join(HERE, '../../../marketing/dummy-accounts');

function photosFor(id: string): string[] {
  const out: string[] = [];
  for (const n of [1, 2, 3]) {
    const f = join(IMG_DIR, `${id}-${n}.jpg`);
    if (existsSync(f)) out.push(`data:image/jpeg;base64,${readFileSync(f).toString('base64')}`);
  }
  return out;
}

async function main() {
  let n = 0;
  for (const p of SEED_PERSONAS) {
    const r = await upsertSeedMember(p.id, photosFor(p.id));
    n += 1;
    console.log(`  ✓ ${r.email} (${r.gender}, ${r.jobDetail}) — 사진 ${r.photos}장`);
  }
  console.log(`\n✔ 시드 회원 ${n}명 생성 완료 (남 2 / 여 5).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
