import { useMemo, useState } from "react";

const DAY_NAMES = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const pad = (n) => String(n).padStart(2, "0");
const keyOf = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const shiftDay = (key, amount) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + amount);
  return keyOf(d);
};
const isRecord = (v) => v && typeof v === "object";

function getDoneIds(data, date) {
  const value = data?.completions?.[date];
  if (Array.isArray(value)) return value.map(String);
  if (isRecord(value)) {
    return Object.entries(value)
      .filter(([, done]) => Boolean(done))
      .map(([id]) => String(id));
  }
  return [];
}

function getRate(data, date) {
  const hasLog =
    Object.prototype.hasOwnProperty.call(data?.completions || {}, date) ||
    Object.prototype.hasOwnProperty.call(data?.habitTotals || {}, date);

  if (!hasLog) return null;

  const total = Number(data?.habitTotals?.[date] ?? data?.habits?.length ?? 0);
  if (total <= 0) return null;

  return Math.round(
    Math.min(getDoneIds(data, date).length, total) / total * 100
  );
}

function noteFor(data, date) {
  const note = data?.notes?.[date];
  if (typeof note === "string") return note;
  if (isRecord(note)) return String(note.text || note.content || "");
  return "";
}

function taskDate(task) {
  return task?.dueDate || task?.date || task?.due || "";
}

function Card({ title, subtitle, children }) {
  return (
    <section style={{
      background: "var(--panel, #fff)",
      color: "var(--text, #17202a)",
      border: "1px solid var(--border, #e5e7eb)",
      borderRadius: 18,
      padding: 16,
      minWidth: 0,
      boxShadow: "0 3px 14px rgba(0,0,0,.035)"
    }}>
      <h3 style={{ fontSize: 16, margin: "0 0 5px", fontWeight: 750 }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ margin: "0 0 14px", fontSize: 12, opacity: .65 }}>
          {subtitle}
        </p>
      )}
      {children}
    </section>
  );
}

function Empty({ children = "ستظهر البيانات هنا مع بدء تسجيل إنجازاتك." }) {
  return (
    <div style={{
      padding: "22px 10px", textAlign: "center", fontSize: 13,
      opacity: .65, border: "1px dashed var(--border, #d1d5db)",
      borderRadius: 12
    }}>
      {children}
    </div>
  );
}

function Metric({ label, value, suffix = "" }) {
  return (
    <div style={{
      padding: 15, borderRadius: 16,
      background: "var(--panel, #fff)",
      border: "1px solid var(--border, #e5e7eb)"
    }}>
      <div style={{ fontSize: 12, opacity: .65, marginBottom: 9 }}>{label}</div>
      <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-.5px" }}>
        {value}{suffix}
      </div>
    </div>
  );
}

function LineChart({ values }) {
  const valid = values.filter((v) => v.rate !== null);
  if (!valid.length) return <Empty>سجّل إنجاز العادات لتكوين منحنى يومي.</Empty>;

  const w = 600, h = 210, left = 30, right = 18, top = 18, bottom = 34;
  const x = (i) => left + i * (w - left - right) / Math.max(values.length - 1, 1);
  const y = (n) => top + (100 - n) * (h - top - bottom) / 100;

  const segments = [];
  let segment = [];
  values.forEach((v, i) => {
    if (v.rate === null) {
      if (segment.length) segments.push(segment);
      segment = [];
    } else {
      segment.push(`${x(i)},${y(v.rate)}`);
    }
  });
  if (segment.length) segments.push(segment);

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", display: "block" }}
        role="img" aria-label="منحنى نسبة إنجاز العادات">
        {[0, 25, 50, 75, 100].map((n) => (
          <g key={n}>
            <line x1={left} y1={y(n)} x2={w - right} y2={y(n)}
              stroke="currentColor" opacity=".12" />
            <text x={left - 7} y={y(n) + 4} textAnchor="end"
              fontSize="11" fill="currentColor">{n}</text>
          </g>
        ))}
        {segments.map((pts, i) => (
          <polyline key={i} points={pts.join(" ")} fill="none"
            stroke="#16a34a" strokeWidth="3" strokeLinecap="round"
            strokeLinejoin="round" />
        ))}
        {values.map((v, i) => v.rate === null ? null : (
          <g key={v.date}>
            <circle cx={x(i)} cy={y(v.rate)} r="4" fill="#16a34a" />
            <title>{v.date}: {v.rate}%</title>
          </g>
        ))}
        <text x={left} y={h - 8} fontSize="11" fill="currentColor">
          {values[0].date.slice(5)}
        </text>
        <text x={w - right} y={h - 8} fontSize="11" textAnchor="end"
          fill="currentColor">{values[values.length - 1].date.slice(5)}</text>
      </svg>
      <p style={{ fontSize: 11, opacity: .6, margin: 0 }}>
        الفجوات تعني عدم وجود سجل لذلك اليوم، ولا تعني إنجازًا بنسبة صفر.
      </p>
    </div>
  );
}

function Bars({ items, emptyText }) {
  if (!items.length) return <Empty>{emptyText}</Empty>;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {items.map((item) => (
        <div key={item.label}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            gap: 10, fontSize: 12, marginBottom: 6
          }}>
            <span style={{ overflowWrap: "anywhere" }}>{item.label}</span>
            <strong>{item.value}{item.suffix || ""}</strong>
          </div>
          <div style={{
            height: 8, borderRadius: 20,
            background: "var(--border, #e5e7eb)", overflow: "hidden"
          }}>
            <div style={{
              width: `${Math.max(0, Math.min(100, item.percent))}%`,
              height: "100%", borderRadius: 20, background: item.color || "#16a34a"
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProgressDashboard({ data = {} }) {
  const habits = Array.isArray(data.habits) ? data.habits : [];
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const completions = data.completions || {};
  const totals = data.habitTotals || {};
  const notes = data.notes || {};

  const today = keyOf(new Date());
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(today);

  const monthTitle = `${MONTHS[month.month]} ${month.year}`;
  const firstDay = new Date(month.year, month.month, 1).getDay();
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const cells = Array(firstDay).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = keyOf(new Date(month.year, month.month, day));
      cells.push({ day, date, rate: getRate(data, date) });
    }
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month.year, month.month, firstDay, daysInMonth, data]);

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const date = shiftDay(today, i - 13);
    return { date, rate: getRate(data, date) };
  });

  const trackedRates = Object.keys(completions)
    .map((date) => getRate(data, date))
    .filter((rate) => rate !== null);

  const overallRate = trackedRates.length
    ? Math.round(trackedRates.reduce((a, b) => a + b, 0) / trackedRates.length)
    : null;

  const completedTasks = tasks.filter((task) => task.completed).length;
  const activeDates = new Set([
    ...Object.keys(completions).filter((date) => getDoneIds(data, date).length > 0),
    ...tasks.filter((task) => task.completedOn).map((task) => task.completedOn),
    ...Object.entries(notes).filter(([, note]) =>
      typeof note === "string" ? note.trim() : Boolean(note)
    ).map(([date]) => date)
  ]);

  const selectedDone = getDoneIds(data, selectedDate);
  const selectedTotal = Number(totals[selectedDate] ?? habits.length);
  const selectedTasks = tasks.filter((task) => taskDate(task) === selectedDate);
  const selectedNote = noteFor(data, selectedDate);
  const selectedRate = getRate(data, selectedDate);
  const hasSelectedData =
    Object.prototype.hasOwnProperty.call(completions, selectedDate) ||
    Object.prototype.hasOwnProperty.call(totals, selectedDate) ||
    selectedTasks.length > 0 || Boolean(selectedNote) ||
    tasks.some((task) => task.completedOn === selectedDate);

  const habitBars = habits.map((habit) => {
    const id = String(habit.id);
    const days = last14.filter((d) => d.rate !== null);
    const done = days.filter((d) => getDoneIds(data, d.date).includes(id)).length;
    return {
      label: habit.name || habit.title || "عادة",
      value: done,
      suffix: ` / ${days.length}`,
      percent: days.length ? done / days.length * 100 : 0
    };
  });

  const taskBars = [
    { label: "مكتملة", value: completedTasks, percent: tasks.length ? completedTasks / tasks.length * 100 : 0, color: "#16a34a" },
    { label: "قيد الإنجاز", value: tasks.length - completedTasks, percent: tasks.length ? (tasks.length - completedTasks) / tasks.length * 100 : 0, color: "#d97706" }
  ];

  const journalCount = Object.values(notes).filter((note) =>
    typeof note === "string" ? note.trim().length > 0 : Boolean(note)
  ).length;

  const changeMonth = (delta) => {
    const d = new Date(month.year, month.month + delta, 1);
    setMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  const dayColor = (rate) => {
    if (rate === null) return "var(--panel, #fff)";
    if (rate === 0) return "#f3f4f6";
    if (rate < 35) return "#dcfce7";
    if (rate < 70) return "#86efac";
    return "#16a34a";
  };

  return (
    <div dir="rtl" style={{
      display: "grid", gap: 16, color: "var(--text, #17202a)",
      paddingBottom: 20
    }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 23, fontWeight: 850 }}>التقدم والإنجاز</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, opacity: .65 }}>
          راجع عاداتك ومهامك ونشاطك اليومي عبر الزمن.
        </p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
        gap: 10
      }}>
        <Metric label="متوسط إنجاز العادات المسجل" value={overallRate === null ? "—" : overallRate} suffix={overallRate === null ? "" : "%"} />
        <Metric label="المهام المكتملة" value={`${completedTasks} / ${tasks.length}`} />
        <Metric label="أيام النشاط المسجلة" value={activeDates.size} />
        <Metric label="أيام اليوميات" value={journalCount} />
      </div>

      <Card title="تقويم الإنجاز التفاعلي" subtitle="لون اليوم يعكس نسبة إنجاز العادات المسجلة. اضغط على أي تاريخ لمراجعة تفاصيله.">
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 8, marginBottom: 15
        }}>
          <button onClick={() => changeMonth(-1)} aria-label="الشهر السابق"
            style={buttonStyle}>‹ السابق</button>
          <strong>{monthTitle}</strong>
          <button onClick={() => changeMonth(1)} aria-label="الشهر التالي"
            style={buttonStyle}>التالي ›</button>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 5
        }}>
          {DAY_NAMES.map((name) => (
            <div key={name} style={{
              textAlign: "center", fontSize: 10, opacity: .65, paddingBottom: 5
            }}>{name}</div>
          ))}
          {calendarDays.map((cell, i) => cell ? (
            <button key={cell.date} onClick={() => setSelectedDate(cell.date)}
              title={cell.rate === null ? `${cell.date} — لا توجد بيانات مسجلة` : `${cell.date} — ${cell.rate}%`}
              style={{
                border: selectedDate === cell.date
                  ? "2px solid #2563eb" : "1px solid var(--border, #e5e7eb)",
                borderRadius: 9, minWidth: 0, minHeight: 48,
                background: dayColor(cell.rate),
                color: cell.rate !== null && cell.rate >= 70 ? "#fff" : "var(--text, #17202a)",
                padding: "5px 1px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 3
              }}>
              <span style={{ fontSize: 13, fontWeight: 750 }}>{cell.day}</span>
              <span style={{ fontSize: 9, opacity: .8 }}>
                {cell.rate === null ? "—" : `${cell.rate}%`}
              </span>
            </button>
          ) : <div key={`empty-${i}`} />)}
        </div>
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 12, marginTop: 13,
          fontSize: 11, opacity: .75
        }}>
          {[
            ["#f3f4f6", "0%"],
            ["#dcfce7", "1–34%"],
            ["#86efac", "35–69%"],
            ["#16a34a", "70–100%"]
          ].map(([color, label]) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: color }} />
              {label}
            </span>
          ))}
          <span>— لا توجد بيانات</span>
        </div>
      </Card>

      <Card title={`تفاصيل ${selectedDate}`} subtitle="مراجعة اليوم المختار من التقويم">
        {!hasSelectedData ? (
          <Empty>لا يوجد سجل محفوظ لهذا اليوم حتى الآن.</Empty>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{
              padding: 12, borderRadius: 12, background: "var(--soft, #f8fafc)"
            }}>
              <div style={{ fontSize: 12, opacity: .65 }}>نسبة إنجاز العادات</div>
              <strong style={{ fontSize: 23 }}>
                {selectedRate === null ? "لا توجد بيانات" : `${selectedRate}%`}
              </strong>
              {selectedRate !== null && (
                <div style={{ fontSize: 12, opacity: .7 }}>
                  {selectedDone.length} من {selectedTotal} عادة
                </div>
              )}
            </div>
            <div>
              <strong style={{ fontSize: 13 }}>العادات المنجزة</strong>
              {selectedDone.length ? (
                <ul style={{ margin: "8px 0", paddingRight: 20 }}>
                  {habits.filter((h) => selectedDone.includes(String(h.id))).map((h) => (
                    <li key={h.id} style={{ marginBottom: 4 }}>{h.name || h.title || "عادة"}</li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: 12, opacity: .65 }}>لا توجد عادات مكتملة مسجلة لهذا اليوم.</p>}
            </div>
            <div>
              <strong style={{ fontSize: 13 }}>المهام المستحقة في هذا اليوم</strong>
              {selectedTasks.length ? (
                <ul style={{ margin: "8px 0", paddingRight: 20 }}>
                  {selectedTasks.map((task) => (
                    <li key={task.id} style={{ marginBottom: 4 }}>
                      {task.title || task.name || "مهمة"} — {task.completed ? "مكتملة" : "غير مكتملة"}
                    </li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: 12, opacity: .65 }}>لا توجد مهام مستحقة مسجلة لهذا اليوم.</p>}
            </div>
            <div>
              <strong style={{ fontSize: 13 }}>الملاحظة اليومية</strong>
              <p style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7 }}>
                {selectedNote || "لا توجد ملاحظة محفوظة لهذا اليوم."}
              </p>
            </div>
            {tasks.some((task) => task.completedOn === selectedDate) && (
              <p style={{ fontSize: 12, margin: 0 }}>
                مهام أُنجزت في هذا اليوم: {tasks.filter((task) => task.completedOn === selectedDate).length}
              </p>
            )}
          </div>
        )}
      </Card>

      <Card title="منحنى الإنجاز اليومي" subtitle="نسبة إنجاز العادات خلال آخر 14 يومًا مسجلًا ضمن الفترة.">
        <LineChart values={last14} />
      </Card>

      <Card title="مقارنة العادات" subtitle="عدد الأيام التي سُجل فيها إنجاز كل عادة خلال الأيام المسجلة من آخر 14 يومًا.">
        <Bars items={habitBars} emptyText="أضف عادات وسجّل إنجازها لتظهر المقارنة." />
      </Card>

      <Card title="حالة المهام" subtitle="ملخص المهام الحالية حسب حالة الإكمال.">
        {tasks.length ? (
          <>
            <Bars items={taskBars} />
            <p style={{ fontSize: 12, opacity: .65, marginBottom: 0 }}>
              نسبة المهام المكتملة: {Math.round(completedTasks / tasks.length * 100)}%
            </p>
          </>
        ) : <Empty>لا توجد مهام بعد. أضف مهامًا ليظهر توزيع حالتها هنا.</Empty>}
      </Card>

      <Card title="نشاط اليوميات" subtitle="الأيام التي تحتوي على ملاحظات محفوظة.">
        {journalCount ? (
          <div style={{ display: "grid", gap: 8 }}>
            <strong style={{ fontSize: 24 }}>{journalCount} يومًا</strong>
            <p style={{ fontSize: 12, opacity: .65, margin: 0 }}>
              أحدث الملاحظات المسجلة:
            </p>
            {Object.entries(notes)
              .filter(([, note]) => typeof note === "string" ? note.trim() : Boolean(note))
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 5)
              .map(([date, note]) => (
                <button key={date} onClick={() => setSelectedDate(date)}
                  style={{
                    ...buttonStyle, display: "block", textAlign: "right",
                    width: "100%", padding: 12
                  }}>
                  <strong>{date}</strong>
                  <div style={{
                    fontSize: 12, opacity: .7, marginTop: 4,
                    overflowWrap: "anywhere"
                  }}>
                    {(typeof note === "string" ? note : note?.text || note?.content || "").slice(0, 100)}
                  </div>
                </button>
              ))}
          </div>
        ) : <Empty>احفظ ملاحظاتك اليومية لتتبع نشاط اليوميات عبر الزمن.</Empty>}
      </Card>
    </div>
  );
}

const buttonStyle = {
  border: "1px solid var(--border, #e5e7eb)",
  borderRadius: 9, background: "var(--panel, #fff)",
  color: "var(--text, #17202a)", padding: "8px 10px",
  fontSize: 12, cursor: "pointer"
};
