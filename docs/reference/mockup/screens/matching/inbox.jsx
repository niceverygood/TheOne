/* ============================================================
   Screen 13 · 매칭함 (Inbox)
   받은 신청서를 정중하게 수락/거절 · 정성 들어간 글이 먼저
   ============================================================ */

function LetterCard({ name, meta, marks, preview, sup, time }) {
  return (
    <div style={{ border: "1px solid var(--hair-light)", padding: 18, marginBottom: 14, borderRadius: 2, background: "#fff" }}>
      <div className="flex jcb aic">
        <div className="flex aic" style={{ gap: 12 }}>
          <div style={{ width: 46, height: 46, flexShrink: 0 }}><Portrait square /></div>
          <div>
            <div className="flex aic" style={{ gap: 8 }}>
              <span className="body-kr" style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink-2)" }}>{name}</span>
              {sup && <span className="mono" style={{ fontSize: 8.5, color: "var(--champagne)", border: "1px solid var(--champagne)", padding: "1px 4px" }}>SUPER</span>}
            </div>
            <div className="body-kr" style={{ fontSize: 11.5, color: "var(--gray)", marginTop: 1 }}>{meta}</div>
          </div>
        </div>
        <VerifiedDots marks={marks} size={5} gap={4} />
      </div>
      <p className="body-kr" style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7, marginTop: 14, fontStyle: "italic" }}>
        “{preview}”
      </p>
      <div className="flex jcb aic" style={{ marginTop: 14 }}>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--gray)" }}>{time}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="o-btn o-btn-outline" style={{ padding: "8px 16px", fontSize: 12.5, borderColor: "var(--terra)", color: "var(--terra)" }}>정중히 거절</button>
          <button className="o-btn o-btn-solid" style={{ padding: "8px 16px", fontSize: 12.5 }}>수락하고 채팅</button>
        </div>
      </div>
    </div>
  );
}

function ScreenInbox() {
  return (
    <div style={{ minHeight: "100%", background: "var(--ivory)" }}>
      <div style={{ padding: "60px 24px 24px" }}>
        <div className="editorial-en" style={{ fontSize: 15, color: "var(--champagne)", marginBottom: 6 }}>The Inbox</div>
        <h1 className="serif-kr" style={{ fontSize: 27, fontWeight: 700, color: "var(--ink-2)" }}>받은 신청서</h1>
        <p className="body-kr" style={{ fontSize: 13, color: "var(--gray)", marginTop: 8 }}>
          정성이 담긴 글이 먼저 도착합니다. 천천히 읽고, 정중하게 답해 주세요.
        </p>
      </div>
      <div style={{ padding: "0 24px 40px" }}>
        <LetterCard name="김민준" meta="32 · 변호사 · 서초" marks={4} sup
          preview="갤러리를 천천히 도는 걸 좋아한다는 문장에서 멈췄어요. 저도 주말이면 종종 미술관에 가는데, 좋아하는 작가가 겹칠지 궁금합니다…"
          time="2시간 전" />
        <LetterCard name="이도현" meta="35 · 정형외과 전문의 · 압구정" marks={4}
          preview="서핑을 하신다는 게 인상적이었어요. 저도 양양을 자주 가는데, 다음 시즌엔 같이 파도를 기다릴 수 있으면 좋겠다는 생각을 했습니다…"
          time="어제" />
        <LetterCard name="정우성" meta="38 · 자산운용사 대표 · 한남" marks={3}
          preview="짧지만 진심을 담아 적습니다. 서로의 일을 존중할 수 있는 분을 오래 찾았어요. 한 번 차분히 대화 나눠보고 싶습니다…"
          time="2일 전" />
      </div>
    </div>
  );
}

window.ScreenInbox = ScreenInbox;
