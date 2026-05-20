/* ============================================================
   Screen 03 · 오늘의 큐레이션 (Dossier)
   하루 1명 풀블리드 · 수직 카운트다운 · Pass / 더 알아보기 / Super Like
   ============================================================ */

function ScreenCuration() {
  return (
    <div style={{ position: "relative", minHeight: "100%", background: "var(--ink)" }}>
      {/* 풀블리드 인물 */}
      <div style={{ position: "relative", height: 560 }}>
        <Portrait label="PORTRAIT · 김지윤" ratio="0">
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#E8E2D5,#C8C1B1)" }} />
          <svg viewBox="0 0 100 130" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <circle cx="50" cy="50" r="22" fill="#A89F8E" opacity="0.6" />
            <path d="M14 130 Q14 86 50 86 Q86 86 86 130 Z" fill="#A89F8E" opacity="0.6" />
          </svg>
        </Portrait>
        {/* 상단 메타 */}
        <div style={{ position: "absolute", top: 62, left: 24, right: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "rgba(15,16,20,0.6)", letterSpacing: "0.14em" }}>TODAY · No. 047</div>
            <div className="editorial-en" style={{ fontSize: 15, color: "rgba(15,16,20,0.7)", marginTop: 2 }}>Curated for you</div>
          </div>
          {/* 수직 카운트다운 */}
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 9, color: "rgba(15,16,20,0.5)", letterSpacing: "0.1em" }}>NEXT IN</div>
            <div className="mono" style={{ fontSize: 22, color: "var(--ink-2)", fontWeight: 600, lineHeight: 1.1 }}>23:47</div>
          </div>
        </div>
        {/* 하단 그라데이션 + 이름 */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "60px 24px 24px", background: "linear-gradient(transparent, rgba(15,16,20,0.85))" }}>
          <VerifiedDots marks={4} dark />
          <h1 className="serif-kr" style={{ fontSize: 32, fontWeight: 700, color: "var(--ivory)", marginTop: 10 }}>김지윤</h1>
          <p className="body-kr" style={{ fontSize: 14, color: "rgba(250,247,242,0.78)", marginTop: 4 }}>32 · 변호사 · 서초</p>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ padding: "28px 24px 24px", background: "var(--ink)" }}>
        <p className="editorial-en" style={{ fontSize: 17, color: "var(--champagne)", lineHeight: 1.5 }}>
          “주말엔 한남동 작은 갤러리들을 천천히 도는 걸 좋아해요.”
        </p>
        {/* 케미 3축 */}
        <div style={{ marginTop: 28 }}>
          <div className="eyebrow" style={{ color: "var(--gray-soft)", marginBottom: 14 }}>Chemistry · 케미 3축</div>
          {[["결혼관", 92], ["라이프스타일", 78], ["갈등 해결", 85]].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div className="flex jcb" style={{ marginBottom: 6 }}>
                <span className="body-kr" style={{ fontSize: 12.5, color: "rgba(250,247,242,0.85)" }}>{k}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--champagne)" }}>{v}%</span>
              </div>
              <div style={{ height: 2, background: "var(--ink-soft)" }}>
                <div style={{ width: v + "%", height: "100%", background: "var(--champagne)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* 액션 — 무한 스와이프 아님, 3개 명시적 버튼 */}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="o-btn o-btn-champ" style={{ width: "100%" }}>프로필 더 알아보기</button>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="o-btn o-btn-outline" style={{ flex: 1, borderColor: "var(--ink-soft)", color: "var(--gray-soft)" }}>Pass · 오늘은 넘기기</button>
            <button className="o-btn o-btn-outline" style={{ flex: 1, borderColor: "var(--champagne)", color: "var(--champagne)" }}>Super Like</button>
          </div>
        </div>
        <p className="body-kr" style={{ fontSize: 11, color: "var(--gray)", textAlign: "center", marginTop: 16 }}>
          오늘의 큐레이션은 자정 이후 갱신됩니다.
        </p>
      </div>
    </div>
  );
}

window.ScreenCuration = ScreenCuration;
