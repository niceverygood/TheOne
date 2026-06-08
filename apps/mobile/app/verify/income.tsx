import { Txt } from '../../src/ui';
import { DocUpload, SecurityNote, ValueTier, VerifyShell } from '../../src/forms';
import { useVerifySubmit } from '../../src/use-verify-submit';

/** 소득 인증 신청 + 연소득 구간 */
export default function VerifyIncome() {
  const { submitting, onSubmit } = useVerifySubmit({
    type: 'income',
    label: '소득금액증명원',
    valueTier: '1억~2억',
  });
  return (
    <VerifyShell
      en="Income Verification"
      title="소득 인증"
      days="1"
      cta={submitting ? '신청 중…' : '소득 인증 신청'}
      onSubmit={onSubmit}
      subtitle="소득금액증명원과 원천징수영수증을 제출합니다. 구체 금액이 아닌 연소득 구간 뱃지만 노출됩니다."
    >
      <ValueTier tiers={['1억 미만', '1억~2억', '2억~3억', '3억 이상']} initial={1} />
      <Txt variant="eyebrow" style={{ marginBottom: 16 }}>
        서류 제출
      </Txt>
      <DocUpload
        doc={{ label: '소득금액증명원 (홈택스, 발급 7일 이내)', required: true }}
        attached
      />
      <DocUpload doc={{ label: '근로소득 원천징수영수증', required: true }} />
      <DocUpload doc={{ label: '급여명세서 (최근 3개월)', required: false }} />
      <SecurityNote />
    </VerifyShell>
  );
}
