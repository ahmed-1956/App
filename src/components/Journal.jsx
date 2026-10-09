import { useEffect, useState } from "react";
import "./Journal.css";

const STORAGE_KEY = "nahw-al-taghyir-journal-v2";

function loadNotes() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Journal() {
  const [notes, setNotes] = useState(loadNotes);
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(todayString());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  function newNote() {
    setSelectedId(null);
    setTitle("");
    setContent("");
    setDate(todayString());
  }

  function saveNote() {
    if (!title.trim() && !content.trim()) return;

    const id = selectedId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const note = {
      id,
      title: title.trim() || "ملاحظة بدون عنوان",
      content,
      date,
      updatedAt: new Date().toISOString(),
    };

    setNotes((previous) => {
      const exists = previous.some((item) => item.id === id);
      return exists
        ? previous.map((item) => item.id === id ? note : item)
        : [note, ...previous];
    });
    setSelectedId(id);
  }

  function openNote(note) {
    setSelectedId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setDate(note.date);
  }

  function deleteNote(id) {
    setNotes((previous) => previous.filter((note) => note.id !== id));
    if (selectedId === id) newNote();
  }

  return (
    <main className="journal-page" dir="rtl">
      <header className="journal-header">
        <div>
          <h1>اليوميات</h1>
          <p>احتفظ بأفكارك وملاحظاتك، يومًا بعد يوم.</p>
        </div>
        <button className="journal-primary" onClick={newNote}>
          ＋ ملاحظة جديدة
        </button>
      </header>

      <section className="journal-editor">
        <h2>{selectedId ? "تعديل الملاحظة" : "ملاحظة جديدة"}</h2>

        <label htmlFor="journal-date">التاريخ</label>
        <input
          id="journal-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label htmlFor="journal-title">عنوان الملاحظة</label>
        <input
          id="journal-title"
          type="text"
          placeholder="اكتب عنوانًا..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="journal-content">ماذا تريد أن تدوّن؟</label>
        <textarea
          id="journal-content"
          rows={6}
          placeholder="اكتب ملاحظتك هنا..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="journal-actions">
          <button className="journal-primary" onClick={saveNote}>
            حفظ الملاحظة
          </button>
          {selectedId && (
            <button className="journal-secondary" onClick={newNote}>
              إلغاء التعديل
            </button>
          )}
        </div>
        <p className="journal-hint">تُحفظ الملاحظات محليًا على هذا الجهاز.</p>
      </section>

      <section className="journal-history">
        <h2>الملاحظات السابقة ({notes.length})</h2>

        {notes.length === 0 ? (
          <p className="journal-empty">لا توجد ملاحظات محفوظة بعد. أنشئ ملاحظتك الأولى.</p>
        ) : (
          <div className="journal-list">
            {[...notes]
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((note) => (
                <article className={`journal-note ${selectedId === note.id ? "journal-note-selected" : ""}`} key={note.id}>
                  <button
                    className="journal-note-open"
                    onClick={() => openNote(note)}
                  >
                    <span className="journal-note-date">{note.date}</span>
                    <strong>{note.title}</strong>
                    {selectedId === note.id && (
                      <span className="journal-selected-label">قيد التعديل</span>
                    )}
                    <span className="journal-note-preview">
                      {note.content || "لا يوجد نص"}
                    </span>
                  </button>
                  <button
                    className="journal-delete"
                    aria-label={`اضغط مطولًا لحذف ${note.title}`}
                    onContextMenu={(e) => e.preventDefault()}
                    onPointerDown={(e) => {
                      if (e.button !== 0) return;
                      const button = e.currentTarget;
                      button.classList.add("journal-delete-holding");
                      button.dataset.holdTimer = String(
                        window.setTimeout(() => {
                          button.dataset.holdDone = "true";
                          button.classList.remove("journal-delete-holding");
                          button.classList.add("journal-delete-complete");
                          deleteNote(note.id);
                        }, 650)
                      );
                      button.dataset.holdDone = "false";
                    }}
                    onPointerUp={(e) => {
                      window.clearTimeout(Number(e.currentTarget.dataset.holdTimer));
                      e.currentTarget.classList.remove("journal-delete-holding");
                    }}
                    onPointerLeave={(e) => {
                      window.clearTimeout(Number(e.currentTarget.dataset.holdTimer));
                      e.currentTarget.classList.remove("journal-delete-holding");
                    }}
                    onPointerCancel={(e) => {
                      window.clearTimeout(Number(e.currentTarget.dataset.holdTimer));
                      e.currentTarget.classList.remove("journal-delete-holding");
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <span>اضغط مطولًا للحذف</span>
                  </button>
                </article>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
