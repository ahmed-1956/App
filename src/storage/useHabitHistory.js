import { useCallback, useEffect, useState } from "react";
import {
  getCompletionsForDate,
  localDateKey,
  setHabitCompletion,
} from "./habitHistory";

export default function useHabitHistory(date = localDateKey()) {
  const [completions, setCompletions] = useState(() =>
    getCompletionsForDate(date)
  );

  useEffect(() => {
    setCompletions(getCompletionsForDate(date));
  }, [date]);

  const setCompleted = useCallback(
    (habitId, completed) => {
      setHabitCompletion(habitId, completed, date);

      setCompletions((current) => {
        const next = { ...current };
        const id = String(habitId);

        if (completed) {
          next[id] = true;
        } else {
          delete next[id];
        }

        return next;
      });
    },
    [date]
  );

  const toggleHabit = useCallback(
    (habitId) => {
      setCompleted(habitId, completions[String(habitId)] !== true);
    },
    [completions, setCompleted]
  );

  const isCompleted = useCallback(
    (habitId) => completions[String(habitId)] === true,
    [completions]
  );

  const completedCount = Object.values(completions).filter(
    (completed) => completed === true
  ).length;

  return {
    completions,
    isCompleted,
    setCompleted,
    toggleHabit,
    completedCount,
  };
}
EOFcd /workspaces/App && cat > src/storage/useHabitHistory.js <<'EOF'
import { useCallback, useEffect, useState } from "react";
import {
  getCompletionsForDate,
  localDateKey,
  setHabitCompletion,
} from "./habitHistory";

export default function useHabitHistory(date = localDateKey()) {
  const [completions, setCompletions] = useState(() =>
    getCompletionsForDate(date)
  );

  useEffect(() => {
    setCompletions(getCompletionsForDate(date));
  }, [date]);

  const setCompleted = useCallback(
    (habitId, completed) => {
      setHabitCompletion(habitId, completed, date);

      setCompletions((current) => {
        const next = { ...current };
        const id = String(habitId);

        if (completed) {
          next[id] = true;
        } else {
          delete next[id];
        }

        return next;
      });
    },
    [date]
  );

  const toggleHabit = useCallback(
    (habitId) => {
      setCompleted(habitId, completions[String(habitId)] !== true);
    },
    [completions, setCompleted]
  );

  const isCompleted = useCallback(
    (habitId) => completions[String(habitId)] === true,
    [completions]
  );

  const completedCount = Object.values(completions).filter(
    (completed) => completed === true
  ).length;

  return {
    completions,
    isCompleted,
    setCompleted,
    toggleHabit,
    completedCount,
  };
}
