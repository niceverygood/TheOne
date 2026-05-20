/* ============================================================
   Screen 19 · 추가 인증 허브
   4개 항목 뱃지 상태 (학력 / 재산 / 차량 / 부동산)
   ============================================================ */

function HubRow({ kr, en, state, days }) {
  return (
    <div className="flex jcb aic" style={{ padding: "20px 0", borderBottom: "1px solid var(--hair-light)", cursor: "pointer" }}>
      <div>
        <div className="editorial-en" style={{ fontSize: 12, color: "var(--gray)", marginBottom: 3 }}>{en}</div>
        <div className="body-kr" style={{ fontSize: 16, fontWeight: 500, color: "var(--ink-2)" }}>{kr}</div>
        <div className="body-kr" style={{ fontSize: 11, color: "var(--gray)", marginTop: 3 }}>평균 {days}일 소요</div>
      </div>
      <div className="flex aic" style={{ gap: 12 }}>
        <VBadge state={state} size="sm" />
        <span className="mono" style={{ fontSize: 14, color: "var(--gray-soft)" }}>›</span>
      </div>
    </div>
  );
}

function ScreenVerifyHub() {
  return (
    <div style={{ minHeight: "100%", background: "var(--ivory)" }}>
      <div style={{ padding: "60px 24px 0" }}>
        <span className="mono" style={{ fontSize: 18, color: "var(--ink-2)" }}>←</span>
        <div className="editorial-en" style={{ fontSize: 15, color: "var(--champagne)", marginTop: 22, marginBottom: 6 }}>Verifications</div>
        <h1 className="serif-kr" style={{ fontSize: 27, fontWeight: 700, color: "var(--ink-2)" }}>추가 인증</h1>
        <p className="body-kr" style={{ fontSize: 13, color: "var(--gray)", marginTop: 8, lineHeight: 1.6 }}>
          인증할수록 신뢰도가 올라갑니다. 관리자가 직접 검토하며, 매칭 상대에게는 뱃지만 노출됩니다.
        </p>
      </div>

      <div style={{ padding: "24px 24px 0" }}>
        {/* 검증 마크 요약 */}
        <div className="flex jcb aic" style={{ padding: "16px", background: "var(--ink-2)", borderRadius: 2, marginBottom: 24 }}>
          <span className="body-kr" style={{ fontSize: 12.5, color: "rgba(250,247,242,0.7)" }}>현재 검증 수준</span>
          <div className="flex aic" style={{ gap: 10 }}>
            <VerifiedDots marks={2} dark />
            <span className="mono" style={{ fontSize: 12, color: "var(--ivory)" }}>2 / 4</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px 40px" }}>
        <HubRow en="Education" kr="학력" state="verified" days="3" />
        <HubRow en="Wealth" kr="재산" state="pending" days="5" />
        <HubRow en="Vehicle" kr="보유 차량" state="none" days="2" />
        <HubRow en="Real Estate" kr="부동산" state="rejected" days="4" />
      </div>
    </div>
  );
}

window.ScreenVerifyHub = ScreenVerifyHub;
