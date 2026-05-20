/* Screen 23 · 부동산 인증 신청 (평균 4일) + 가액 구간 4단계 */

function ScreenVerifyRealEstate() {
  return (
    <VerifyShell
      en="Real Estate Verification"
      title="부동산 인증"
      days="4"
      subtitle="등기부등본과 외관 사진, 공시지가 증빙을 제출합니다. 가액 구간 뱃지만 노출됩니다."
      cta="부동산 인증 신청"
    >
      <ValueTier tiers={["10억 미만", "10억~30억", "30억~50억", "50억 이상"]} selected={2} />

      {/* 외관 사진 */}
      <div style={{ marginBottom: 22 }}>
        <div className="flex aic" style={{ gap: 8, marginBottom: 10 }}>
          <span className="body-kr" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-2)" }}>부동산 외관 사진</span>
          <span className="mono" style={{ fontSize: 9, color: "var(--terra)" }}>필수</span>
        </div>
        <div style={{ aspectRatio: "16/9", position: "relative" }}>
          <Portrait label="PROPERTY · 외관" ratio="0">
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#E8E2D5,#C8C1B1)" }} />
            <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <rect x="40" y="22" width="80" height="68" fill="#A89F8E" opacity="0.55" />
              {[30, 46, 62, 78].map(y => [56, 72, 88, 104].map(x => (
                <rect key={x + "-" + y} x={x} y={y} width="8" height="10" fill="#E8E2D5" opacity="0.7" />
              )))}
            </svg>
          </Portrait>
        </div>
      </div>

      <DocUpload doc={{ label: "등기부등본 (발급 30일 이내)", required: true, files: [{ name: "등기부등본.pdf", size: "0.6 MB", kind: "PDF" }], canAdd: true }} />
      <DocUpload doc={{ label: "공시지가 증빙", required: true, files: [] }} />
      <DocUpload doc={{ label: "임대차 계약서 (수익형일 경우)", required: false, files: [] }} />
      <SecurityNote />
    </VerifyShell>
  );
}

window.ScreenVerifyRealEstate = ScreenVerifyRealEstate;
