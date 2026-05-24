import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C } from '../../src/theme';
import { Txt } from '../../src/ui';

const QUESTIONS = [
  '결혼은 인생에서 반드시 이루고 싶은 목표다.',
  '결혼 후에도 각자의 커리어를 이어가야 한다.',
  '재정은 부부가 투명하게 공유해야 한다.',
  '아이를 갖는 것은 결혼의 중요한 부분이다.',
];

function Likert({ q, value, onPick }: { q: string; value: number; onPick: (n: number) => void }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Txt size={13.5} color={C.ink2} style={{ marginBottom: 10, lineHeight: 20 }}>
        {q}
      </Txt>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end' }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const sel = n === value;
          const h = 14 + Math.abs(n - 3) * 8;
          return (
            <Pressable key={n} onPress={() => onPick(n)} style={{ flex: 1 }}>
              <View style={{ height: h, backgroundColor: sel ? C.champagne : C.ivory3 }} />
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Txt size={10} color={C.gray}>
          전혀 아니다
        </Txt>
        <Txt size={10} color={C.gray}>
          매우 그렇다
        </Txt>
      </View>
    </View>
  );
}

export default function Step04() {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>([5, 4, 5, 4]);
  return (
    <AppShell
      step={4}
      total={5}
      eyebrow="60 Questions"
      title="가치관 설문"
      subtitle="총 60문항 · 결혼관 / 라이프스타일 / 관계 / 갈등. 매칭 케미 분석의 기반이 됩니다."
      footer={<FormFooter next="다음 — 추천인" onNext={() => router.push('/signup/step05')} />}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Txt variant="mono" size={11} color={C.champagne}>
          결혼관 · 1/4
        </Txt>
        <Txt variant="mono" size={10} color={C.gray}>
          14 / 60
        </Txt>
      </View>
      <View style={{ height: 2, backgroundColor: C.ivory3, marginBottom: 28 }}>
        <View style={{ width: '23%', height: '100%', backgroundColor: C.ink2 }} />
      </View>
      {QUESTIONS.map((q, i) => (
        <Likert
          key={q}
          q={q}
          value={answers[i] ?? 3}
          onPick={(n) => setAnswers((a) => a.map((v, idx) => (idx === i ? n : v)))}
        />
      ))}
    </AppShell>
  );
}
