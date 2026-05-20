/* ============================================================
   Step 02 · 직업 (남성 회원) — 11개 카테고리
   성별 토글 + 2열 카테고리 그리드 + 검증 기준 메타 + 다중 서류
   ============================================================ */

function JobCard({ en, kr, sub, selected }) {
  return (
    <div style={{
      border: "1px solid " + (selected ? "var(--ink-2)" : "var(--hair-light)"),
      background: selected ? "var(--ink-2)" : "transparent",
      padding: "14px 12px", borderRadius: 2, cursor: "pointer", minHeight: 92,
    }}>
      <div className="editorial-en" style={{ fontSize: 11, color: selected ? "var(--champagne)" : "var(--gray)", marginBottom: 6 }}>{en}</div>
      <div className="body-kr" style={{ fontSize: 14.5, fontWeight: 600, color: selected ? "var(--ivory)" : "var(--ink-2)" }}>{kr}</div>
      <div className="body-kr" style={{ fontSize: 10.5, color: selected ? "rgba(250,247,242,0.6)" : "var(--gray)", marginTop: 4, lineHeight: 1.4 }}>{sub}</div>
    </div>
  );
}

function GenderToggle({ male }) {
  return (
    <div style={{ display: "flex", border: "1px solid var(--hair-light)", borderRadius: 2, marginBottom: 24 }}>
      {[["남성 회원", male], ["여성 회원", !male]].map(([t, on]) => (
        <div key={t} style={{
          flex: 1, textAlign: "center", padding: "10px 0",
          background: on ? "var(--ink-2)" : "transparent",
          color: on ? "var(--ivory)" : "var(--gray)", fontSize: 12.5,
        }} className="body-kr">{t}</div>
      ))}
    </div>
  );
}

function ScreenStep02Male() {
  const cats = [
    ["Legal", "법조계", "변호사·판사·검사"],
    ["Medical", "의료계", "의사·치과·한의·약사"],
    ["Acc·Tax·IP", "회계·세무·변리", "CPA·세무사·변리사"],
    ["Corporate", "대기업", "재계 50위 과장급↑"],
    ["Finance", "금융", "은행·증권·VC·PE"],
    ["Tech", "IT·테크", "시니어 개발·CTO·창업"],
    ["Public", "공직", "5급 이상 공무원"],
    ["Architecture", "건축·디자인", "건축가·인테리어 디렉터"],
    ["Consulting", "컨설팅", "MBB·전략·M&A 자문"],
    ["Academia", "학계·연구", "교수·국책 연구원·박사"],
    ["Founder", "사업·임원", "C-level·연매출 30억↑"],
  ];
  return (
    <AppShell
      step={2}
      eyebrow="Occupation"
      title="직업"
      subtitle="가입 심사 위원회가 서류를 검토해 직업 뱃지를 부여합니다. 카테고리마다 필요한 서류가 다릅니다."
      footer={<FormFooter next="다음 — 학력" />}
    >
      <GenderToggle male />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {cats.map((c, i) => <JobCard key={c[1]} en={c[0]} kr={c[1]} sub={c[2]} selected={i === 0} />)}
      </div>

      {/* 검증 기준 메타 스트립 */}
      <div style={{ marginTop: 20, borderLeft: "2px solid var(--champagne)", paddingLeft: 14, background: "var(--ivory-2)", padding: "14px 16px" }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>검증 기준 · 법조계</div>
        <p className="body-kr" style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
          <b>필수</b> 변협 등록증 + 재직증명서 · <span style={{ color: "var(--gray)" }}>선택 명함</span>
        </p>
      </div>

      {/* 다중 서류 업로드 */}
      <div style={{ marginTop: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>서류 제출</div>
        <DocUpload doc={{ label: "변호사협회 등록증", required: true, files: [{ name: "변협등록증_김민준.pdf", size: "1.2 MB", kind: "PDF" }], canAdd: true }} />
        <DocUpload doc={{ label: "재직증명서", required: true, files: [] }} />
        <DocUpload doc={{ label: "명함", required: false, files: [] }} />
        <SecurityNote />
      </div>
    </AppShell>
  );
}

window.ScreenStep02Male = ScreenStep02Male;
window.JobCard = JobCard;
window.GenderToggle = GenderToggle;
