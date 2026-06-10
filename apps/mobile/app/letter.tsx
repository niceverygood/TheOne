import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { letterCost } from '@theone/shared';
import { C, RADIUS } from '../src/theme';
import { Btn, Hairline, Portrait, Screen, Txt } from '../src/ui';
import { ChoiceRow } from '../src/ui';
import { previewPortraits } from '../src/preview-assets';

// 서버 연동 전 프리뷰 상태 — 첫 신청 여부·잔액
const IS_FIRST_LETTER = true;
const BALANCE = 187;

/** 작성 가이드 — 수락률을 높이는 3요소. 탭하면 문장 시작점을 본문에 추가한다. */
const GUIDES: { label: string; starter: string }[] = [
  { label: '프로필에서 끌린 점', starter: '프로필에서 ' },
  { label: '나의 가치관 한 줄', starter: '저는 관계에서 ' },
  { label: '구체적인 만남 제안', starter: '괜찮으시다면 ' },
];

/** Screen 12 · 만남 신청서 (Interest Letter) — 골드스푼식 진지한 글쓰기 + 크레딧 차감 */
export default function Letter() {
  const router = useRouter();
  const [body, setBody] = useState(
    '지윤 님, 갤러리를 천천히 도는 걸 좋아한다는 문장에서 멈췄어요. 저도 주말이면 종종 미술관에 가는데, 좋아하는 작가가 겹칠지 궁금합니다. 서로의 일을 존중하면서 함께 성장할 수 있는 관계를 진지하게 찾고 있어요.',
  );
  const [sup, setSup] = useState(false);
  const len = body.length;
  const enough = len >= 80;

  const cost = letterCost(sup ? 'super' : 'normal', { isFirstLetter: IS_FIRST_LETTER });
  const short = BALANCE < cost; // 잔액 부족 → 충전 유도

  function appendStarter(starter: string) {
    setBody((b) => (b.trim().length === 0 ? starter : `${b.trimEnd()}\n${starter}`));
  }

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 22,
            }}
          >
            <Pressable onPress={() => router.back()}>
              <Txt variant="mono" size={18} color={C.ink2}>
                ←
              </Txt>
            </Pressable>
            <Txt variant="mono" size={10} color={C.gray}>
              잔액 {BALANCE} C
            </Txt>
          </View>
          <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 8 }}>
            An Interest Letter
          </Txt>
          <Txt variant="serifKr" size={24} weight="700" color={C.ink2} style={{ lineHeight: 33 }}>
            김지윤 님께{'\n'}마음을 전합니다
          </Txt>
          <Txt size={13} color={C.gray} style={{ marginTop: 10, lineHeight: 21 }}>
            가벼운 호감 대신, 진심을 담은 글을 보냅니다. 정성이 담긴 글이 매칭함 상단에 먼저
            보여집니다.
          </Txt>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: C.hairLight,
            }}
          >
            <View style={{ width: 44, height: 44 }}>
              <Portrait fill source={previewPortraits.jiyoon} />
            </View>
            <View>
              <Txt size={14} weight="500" color={C.ink2}>
                김지윤
              </Txt>
              <Txt size={11.5} color={C.gray}>
                32 · 변호사 · 서초
              </Txt>
            </View>
          </View>

          <Txt variant="eyebrow" style={{ marginTop: 20, marginBottom: 10 }}>
            마음을 담아 · 최소 80자
          </Txt>
          {/* 작성 가이드 칩 — 수락률 높은 신청서의 3요소 */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {GUIDES.map((g) => (
              <Pressable
                key={g.label}
                onPress={() => appendStarter(g.starter)}
                style={{
                  borderWidth: 1,
                  borderColor: C.hairLight,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: RADIUS,
                }}
              >
                <Txt variant="mono" size={10} color={C.gray}>
                  + {g.label}
                </Txt>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            style={{
              borderWidth: 1,
              borderColor: C.hairLight,
              padding: 16,
              minHeight: 150,
              borderRadius: RADIUS,
              backgroundColor: '#fff',
              fontSize: 13.5,
              lineHeight: 22,
              color: C.ink2,
              textAlignVertical: 'top',
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Txt variant="mono" size={10} color={C.gray}>
              {len} / 300자
            </Txt>
            <Txt variant="mono" size={10} color={enough ? C.sage : C.terra}>
              {enough ? '✓ 충분한 분량' : '80자 이상'}
            </Txt>
          </View>

          <View style={{ marginTop: 20 }}>
            <Txt variant="eyebrow" style={{ marginBottom: 10 }}>
              전송 방식
            </Txt>
            <ChoiceRow
              label={IS_FIRST_LETTER ? '일반 신청서 · 첫 신청 무료' : `일반 신청서 · ${20}C`}
              hint="매칭함에 순서대로 도착"
              selected={!sup}
              onPress={() => setSup(false)}
            />
            <ChoiceRow
              label="Super · 우선 신청서 · 50C"
              hint="매칭함 최상단 · 한정 노출"
              selected={sup}
              onPress={() => setSup(true)}
            />
          </View>
        </View>

        <View>
          <Hairline />
          <View style={{ padding: 24 }}>
            {short ? (
              <Txt size={11} color={C.terra} style={{ marginBottom: 10, textAlign: 'center' }}>
                잔액이 {cost - BALANCE}C 부족합니다. 충전 후 보낼 수 있어요.
              </Txt>
            ) : null}
            <Btn
              label={
                short
                  ? '크레딧 충전하기'
                  : cost === 0
                    ? '신청서 보내기 · 첫 신청 무료'
                    : `신청서 보내기 · ${cost}C 차감`
              }
              variant="solid"
              disabled={!enough && !short}
              onPress={() => (short ? router.push('/credits') : router.replace('/inbox'))}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}
