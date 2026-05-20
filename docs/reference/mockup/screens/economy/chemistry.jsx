/* ============================================================
   Screen 17 · 케미 분석 리포트
   "상위 8%" 헤드라인 + 3 섹션 (결혼관·라이프·갈등)
   매칭 시작 후 7일째 자동 발행
   ============================================================ */

function ReportSection({ kr, en, score, lines }) {
  return (
    <div style={{ marginTop: 28 }}>
      <div className="flex jcb aic" style={{ marginBottom: 14 }}>
        <div>
          <div className="editorial-en" style={{ fontSize: 13, color: "var(--champagne)" }}>{en}</div>
          <h3 className="serif-kr" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink-2)" }}>{kr}</h3>
        </div>
        <span className="mono" style={{ fontSize: 20, color: "var(--ink-2)", fontWeight: 600 }}>{score}</span>
      </div>
      {lines.map((l, i) => (
        <p key={i} className="body-kr" style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 8 }}>{l}</p>
      ))}
    </div>
  );
}

function ScreenChemistry() {
  return (
    <div style={{ minHeight: "100%", background: "var(--ivory)" }}>
      <div style={{ padding: "60px 24px 0" }}>
        <span className="mono" style={{ fontSize: 18, color: "var(--ink-2)" }}>←</span>
      </div>
      {/* 헤드라인 */}
      <div style={{ padding: "28px 24px 0", textAlign: "center" }}>
        <div className="editorial-en" style={{ fontSize: 15, color: "var(--champagne)", marginBottom: 10 }}>Chemistry Report</div>
        <div className="serif-kr" style={{ fontSize: 56, fontWeight: 700, color: "var(--ink-2)", lineHeight: 1 }}>상위 8%</div>
        <p className="body-kr" style={{ fontSize: 13.5, color: "var(--gray)", marginTop: 14, lineHeight: 1.7 }}>
          김민준 · 김지윤 두 분의 종합 케미는 전체 매칭 중 <b style={{ color: "var(--ink-2)" }}>상위 8%</b>입니다.<br/>매칭 7일째 자동 발행된 리포트입니다.
        </p>
        <div className="mono" style={{ fontSize: 10, color: "var(--gray)", marginTop: 10 }}>ISSUED · 05.17 · No. R-2026-0331</div>
      </div>

      <div style={{ padding: "8px 24px 40px" }}>
        <hr className="o-hair" style={{ margin: "24px 0 0" }} />
        <ReportSection en="On Marriage" kr="결혼관" score="92"
          lines={[
            "두 분 모두 결혼을 신중하지만 분명한 목표로 두고 있습니다. 시점과 가족 계획에 대한 답변이 거의 일치했어요.",
            "재정의 투명한 공유에 대해 두 분 다 ‘매우 그렇다’를 선택했습니다 — 갈등의 큰 원인 하나가 줄어듭니다.",
          ]} />
        <hr className="o-hair" style={{ margin: "24px 0 0" }} />
        <ReportSection en="Lifestyle" kr="라이프스타일" score="78"
          lines={[
            "주말 활동 성향이 비슷합니다. 둘 다 조용한 문화생활을 선호하지만, 운동 강도에서 약간의 차이가 있어요.",
            "여행 빈도와 소비 성향은 잘 맞습니다. 함께 계획을 세우는 즐거움이 클 거예요.",
          ]} />
        <hr className="o-hair" style={{ margin: "24px 0 0" }} />
        <ReportSection en="Conflict" kr="갈등 해결" score="85"
          lines={[
            "두 분 다 갈등을 즉시 대화로 풀려는 경향이 강합니다. 다만 한 분은 시간을 두고 정리하는 편이라, 속도 차이를 인지하면 좋겠어요.",
          ]} />
        <button className="o-btn o-btn-outline" style={{ width: "100%", marginTop: 32 }}>리포트 PDF 저장</button>
      </div>
    </div>
  );
}

window.ScreenChemistry = ScreenChemistry;
