import { useEffect, useState } from "react";
import { loadData, saveData } from "./localStorage";

export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() =>
    loadData(key, initialValue)
  );

  useEffect(() => {
    saveData(key, value);
  }, [key, value]);

  return [value, setValue];
}
