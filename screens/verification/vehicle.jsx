/* Screen 22 · 차량 인증 신청 (평균 2일) · 자동차등록증 + 차량 사진 */

function ScreenVerifyVehicle() {
  return (
    <VerifyShell
      en="Vehicle Verification"
      title="보유 차량 인증"
      days="2"
      subtitle="본인 명의 자동차등록증과 번호판이 일치하는 차량 사진 2장을 제출합니다."
      cta="차량 인증 신청"
    >
      <Field eyebrow="차량" label="모델 · 연식" value="입력해 주세요" placeholder="예: G80 · 2024" />

      {/* 차량 사진 2장 */}
      <div style={{ marginTop: 8, marginBottom: 22 }}>
        <div className="flex aic" style={{ gap: 8, marginBottom: 10 }}>
          <span className="body-kr" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-2)" }}>차량 사진 (정면 + 측면)</span>
          <span className="mono" style={{ fontSize: 9, color: "var(--terra)" }}>필수</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["정면 · 번호판", "측면"].map((l, i) => (
            <div key={l} style={{ aspectRatio: "4/3", position: "relative" }}>
              {i === 0 ? (
                <Portrait label={"VEHICLE · " + l} ratio="0">
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#E8E2D5,#C8C1B1)" }} />
                  <svg viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    <rect x="18" y="38" width="64" height="22" rx="4" fill="#A89F8E" opacity="0.6" />
                    <rect x="30" y="26" width="40" height="16" rx="5" fill="#A89F8E" opacity="0.55" />
                    <circle cx="32" cy="60" r="7" fill="#8B8378" />
                    <circle cx="68" cy="60" r="7" fill="#8B8378" />
                  </svg>
                </Portrait>
              ) : (
                <div style={{ width: "100%", height: "100%", border: "1px dashed var(--gray-soft)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2 }}>
                  <span className="mono" style={{ fontSize: 18, color: "var(--gray-soft)" }}>+</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <DocUpload doc={{ label: "자동차등록증 (본인 명의)", required: true, files: [{ name: "자동차등록증.pdf", size: "0.4 MB", kind: "PDF" }], canAdd: false }} />
      <DocUpload doc={{ label: "차량가액 증빙 (영수증·시세표)", required: false, files: [] }} />
      <SecurityNote />
    </VerifyShell>
  );
}

window.ScreenVerifyVehicle = ScreenVerifyVehicle;
