/**
 * AI 자기소개 생성 — Claude API(있으면) 또는 규칙기반 템플릿(폴백).
 * 더원 톤: 과장·이모지·"프리미엄" 단어 금지, 잉크블랙처럼 담백하고 품위 있게. 한국어.
 *
 * ANTHROPIC_API_KEY 미설정 시 lib 자체가 템플릿 폴백을 반환한다(KCB mock 폴백 패턴과 동일).
 */
import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import {
  type ProfileGenerateInput,
  type IntroSections,
  INTRO_SECTIONS,
  REGIONS,
  HOBBIES,
  DRINKING_FREQUENCY,
  DRINKING_AMOUNT,
  SMOKING,
  BODY_TYPES,
  optionLabel,
  jobCategories,
} from '@theone/shared';

const MODEL = process.env.PROFILE_AI_MODEL || 'claude-haiku-4-5-20251001';

/** 수집한 슬러그·코드를 사람이 읽는 한국어 요약으로 변환(프롬프트/템플릿 공용). */
export function describeProfile(input: ProfileGenerateInput): Record<string, string> {
  const job = jobCategories(input.gender).find((j) => j.id === input.jobCategory);
  const hobbies = (input.hobbies ?? [])
    .map((h) => optionLabel(HOBBIES, h) ?? (h === 'etc' ? undefined : h))
    .filter(Boolean) as string[];
  const out: Record<string, string> = {};
  if (input.age) out['나이'] = `${input.age}세`;
  out['성별'] = input.gender === 'male' ? '남성' : '여성';
  if (job) out['직업'] = `${job.kr}(${job.detail})`;
  if (input.school) out['학교'] = input.school;
  if (input.height) out['키'] = `${input.height}cm`;
  const res = optionLabel(REGIONS, input.residenceRegion);
  const act = optionLabel(REGIONS, input.activityRegion);
  if (res) out['사는 지역'] = res;
  if (act) out['활동 지역'] = act;
  if (hobbies.length) out['취미'] = hobbies.join(', ');
  const freq = optionLabel(DRINKING_FREQUENCY, input.drinkingFrequency);
  const amt = optionLabel(DRINKING_AMOUNT, input.drinkingAmount);
  if (freq) out['음주 빈도'] = freq;
  if (amt) out['주량'] = amt;
  const smk = optionLabel(SMOKING, input.smoking);
  if (smk) out['흡연'] = smk;
  const body = optionLabel(BODY_TYPES[input.gender], input.bodyType);
  if (body) out['체형'] = body;
  return out;
}

/** 규칙기반 템플릿 — 키 없거나 AI 실패 시 폴백. 담백한 1~2문장 초안. */
export function templateIntro(input: ProfileGenerateInput): IntroSections {
  const d = describeProfile(input);
  const job = jobCategories(input.gender).find((j) => j.id === input.jobCategory);
  const hobbies = (input.hobbies ?? [])
    .map((h) => optionLabel(HOBBIES, h))
    .filter(Boolean) as string[];
  const region = d['사는 지역'] ?? d['활동 지역'];
  const hobbyPhrase = hobbies.length
    ? `${hobbies.slice(0, 3).join(', ')}을(를) 좋아합니다.`
    : '새로운 경험과 배움을 즐깁니다.';

  return {
    about: [
      job ? `${job.kr} 분야에서 일하고 있습니다.` : '제 일에 진심인 사람입니다.',
      region
        ? `${region}에서 지내며 일상의 균형을 중요하게 생각합니다.`
        : '일상의 균형을 중요하게 생각합니다.',
    ].join(' '),
    idealType:
      '서로의 일과 가치관을 존중하고, 대화가 잘 통하는 분을 만나고 싶습니다. 함께 있을 때 편안하고 신뢰가 쌓이는 관계를 바랍니다.',
    lifestyle:
      `${hobbyPhrase}${d['음주 빈도'] ? ` 술자리는 ${d['음주 빈도']} 정도입니다.` : ''}`.trim(),
    datingStyle:
      '관계는 천천히, 그러나 진지하게 만들어가는 편입니다. 표현에 솔직하고 책임감을 중요하게 생각합니다.',
    weekend: hobbies.length
      ? `주말엔 주로 ${hobbies[0]}을(를) 즐기거나, 가까운 곳으로 나가 시간을 보냅니다.`
      : '주말엔 여유롭게 쉬거나 좋아하는 공간에서 시간을 보냅니다.',
  };
}

const SYSTEM = `당신은 진중한 결혼정보 서비스 'THE ONE'의 자기소개 작성 도우미입니다.
회원이 입력한 정보를 바탕으로, 매칭 상대가 읽을 자기소개를 한국어로 작성합니다.

원칙:
- 담백하고 품위 있게. 과장·미사여구·이모지·느낌표 남발 금지.
- "프리미엄", "최고", "완벽" 같은 자기과시 단어 금지.
- 직접식별정보(실명·연락처·구체 회사명)는 절대 추측해 쓰지 않는다.
- 각 섹션 1~3문장. 1인칭("저는…").
- 입력에 없는 사실을 지어내지 않는다.

다음 JSON 형식으로만 응답하세요(마크다운·설명 없이):
{"about": "...", "idealType": "...", "lifestyle": "...", "datingStyle": "...", "weekend": "..."}

각 키의 의미:
- about: 나는 이런 사람
- idealType: 내가 찾는 사람(이상형)
- lifestyle: 나의 라이프스타일
- datingStyle: 연애·관계관
- weekend: 주말엔 보통 무엇을 하는지`;

function coerceSections(raw: unknown): IntroSections {
  const o = (raw ?? {}) as Record<string, unknown>;
  const pick = (k: string) => (typeof o[k] === 'string' ? (o[k] as string).slice(0, 600) : '');
  return {
    about: pick('about'),
    idealType: pick('idealType'),
    lifestyle: pick('lifestyle'),
    datingStyle: pick('datingStyle'),
    weekend: pick('weekend'),
  };
}

/** 자기소개 생성 — 키 있으면 Claude, 없거나 실패하면 템플릿. */
export async function generateIntro(
  input: ProfileGenerateInput,
): Promise<{ sections: IntroSections; source: 'ai' | 'template' }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { sections: templateIntro(input), source: 'template' };

  try {
    const client = new Anthropic({ apiKey });
    const profile = describeProfile(input);
    const userMsg = [
      '아래 회원 정보로 자기소개 5개 섹션을 작성해 주세요.',
      ...Object.entries(profile).map(([k, v]) => `- ${k}: ${v}`),
      '',
      `섹션 키: ${INTRO_SECTIONS.map((s) => s.key).join(', ')}`,
    ].join('\n');

    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: 'user', content: userMsg }],
    });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const sections = coerceSections(JSON.parse(json));
    // 빈 응답이면 템플릿으로 폴백
    if (!sections.about && !sections.idealType) {
      return { sections: templateIntro(input), source: 'template' };
    }
    return { sections, source: 'ai' };
  } catch (e) {
    console.error('[profile-intro] AI generation failed, falling back to template', e);
    return { sections: templateIntro(input), source: 'template' };
  }
}
