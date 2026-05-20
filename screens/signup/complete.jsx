/* ============================================================
   Screen · 신청 완료
   Application №2026-XXXX 인장 + 4단계 심사 타임라인
   ============================================================ */

function ScreenComplete() {
  const timeline = [
    ["접수 완료", "05.20", "done"],
    ["서류 검증", "진행 중", "active"],
    ["심사 위원회", "대기", "wait"],
    ["최종 승인", "대기", "wait"],
  ];
  return (
    <div style={{ minHeight: "100%", background: "var(--ink)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "90px 32px 0", textAlign: "center" }}>
        <div className="editorial-en" style={{ fontSize: 15, color: "var(--champagne)", marginBottom: 18 }}>Application Received</div>

        {/* 인장 */}
        <div style={{
          width: 132, height: 132, margin: "0 auto", borderRadius: "50%",
          border: "1px solid var(--champagne)", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--gray-soft)", letterSpacing: "0.14em" }}>APPLICATION</div>
          <div className="serif-kr" style={{ fontSize: 17, fontWeight: 700, color: "var(--ivory)", marginTop: 4 }}>№2026</div>
          <div className="serif-kr" style={{ fontSize: 17, fontWeight: 700, color: "var(--ivory)" }}>04827</div>
        </div>

        <h1 className="serif-kr" style={{ fontSize: 24, fontWeight: 700, color: "var(--ivory)", marginTop: 36, lineHeight: 1.4 }}>
          신청서가<br/>접수되었습니다
        </h1>
        <p className="body-kr" style={{ fontSize: 13, color: "rgba(250,247,242,0.7)", marginTop: 12, lineHeight: 1.7 }}>
          심사는 평균 5일이 소요됩니다.<br/>결과는 휴대폰과 이메일로 안내드립니다.
        </p>

        {/* 4단계 타임라인 */}
        <div style={{ marginTop: 40, textAlign: "left" }}>
          {timeline.map(([t, d, st], i) => (
            <div key={t} className="flex aic" style={{ gap: 14, paddingBottom: i < 3 ? 22 : 0, position: "relative" }}>
              {i < 3 && <span style={{ position: "absolute", left: 5, top: 14, bottom: -8, width: 1, background: "var(--ink-soft)" }} />}
              <span style={{
                width: 11, height: 11, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                background: st === "done" ? "var(--sage)" : st === "active" ? "var(--champagne)" : "transparent",
                border: st === "wait" ? "1px solid var(--ink-soft)" : "none",
              }} />
              <div className="flex jcb" style={{ flex: 1 }}>
                <span className="body-kr" style={{ fontSize: 13.5, color: st === "wait" ? "var(--gray)" : "var(--ivory)" }}>{t}</span>
                <span className="mono" style={{ fontSize: 10.5, color: st === "active" ? "var(--champagne)" : "var(--gray)" }}>{d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 32px 48px" }}>
        <button className="o-btn o-btn-champ" style={{ width: "100%" }}>심사 현황 알림 받기</button>
      </div>
    </div>
  );
}

window.ScreenComplete = ScreenComplete;
