import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, RADIUS } from '../src/theme';
import { Btn, Portrait, Screen, Txt, VerifiedDots } from '../src/ui';

interface Letter {
  id: string;
  name: string;
  meta: string;
  marks: number;
  sup?: boolean;
  preview: string;
  time: string;
}
const SEED: Letter[] = [
  {
    id: '1',
    name: '김민준',
    meta: '32 · 변호사 · 서초',
    marks: 4,
    sup: true,
    time: '2시간 전',
    preview:
      '갤러리를 천천히 도는 걸 좋아한다는 문장에서 멈췄어요. 저도 주말이면 종종 미술관에 가는데, 좋아하는 작가가 겹칠지 궁금합니다…',
  },
  {
    id: '2',
    name: '이도현',
    meta: '35 · 정형외과 전문의 · 압구정',
    marks: 4,
    time: '어제',
    preview:
      '서핑을 하신다는 게 인상적이었어요. 저도 양양을 자주 가는데, 다음 시즌엔 같이 파도를 기다릴 수 있으면 좋겠다는 생각을 했습니다…',
  },
  {
    id: '3',
    name: '정우성',
    meta: '38 · 자산운용사 대표 · 한남',
    marks: 3,
    time: '2일 전',
    preview:
      '짧지만 진심을 담아 적습니다. 서로의 일을 존중할 수 있는 분을 오래 찾았어요. 한 번 차분히 대화 나눠보고 싶습니다…',
  },
];

export default function Inbox() {
  const router = useRouter();
  const [letters, setLetters] = useState(SEED);

  function decline(id: string) {
    setLetters((l) => l.filter((x) => x.id !== id));
  }

  return (
    <Screen>
      <View style={{ padding: 24 }}>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 6 }}>
          The Inbox
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2}>
          받은 신청서
        </Txt>
        <Txt size={13} color={C.gray} style={{ marginTop: 8, lineHeight: 21 }}>
          정성이 담긴 글이 먼저 도착합니다. 천천히 읽고, 정중하게 답해 주세요.
        </Txt>

        <View style={{ marginTop: 20 }}>
          {letters.length === 0 ? (
            <View
              style={{
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: C.hairLight,
                borderRadius: RADIUS,
              }}
            >
              <Txt size={13} color={C.gray}>
                모든 신청서를 확인했습니다.
              </Txt>
            </View>
          ) : (
            letters.map((l) => (
              <View
                key={l.id}
                style={{
                  borderWidth: 1,
                  borderColor: C.hairLight,
                  padding: 18,
                  borderRadius: RADIUS,
                  marginBottom: 14,
                  backgroundColor: '#fff',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 46, height: 46 }}>
                      <Portrait fill />
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Txt size={14.5} weight="500" color={C.ink2}>
                          {l.name}
                        </Txt>
                        {l.sup ? (
                          <Txt
                            variant="mono"
                            size={8.5}
                            color={C.champagne}
                            style={{
                              borderWidth: 1,
                              borderColor: C.champagne,
                              paddingHorizontal: 4,
                              paddingVertical: 1,
                            }}
                          >
                            SUPER
                          </Txt>
                        ) : null}
                      </View>
                      <Txt size={11.5} color={C.gray} style={{ marginTop: 1 }}>
                        {l.meta}
                      </Txt>
                    </View>
                  </View>
                  <VerifiedDots marks={l.marks} size={5} />
                </View>
                <Txt
                  size={13}
                  color={C.ink2}
                  style={{ lineHeight: 22, marginTop: 14, fontStyle: 'italic' }}
                >
                  “{l.preview}”
                </Txt>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 14,
                  }}
                >
                  <Txt variant="mono" size={9.5} color={C.gray}>
                    {l.time}
                  </Txt>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Btn
                      label="정중히 거절"
                      variant="outline"
                      labelColor={C.terra}
                      style={{ paddingVertical: 8, paddingHorizontal: 14, borderColor: C.terra }}
                      onPress={() => decline(l.id)}
                    />
                    <Btn
                      label="수락하고 채팅"
                      variant="solid"
                      style={{ paddingVertical: 8, paddingHorizontal: 14 }}
                      onPress={() => router.push('/chat')}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </Screen>
  );
}
