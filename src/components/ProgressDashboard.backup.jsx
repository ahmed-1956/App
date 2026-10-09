import { useState } from "react";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const monthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const dateKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const monthName = (y, m) =>
  new Intl.DateTimeFormat("ar", { month: "long", year: "numeric" })
    .format(new Date(y, m, 1));

const number = (n) => new Intl.NumberFormat("ar").format(n);

function Card({ title, children }) {
  return (
    <section style={{
      background: "#fff",
      border: "1px solid #E4E7EC",
      borderRadius: 18,
      padding: 18,
      marginBottom: 16,
      minWidth: 0,
    }}>
      <h2 style={{ fontSize: 17, margin: "0 0 18px" }}>{title}</h2>
      {children}
    </section>
  );
}

function Bar({ value, color = "#2563EB" }) {
  return (
    <div style={{ height: 8, background: "#EEF0F4", borderRadius: 20, overflow: "hidden" }}>
      <div style={{
        width: `${Math.max(0, Math.min(100, value))}%`,
        height: "100%",
        background: color,
        borderRadius: 20,
        transition: "width .2s ease",
      }} />
    </div>
  );
}

function LineChart({ values }) {
  const width = 320;
  const height = 115;
  const points = values.map((v, i) => {
    const x = values.length <= 1 ? width / 2 : 8 + i * (width - 16) / (values.length - 1);
    const y = height - 8 - (v / 100) * (height - 20);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label="منحنى نسبة إنجاز العادات اليومية"
        style={{ width: "100%", display: "block", overflow: "visible" }}>
        {[0, 50, 100].map((v) => {
          const y = height - 8 - (v / 100) * (height - 20);
          return <line key={v} x1="0" x2={width} y1={y} y2={y} stroke="#E4E7EC" strokeDasharray="4 4" />;
        })}
        {values.length > 0 && (
          <>
            <polyline points={points} fill="none" stroke="#2563EB"
              strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {values.map((v, i) => {
              const x = values.length <= 1 ? width / 2 : 8 + i * (width - 16) / (values.length - 1);
              const y = height - 8 - (v / 100) * (height - 20);
              return <circle key={i} cx={x} cy={y} r="3.5" fill="#2563EB" />;
            })}
          </>
        )}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#667085", fontSize: 11 }}>
        <span>الأقدم</span><span>الأحدث</span>
      </div>
    </div>
  );
}


function WeeklyChart({ data }) {
  const completions = data.completions || {};
  const totals = data.habitTotals || {};
  const habits = data.habits || [];

  const weeks = Array.from({ length: 6 }, (_, i) => {
    const end = new Date();
    end.setHours(12, 0, 0, 0);
    end.setDate(end.getDate() - (5 - i) * 7);

    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    let done = 0;
    let possible = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      done += Object.values(completions[key] || {}).filter(Boolean).length;
      possible += totals[key] ?? habits.length;
    }

    return {
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      rate: possible ? Math.round(done / possible * 100) : 0,
      done,
      possible,
    };
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8, alignItems: "end" }}>
      {weeks.map((week, i) => (
        <div key={i} style={{ minWidth: 0, textAlign: "center" }}>
          <strong style={{ display: "block", fontSize: 11, marginBottom: 7 }}>{week.rate}%</strong>
          <div style={{ height: 110, background: "#F1F5F9", borderRadius: 8, display: "flex", alignItems: "end", overflow: "hidden" }}>
            <div title={`${week.done} إنجازًا من ${week.possible}`}
              style={{ height: `${Math.max(week.rate, 2)}%`, width: "100%", background: "#2563EB", borderRadius: "7px 7px 0 0" }} />
          </div>
          <span style={{ display: "block", fontSize: 10, color: "#667085", marginTop: 7 }}>{week.label}</span>
        </div>
      ))}
    </div>
  );
}

function HabitHistoryChart({ data }) {
  const habits = data.habits || [];
  const completions = data.completions || {};
  const totals = data.habitTotals || {};

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  if (!habits.length) {
    return <p style={{ color: "#667085", fontSize: 14 }}>أضف عادات وابدأ بتسجيل إنجازها لعرض المقارنة.</p>;
  }

  return (
    <div>
      {habits.map((habit) => {
        const tracked = dates.filter((date) =>
          Object.prototype.hasOwnProperty.call(completions, date) ||
          Object.prototype.hasOwnProperty.call(totals, date)
        );
        const done = tracked.filter((date) => completions[date]?.[habit.id]).length;
        const rate = tracked.length ? Math.round(done / tracked.length * 100) : 0;

        return (
          <div key={habit.id} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, marginBottom: 7 }}>
              <span>{habit.name}</span>
              <strong>{done}/{tracked.length} يومًا</strong>
            </div>
            <div style={{ height: 9, background: "#EEF0F4", borderRadius: 20, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${rate}%`, background: "#0D9488", borderRadius: 20 }} />
            </div>
          </div>
        );
      })}
      <p style={{ color: "#667085", fontSize: 11, lineHeight: 1.7 }}>
        النسبة محسوبة من الأيام التي لها سجل محفوظ في آخر 14 يومًا، وليست من الأيام التي لم تسجل فيها بيانات.
      </p>
    </div>
  );
}

export default function ProgressDashboard({ data }) {
  const currentDate = new Date();
  const [month, setMonth] = useState(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today());

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;
  const weekdays = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];

  const habits = data.habits || [];
  const tasks = data.tasks || [];
  const completions = data.completions || {};
  const totals = data.habitTotals || {};
  const notes = data.notes || {};

  const rateFor = (date) => {
    const done = Object.values(completions[date] || {}).filter(Boolean).length;
    const total = totals[date] ?? habits.length;
    return total ? Math.round(done / total * 100) : 0;
  };

  const monthDates = Array.from({ length: daysInMonth }, (_, i) => dateKey(year, monthIndex, i + 1));
  const activeDates = Object.keys(completions).filter((d) =>
    Object.values(completions[d] || {}).some(Boolean)
  );
  const dailyRates = monthDates.map(rateFor);
  const monthDone = monthDates.reduce((sum, d) =>
    sum + Object.values(completions[d] || {}).filter(Boolean).length, 0);
  const monthPossible = monthDates.reduce((sum, d) =>
    sum + (totals[d] ?? habits.length), 0);
  const monthRate = monthPossible ? Math.round(monthDone / monthPossible * 100) : 0;

  const selectedCompletions = completions[selectedDate] || {};
  const selectedTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const selectedDone = Object.values(selectedCompletions).filter(Boolean).length;
  const selectedTotal = totals[selectedDate] ?? habits.length;

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
    return { date: key, rate: rateFor(key) };
  });

  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const notesCount = Object.values(notes).filter((n) => String(n).trim()).length;
  const monthNotes = monthDates.filter((d) => String(notes[d] || "").trim()).length;
  const activeDays = new Set(activeDates).size;

  const changeMonth = (amount) => {
    setMonth(new Date(year, monthIndex + amount, 1));
  };

  const cellButton = (date, day) => {
    const rate = rateFor(date);
    const isSelected = selectedDate === date;
    const isToday = date === today();
    const hasNote = Boolean(String(notes[date] || "").trim());
    const hasTask = tasks.some((t) => t.dueDate === date);
    const bg = rate >= 75 ? "#BBF7D0" : rate >= 40 ? "#D1FAE5" : rate > 0 ? "#ECFDF5" : "#F6F7F9";

    return (
      <button key={date} type="button" onClick={() => setSelectedDate(date)}
        aria-pressed={isSelected}
        aria-label={`${date}، إنجاز ${rate}%`}
        title={`${date} — ${rate}%`}
        style={{
          minWidth: 0,
          aspectRatio: "1 / 1",
          borderRadius: 10,
          border: isSelected ? "2px solid #2563EB" : isToday ? "1px solid #2563EB" : "1px solid transparent",
          background: bg,
          color: "#17202A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          padding: 2,
          cursor: "pointer",
          font: "inherit",
        }}>
        <span style={{ fontSize: 13, fontWeight: isSelected || isToday ? 700 : 500 }}>{number(day)}</span>
        <span style={{ fontSize: 9, color: "#475467" }}>{rate > 0 ? `${number(rate)}٪` : "—"}</span>
        {(hasNote || hasTask) && <span aria-hidden="true" style={{ width: 4, height: 4, borderRadius: "50%", background: "#2563EB" }} />}
      </button>
    );
  };

  return (
    <div>
      <Card title="ملخص التقدم">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          <div style={{ background: "#F6F7F9", borderRadius: 14, padding: 14 }}>
            <div style={{ color: "#667085", fontSize: 13 }}>إنجاز هذا الشهر</div>
            <strong style={{ display: "block", fontSize: 28, marginTop: 5 }}>{number(monthRate)}٪</strong>
            <Bar value={monthRate} />
          </div>
          <div style={{ background: "#F6F7F9", borderRadius: 14, padding: 14 }}>
            <div style={{ color: "#667085", fontSize: 13 }}>أيام مسجّلة</div>
            <strong style={{ display: "block", fontSize: 28, marginTop: 5 }}>{number(activeDays)}</strong>
            <span style={{ color: "#667085", fontSize: 12 }}>منذ بداية استخدام التطبيق</span>
          </div>
          <div style={{ background: "#F6F7F9", borderRadius: 14, padding: 14 }}>
            <div style={{ color: "#667085", fontSize: 13 }}>المهام المكتملة</div>
            <strong style={{ display: "block", fontSize: 28, marginTop: 5 }}>{number(completedTasks)}</strong>
            <span style={{ color: "#667085", fontSize: 12 }}>من أصل {number(tasks.length)}</span>
          </div>
          <div style={{ background: "#F6F7F9", borderRadius: 14, padding: 14 }}>
            <div style={{ color: "#667085", fontSize: 13 }}>اليوميات المكتوبة</div>
            <strong style={{ display: "block", fontSize: 28, marginTop: 5 }}>{number(notesCount)}</strong>
            <span style={{ color: "#667085", fontSize: 12 }}>ملاحظة محفوظة</span>
          </div>
        </div>
      </Card>

      <Card title="تقويم الإنجاز">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 16 }}>
          <button type="button" onClick={() => changeMonth(-1)} aria-label="الشهر السابق"
            style={{ border: "1px solid #E4E7EC", background: "#fff", borderRadius: 9, padding: "8px 13px", cursor: "pointer" }}>‹</button>
          <strong>{monthName(year, monthIndex)}</strong>
          <button type="button" onClick={() => changeMonth(1)} aria-label="الشهر التالي"
            style={{ border: "1px solid #E4E7EC", background: "#fff", borderRadius: 9, padding: "8px 13px", cursor: "pointer" }}>›</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 5 }}>
          {weekdays.map((day) => (
            <div key={day} style={{ textAlign: "center", color: "#667085", fontSize: 10, paddingBottom: 5 }}>{day.slice(0, 2)}</div>
          ))}
          {Array.from({ length: offset }, (_, i) => <div key={`blank-${i}`} />)}
          {monthDates.map((date, i) => cellButton(date, i + 1))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 15, color: "#667085", fontSize: 11 }}>
          <span>مستوى الإنجاز:</span>
          <span>— لا تسجيل</span><span>🟩 إنجاز مسجّل</span>
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #E4E7EC" }}>
          <strong>{selectedDate}</strong>
          <p style={{ color: "#667085", fontSize: 13 }}>
            إنجاز العادات: {number(selectedDone)} من {number(selectedTotal)} ({number(rateFor(selectedDate))}٪)
          </p>
          {habits.length > 0 ? habits.map((habit) => (
            <div key={habit.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", fontSize: 14 }}>
              <span style={{ color: selectedCompletions[habit.id] ? "#15803D" : "#98A2B3" }}>
                {selectedCompletions[habit.id] ? "✓" : "○"}
              </span>
              <span>{habit.name}</span>
            </div>
          )) : <p style={{ color: "#667085", fontSize: 13 }}>أضف عادات لتظهر هنا تفاصيل الإنجاز.</p>}
          {selectedTasks.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ fontSize: 13 }}>المهام في هذا اليوم</strong>
              {selectedTasks.map((task) => (
                <div key={task.id} style={{ fontSize: 13, marginTop: 7 }}>
                  {task.completed ? "✓" : "○"} {task.title}
                </div>
              ))}
            </div>
          )}
          {notes[selectedDate] && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ fontSize: 13 }}>ملاحظة اليوم</strong>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 13 }}>{notes[selectedDate]}</p>
            </div>
          )}
        </div>
      </Card>

      <Card title="إنجاز العادات — آخر 14 يومًا">
        {activeDates.length === 0 && habits.length === 0 ? (
          <p style={{ color: "#667085", fontSize: 14 }}>سجّل إنجاز عاداتك لتكوين الرسم البياني.</p>
        ) : (
          <LineChart values={last14.map((d) => d.rate)} />
        )}
      </Card>

      <Card title="إنجاز كل عادة اليوم">
        {habits.length === 0 ? (
          <p style={{ color: "#667085", fontSize: 14 }}>لا توجد عادات بعد.</p>
        ) : habits.map((habit) => {
          const done = Boolean((completions[today()] || {})[habit.id]);
          return (
            <div key={habit.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14, marginBottom: 8 }}>
                <span>{habit.name}</span><strong>{done ? "100٪" : "0٪"}</strong>
              </div>
              <Bar value={done ? 100 : 0} color={done ? "#16A34A" : "#2563EB"} />
            </div>
          );
        })}
      </Card>

      <Card title="مقارنة الإنجاز الأسبوعي">
        <p style={{ color: "#667085", fontSize: 12, marginTop: -8, lineHeight: 1.7 }}>
          نسبة إنجاز العادات المسجلة في كل فترة من سبعة أيام.
        </p>
        <WeeklyChart data={data} />
      </Card>

      <Card title="مقارنة العادات — آخر 14 يومًا">
        <HabitHistoryChart data={data} />
      </Card>

      <Card title="حالة المهام">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
          <span>مكتملة</span><strong>{number(completedTasks)}</strong>
        </div>
        <Bar value={tasks.length ? completedTasks / tasks.length * 100 : 0} color="#16A34A" />
        <div style={{ display: "flex", justifyContent: "space-between", margin: "16px 0 8px", fontSize: 14 }}>
          <span>غير مكتملة</span><strong>{number(pendingTasks)}</strong>
        </div>
        <Bar value={tasks.length ? pendingTasks / tasks.length * 100 : 0} color="#F59E0B" />
      </Card>

      <Card title="نشاط اليوميات هذا الشهر">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 26 }}>{number(monthNotes)}</strong>
            <p style={{ margin: "4px 0 0", color: "#667085", fontSize: 13 }}>يومًا يحتوي على ملاحظة</p>
          </div>
          <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#EFF6FF", display: "grid", placeItems: "center", color: "#2563EB", fontWeight: 700 }}>
            {number(Math.round(monthNotes / daysInMonth * 100))}٪
          </div>
        </div>
        <Bar value={monthNotes / daysInMonth * 100} />
      </Card>
    </div>
  );
}
