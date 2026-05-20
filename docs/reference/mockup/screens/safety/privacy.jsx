/* ============================================================
   Screen 18 · 프라이버시 + 졸업
   5개 토글 + "졸업하기" 모달
   ============================================================ */

function Toggle({ on }) {
  return (
    <div style={{
      width: 40, height: 23, borderRadius: 2, padding: 2, flexShrink: 0,
      background: on ? "var(--ink-2)" : "var(--ivory-3)",
      display: "flex", justifyContent: on ? "flex-end" : "flex-start",
    }}>
      <span style={{ width: 19, height: 19, borderRadius: 1, background: on ? "var(--champagne)" : "#fff" }} />
    </div>
  );
}

function ScreenPrivacy() {
  const toggles = [
    ["프로필 비공개 휴식", "큐레이션에서 잠시 제외됩니다", false],
    ["직장 동료 차단", "같은 회사 도메인 회원을 숨깁니다", true],
    ["연락처 기반 차단", "주소록 지인을 매칭에서 제외", true],
    ["읽음 표시", "상대에게 메시지 읽음을 표시", false],
    ["접속 상태 표시", "마지막 접속 시간을 노출", false],
  ];
  return (
    <div style={{ minHeight: "100%", background: "var(--ivory)" }}>
      <div style={{ padding: "60px 24px 0" }}>
        <span className="mono" style={{ fontSize: 18, color: "var(--ink-2)" }}>←</span>
        <div className="editorial-en" style={{ fontSize: 15, color: "var(--champagne)", marginTop: 22, marginBottom: 6 }}>Privacy & Safety</div>
        <h1 className="serif-kr" style={{ fontSize: 27, fontWeight: 700, color: "var(--ink-2)" }}>프라이버시</h1>
      </div>

      <div style={{ padding: "28px 24px 0" }}>
        {toggles.map(([t, h, on]) => (
          <div key={t} className="flex jcb aic" style={{ padding: "16px 0", borderBottom: "1px solid var(--hair-light)" }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <div className="body-kr" style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink-2)" }}>{t}</div>
              <div className="body-kr" style={{ fontSize: 11.5, color: "var(--gray)", marginTop: 2 }}>{h}</div>
            </div>
            <Toggle on={on} />
          </div>
        ))}
      </div>

      {/* 졸업 모달 */}
      <div style={{ padding: "32px 24px 40px" }}>
        <div style={{ border: "1px solid var(--hair-light)", padding: 22, borderRadius: 2, textAlign: "center" }}>
          <div className="editorial-en" style={{ fontSize: 14, color: "var(--champagne)", marginBottom: 8 }}>Graduation</div>
          <h2 className="serif-kr" style={{ fontSize: 20, fontWeight: 700, color: "var(--ink-2)" }}>졸업하기</h2>
          <p className="body-kr" style={{ fontSize: 12.5, color: "var(--gray)", marginTop: 10, lineHeight: 1.7 }}>
            좋은 인연을 만나 THE ONE을 떠나시나요?<br/>졸업하시면 프로필이 비공개 처리되고,<br/>축하의 의미로 마지막 케미 리포트를 드립니다.
          </p>
          <button className="o-btn o-btn-outline" style={{ width: "100%", marginTop: 20 }}>졸업 신청하기</button>
        </div>
        <p className="body-kr" style={{ fontSize: 11.5, color: "var(--gray)", textAlign: "center", marginTop: 20, textDecoration: "underline", cursor: "pointer" }}>계정 영구 삭제</p>
      </div>
    </div>
  );
}

window.ScreenPrivacy = ScreenPrivacy;
