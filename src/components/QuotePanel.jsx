import { useEffect, useState } from "react";

const KEY = "nahw-al-tagheer-quotes";
const DEFAULT_QUOTES = ["من لا يتغير، يهلك"];

function loadQuotes() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some(q => typeof q === "string" && q.trim())) {
        return parsed.filter(q => typeof q === "string" && q.trim());
      }
    }
  } catch {}
  return DEFAULT_QUOTES;
}

function getDailyQuote(quotes) {
  const now = new Date();
  const day = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000
  );
  return quotes[day % quotes.length];
}

export default function QuotePanel() {
  const [quotes, setQuotes] = useState(loadQuotes);
  const [draft, setDraft] = useState("");
  const [managing, setManaging] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(quotes));
    } catch {}
  }, [quotes]);

  const addQuote = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || quotes.includes(text)) return;
    setQuotes(current => [...current, text]);
    setDraft("");
  };

  const removeQuote = (text) => {
    if (quotes.length <= 1) return;
    setQuotes(current => current.filter(q => q !== text));
  };

  return (
    <div dir="rtl" style={{ margin: "14px 20px 18px" }}>
      <div
        style={{
          padding: "22px 20px",
          borderRadius: 22,
          background: "rgba(255,255,255,0.22)",
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow: "0 8px 32px rgba(31,41,55,0.08)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "Thmanyah, serif",
            fontWeight: 700,
            fontSize: "clamp(23px, 6vw, 30px)",
            lineHeight: 1.8,
            color: "inherit",
            overflowWrap: "anywhere",
          }}
        >
          {getDailyQuote(quotes)}
        </p>

        <button
          type="button"
          onClick={() => setManaging(value => !value)}
          aria-expanded={managing}
          style={{
            display: "block",
            margin: "12px auto 0",
            padding: "5px 10px",
            border: 0,
            background: "transparent",
            color: "#2563EB",
            font: "inherit",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {managing ? "إغلاق الإدارة" : "إدارة الحكم"}
        </button>
      </div>

      {managing && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            borderRadius: 18,
            background: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(148,163,184,0.25)",
          }}
        >
          <form onSubmit={addQuote} style={{ display: "grid", gap: 10 }}>
            <textarea
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder="اكتب الحكمة هنا"
              rows={3}
              aria-label="حكمة جديدة"
              style={{
                width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    boxSizing: "border-box",
    maxWidth: "100%",
                boxSizing: "border-box",
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.4)",
                background: "rgba(255,255,255,0.7)",
                color: "inherit",
                font: "inherit",
                resize: "vertical",
              }}
            />
            <button
              type="submit"
              disabled={!draft.trim() || quotes.includes(draft.trim())}
              style={{
                padding: "11px 14px",
                border: 0,
                borderRadius: 12,
                background: "#2563EB",
                color: "#fff",
                font: "inherit",
                cursor: "pointer",
                opacity: !draft.trim() || quotes.includes(draft.trim()) ? 0.55 : 1,
              }}
            >
              إضافة الحكمة
            </button>
          </form>

          <p style={{ fontSize: 13, color: "inherit", margin: "16px 0 8px" }}>
            الحكم المحفوظة: {quotes.length}
          </p>

          <div style={{ display: "grid", gap: 8 }}>
            {quotes.map((quote, index) => (
              <div
                key={`${quote}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  justifyContent: "space-between",
                  padding: "9px 10px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.45)",
                }}
              >
                <span style={{ flex: 1, overflowWrap: "anywhere", fontSize: 14 }}>
                  {quote}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuote(quote)}
                  disabled={quotes.length <= 1}
                  aria-label={`حذف الحكمة: ${quote}`}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "#B42318",
                    font: "inherit",
                    fontSize: 13,
                    cursor: quotes.length <= 1 ? "default" : "pointer",
                    opacity: quotes.length <= 1 ? 0.35 : 1,
                  }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
