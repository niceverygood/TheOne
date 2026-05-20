/* ============================================================
   PhoneFrame · Portrait · VerifiedDots
   ============================================================ */

function PhoneFrame({ dark, label, statusDark, children }) {
  return (
    <div className={"o-frame" + (dark ? " dark" : "")}>
      <div className="o-frame-inner">
        <div className="o-island" />
        <div
          className="o-statusbar"
          style={{ color: statusDark || (dark ? "var(--ivory)" : "var(--ink-2)") }}
        >
          <span>9:41</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 11 }}>
            <span>􀙇</span><span>􀛨</span><span>􀛪</span>
          </span>
        </div>
        <div className="o-scroll">{children}</div>
        <div className="o-home" />
      </div>
    </div>
  );
}

/* SVG 인물 placeholder — 따뜻한 회색 그라디언트 + 어두운 반원 실루엣 */
function Portrait({ label, tall, square, ratio, style, children }) {
  let h = "auto";
  let pad = "133%"; // 3:4
  if (tall) pad = "150%";
  if (square) pad = "100%";
  if (ratio) pad = ratio;

  return (
    <div
      className="o-portrait"
      style={{ width: "100%", height: h, paddingBottom: children ? 0 : pad, ...style }}
    >
      {label && <div className="o-portrait-cap">{label}</div>}
      {!children && (
        <svg
          viewBox="0 0 100 130"
          preserveAspectRatio="xMidYMax meet"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="pg" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stopColor="#E8E2D5" />
              <stop offset="1" stopColor="#C8C1B1" />
            </linearGradient>
          </defs>
          <rect width="100" height="130" fill="url(#pg)" />
          {/* 머리 */}
          <circle cx="50" cy="58" r="20" fill="#A89F8E" opacity="0.6" />
          {/* 어깨 반원 */}
          <path d="M16 130 Q16 92 50 92 Q84 92 84 130 Z" fill="#A89F8E" opacity="0.6" />
        </svg>
      )}
      {children}
    </div>
  );
}

/* 4개 sage 검증 점 */
function VerifiedDots({ marks = 4, dark, gap = 6, size = 6 }) {
  return (
    <div style={{ display: "flex", gap }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: i < marks ? "var(--sage)" : "transparent",
            border: i < marks ? "none" : "1px solid " + (dark ? "var(--hair-dark)" : "var(--hair-light)"),
          }}
        />
      ))}
    </div>
  );
}

window.PhoneFrame = PhoneFrame;
window.Portrait = Portrait;
window.VerifiedDots = VerifiedDots;
