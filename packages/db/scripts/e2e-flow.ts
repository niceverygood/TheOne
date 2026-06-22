/**
 * E2E — 회원가입 → 심사승인 → 오늘의 큐레이션(매칭 추천) → 큐레이션 액션 → 매칭 신청(letter)
 * 실제 백엔드 함수(@theone/db)로 로컬 DB에서 전 과정을 돌린다.
 * 실행: cd packages/db && pnpm exec tsx scripts/e2e-flow.ts
 */
import {
  prisma,
  createSignupUser,
  approveMembership,
  getTodayCuration,
  recordCurationAction,
  sendLetter,
  respondToMatch,
  sendMessage,
  surveyFor,
} from '../src/index';
import { ageFromBirth } from '@theone/shared';

const LETTER =
  '안녕하세요. 프로필과 가치관 케미를 보고 진심으로 좋은 인연이 될 것 같아 첫 편지를 보냅니다. ' +
  '주말엔 전시나 산책을 즐기는데, 비슷한 결을 가진 분 같아 반가웠어요. ' +
  '편하게 이야기 나눠보고 싶습니다. 좋은 하루 보내세요.';

async function step(label: string, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    console.log(`   ✗ ${label} 실패:`, (e as Error).message);
    throw e;
  }
}

async function runViewer(opts: {
  tag: string;
  gender: 'male' | 'female';
  job: string;
  age: number;
  surveyTarget: number; // 1=m1,2=m2,3=f1,4=f2,5=f3,6=f4,7=f5 — 이 시드와 케미 100% 정렬
}) {
  const email = `tester_e2e_${opts.tag}@theone.app`;
  await prisma.user.deleteMany({ where: { email } });

  console.log(
    `\n══════════ [${opts.tag}] ${opts.gender === 'male' ? '남성' : '여성'} 뷰어 E2E ══════════`,
  );

  // 1) 회원가입(pending)
  const birth = `${2026 - opts.age}-05-20`;
  const user = await createSignupUser({
    gender: opts.gender,
    jobCategory: opts.job,
    birth,
    email,
    residenceRegion: '서울',
    activityRegion: '서울',
    height: opts.gender === 'male' ? 180 : 165,
    hobbies: ['여행', '독서'],
    surveyAnswers: surveyFor(opts.surveyTarget),
    introSections: { about: '테스트 회원입니다.' },
  });
  const fresh = await prisma.user.findUnique({ where: { id: user.id }, select: { status: true } });
  console.log(
    `1) 회원가입 ✓  id=${user.id.slice(0, 8)}… status=${fresh?.status} (나이 ${ageFromBirth(new Date(birth))})`,
  );

  // 2) 가입 심사 통과 → active
  await step('심사승인', async () => {
    await approveMembership(user.id);
  });
  const after = await prisma.user.findUnique({ where: { id: user.id }, select: { status: true } });
  console.log(`2) 가입 심사 통과 ✓  status=${after?.status}`);

  // 남성은 letter 차감 — 크레딧 충전
  if (opts.gender === 'male') {
    await prisma.credit.upsert({
      where: { userId: user.id },
      create: { userId: user.id, balance: 100 },
      update: { balance: 100 },
    });
    console.log('   (남성 → 크레딧 100 충전)');
  }

  // 3) 오늘의 큐레이션(매칭 추천)
  const res = await getTodayCuration(user.id);
  if (!res?.candidate) {
    console.log('3) 큐레이션 ✗ 적격 후보 없음');
    return;
  }
  const c = res.candidate as any;
  const isSeed = c.email?.startsWith('seed_');
  console.log(`3) 오늘의 큐레이션 ✓`);
  console.log(
    `     후보: ${isSeed ? c.email.replace('@theone.app', '') : '(비시드)'} · ${c.gender} · ${c.profile?.jobDetail ?? c.jobCategory} · ${c.birth ? ageFromBirth(c.birth) + '세' : '?'}`,
  );
  console.log(
    `     사진 ${c.profile?.photos?.length ?? 0}장 · 뱃지 ${(c.badges ?? []).length}개 · 케미 ${res.breakdown?.overall ?? '?'}%`,
  );

  // 4) 큐레이션 액션(좋아요)
  if (res.log) {
    await recordCurationAction(res.log.id, 'liked');
    console.log('4) 큐레이션 액션(liked) ✓');
  }

  // 5) 매칭 신청(letter)
  const sent = await sendLetter({ fromId: user.id, toId: c.id, letter: LETTER });
  console.log(
    `5) 매칭 신청(편지 발송) ✓  matchId=${sent.matchId.slice(0, 8)}… ${sent.free ? '무료' : `크레딧 ${sent.spent} 차감`}`,
  );

  // 검증 — Match row
  const match = await prisma.match.findUnique({
    where: { id: sent.matchId },
    select: { status: true, fromId: true, toId: true },
  });
  console.log(
    `   → Match 생성 확인: status=${match?.status} (${match?.fromId === user.id ? '내가 발신' : '?'} → 상대)`,
  );

  // 6) 상대가 수락 → 대화 개설 (수신자 = 후보 c.id 본인만 가능)
  const resp = await respondToMatch(sent.matchId, c.id, 'accept');
  console.log(
    `6) 상대 수락 ✓  status=${resp.status} · conversationId=${resp.conversationId?.slice(0, 8)}…`,
  );

  // 7) 첫 메시지 전송(대화 성사 후)
  if (resp.conversationId) {
    const msg = await sendMessage({
      conversationId: resp.conversationId,
      senderId: c.id,
      body: '안녕하세요! 편지 잘 읽었어요. 반갑습니다 :)',
    });
    console.log(`7) 첫 메시지 전송 ✓  messageId=${msg.id.slice(0, 8)}… → 핵심 루프 완결`);
  }
}

async function main() {
  console.log('▶ 시드 회원 수 확인…');
  const seeds = await prisma.user.count({ where: { email: { startsWith: 'seed_' } } });
  console.log(`  시드 회원 ${seeds}명 (남2/여5 기대)`);

  // 여성 뷰어 → 남성 시드(m1) 추천 기대, letter 무료
  await runViewer({ tag: 'f', gender: 'female', job: 'medical', age: 27, surveyTarget: 1 });
  // 남성 뷰어(30) → 여성 시드(f5, 28세) 추천 기대(나이 적격), letter 크레딧 차감
  await runViewer({ tag: 'm', gender: 'male', job: 'finance', age: 30, surveyTarget: 7 });

  // 정리
  await prisma.user.deleteMany({ where: { email: { startsWith: 'tester_e2e_' } } });
  console.log('\n✔ E2E 완료 — 테스트 회원 정리됨. 시드/실데이터는 유지.');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
