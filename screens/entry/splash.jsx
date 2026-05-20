/* ============================================================
   Screen 01 · Splash + Application Gate
   잉크 캔버스 + 샴페인 코너 틱 + "Application Only" + 통과율 23%
   ============================================================ */

function ScreenSplash() {
  const tick = (pos) => {
    const base = { position: "absolute", width: 22, height: 22 };
    const b = "1px solid var(--champagne)";
    if (pos === "tl") return { ...base, top: 40, left: 28, borderTop: b, borderLeft: b };
    if (pos === "tr") return { ...base, top: 40, right: 28, borderTop: b, borderRight: b };
    if (pos === "bl") return { ...base, bottom: 40, left: 28, borderBottom: b, borderLeft: b };
    return { ...base, bottom: 40, right: 28, borderBottom: b, borderRight: b };
  };
  return (
    <div style={{ minHeight: "100%", background: "var(--ink)", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px" }}>
      <div style={tick("tl")} /><div style={tick("tr")} />
      <div style={tick("bl")} /><div style={tick("br")} />

      <div style={{ textAlign: "center" }}>
        <div className="eyebrow" style={{ color: "var(--champagne)", marginBottom: 28 }}>Application Only</div>
        <h1 className="serif-kr" style={{ fontSize: 46, fontWeight: 700, color: "var(--ivory)", lineHeight: 1.1 }}>THE ONE</h1>
        <div className="editorial-en" style={{ fontSize: 17, color: "var(--gray-soft)", marginTop: 10 }}>The One, and only.</div>

        <p className="body-kr" style={{ fontSize: 13.5, color: "rgba(250,247,242,0.7)", marginTop: 40, lineHeight: 1.8 }}>
          인생에 한 번뿐인 매칭.<br/>검증된 결혼 의지를 가진 분들만<br/>심사를 거쳐 입회합니다.
        </p>

        {/* 통과율 */}
        <div style={{ marginTop: 48, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--gray)", letterSpacing: "0.14em" }}>가입 통과율</span>
          <span className="serif-kr" style={{ fontSize: 36, fontWeight: 700, color: "var(--champagne)", lineHeight: 1 }}>23%</span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 56, left: 40, right: 40 }}>
        <button className="o-btn o-btn-champ" style={{ width: "100%" }}>가입 심사 신청하기</button>
        <p className="body-kr" style={{ fontSize: 12, color: "var(--gray)", textAlign: "center", marginTop: 14 }}>
          이미 회원이신가요? <span style={{ color: "var(--ivory)", textDecoration: "underline" }}>로그인</span>
        </p>
      </div>
    </div>
  );
}

window.ScreenSplash = ScreenSplash;
