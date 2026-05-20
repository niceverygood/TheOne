/* ============================================================
   Step 05 · 60문항 설문
   Likert 막대 시각화 · 4 카테고리 (결혼관·라이프·관계·갈등)
   ============================================================ */

function Likert({ q, value }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p className="body-kr" style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.5 }}>{q}</p>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const sel = n === value;
          const h = 14 + Math.abs(n - 3) * 8;
          return (
            <div key={n} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                height: h, borderRadius: 1,
                background: sel ? "var(--champagne)" : "var(--ivory-3)",
              }} />
            </div>
          );
        })}
      </div>
      <div className="flex jcb" style={{ marginTop: 6 }}>
        <span className="body-kr" style={{ fontSize: 10, color: "var(--gray)" }}>전혀 아니다</span>
        <span className="body-kr" style={{ fontSize: 10, color: "var(--gray)" }}>매우 그렇다</span>
      </div>
    </div>
  );
}

function ScreenStep05() {
  return (
    <AppShell
      step={5}
      eyebrow="60 Questions"
      title="가치관 설문"
      subtitle="총 60문항 · 결혼관 / 라이프스타일 / 관계 / 갈등. 매칭 케미 분석의 기반이 됩니다."
      footer={<FormFooter next="다음 — 추천인" />}
    >
      <div className="flex jcb aic" style={{ marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--champagne)" }}>결혼관 · 1/4</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--gray)" }}>14 / 60</span>
      </div>
      <div style={{ height: 2, background: "var(--ivory-3)", marginBottom: 28 }}>
        <div style={{ width: "23%", height: "100%", background: "var(--ink-2)" }} />
      </div>

      <Likert q="결혼은 인생에서 반드시 이루고 싶은 목표다." value={5} />
      <Likert q="결혼 후에도 각자의 커리어를 이어가야 한다." value={4} />
      <Likert q="재정은 부부가 투명하게 공유해야 한다." value={5} />
      <Likert q="아이를 갖는 것은 결혼의 중요한 부분이다." value={4} />
    </AppShell>
  );
}

window.ScreenStep05 = ScreenStep05;
