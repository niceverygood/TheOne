import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CREDIT_PACKAGES } from '@theone/shared';
import { C, RADIUS } from '../src/theme';
import { Btn, Screen, Txt } from '../src/ui';
import { getIap } from '../src/iap';

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? (typeof window !== 'undefined' ? window.location.origin : '');

// 세션 연동 전까지는 데모 유저. API/auth 연동 시 교체.
const DEMO_USER_ID = 'demo-user';

function bonusRate(pkg: { credits: number; baseCredits: number }): number {
  if (pkg.credits === pkg.baseCredits) return 0;
  return Math.round(((pkg.credits - pkg.baseCredits) / pkg.baseCredits) * 100);
}

function fmtWon(n: number): string {
  return n.toLocaleString('ko-KR');
}

/** Screen 16 · 크레딧 충전 — packages/shared 8패키지 + IAP 결제 */
export default function Credits() {
  const router = useRouter();
  const [sel, setSel] = useState<number>(3);
  const [busy, setBusy] = useState(false);

  async function onPurchase() {
    const pkg = CREDIT_PACKAGES[sel];
    if (!pkg) return;
    setBusy(true);
    try {
      const iap = getIap();
      await iap.init();
      const purchase = await iap.buy(pkg.appleProductId);

      const res = await fetch(`${API_BASE}/api/payment/iap/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          platform: 'ios',
          productId: purchase.productId,
          receipt: purchase.receipt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.reason ?? 'verify_failed');

      await iap.finish(purchase);
      Alert.alert('충전 완료', `${data.credited} 크레딧이 적립되었습니다.`, [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      Alert.alert('결제 실패', msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={{ padding: 24 }}>
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
        </View>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 6 }}>
          Credits
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2}>
          크레딧 충전
        </Txt>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
            padding: 16,
            backgroundColor: C.ink2,
            borderRadius: RADIUS,
          }}
        >
          <Txt size={12.5} color="rgba(250,247,242,0.7)">
            현재 잔액
          </Txt>
          <Txt variant="mono" size={20} weight="600" color={C.ivory}>
            187 C
          </Txt>
        </View>

        <Txt variant="eyebrow" style={{ marginTop: 24, marginBottom: 14 }}>
          패키지 · {CREDIT_PACKAGES.length}
        </Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CREDIT_PACKAGES.map((pkg, i) => {
            const on = sel === i;
            const rate = bonusRate(pkg);
            return (
              <Pressable
                key={pkg.id}
                onPress={() => setSel(i)}
                style={{
                  width: '48%',
                  borderWidth: 1,
                  borderColor: on ? C.ink2 : C.hairLight,
                  backgroundColor: on ? C.ink2 : 'transparent',
                  padding: 16,
                  borderRadius: RADIUS,
                }}
              >
                {rate > 0 ? (
                  <Txt
                    variant="mono"
                    size={8.5}
                    color={on ? C.champagne : C.sage}
                    style={{ position: 'absolute', top: 10, right: 10 }}
                  >
                    +{rate}%
                  </Txt>
                ) : null}
                <Txt variant="serifKr" size={22} weight="700" color={on ? C.ivory : C.ink2}>
                  {pkg.credits.toLocaleString('ko-KR')}{' '}
                  <Txt size={12} color={C.gray}>
                    C
                  </Txt>
                </Txt>
                <Txt
                  variant="mono"
                  size={12}
                  color={on ? 'rgba(250,247,242,0.7)' : C.gray}
                  style={{ marginTop: 6 }}
                >
                  {fmtWon(pkg.won)}원
                </Txt>
              </Pressable>
            );
          })}
        </View>
        <Txt size={11} color={C.gray} style={{ marginTop: 16, lineHeight: 18 }}>
          신청서 일반 20C · 슈퍼 50C. 결제는 Apple/Google 스토어를 통해 처리되며 환불은 스토어
          정책을 따릅니다.
        </Txt>
        <Btn
          label={busy ? '결제 중…' : '결제하기'}
          variant="solid"
          style={{ marginTop: 20 }}
          disabled={busy}
          onPress={onPurchase}
        />
      </View>
    </Screen>
  );
}
