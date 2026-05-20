/* ============================================================
   추가 인증 신청 공통 — VerifyShell · ValueTier
   ============================================================ */

function VerifyShell({ en, title, days, subtitle, cta, children }) {
  return (
    <div style={{ minHeight: "100%", background: "var(--ivory)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "60px 24px 0" }}>
        <div className="flex jcb aic" style={{ marginBottom: 22 }}>
          <span className="mono" style={{ fontSize: 18, color: "var(--ink-2)" }}>←</span>
          <span className="mono" style={{ fontSize: 10, color: "var(--gray)" }}>평균 {days}일</span>
        </div>
        <div className="editorial-en" style={{ fontSize: 15, color: "var(--champagne)", marginBottom: 6 }}>{en}</div>
        <h1 className="serif-kr" style={{ fontSize: 26, fontWeight: 700, color: "var(--ink-2)" }}>{title}</h1>
        {subtitle && <p className="body-kr" style={{ fontSize: 13, color: "var(--gray)", marginTop: 8, lineHeight: 1.6 }}>{subtitle}</p>}
      </div>
      <div style={{ flex: 1, padding: "28px 24px 24px" }}>{children}</div>
      <div style={{ padding: "16px 24px 40px", borderTop: "1px solid var(--hair-light)" }}>
        <button className="o-btn o-btn-solid" style={{ width: "100%" }}>{cta}</button>
      </div>
    </div>
  );
}

function ValueTier({ tiers, selected }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>가액 구간</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {tiers.map((t, i) => (
          <div key={t} style={{
            padding: "13px 12px", textAlign: "center", borderRadius: 2,
            border: "1px solid " + (i === selected ? "var(--ink-2)" : "var(--hair-light)"),
            background: i === selected ? "var(--ink-2)" : "transparent",
            color: i === selected ? "var(--ivory)" : "var(--ink-2)",
          }} className="body-kr">{t}</div>
        ))}
      </div>
    </div>
  );
}

window.VerifyShell = VerifyShell;
window.ValueTier = ValueTier;
