/* ============================================================
   Step 02 · 직업 (여성 회원) — 13개 카테고리
   ============================================================ */

function ScreenStep02Female() {
  const cats = [
    ["Professional", "전문직", "의사·약사·변호사·회계사"],
    ["Broadcast", "방송·미디어", "아나운서·기자·PD·작가"],
    ["Arts", "예술·문화", "큐레이터·연주자·작가"],
    ["Hospitality", "항공·호텔", "승무원·호텔리어·의전"],
    ["Academia", "교육·연구", "교수·교사·연구원·박사"],
    ["Fashion", "패션·뷰티", "디자이너·MD·디렉터"],
    ["Creator", "인플루언서", "콘텐츠·모델·크리에이터"],
    ["Marketing", "마케팅·PR", "CMO·브랜드·홍보 디렉터"],
    ["Lifestyle", "F&B·라이프스타일", "셰프·소믈리에·공간기획"],
    ["Tech", "IT·테크", "PM·디자이너·창업"],
    ["Finance", "금융·컨설팅", "애널리스트·IB·컨설턴트"],
    ["Global", "외교·국제", "외교관·국제기구·NGO"],
    ["Founder", "사업·임원", "대표·C-level·공동대표"],
  ];
  return (
    <AppShell
      step={2}
      eyebrow="Occupation"
      title="직업"
      subtitle="가입 심사 위원회가 서류를 검토해 직업 뱃지를 부여합니다. 카테고리마다 필요한 서류가 다릅니다."
      footer={<FormFooter next="다음 — 학력" />}
    >
      <GenderToggle male={false} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {cats.map((c, i) => <JobCard key={c[1]} en={c[0]} kr={c[1]} sub={c[2]} selected={i === 1} />)}
      </div>

      <div style={{ marginTop: 20, borderLeft: "2px solid var(--champagne)", background: "var(--ivory-2)", padding: "14px 16px" }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>검증 기준 · 방송·미디어</div>
        <p className="body-kr" style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
          <b>필수</b> 소속사 재직증명 + 출연 이력 · <span style={{ color: "var(--gray)" }}>선택 사원증</span>
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>서류 제출</div>
        <DocUpload doc={{ label: "소속사 재직증명서", required: true, files: [{ name: "재직증명_방송사.pdf", size: "0.9 MB", kind: "PDF" }], canAdd: true }} />
        <DocUpload doc={{ label: "출연 이력 (PDF)", required: true, files: [] }} />
        <DocUpload doc={{ label: "사원증 / ID 카드", required: false, files: [] }} />
        <SecurityNote />
      </div>
    </AppShell>
  );
}

window.ScreenStep02Female = ScreenStep02Female;
