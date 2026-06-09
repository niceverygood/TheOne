import { View } from 'react-native';
import { Field, Txt } from '../../src/ui';
import { DocUpload, SecurityNote, VerifyShell } from '../../src/forms';
import { useVerifySubmit } from '../../src/use-verify-submit';

/** 직업 인증 신청 */
export default function VerifyJob() {
  const { submitting, onSubmit } = useVerifySubmit({ type: 'job', label: '재직증명서' });
  return (
    <VerifyShell
      en="Occupation Verification"
      title="직업 인증"
      days="1"
      cta={submitting ? '신청 중…' : '직업 인증 신청'}
      onSubmit={onSubmit}
      subtitle="재직증명서 또는 사업자등록증으로 직업을 확인합니다. 매칭 상대에게는 직업 뱃지만 노출됩니다."
    >
      <Field eyebrow="직장 / 직무" label="현재 직업" value="법무법인 · 파트너 변호사" />
      <View style={{ marginTop: 8 }}>
        <Txt variant="eyebrow" style={{ marginBottom: 16 }}>
          서류 제출
        </Txt>
        <DocUpload doc={{ label: '재직증명서 또는 사업자등록증', required: true }} attached />
        <DocUpload doc={{ label: '명함 또는 사원증', required: true }} />
        <DocUpload doc={{ label: '직무 관련 자격·면허', required: false }} />
        <SecurityNote />
      </View>
    </VerifyShell>
  );
}
