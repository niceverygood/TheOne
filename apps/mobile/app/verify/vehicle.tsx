import { View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { C, RADIUS } from '../../src/theme';
import { Field, Txt } from '../../src/ui';
import { DocUpload, SecurityNote, VerifyShell } from '../../src/forms';
import { useVerifySubmit } from '../../src/use-verify-submit';

/** Screen 22 · 차량 인증 — 자동차등록증 + 차량 사진 */
export default function VerifyVehicle() {
  const { submitting, onSubmit } = useVerifySubmit({ type: 'vehicle', label: '자동차등록증' });
  return (
    <VerifyShell
      en="Vehicle Verification"
      title="보유 차량 인증"
      days="2"
      cta={submitting ? '신청 중…' : '차량 인증 신청'}
      onSubmit={onSubmit}
      subtitle="본인 명의 자동차등록증과 번호판이 일치하는 차량 사진 2장을 제출합니다."
    >
      <Field eyebrow="차량" label="모델 · 연식" placeholder="예: G80 · 2024" />

      <View style={{ marginTop: 8, marginBottom: 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Txt size={13.5} weight="500" color={C.ink2}>
            차량 사진 (정면 + 측면)
          </Txt>
          <Txt variant="mono" size={9} color={C.terra}>
            필수
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, aspectRatio: 4 / 3, borderRadius: RADIUS, overflow: 'hidden' }}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 100 75"
              preserveAspectRatio="xMidYMid slice"
            >
              <Rect width="100" height="75" fill="#D8D1C2" />
              <Rect x="18" y="38" width="64" height="22" rx="4" fill="#A89F8E" opacity={0.6} />
              <Rect x="30" y="26" width="40" height="16" rx="5" fill="#A89F8E" opacity={0.55} />
              <Circle cx="32" cy="60" r="7" fill="#8B8378" />
              <Circle cx="68" cy="60" r="7" fill="#8B8378" />
            </Svg>
          </View>
          <View
            style={{
              flex: 1,
              aspectRatio: 4 / 3,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: C.graySoft,
              borderRadius: RADIUS,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Txt variant="mono" size={18} color={C.graySoft}>
              +
            </Txt>
          </View>
        </View>
      </View>

      <DocUpload doc={{ label: '자동차등록증 (본인 명의)', required: true }} attached />
      <DocUpload doc={{ label: '차량가액 증빙 (영수증·시세표)', required: false }} />
      <SecurityNote />
    </VerifyShell>
  );
}
