/* ============================================================
   Screen 04 · 프로필 상세
   사진 카루셀 + 케미 3축 + 검증 4중 + 60문항 split + 자기소개
   ============================================================ */

function ScreenProfile() {
  return (
    <div style={{ minHeight: "100%", background: "var(--ivory)" }}>
      {/* 사진 카루셀 */}
      <div style={{ position: "relative", height: 420 }}>
        <Portrait label="PORTRAIT · 김지윤 · 1/4" ratio="0">
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#E8E2D5,#C8C1B1)" }} />
          <svg viewBox="0 0 100 130" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <circle cx="50" cy="48" r="20" fill="#A89F8E" opacity="0.6" />
            <path d="M16 130 Q16 88 50 88 Q84 88 84 130 Z" fill="#A89F8E" opacity="0.6" />
          </svg>
        </Portrait>
        <div style={{ position: "absolute", top: 60, left: 24 }}>
          <span className="mono" style={{ fontSize: 18, color: "var(--ink-2)", cursor: "pointer" }}>←</span>
        </div>
        {/* 카루셀 점 */}
        <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
          {[0,1,2,3].map(i => (
            <span key={i} style={{ width: i===0?16:6, height: 3, background: i===0 ? "var(--ivory)" : "rgba(250,247,242,0.5)" }} />
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 24px 40px" }}>
        <div className="flex jcb aic">
          <div>
            <h1 className="serif-kr" style={{ fontSize: 26, fontWeight: 700, color: "var(--ink-2)" }}>김지윤</h1>
            <p className="body-kr" style={{ fontSize: 13.5, color: "var(--gray)", marginTop: 2 }}>32 · 변호사 · 서초</p>
          </div>
          <VerifiedDots marks={4} />
        </div>

        {/* 검증 4중 */}
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["직업", "verified"], ["학력", "verified"], ["재산", "verified"], ["부동산", "pending"]].map(([k, s]) => (
            <div key={k} className="flex jcb aic" style={{ border: "1px solid var(--hair-light)", padding: "10px 12px", borderRadius: 2 }}>
              <span className="body-kr" style={{ fontSize: 12, color: "var(--ink-2)" }}>{k}</span>
              <VBadge state={s} size="sm" />
            </div>
          ))}
        </div>

        {/* 자기소개 300자 */}
        <div style={{ marginTop: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>About · 자기소개</div>
          <p className="body-kr" style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8 }}>
            10년 차 송무 변호사입니다. 평일엔 치열하게 일하지만 주말엔 한남동 작은 갤러리들을 천천히 돌거나, 양양에서 서핑을 즐겨요. 대화가 잘 통하고, 서로의 일을 존중할 수 있는 사람을 찾고 있습니다. 결혼은 신중하지만 분명한 의지를 가지고 있어요.
          </p>
        </div>

        {/* 케미 3축 */}
        <div style={{ marginTop: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Chemistry · 케미 3축</div>
          {[["결혼관", 92], ["라이프스타일", 78], ["갈등 해결", 85]].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div className="flex jcb" style={{ marginBottom: 6 }}>
                <span className="body-kr" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{k}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--champagne)" }}>{v}%</span>
              </div>
              <div style={{ height: 2, background: "var(--ivory-3)" }}>
                <div style={{ width: v + "%", height: "100%", background: "var(--champagne)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* 60문항 split 5개 */}
        <div style={{ marginTop: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>60문항 일치 · 주요 5개</div>
          {[
            ["아이를 갖고 싶다", "매우 그렇다", "그렇다"],
            ["주말은 함께 보낸다", "그렇다", "매우 그렇다"],
            ["재정은 투명하게 공유", "매우 그렇다", "매우 그렇다"],
            ["갈등은 즉시 대화로", "그렇다", "보통"],
            ["커리어를 계속 이어간다", "매우 그렇다", "그렇다"],
          ].map(([q, a, b]) => (
            <div key={q} style={{ marginBottom: 14, borderBottom: "1px solid var(--hair-light)", paddingBottom: 12 }}>
              <div className="body-kr" style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>{q}</div>
              <div className="flex jcb">
                <span className="mono" style={{ fontSize: 10.5, color: "var(--gray)" }}>나 · {a}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--champagne)" }}>지윤 · {b}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="o-btn o-btn-solid" style={{ width: "100%", marginTop: 28 }}>만남 신청서 쓰기 · 20C</button>
      </div>
    </div>
  );
}

window.ScreenProfile = ScreenProfile;
