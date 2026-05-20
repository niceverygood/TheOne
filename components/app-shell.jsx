/* ============================================================
   가입 심사 공통 — AppShell · FormFooter · Field · ChoiceRow · UploadSlot
   ============================================================ */

function StepDots({ step, total = 6 }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          height: 3,
          width: i + 1 === step ? 22 : 8,
          background: i + 1 <= step ? "var(--ink-2)" : "var(--ivory-3)",
          transition: "all .2s",
        }} />
      ))}
    </div>
  );
}

function AppShell({ step, total, eyebrow, title, subtitle, children, footer, hideBack }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: "var(--ivory)" }}>
      <div style={{ padding: "60px 24px 0" }}>
        <div className="flex jcb aic" style={{ marginBottom: 28 }}>
          {!hideBack
            ? <span className="mono" style={{ fontSize: 18, color: "var(--ink-2)", cursor: "pointer" }}>←</span>
            : <span style={{ width: 18 }} />}
          {step != null && <StepDots step={step} total={total} />}
          <span className="mono" style={{ fontSize: 10, color: "var(--gray)" }}>
            {step != null ? `0${step}/0${total || 6}` : ""}
          </span>
        </div>
        {eyebrow && <div className="editorial-en" style={{ fontSize: 15, color: "var(--champagne)", marginBottom: 8 }}>{eyebrow}</div>}
        <h1 className="serif-kr" style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.3, color: "var(--ink-2)" }}>{title}</h1>
        {subtitle && <p className="body-kr" style={{ fontSize: 13.5, color: "var(--gray)", marginTop: 10, lineHeight: 1.6 }}>{subtitle}</p>}
      </div>
      <div style={{ flex: 1, padding: "32px 24px 24px" }}>{children}</div>
      {footer && <div style={{ padding: "16px 24px 40px", borderTop: "1px solid var(--hair-light)" }}>{footer}</div>}
    </div>
  );
}

function FormFooter({ prev = "이전", next = "다음", disabled, onlyNext, intro, hint }) {
  if (intro) {
    return (
      <div>
        {hint && <p className="body-kr" style={{ fontSize: 11.5, color: "var(--gray)", textAlign: "center", marginBottom: 14 }}>{hint}</p>}
        <button className="o-btn o-btn-solid" style={{ width: "100%" }}>{next}</button>
      </div>
    );
  }
  if (onlyNext) {
    return <button className="o-btn o-btn-solid" style={{ width: "100%" }} disabled={disabled}>{next}</button>;
  }
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button className="o-btn o-btn-outline" style={{ flex: "0 0 96px" }}>{prev}</button>
      <button className="o-btn o-btn-solid" style={{ flex: 1 }} disabled={disabled}>{next}</button>
    </div>
  );
}

function Field({ label, value, eyebrow, placeholder, verified, action, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
      <div style={{ borderBottom: "1px solid var(--hair-light)", paddingBottom: 10 }}>
        <div className="flex jcb aic">
          <span className="body-kr" style={{ fontSize: 11, color: "var(--gray)" }}>{label}</span>
          {action && <span className="mono" style={{ fontSize: 10, color: "var(--champagne)", cursor: "pointer" }}>{action}</span>}
        </div>
        <div className="flex jcb aic" style={{ marginTop: 6 }}>
          <span className="body-kr" style={{ fontSize: 16, color: value ? "var(--ink-2)" : "var(--gray-soft)", fontWeight: value ? 500 : 400 }}>
            {value || placeholder}
          </span>
          {verified && <span className="mono" style={{ fontSize: 9, color: "var(--sage)" }}>✓ 인증됨</span>}
        </div>
      </div>
      {hint && <p className="body-kr" style={{ fontSize: 11, color: "var(--gray)", marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

function ChoiceRow({ label, value, selected, hint }) {
  return (
    <div className="flex jcb aic" style={{
      padding: "16px 16px",
      border: "1px solid " + (selected ? "var(--ink-2)" : "var(--hair-light)"),
      background: selected ? "var(--ink-2)" : "transparent",
      marginBottom: 8,
      borderRadius: 2,
      cursor: "pointer",
    }}>
      <div>
        <div className="body-kr" style={{ fontSize: 14.5, fontWeight: 500, color: selected ? "var(--ivory)" : "var(--ink-2)" }}>{label}</div>
        {hint && <div className="body-kr" style={{ fontSize: 11, color: selected ? "rgba(250,247,242,0.6)" : "var(--gray)", marginTop: 2 }}>{hint}</div>}
      </div>
      <span style={{
        width: 16, height: 16, borderRadius: "50%",
        border: "1px solid " + (selected ? "var(--ivory)" : "var(--gray-soft)"),
        background: selected ? "var(--champagne)" : "transparent",
        flexShrink: 0,
      }} />
      {value && <span className="body-kr" style={{ fontSize: 13, color: selected ? "var(--ivory)" : "var(--ink-2)" }}>{value}</span>}
    </div>
  );
}

function UploadSlot({ label, hint, dashed = true }) {
  return (
    <div style={{
      border: (dashed ? "1px dashed " : "1px solid ") + "var(--gray-soft)",
      padding: "20px 16px",
      textAlign: "center",
      borderRadius: 2,
      marginBottom: 10,
    }}>
      <div className="body-kr" style={{ fontSize: 13.5, color: "var(--ink-2)", fontWeight: 500 }}>+ {label}</div>
      {hint && <div className="body-en" style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

window.AppShell = AppShell;
window.FormFooter = FormFooter;
window.Field = Field;
window.ChoiceRow = ChoiceRow;
window.UploadSlot = UploadSlot;
window.StepDots = StepDots;
