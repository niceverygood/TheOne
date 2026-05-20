/* ============================================================
   Step 04 · 사진
   5개 슬롯 + 가이드라인
   ============================================================ */

function ScreenStep04() {
  const slots = [
    { filled: true, label: "PORTRAIT · 1" },
    { filled: true, label: "PORTRAIT · 2" },
    { filled: false },
    { filled: false },
    { filled: false },
  ];
  return (
    <AppShell
      step={4}
      eyebrow="Photographs"
      title="사진"
      subtitle="얼굴이 선명히 보이는 사진을 5장까지 등록할 수 있습니다. 첫 사진이 대표 이미지가 됩니다."
      footer={<FormFooter next="다음 — 설문" />}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {slots.map((s, i) => (
          <div key={i} style={{ position: "relative", aspectRatio: "3/4" }}>
            {s.filled ? (
              <Portrait label={s.label} ratio="0">
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#E8E2D5,#C8C1B1)" }} />
                <svg viewBox="0 0 100 130" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <circle cx="50" cy="52" r="18" fill="#A89F8E" opacity="0.6" />
                  <path d="M20 130 Q20 92 50 92 Q80 92 80 130 Z" fill="#A89F8E" opacity="0.6" />
                </svg>
                {i === 0 && <span className="mono" style={{ position: "absolute", bottom: 6, left: 6, fontSize: 8, color: "var(--ivory)", background: "var(--ink-2)", padding: "2px 5px" }}>대표</span>}
              </Portrait>
            ) : (
              <div style={{ width: "100%", height: "100%", border: "1px dashed var(--gray-soft)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2 }}>
                <span className="mono" style={{ fontSize: 20, color: "var(--gray-soft)" }}>+</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>가이드라인</div>
        {[
          "최근 6개월 이내 촬영한 본인 사진",
          "얼굴이 정면으로 또렷하게 보일 것",
          "단체 사진·과도한 보정·선글라스 불가",
          "검증 위원이 본인 여부를 확인합니다",
        ].map((g, i) => (
          <div key={i} className="flex aic" style={{ gap: 10, marginBottom: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--champagne)" }} />
            <span className="body-kr" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{g}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

window.ScreenStep04 = ScreenStep04;
