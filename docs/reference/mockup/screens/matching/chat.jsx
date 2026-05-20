/* ============================================================
   Screen 15 · 채팅
   매칭 7일째 캡션 + AI 추천 메시지 3종 + 차분한 버블
   ============================================================ */

function Bubble({ me, children, time }) {
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", marginBottom: 12 }}>
      <div style={{ maxWidth: "76%" }}>
        <div style={{
          padding: "11px 14px",
          background: me ? "var(--ink-2)" : "#fff",
          color: me ? "var(--ivory)" : "var(--ink-2)",
          border: me ? "none" : "1px solid var(--hair-light)",
          borderRadius: 2,
        }}>
          <p className="body-kr" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{children}</p>
        </div>
        <div className="mono" style={{ fontSize: 9, color: "var(--gray)", marginTop: 4, textAlign: me ? "right" : "left" }}>{time}</div>
      </div>
    </div>
  );
}

function ScreenChat() {
  return (
    <div style={{ minHeight: "100%", background: "var(--ivory)", display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{ padding: "58px 24px 16px", borderBottom: "1px solid var(--hair-light)", background: "var(--ivory)" }}>
        <div className="flex jcb aic">
          <div className="flex aic" style={{ gap: 12 }}>
            <span className="mono" style={{ fontSize: 18, color: "var(--ink-2)" }}>←</span>
            <div style={{ width: 38, height: 38 }}><Portrait square /></div>
            <div>
              <div className="flex aic" style={{ gap: 6 }}>
                <span className="body-kr" style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-2)" }}>김지윤</span>
                <VerifiedDots marks={4} size={4} gap={3} />
              </div>
              <span className="body-kr" style={{ fontSize: 11, color: "var(--gray)" }}>변호사 · 서초</span>
            </div>
          </div>
        </div>
      </div>

      {/* 매칭 시작 캡션 */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--champagne)", letterSpacing: "0.12em" }}>MATCHED · 05.10</div>
          <p className="body-kr" style={{ fontSize: 11.5, color: "var(--gray)", marginTop: 4 }}>두 분이 매칭된 지 7일째입니다</p>
        </div>
      </div>

      {/* 메시지 */}
      <div style={{ flex: 1, padding: "24px 24px 16px" }}>
        <Bubble me time="05.10 21:14">안녕하세요 지윤 님, 신청서 읽어주셔서 감사해요. 좋아하시는 작가가 있으세요?</Bubble>
        <Bubble time="05.10 21:32">민준 님 안녕하세요 :) 요즘은 박서보 화백 작품을 좋아해요. 단색화 보면 마음이 차분해지더라구요.</Bubble>
        <Bubble me time="05.10 21:40">오 저도 단색화 좋아합니다. 다음 주말에 국제갤러리 전시 같이 가실래요?</Bubble>
      </div>

      {/* AI 추천 메시지 3종 */}
      <div style={{ padding: "0 24px 12px" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>AI 추천 답장</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {["좋아요, 토요일 오후 어떠세요?", "전시 보고 근처에서 차 한잔도 좋겠어요", "혹시 선호하는 시간대가 있으세요?"].map((t, i) => (
            <div key={i} style={{ border: "1px solid var(--champagne)", color: "var(--champagne)", padding: "8px 12px", borderRadius: 2, fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }} className="body-kr">{t}</div>
          ))}
        </div>
      </div>

      {/* 입력바 */}
      <div style={{ padding: "12px 24px 36px", borderTop: "1px solid var(--hair-light)" }}>
        <div className="flex jcb aic" style={{ border: "1px solid var(--hair-light)", padding: "11px 14px", borderRadius: 2, background: "#fff" }}>
          <span className="body-kr" style={{ fontSize: 13, color: "var(--gray-soft)" }}>메시지를 입력하세요</span>
          <span className="mono" style={{ fontSize: 13, color: "var(--champagne)" }}>↑</span>
        </div>
      </div>
    </div>
  );
}

window.ScreenChat = ScreenChat;
