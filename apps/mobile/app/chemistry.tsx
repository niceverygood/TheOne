import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../src/theme';
import { Btn, Hairline, Screen, Txt } from '../src/ui';

const SECTIONS: { en: string; kr: string; score: string; lines: string[] }[] = [
  {
    en: 'On Marriage',
    kr: '결혼관',
    score: '92',
    lines: [
      '두 분 모두 결혼을 신중하지만 분명한 목표로 두고 있습니다. 시점과 가족 계획에 대한 답변이 거의 일치했어요.',
      '재정의 투명한 공유에 대해 두 분 다 ‘매우 그렇다’를 선택했습니다 — 갈등의 큰 원인 하나가 줄어듭니다.',
    ],
  },
  {
    en: 'Lifestyle',
    kr: '라이프스타일',
    score: '78',
    lines: [
      '주말 활동 성향이 비슷합니다. 둘 다 조용한 문화생활을 선호하지만, 운동 강도에서 약간의 차이가 있어요.',
      '여행 빈도와 소비 성향은 잘 맞습니다. 함께 계획을 세우는 즐거움이 클 거예요.',
    ],
  },
  {
    en: 'Conflict',
    kr: '갈등 해결',
    score: '85',
    lines: [
      '두 분 다 갈등을 즉시 대화로 풀려는 경향이 강합니다. 다만 한 분은 시간을 두고 정리하는 편이라, 속도 차이를 인지하면 좋겠어요.',
    ],
  },
];

// 대화 시작점 — 공통점·차이에서 뽑은 첫 질문 (P1-6 케미 인사이트)
const STARTERS: { from: string; q: string }[] = [
  { from: '결혼관 일치', q: '결혼 후 어떤 일상을 가장 기대하세요?' },
  { from: '문화생활 공통', q: '최근에 가장 좋았던 전시나 공연이 있었나요?' },
  { from: '운동 강도 차이', q: '주말 아침엔 활동적인 편이세요, 느긋한 편이세요?' },
];

/** Screen 17 · 케미 분석 리포트 — 상위 8% + 3섹션 */
export default function Chemistry() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <Pressable onPress={() => router.back()}>
          <Txt variant="mono" size={18} color={C.ink2}>
            ←
          </Txt>
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, alignItems: 'center' }}>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 10 }}>
          Chemistry Report
        </Txt>
        <Txt variant="serifKr" size={52} weight="700" color={C.ink2}>
          상위 8%
        </Txt>
        <Txt
          size={13.5}
          color={C.gray}
          style={{ marginTop: 14, textAlign: 'center', lineHeight: 23 }}
        >
          김민준 · 김지윤 두 분의 종합 케미는 전체 매칭 중 상위 8%입니다.{'\n'}매칭 7일째 자동
          발행된 리포트입니다.
        </Txt>
        <Txt variant="mono" size={10} color={C.gray} style={{ marginTop: 10 }}>
          ISSUED · 05.17 · No. R-2026-0331
        </Txt>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {SECTIONS.map((s) => (
          <View key={s.en}>
            <Hairline style={{ marginTop: 24 }} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 20,
                marginBottom: 14,
              }}
            >
              <View>
                <Txt variant="serifEn" size={13} color={C.champagne}>
                  {s.en}
                </Txt>
                <Txt variant="serifKr" size={18} weight="700" color={C.ink2}>
                  {s.kr}
                </Txt>
              </View>
              <Txt variant="mono" size={20} weight="600" color={C.ink2}>
                {s.score}
              </Txt>
            </View>
            {s.lines.map((l, i) => (
              <Txt key={i} size={13} color={C.ink2} style={{ lineHeight: 23, marginBottom: 8 }}>
                {l}
              </Txt>
            ))}
          </View>
        ))}
        {/* 대화 시작점 — 리포트를 행동으로 연결 */}
        <Hairline style={{ marginTop: 24 }} />
        <View style={{ marginTop: 20 }}>
          <Txt variant="serifEn" size={13} color={C.champagne}>
            Conversation Starters
          </Txt>
          <Txt variant="serifKr" size={18} weight="700" color={C.ink2} style={{ marginTop: 2 }}>
            대화 시작점
          </Txt>
          <Txt size={12.5} color={C.gray} style={{ marginTop: 8, lineHeight: 20 }}>
            두 분의 공통점과 차이에서 뽑은 첫 질문입니다. 채팅에서 그대로 써보세요.
          </Txt>
          {STARTERS.map((s) => (
            <View
              key={s.q}
              style={{
                borderWidth: 1,
                borderColor: C.hairLight,
                borderRadius: 2,
                padding: 14,
                marginTop: 10,
              }}
            >
              <Txt variant="mono" size={9} color={C.champagne}>
                {s.from}
              </Txt>
              <Txt size={13.5} color={C.ink2} style={{ marginTop: 6, lineHeight: 21 }}>
                “{s.q}”
              </Txt>
            </View>
          ))}
        </View>

        <Btn label="리포트 PDF 저장" variant="outline" style={{ marginTop: 32 }} />
      </View>
    </Screen>
  );
}
