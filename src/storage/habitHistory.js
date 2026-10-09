import { loadData, saveData } from "./localStorage";

const STORAGE_KEY = "habit-history";

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readHistory() {
  const value = loadData(STORAGE_KEY, {});
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function getHabitCompletion(habitId, date = localDateKey()) {
  if (habitId == null) return false;
  return readHistory()[date]?.[String(habitId)] === true;
}

export function setHabitCompletion(habitId, completed, date = localDateKey()) {
  if (habitId == null) {
    throw new Error("يجب تحديد معرّف العادة.");
  }

  const history = readHistory();
  const id = String(habitId);
  const day = { ...(history[date] || {}) };

  if (completed) {
    day[id] = true;
  } else {
    delete day[id];
  }

  if (Object.keys(day).length) {
    history[date] = day;
  } else {
    delete history[date];
  }

  saveData(STORAGE_KEY, history);
  return completed === true;
}

export function getCompletionsForDate(date = localDateKey()) {
  return { ...(readHistory()[date] || {}) };
}

export function getHabitHistory(habitId) {
  if (habitId == null) return {};

  const id = String(habitId);
  const history = readHistory();
  const result = {};

  for (const [date, completions] of Object.entries(history)) {
    if (completions?.[id] === true) {
      result[date] = true;
    }
  }

  return result;
}
