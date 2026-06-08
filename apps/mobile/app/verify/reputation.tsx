import { View } from 'react-native';
import { Field, Txt } from '../../src/ui';
import { DocUpload, SecurityNote, VerifyShell } from '../../src/forms';
import { useVerifySubmit } from '../../src/use-verify-submit';

/** 명성 인증 신청 */
export default function VerifyReputation() {
  const { submitting, onSubmit } = useVerifySubmit({ type: 'reputation', label: '공식 프로필' });
  return (
    <VerifyShell
      en="Reputation Verification"
      title="명성 인증"
      days="2"
      cta={submitting ? '신청 중…' : '명성 인증 신청'}
      onSubmit={onSubmit}
      subtitle="언론 보도·공식 프로필·수상 내역 등으로 사회적 평판을 확인합니다. 매칭 상대에게는 인증 뱃지만 노출됩니다."
    >
      <Field eyebrow="대표 활동" label="공식 직함 / 분야" value="비상장사 대표 · 業界 수상 이력" />
      <View style={{ marginTop: 8 }}>
        <Txt variant="eyebrow" style={{ marginBottom: 16 }}>
          서류 제출
        </Txt>
        <DocUpload doc={{ label: '언론 보도·기사 또는 공식 프로필', required: true }} attached />
        <DocUpload doc={{ label: '수상·임명장 또는 공식 직함 증빙', required: true }} />
        <DocUpload doc={{ label: '저서·특허·전시 등 활동 증빙', required: false }} />
        <SecurityNote />
      </View>
    </VerifyShell>
  );
}
