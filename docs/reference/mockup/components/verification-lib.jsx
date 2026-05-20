/* ============================================================
   인증 공통 — VBadge · FileChip · DocUpload
   상태: none / pending / verified / rejected
   ============================================================ */

function VBadge({ state = "none", label, size = "md", icon }) {
  const map = {
    none:     { bg: "transparent", bd: "var(--hair-light)", fg: "var(--gray)", dot: "var(--gray-soft)", txt: "미인증" },
    pending:  { bg: "transparent", bd: "var(--champagne)", fg: "var(--champagne)", dot: "var(--champagne)", txt: "심사중" },
    verified: { bg: "var(--sage)", bd: "var(--sage)", fg: "var(--ivory)", dot: "var(--ivory)", txt: "승인됨" },
    rejected: { bg: "transparent", bd: "var(--terra)", fg: "var(--terra)", dot: "var(--terra)", txt: "반려" },
  };
  const c = map[state];
  const pad = size === "sm" ? "3px 8px" : "5px 11px";
  const fs = size === "sm" ? 9.5 : 11;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: c.bg, border: "1px solid " + c.bd, color: c.fg,
      padding: pad, borderRadius: 2,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot }} />
      <span className="mono" style={{ fontSize: fs, letterSpacing: "0.06em" }}>{label || c.txt}</span>
    </span>
  );
}

function FileChip({ name, size, kind = "PDF", onRemove }) {
  return (
    <div className="flex jcb aic" style={{
      border: "1px solid var(--hair-light)", padding: "11px 12px", borderRadius: 2, marginBottom: 8,
      background: "var(--ivory)",
    }}>
      <div className="flex aic" style={{ gap: 10, minWidth: 0 }}>
        <span className="mono" style={{
          fontSize: 8.5, color: "var(--ivory)", background: kind === "PDF" ? "var(--terra)" : "var(--ink-2)",
          padding: "3px 5px", borderRadius: 1, flexShrink: 0,
        }}>{kind}</span>
        <div style={{ minWidth: 0 }}>
          <div className="body-kr" style={{ fontSize: 12.5, color: "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
          <div className="mono" style={{ fontSize: 9, color: "var(--gray)" }}>{size}</div>
        </div>
      </div>
      <span className="mono" style={{ fontSize: 13, color: "var(--gray)", cursor: "pointer", flexShrink: 0 }}>✕</span>
    </div>
  );
}

function DocUpload({ doc }) {
  const { label, required, files = [], canAdd } = doc;
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="flex aic" style={{ gap: 8, marginBottom: 10 }}>
        <span className="body-kr" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-2)" }}>{label}</span>
        {required
          ? <span className="mono" style={{ fontSize: 9, color: "var(--terra)" }}>필수</span>
          : <span className="body-en" style={{ fontSize: 10, color: "var(--gray)", fontStyle: "italic" }}>optional</span>}
      </div>
      {files.length === 0 ? (
        <div style={{ border: "1px dashed var(--gray-soft)", padding: "18px 16px", textAlign: "center", borderRadius: 2 }}>
          <div className="body-kr" style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>+ 파일 첨부</div>
          <div className="body-en" style={{ fontSize: 10.5, color: "var(--gray)", marginTop: 3, fontStyle: "italic" }}>Drag or tap</div>
        </div>
      ) : (
        <>
          {files.map((f, i) => <FileChip key={i} {...f} />)}
          {canAdd && (
            <div className="body-kr" style={{ fontSize: 12, color: "var(--champagne)", cursor: "pointer", marginTop: 2 }}>+ 추가 업로드</div>
          )}
        </>
      )}
    </div>
  );
}

/* 보안 카피 — 일관 유지 */
function SecurityNote() {
  return (
    <div style={{ background: "var(--ivory-2)", padding: "14px 16px", borderLeft: "2px solid var(--champagne)", marginTop: 8 }}>
      <p className="body-kr" style={{ fontSize: 11.5, color: "var(--gray)", lineHeight: 1.6 }}>
        업로드 즉시 256-bit 암호화되어 관리자 외 접근이 불가합니다. 검토 완료 후 <b style={{ color: "var(--ink-2)" }}>7일 안에 자동 파기</b>되며, 매칭 상대에게는 뱃지만 노출됩니다.
      </p>
    </div>
  );
}

window.VBadge = VBadge;
window.FileChip = FileChip;
window.DocUpload = DocUpload;
window.SecurityNote = SecurityNote;
