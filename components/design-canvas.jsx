/* ============================================================
   DesignCanvas · DCSection · DCArtboard · DCPostIt
   모든 화면을 펼쳐서 비교하는 무한 캔버스
   ============================================================ */

function DesignCanvas({ children }) {
  return (
    <div className="dc-root">
      <header className="dc-head">
        <div className="eyebrow" style={{ marginBottom: 14 }}>THE ONE · Application Only</div>
        <h1 className="serif-kr" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1, color: "var(--ink-2)" }}>
          인생에 한 번뿐인 매칭
        </h1>
        <p className="editorial-en" style={{ fontSize: 22, color: "var(--gray)", marginTop: 10 }}>
          The marriage agency, reimagined for the digital age.
        </p>
        <p className="body-kr" style={{ fontSize: 14, color: "var(--gray)", marginTop: 20, maxWidth: 560 }}>
          가입 심사제 · 4중 검증 · 매일 1명 큐레이션. 28–42세 전문직 미혼을 위한 디자인 시스템.
        </p>
      </header>
      {children}
    </div>
  );
}

function DCSection({ id, title, subtitle, children }) {
  return (
    <section className="dc-section" id={id}>
      <div className="dc-section-head">
        <div className="eyebrow" style={{ marginBottom: 6 }}>{id}</div>
        <h2 className="serif-kr" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink-2)" }}>{title}</h2>
        {subtitle && <p className="body-kr" style={{ fontSize: 13.5, color: "var(--gray)", marginTop: 6 }}>{subtitle}</p>}
      </div>
      <div className="dc-grid">{children}</div>
    </section>
  );
}

function DCArtboard({ id, label, children }) {
  return (
    <div className="dc-artboard">
      <div className="dc-artboard-label">
        <span className="mono" style={{ fontSize: 11, color: "var(--champagne)", letterSpacing: "0.1em" }}>{id}</span>
        <span className="body-kr" style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)" }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function DCPostIt({ children }) {
  return <div className="dc-postit">{children}</div>;
}

window.DesignCanvas = DesignCanvas;
window.DCSection = DCSection;
window.DCArtboard = DCArtboard;
window.DCPostIt = DCPostIt;
