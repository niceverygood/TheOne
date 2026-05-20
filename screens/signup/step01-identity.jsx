/* ============================================================
   Step 01 · 본인 인증
   통신사 토글 + 휴대폰 인증
   ============================================================ */

function ScreenStep01() {
  return (
    <AppShell
      step={1}
      eyebrow="Identity"
      title="본인 인증"
      subtitle="실명 확인을 위해 휴대폰 본인 인증을 진행합니다. 정보는 매칭 상대에게 노출되지 않습니다."
      footer={<FormFooter next="다음 — 직업" />}
    >
      <div className="eyebrow" style={{ marginBottom: 12 }}>통신사</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["SKT", "KT", "LG U+", "알뜰폰"].map((c, i) => (
          <div key={c} style={{
            flex: 1, textAlign: "center", padding: "11px 0",
            border: "1px solid " + (i === 0 ? "var(--ink-2)" : "var(--hair-light)"),
            background: i === 0 ? "var(--ink-2)" : "transparent",
            color: i === 0 ? "var(--ivory)" : "var(--ink-2)",
            borderRadius: 2, fontSize: 12.5,
          }} className="body-kr">{c}</div>
        ))}
      </div>

      <Field eyebrow="이름" label="실명" value="김민준" verified />
      <Field eyebrow="주민등록번호" label="앞 6자리 - 뒤 1자리" value="920314 - 1●●●●●●" />
      <Field eyebrow="휴대폰" label="번호" value="010 - 1234 - 5678" action="인증번호 받기" />

      <div style={{ borderBottom: "1px solid var(--hair-light)", paddingBottom: 10, marginBottom: 8 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>인증번호</div>
        <div className="flex jcb aic">
          <span className="mono" style={{ fontSize: 18, color: "var(--ink-2)", letterSpacing: "0.3em" }}>4 8 2 _ _ _</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--terra)" }}>02:48</span>
        </div>
      </div>
    </AppShell>
  );
}

window.ScreenStep01 = ScreenStep01;
