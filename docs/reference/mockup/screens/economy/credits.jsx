/* ============================================================
   Screen 16 · 크레딧 충전
   8개 패키지 + 24h 한정 부스트
   ============================================================ */

function ScreenCredits() {
  const packs = [
    ["80", "12,000", null],
    ["180", "26,000", "8%"],
    ["320", "44,000", "12%"],
    ["480", "62,000", "16%"],
    ["720", "89,000", "20%"],
    ["1,000", "119,000", "24%"],
    ["1,600", "179,000", "30%"],
    ["2,400", "249,000", "35%"],
  ];
  return (
    <div style={{ minHeight: "100%", background: "var(--ivory)" }}>
      <div style={{ padding: "60px 24px 0" }}>
        <div className="flex jcb aic" style={{ marginBottom: 24 }}>
          <span className="mono" style={{ fontSize: 18, color: "var(--ink-2)" }}>←</span>
        </div>
        <div className="editorial-en" style={{ fontSize: 15, color: "var(--champagne)", marginBottom: 6 }}>Credits</div>
        <h1 className="serif-kr" style={{ fontSize: 27, fontWeight: 700, color: "var(--ink-2)" }}>크레딧 충전</h1>
        <div className="flex jcb aic" style={{ marginTop: 16, padding: "14px 16px", background: "var(--ink-2)", borderRadius: 2 }}>
          <span className="body-kr" style={{ fontSize: 12.5, color: "rgba(250,247,242,0.7)" }}>현재 잔액</span>
          <span className="mono" style={{ fontSize: 20, color: "var(--ivory)", fontWeight: 600 }}>187 C</span>
        </div>
        <p className="mono" style={{ fontSize: 10, color: "var(--gray)", marginTop: 8 }}>지난 충전 · 04.21 · 99,000원 · 480 C</p>
      </div>

      {/* 24h 한정 부스트 */}
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ border: "1px solid var(--champagne)", padding: 16, borderRadius: 2 }}>
          <div className="flex jcb aic">
            <div className="editorial-en" style={{ fontSize: 14, color: "var(--champagne)" }}>24h Boost</div>
            <span className="mono" style={{ fontSize: 11, color: "var(--terra)" }}>11:42:08</span>
          </div>
          <div className="flex jcb aic" style={{ marginTop: 8 }}>
            <div>
              <div className="serif-kr" style={{ fontSize: 19, fontWeight: 700, color: "var(--ink-2)" }}>480 C + 120 C</div>
              <div className="body-kr" style={{ fontSize: 11.5, color: "var(--gray)", marginTop: 2 }}>한정 보너스 25%</div>
            </div>
            <button className="o-btn o-btn-champ" style={{ padding: "10px 18px" }}>99,000원</button>
          </div>
        </div>
      </div>

      {/* 8개 패키지 */}
      <div style={{ padding: "24px 24px 40px" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>패키지 · 8</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {packs.map(([c, won, bonus], i) => (
            <div key={i} style={{ border: "1px solid var(--hair-light)", padding: "16px 14px", borderRadius: 2, position: "relative" }}>
              {bonus && <span className="mono" style={{ position: "absolute", top: 10, right: 10, fontSize: 8.5, color: "var(--sage)" }}>+{bonus}</span>}
              <div className="serif-kr" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink-2)" }}>{c} <span style={{ fontSize: 12, color: "var(--gray)" }}>C</span></div>
              <div className="mono" style={{ fontSize: 12, color: "var(--gray)", marginTop: 6 }}>{won}원</div>
            </div>
          ))}
        </div>
        <p className="body-kr" style={{ fontSize: 11, color: "var(--gray)", marginTop: 16, lineHeight: 1.6 }}>
          신청서 일반 20C · 슈퍼 50C. 크레딧은 환불되지 않으며 매칭 성사 여부와 무관합니다.
        </p>
      </div>
    </div>
  );
}

window.ScreenCredits = ScreenCredits;
