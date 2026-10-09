import useHabitHistory from "../../storage/useHabitHistory";

export default function HabitCompletion({
  habitId,
  date,
  label = "إكمال العادة",
  onChange,
}) {
  const { isCompleted, toggleHabit } = useHabitHistory(date);
  const completed = isCompleted(habitId);

  function handleChange() {
    const nextValue = !completed;
    toggleHabit(habitId);
    onChange?.(nextValue);
  }

  return (
    <button
      type="button"
      onClick={handleChange}
      aria-pressed={completed}
      aria-label={`${label}: ${completed ? "مكتملة" : "غير مكتملة"}`}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
        completed
          ? "border-green-600 bg-green-600 text-white"
          : "border-gray-300 bg-transparent text-current hover:bg-gray-100"
      }`}
    >
      <span aria-hidden="true">{completed ? "✓" : "○"}</span>
      <span>{completed ? "مكتملة" : label}</span>
    </button>
  );
}
