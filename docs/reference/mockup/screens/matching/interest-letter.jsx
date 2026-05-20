/* ============================================================
   Screen 12 · 만남 신청서 (Interest Letter)
   골드스푼식 진지한 글쓰기 인터페이스 · 크레딧 차감
   ============================================================ */

function ScreenLetter() {
  return (
    <div style={{ minHeight: "100%", background: "var(--ivory)" }}>
      <div style={{ padding: "60px 24px 0" }}>
        <div className="flex jcb aic" style={{ marginBottom: 24 }}>
          <span className="mono" style={{ fontSize: 18, color: "var(--ink-2)" }}>←</span>
          <span className="mono" style={{ fontSize: 10, color: "var(--gray)" }}>잔액 187 C</span>
        </div>
        <div className="editorial-en" style={{ fontSize: 15, color: "var(--champagne)", marginBottom: 8 }}>An Interest Letter</div>
        <h1 className="serif-kr" style={{ fontSize: 25, fontWeight: 700, color: "var(--ink-2)", lineHeight: 1.3 }}>
          김지윤 님께<br/>마음을 전합니다
        </h1>
        <p className="body-kr" style={{ fontSize: 13, color: "var(--gray)", marginTop: 10, lineHeight: 1.6 }}>
          가벼운 호감 대신, 진심을 담은 글을 보냅니다. 정성이 담긴 글이 매칭함 상단에 먼저 보여집니다.
        </p>
      </div>

      <div style={{ padding: "28px 24px 24px" }}>
        {/* 받는 사람 */}
        <div className="flex aic" style={{ gap: 12, padding: "12px 0", borderBottom: "1px solid var(--hair-light)" }}>
          <div style={{ width: 44, height: 44, flexShrink: 0 }}>
            <Portrait square />
          </div>
          <div>
            <div className="body-kr" style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-2)" }}>김지윤</div>
            <div className="body-kr" style={{ fontSize: 11.5, color: "var(--gray)" }}>32 · 변호사 · 서초</div>
          </div>
        </div>

        {/* 글쓰기 영역 */}
        <div style={{ marginTop: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>마음을 담아 · 최소 80자</div>
          <div style={{ border: "1px solid var(--hair-light)", padding: 16, minHeight: 200, borderRadius: 2, background: "#fff" }}>
            <p className="body-kr" style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.8 }}>
              지윤 님, 갤러리를 천천히 도는 걸 좋아한다는 문장에서 멈췄어요. 저도 주말이면 종종 미술관에 가는데, 좋아하는 작가가 겹칠지 궁금합니다. 서로의 일을 존중하면서 함께 성장할 수 있는 관계를 진지하게 찾고 있어요.
            </p>
          </div>
          <div className="flex jcb" style={{ marginTop: 8 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--gray)" }}>132 / 300자</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--sage)" }}>✓ 충분한 분량</span>
          </div>
        </div>

        {/* 전송 방식 */}
        <div style={{ marginTop: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>전송 방식</div>
          <ChoiceRow label="일반 신청서" hint="매칭함에 순서대로 도착" value="20C" selected />
          <ChoiceRow label="Super · 우선 신청서" hint="매칭함 최상단 · 한정 노출" value="50C" />
        </div>
      </div>

      <div style={{ padding: "16px 24px 40px", borderTop: "1px solid var(--hair-light)" }}>
        <button className="o-btn o-btn-solid" style={{ width: "100%" }}>신청서 보내기 · 20C 차감</button>
      </div>
    </div>
  );
}

window.ScreenLetter = ScreenLetter;
