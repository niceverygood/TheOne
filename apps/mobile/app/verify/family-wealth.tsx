import { Txt } from '../../src/ui';
import { DocUpload, SecurityNote, ValueTier, VerifyShell } from '../../src/forms';
import { useVerifySubmit } from '../../src/use-verify-submit';

/** 집안 자산 인증 신청 + 가액 구간 */
export default function VerifyFamilyWealth() {
  const { submitting, onSubmit } = useVerifySubmit({
    type: 'family_wealth',
    label: '가족관계증명서',
    valueTier: '30억~100억',
  });
  return (
    <VerifyShell
      en="Family Wealth Verification"
      title="집안 자산 인증"
      days="2"
      cta={submitting ? '신청 중…' : '집안 자산 인증 신청'}
      onSubmit={onSubmit}
      subtitle="가족관계증명서와 부모 명의 자산 증빙으로 확인합니다. 가액 구간 뱃지만 노출되며, 서류는 본인 동의 하에 제출해야 합니다."
    >
      <ValueTier tiers={['30억 미만', '30억~100억', '100억~300억', '300억 이상']} initial={1} />
      <Txt variant="eyebrow" style={{ marginBottom: 16 }}>
        서류 제출
      </Txt>
      <DocUpload doc={{ label: '가족관계증명서', required: true }} attached />
      <DocUpload doc={{ label: '부모 명의 자산 증빙 (등기부등본·잔고증명 등)', required: true }} />
      <DocUpload doc={{ label: '가업·법인 증빙', required: false }} />
      <SecurityNote />
    </VerifyShell>
  );
}
