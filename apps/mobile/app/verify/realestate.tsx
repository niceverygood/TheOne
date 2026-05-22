import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { C, RADIUS } from '../../src/theme';
import { Txt } from '../../src/ui';
import { DocUpload, SecurityNote, ValueTier, VerifyShell } from '../../src/forms';

/** Screen 23 · 부동산 인증 + 가액 구간 */
export default function VerifyRealEstate() {
  return (
    <VerifyShell
      en="Real Estate Verification"
      title="부동산 인증"
      days="4"
      cta="부동산 인증 신청"
      subtitle="등기부등본과 외관 사진, 공시지가 증빙을 제출합니다. 가액 구간 뱃지만 노출됩니다."
    >
      <ValueTier tiers={['10억 미만', '10억~30억', '30억~50억', '50억 이상']} initial={2} />

      <View style={{ marginBottom: 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Txt size={13.5} weight="500" color={C.ink2}>
            부동산 외관 사진
          </Txt>
          <Txt variant="mono" size={9} color={C.terra}>
            필수
          </Txt>
        </View>
        <View
          style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: RADIUS, overflow: 'hidden' }}
        >
          <Svg width="100%" height="100%" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice">
            <Rect width="160" height="90" fill="#D8D1C2" />
            <Rect x="40" y="22" width="80" height="68" fill="#A89F8E" opacity={0.55} />
            {[30, 46, 62, 78].map((y) =>
              [56, 72, 88, 104].map((x) => (
                <Rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width="8"
                  height="10"
                  fill="#E8E2D5"
                  opacity={0.7}
                />
              )),
            )}
          </Svg>
        </View>
      </View>

      <DocUpload doc={{ label: '등기부등본 (발급 30일 이내)', required: true }} attached />
      <DocUpload doc={{ label: '공시지가 증빙', required: true }} />
      <DocUpload doc={{ label: '임대차 계약서 (수익형일 경우)', required: false }} />
      <SecurityNote />
    </VerifyShell>
  );
}
