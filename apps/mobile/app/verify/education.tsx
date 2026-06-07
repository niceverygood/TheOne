import { View } from 'react-native';
import { Field } from '../../src/ui';
import { Txt } from '../../src/ui';
import { DocUpload, SecurityNote, VerifyShell } from '../../src/forms';
import { useVerifySubmit } from '../../src/use-verify-submit';

/** Screen 20 · 학력 인증 신청 */
export default function VerifyEducation() {
  const { submitting, onSubmit } = useVerifySubmit({ type: 'education', label: '졸업증명서' });
  return (
    <VerifyShell
      en="Education Verification"
      title="학력 인증"
      days="3"
      cta={submitting ? '신청 중…' : '학력 인증 신청'}
      onSubmit={onSubmit}
      subtitle="졸업·학위 증명서를 제출하면 관리자가 직접 검토 후 학력 뱃지를 부여합니다."
    >
      <Field eyebrow="학교" label="최종 학력" value="서울대학교" />
      <Field eyebrow="전공 / 학위" label="과정" value="법학과 · 석사" />
      <View style={{ marginTop: 8 }}>
        <Txt variant="eyebrow" style={{ marginBottom: 16 }}>
          서류 제출
        </Txt>
        <DocUpload doc={{ label: '졸업증명서', required: true }} attached />
        <DocUpload doc={{ label: '학위증명서 (석·박사 시)', required: true }} />
        <DocUpload doc={{ label: '전문 자격증', required: false }} />
        <SecurityNote />
      </View>
    </VerifyShell>
  );
}
