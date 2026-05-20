/* Screen 20 · 학력 인증 신청 (평균 3일) */

function ScreenVerifyEducation() {
  return (
    <VerifyShell
      en="Education Verification"
      title="학력 인증"
      days="3"
      subtitle="졸업·학위 증명서를 제출하면 관리자가 직접 검토 후 학력 뱃지를 부여합니다."
      cta="학력 인증 신청"
    >
      <Field eyebrow="학교" label="최종 학력" value="서울대학교" />
      <Field eyebrow="전공 / 학위" label="과정" value="법학과 · 석사" />
      <div style={{ marginTop: 8 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>서류 제출</div>
        <DocUpload doc={{ label: "졸업증명서", required: true, files: [{ name: "졸업증명서.pdf", size: "0.7 MB", kind: "PDF" }], canAdd: true }} />
        <DocUpload doc={{ label: "학위증명서 (석·박사 시)", required: true, files: [] }} />
        <DocUpload doc={{ label: "전문 자격증", required: false, files: [] }} />
        <SecurityNote />
      </div>
    </VerifyShell>
  );
}

window.ScreenVerifyEducation = ScreenVerifyEducation;
