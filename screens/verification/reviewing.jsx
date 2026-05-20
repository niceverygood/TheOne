/* Screen 24 · 인증 심사중 · Ticket №V-2026-XXXX + 펄스 타임라인 */

function ScreenVerifyReviewing() {
  const tl = [
    ["서류 접수", "05.18", "done"],
    ["관리자 검토 중", "진행 중", "active"],
    ["뱃지 부여", "대기", "wait"],
  ];
  return (
    <div style={{ minHeight: "100%", background: "var(--ivory)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "80px 32px 0", textAlign: "center" }}>
        <div className="editorial-en" style={{ fontSize: 15, color: "var(--champagne)", marginBottom: 14 }}>Under Review</div>

        {/* 펄스 */}
        <div style={{ width: 90, height: 90, margin: "0 auto", position: "relative" }}>
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid var(--champagne)", opacity: 0.35 }} />
          <span style={{ position: "absolute", inset: 16, borderRadius: "50%", border: "1px solid var(--champagne)", opacity: 0.6 }} />
          <span style={{ position: "absolute", inset: 34, borderRadius: "50%", background: "var(--champagne)" }} />
        </div>

        <h1 className="serif-kr" style={{ fontSize: 23, fontWeight: 700, color: "var(--ink-2)", marginTop: 36, lineHeight: 1.4 }}>
          재산 인증을<br/>검토하고 있습니다
        </h1>
        <p className="mono" style={{ fontSize: 11, color: "var(--gray)", marginTop: 14, letterSpacing: "0.08em" }}>Ticket №V-2026-0518</p>
        <p className="body-kr" style={{ fontSize: 13, color: "var(--gray)", marginTop: 8 }}>평균 5일 소요 · 완료 시 알림을 보내드립니다</p>

        <div style={{ marginTop: 44, textAlign: "left" }}>
          {tl.map(([t, d, st], i) => (
            <div key={t} className="flex aic" style={{ gap: 14, paddingBottom: i < 2 ? 22 : 0, position: "relative" }}>
              {i < 2 && <span style={{ position: "absolute", left: 5, top: 14, bottom: -8, width: 1, background: "var(--hair-light)" }} />}
              <span style={{
                width: 11, height: 11, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                background: st === "done" ? "var(--sage)" : st === "active" ? "var(--champagne)" : "transparent",
                border: st === "wait" ? "1px solid var(--hair-light)" : "none",
              }} />
              <div className="flex jcb" style={{ flex: 1 }}>
                <span className="body-kr" style={{ fontSize: 13.5, color: st === "wait" ? "var(--gray)" : "var(--ink-2)" }}>{t}</span>
                <span className="mono" style={{ fontSize: 10.5, color: st === "active" ? "var(--champagne)" : "var(--gray)" }}>{d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "20px 32px 48px" }}>
        <button className="o-btn o-btn-outline" style={{ width: "100%" }}>허브로 돌아가기</button>
      </div>
    </div>
  );
}

window.ScreenVerifyReviewing = ScreenVerifyReviewing;
