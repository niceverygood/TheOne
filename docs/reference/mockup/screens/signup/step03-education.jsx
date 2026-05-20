/* ============================================================
   Step 03 · 학력
   학교·전공·학위 + 졸업증명서
   ============================================================ */

function ScreenStep03() {
  return (
    <AppShell
      step={3}
      eyebrow="Education"
      title="학력"
      subtitle="최종 학력을 입력하고 졸업증명서를 첨부해 주세요. 검증 후 학력 뱃지가 부여됩니다."
      footer={<FormFooter next="다음 — 사진" />}
    >
      <Field eyebrow="학교" label="최종 학력" value="서울대학교" />
      <Field eyebrow="전공" label="학과 / 계열" value="법학과" />
      <ChoiceRow label="학사" selected={false} />
      <ChoiceRow label="석사" selected />
      <ChoiceRow label="박사" selected={false} />

      <div style={{ marginTop: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>서류 제출</div>
        <DocUpload doc={{ label: "졸업증명서", required: true, files: [{ name: "졸업증명서_서울대.pdf", size: "0.7 MB", kind: "PDF" }], canAdd: true }} />
        <DocUpload doc={{ label: "학위증명서 (석·박사)", required: true, files: [] }} />
        <DocUpload doc={{ label: "전문 자격증", required: false, files: [] }} />
        <SecurityNote />
      </div>
    </AppShell>
  );
}

window.ScreenStep03 = ScreenStep03;
