import QuotePanel from "./components/QuotePanel";
import { useEffect, useState } from "react";
import Journal from "./components/Journal";
import HoldButton from "./components/HoldButton";
import Dock from "./components/Dock";
import ProgressDashboard from "./components/ProgressDashboard";


import BackupPanel from "./components/BackupPanel";
const STORAGE_KEY = "nahw-al-taghyir-v1";

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Use empty local data if stored data cannot be read.
  }

  return {
    habits: [],
    tasks: [],
    completions: {},
    habitTotals: {},
    notes: {},
  };
}

function App() {
  const [data, setData] = useState(loadData);
  const [activeId, setActiveId] = useState("today");
  const [habitName, setHabitName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState(getToday());

  const today = getToday();
  const todayCompletions = data.completions[today] || {};
  const todayNote = data.notes[today] || "";

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Keep the app usable if browser storage is unavailable.
    }
  }, [data]);

  const completedHabits = data.habits.filter(
    (habit) => todayCompletions[habit.id]
  ).length;

  const todayHabitTotal =
    data.habitTotals?.[today] ?? data.habits.length;

  const completionRate = todayHabitTotal
    ? Math.round((completedHabits / todayHabitTotal) * 100)
    : 0;

  const doneTasks = data.tasks.filter((task) => task.completed).length;

  function addHabit(event) {
    event.preventDefault();
    const name = habitName.trim();
    if (!name) return;

    setData((current) => ({
      ...current,
      habits: [
        ...current.habits,
        { id: `${Date.now()}-${Math.random()}`, name },
      ],
    }));
    setHabitName("");
  }

  function toggleHabit(id) {
    setData((current) => {
      const completions = { ...current.completions };
      const todayState = { ...(completions[today] || {}) };

      if (todayState[id]) {
        delete todayState[id];
      } else {
        todayState[id] = true;
      }

      completions[today] = todayState;

      const habitTotals = {
        ...(current.habitTotals || {}),
        [today]: current.habits.length,
      };

      return { ...current, completions, habitTotals };
    });
  }

  function deleteHabit(id) {
    setData((current) => ({
      ...current,
      habits: current.habits.filter((habit) => habit.id !== id),
    }));
  }

  function addTask(event) {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;

    setData((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: `${Date.now()}-${Math.random()}`,
          title,
          dueDate: taskDate,
          completed: false,
        },
      ],
    }));
    setTaskTitle("");
  }

  function toggleTask(id) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      ),
    }));
  }

  function deleteTask(id) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
    }));
  }

  function updateNote(value) {
    setData((current) => ({
      ...current,
      notes: { ...current.notes, [today]: value },
    }));
  }

  const dateLabel = new Intl.DateTimeFormat("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const pageTitle = {
    today: "اليوم",
    tasks: "المهام",
    progress: "التقدم",
    journal: "اليوميات",
  }[activeId];

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F6F7F9",
      color: "#17202A",
      direction: "rtl",
      paddingBottom: "115px",
      fontFamily: "Elgharib",
    },
    header: {
      maxWidth: "680px",
      margin: "0 auto",
      padding: "12px 20px 20px",
    },
    content: {
      maxWidth: "680px",
      margin: "0 auto",
      padding: "0 20px",
    },
    card: {
      background: "#FFFFFF",
      border: "1px solid #E4E7EC",
      borderRadius: "18px",
      padding: "20px",
      marginBottom: "16px",
    },
    muted: { color: "#344054", fontSize: "22px", fontWeight: 700, lineHeight: 1.4 },
    input: {
      boxSizing: "border-box",
      minWidth: 0,
      width: "100%",
      padding: "12px",
      border: "1px solid #D0D5DD",
      borderRadius: "10px",
      background: "#FFFFFF",
      color: "#17202A",
      fontSize: "15px",
    },
    button: {
      border: 0,
      borderRadius: "10px",
      padding: "12px 16px",
      background: "#2563EB",
      color: "#FFFFFF",
      fontWeight: 600,
      fontSize: "14px",
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    row: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "14px 0",
      borderBottom: "1px solid #F0F1F3",
    },
  };

  function SectionHeading({ children }) {
    return (
      <h2 style={{ fontSize: "18px", margin: "0 0 16px" }}>
        {children}
      </h2>
    );
  }

  function Empty({ children }) {
    return (
      <p style={{ ...styles.muted, padding: "10px 0", lineHeight: 1.8 }}>
        {children}
      </p>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <p style={{ ...styles.muted, margin: "0 0 8px" }}>{dateLabel}</p>
        <h1 style={{ fontSize: "28px", margin: 0, fontWeight: 750 }}>
          نحو التغيير
        </h1>
        <p style={{ ...styles.muted, marginBottom: 0, fontFamily: "Thmanyah", fontWeight: 700, fontSize: "24px", lineHeight: 1.5 }}>{pageTitle}</p>
          {activeId === "today" && <QuotePanel />}
      </header>

      <main style={styles.content}>
        {activeId === "today" && (
          <>
            <section style={styles.card}>
              <SectionHeading>ملخص اليوم</SectionHeading>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    border: "6px solid #2563EB",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                >
                  {completionRate}%
                </div>
                <div>
                  <strong>
                    {completedHabits} من {data.habits.length} عادات
                  </strong>
                  <p style={styles.muted}>إنجازك اليومي</p>
                </div>
              </div>
            </section>

            <section style={styles.card}>
              <SectionHeading>عاداتي</SectionHeading>
              <form
                onSubmit={addHabit}
                style={{ display: "flex", gap: 8, marginBottom: 12 }}
              >
                <input
                  style={styles.input}
                  value={habitName}
                  onChange={(event) => setHabitName(event.target.value)}
                  placeholder="أضف عادة جديدة..."
                  aria-label="اسم العادة"
                  maxLength={100}
                />
                <button style={styles.button} type="submit">إضافة</button>
              </form>

              {data.habits.length === 0 ? (
                <Empty>أضف أول عادة لتبدأ بتسجيل إنجازك اليومي.</Empty>
              ) : (
                data.habits.map((habit) => (
                  <div key={habit.id} style={styles.row}>
                    <input
                      type="checkbox"
                      checked={Boolean(todayCompletions[habit.id])}
                      onChange={() => toggleHabit(habit.id)}
                      aria-label={`إنجاز ${habit.name}`}
                      style={{ width: 20, height: 20, accentColor: "#2563EB" }}
                    />
                    <span
                      style={{
                        flex: 1,
                        textDecoration: todayCompletions[habit.id]
                          ? "line-through"
                          : "none",
                        color: todayCompletions[habit.id] ? "#667085" : "#17202A",
                      }}
                    >
                      {habit.name}
                    </span>
                    <HoldButton ariaLabel={`حذف ${habit.name}`} onClick={() => deleteHabit(habit.id)}>حذف</HoldButton>
                  </div>
                ))
              )}
            </section>

            <section style={styles.card}>
              <SectionHeading>مهام اليوم</SectionHeading>
              {data.tasks.filter(
                (task) => task.dueDate === today && !task.completed
              ).length === 0 ? (
                <Empty>لا توجد مهام مستحقة غير مكتملة اليوم.</Empty>
              ) : (
                data.tasks
                  .filter((task) => task.dueDate === today && !task.completed)
                  .map((task) => (
                    <div key={task.id} style={styles.row}>
                      <span style={{ flex: 1 }}>{task.title}</span>
                      <button
                        style={styles.button}
                        type="button"
                        onClick={() => toggleTask(task.id)}
                      >
                        إنجاز
                      </button>
                    </div>
                  ))
              )}
            </section>
          </>
        )}

        {activeId === "tasks" && (
          <section style={styles.card}>
            <SectionHeading>قائمة المهام</SectionHeading>
            <form onSubmit={addTask} style={{ display: "grid", gap: 10 }}>
              <input
                style={styles.input}
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="ما المهمة التي تريد إنجازها؟"
                aria-label="عنوان المهمة"
                maxLength={200}
              />
              <label style={{ ...styles.muted, display: "grid", gap: 6 }}>
                تاريخ الاستحقاق
                <input
                  style={styles.input}
                  type="date"
                  value={taskDate}
                  onChange={(event) => setTaskDate(event.target.value)}
                  required
                />
              </label>
              <button style={styles.button} type="submit">إضافة مهمة</button>
            </form>

            <h3 style={{ marginTop: 26 }}>كل المهام ({data.tasks.length})</h3>
            {data.tasks.length === 0 ? (
              <Empty>لم تضف أي مهام بعد.</Empty>
            ) : (
              [...data.tasks]
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map((task) => (
                  <div key={task.id} style={styles.row}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      aria-label={`إنجاز ${task.title}`}
                      style={{ width: 20, height: 20, accentColor: "#2563EB" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          textDecoration: task.completed ? "line-through" : "none",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {task.title}
                      </div>
                      <span style={styles.muted}>{task.dueDate}</span>
                    </div>
                    <HoldButton ariaLabel={`حذف ${task.title}`} onClick={() => deleteTask(task.id)}>حذف</HoldButton>
                  </div>
                ))
            )}
          </section>
        )}

        {activeId === "progress" && <ProgressDashboard data={data} />}

        {activeId === "journal" && <BackupPanel />}
      {activeId === "journal" && <Journal />}
      </main>

      <Dock activeId={activeId} onSelect={setActiveId} />
    </div>
  );
}

export default App;
