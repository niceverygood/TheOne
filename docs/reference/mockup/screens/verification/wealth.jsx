/* Screen 21 · 재산 인증 신청 (평균 5일) + 가액 구간 4단계 */

function ScreenVerifyWealth() {
  return (
    <VerifyShell
      en="Wealth Verification"
      title="재산 인증"
      days="5"
      subtitle="잔고증명서와 소득 자료를 제출합니다. 구체 금액이 아닌 가액 구간 뱃지만 매칭 상대에게 노출됩니다."
      cta="재산 인증 신청"
    >
      <ValueTier tiers={["5억~10억", "10억~30억", "30억~50억", "50억 이상"]} selected={1} />
      <div className="eyebrow" style={{ marginBottom: 16 }}>서류 제출</div>
      <DocUpload doc={{ label: "잔고증명서 (발급 30일 이내)", required: true, files: [{ name: "잔고증명_KB.pdf", size: "0.5 MB", kind: "PDF" }], canAdd: true }} />
      <DocUpload doc={{ label: "종합소득세 신고확인서", required: true, files: [] }} />
      <DocUpload doc={{ label: "금융자산 명세 (증권·펀드·예적금)", required: false, files: [] }} />
      <SecurityNote />
    </VerifyShell>
  );
}

window.ScreenVerifyWealth = ScreenVerifyWealth;
