/* ============================================================
   Screen 02 · 가입 심사 Intro
   평균 5일 · 6단계 소요시간 미리보기
   ============================================================ */

function ScreenSignupIntro() {
  const steps = [
    ["01", "본인 인증", "휴대폰 · 약 2분"],
    ["02", "직업", "서류 업로드 · 약 5분"],
    ["03", "학력", "졸업증명서 · 약 3분"],
    ["04", "사진", "5장 · 약 3분"],
    ["05", "60문항 설문", "가치관 진단 · 약 10분"],
    ["06", "추천인 코드", "선택 · 약 1분"],
  ];
  return (
    <AppShell
      hideBack
      eyebrow="Application"
      title={<>가입 심사를<br/>시작합니다</>}
      subtitle="심사는 평균 5일이 소요됩니다. 6단계를 차분히 채워주세요. 진정성 있는 작성이 통과율을 높입니다."
      footer={<FormFooter intro next="시작하기" hint="작성 중 언제든 저장하고 이어서 진행할 수 있습니다." />}
    >
      <div style={{ marginTop: 8 }}>
        {steps.map(([n, t, h]) => (
          <div key={n} className="flex aic" style={{ gap: 16, padding: "16px 0", borderBottom: "1px solid var(--hair-light)" }}>
            <span className="mono" style={{ fontSize: 13, color: "var(--champagne)", width: 24 }}>{n}</span>
            <div style={{ flex: 1 }}>
              <div className="body-kr" style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-2)" }}>{t}</div>
              <div className="body-kr" style={{ fontSize: 11.5, color: "var(--gray)", marginTop: 1 }}>{h}</div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

window.ScreenSignupIntro = ScreenSignupIntro;
