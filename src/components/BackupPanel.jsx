import { useRef, useState } from "react";
import { exportBackup, importBackup } from "../storage/backup";

export default function BackupPanel() {
  const fileRef = useRef(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function restoreFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!window.confirm(
      "قبل الاستعادة، صدّر نسخة من بياناتك الحالية. هل تريد متابعة الاستعادة؟"
    )) return;

    setBusy(true);
    setMessage("");

    try {
      const count = await importBackup(file);
      setMessage(`تمت استعادة ${count} عنصرًا. أعد تحميل التطبيق لتظهر البيانات.`);
    } catch (error) {
      setMessage(error.message || "تعذّرت استعادة النسخة.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section dir="rtl" style={{
      margin: "20px 0",
      padding: 16,
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.4)",
      background: "rgba(255,255,255,0.22)",
      backdropFilter: "blur(20px) saturate(160%)",
      WebkitBackdropFilter: "blur(20px) saturate(160%)",
      display: "grid",
      gap: 12,
    }}>
      <strong>النسخ الاحتياطي</strong>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8 }}>
        احتفظ بنسخة من بياناتك لاستعادتها عند الحاجة أو عند تغيير الجهاز.
      </p>
      <button type="button" onClick={() => {
        try {
          const count = exportBackup();
          setMessage(`تم تصدير ${count} عنصرًا.`);
        } catch {
          setMessage("تعذّر إنشاء النسخة الاحتياطية.");
        }
      }}>
        تصدير نسخة احتياطية
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? "جارٍ الاستعادة..." : "استعادة نسخة"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={restoreFile}
      />
      {message && <p role="status" style={{ margin: 0, fontSize: 13 }}>{message}</p>}
    </section>
  );
}
