/* ============================================================
   Step 06 · 추천인 코드
   모노스페이스 코드 입력 + 혜택 3종
   ============================================================ */

function ScreenStep06() {
  return (
    <AppShell
      step={6}
      eyebrow="Referral"
      title="추천인 코드"
      subtitle="회원의 추천을 받으셨다면 코드를 입력해 주세요. 선택 사항이며, 입력 시 심사 우선순위가 올라갑니다."
      footer={<FormFooter next="신청서 제출" />}
    >
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>코드 입력</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {["T", "H", "E", "•", "9", "2"].map((ch, i) => (
            <div key={i} style={{
              flex: 1, maxWidth: 48, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid " + (ch === "•" ? "transparent" : "var(--ink-2)"), borderRadius: 2,
            }}>
              <span className="mono" style={{ fontSize: 20, color: ch === "•" ? "var(--gray-soft)" : "var(--ink-2)" }}>{ch}</span>
            </div>
          ))}
        </div>
        <p className="mono" style={{ fontSize: 10, color: "var(--sage)", textAlign: "center", marginTop: 10 }}>✓ 유효한 코드 · 김지윤 회원</p>
      </div>

      <div className="eyebrow" style={{ marginBottom: 14 }}>추천 혜택 · 3</div>
      {[
        ["심사 우선 검토", "평균 5일 → 3일 단축"],
        ["가입 크레딧 50C", "첫 신청서 무료 발송"],
        ["케미 리포트 무료", "첫 매칭 리포트 1회"],
      ].map(([t, h]) => (
        <div key={t} className="flex aic" style={{ gap: 14, padding: "14px 0", borderBottom: "1px solid var(--hair-light)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--champagne)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="body-kr" style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-2)" }}>{t}</div>
            <div className="body-kr" style={{ fontSize: 11.5, color: "var(--gray)", marginTop: 1 }}>{h}</div>
          </div>
        </div>
      ))}
    </AppShell>
  );
}

window.ScreenStep06 = ScreenStep06;
