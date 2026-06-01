import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, RADIUS } from '../src/theme';
import { Btn, Hairline, Screen, Txt } from '../src/ui';
import { useSignup } from '../src/store';

/**
 * 계정 영구 삭제 (Apple 5.1.1(v) · Google Play 계정 삭제 요구사항).
 * 가입을 한 사용자가 앱 내에서 직접 계정과 데이터 삭제를 시작할 수 있어야 한다.
 * 백엔드 연동 전(Phase 4 mock) — 삭제 요청 접수 + 로컬 상태 초기화로 동작.
 */

const WILL_DELETE = [
  '프로필 · 사진 · 자기소개',
  '학력 · 재산 · 차량 · 부동산 인증 뱃지',
  '큐레이션 · 만남 신청 · 매칭 내역',
  '대화 내용',
];

export default function DeleteAccount() {
  const router = useRouter();
  const resetSignup = useSignup((s) => s.reset);
  const [agreed, setAgreed] = useState(false);
  const [phase, setPhase] = useState<'form' | 'done'>('form');

  function handleDelete() {
    // 백엔드 연동 시: DELETE /account 호출. 현재는 로컬 세션/온보딩 상태 초기화.
    resetSignup();
    setPhase('done');
  }

  if (phase === 'done') {
    return (
      <Screen dark scroll={false}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 16 }}>
            Account Closed
          </Txt>
          <Txt
            variant="serifKr"
            size={24}
            weight="700"
            color={C.ivory}
            style={{ textAlign: 'center', lineHeight: 34 }}
          >
            계정 삭제가{'\n'}요청되었습니다
          </Txt>
          <Txt
            size={13}
            color="rgba(250,247,242,0.7)"
            style={{ marginTop: 14, textAlign: 'center', lineHeight: 22 }}
          >
            회원님의 정보는 30일 이내 영구 삭제됩니다.{'\n'}그동안 THE ONE을 찾아주셔서
            감사했습니다.
          </Txt>
        </View>
        <View style={{ paddingHorizontal: 32, paddingBottom: 32 }}>
          <Btn label="확인" variant="champ" onPress={() => router.replace('/')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ padding: 24 }}>
        <Pressable onPress={() => router.back()}>
          <Txt variant="mono" size={18} color={C.ink2}>
            ←
          </Txt>
        </Pressable>

        <Txt variant="serifEn" size={15} color={C.terra} style={{ marginTop: 22, marginBottom: 6 }}>
          Delete Account
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2}>
          계정 영구 삭제
        </Txt>
        <Txt size={13.5} color={C.gray} style={{ marginTop: 12, lineHeight: 22 }}>
          계정을 삭제하면 되돌릴 수 없습니다. 삭제를 진행하면 아래 정보가 즉시 비공개 처리되고 30일
          이내 영구 삭제됩니다.
        </Txt>

        {/* 삭제되는 항목 */}
        <View style={{ marginTop: 28 }}>
          <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
            삭제되는 정보
          </Txt>
          {WILL_DELETE.map((item) => (
            <View
              key={item}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9 }}
            >
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 4,
                  backgroundColor: C.terra,
                  marginRight: 12,
                }}
              />
              <Txt size={14} color={C.ink2}>
                {item}
              </Txt>
            </View>
          ))}
        </View>

        {/* 법령상 보관 고지 */}
        <View
          style={{
            borderWidth: 1,
            borderColor: C.hairLight,
            backgroundColor: C.ivory2,
            padding: 18,
            borderRadius: RADIUS,
            marginTop: 20,
          }}
        >
          <Txt size={12} color={C.gray} style={{ lineHeight: 20 }}>
            전자상거래법 등 관계 법령에 따라 결제·거래 기록은 삭제 후에도 5년간 별도 보관되며, 보관
            기간이 지나면 자동 파기됩니다.
          </Txt>
        </View>

        {/* 동의 체크 */}
        <Pressable
          onPress={() => setAgreed((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28 }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: agreed ? C.terra : C.graySoft,
              backgroundColor: agreed ? C.terra : 'transparent',
              borderRadius: RADIUS,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            {agreed ? (
              <Txt variant="mono" size={11} color={C.ivory}>
                ✓
              </Txt>
            ) : null}
          </View>
          <Txt size={13.5} color={C.ink2} style={{ flex: 1 }}>
            위 내용을 확인했으며 계정 삭제에 동의합니다.
          </Txt>
        </Pressable>

        <Hairline style={{ marginTop: 28 }} />
        <Btn
          label="계정 영구 삭제"
          variant="solid"
          labelColor={C.ivory}
          disabled={!agreed}
          style={{ marginTop: 24, backgroundColor: C.terra, borderColor: C.terra }}
          onPress={handleDelete}
        />
        <Btn label="취소" variant="ghost" style={{ marginTop: 4 }} onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
