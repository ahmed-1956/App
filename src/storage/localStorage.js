const PREFIX = "nahw-al-tagheer:";
const BACKUP_SUFFIX = ":backup";

function parse(raw) {
  if (raw === null) return { ok: false };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
}

export function loadData(key, fallback) {
  try {
    const primary = parse(localStorage.getItem(PREFIX + key));
    if (primary.ok) return primary.value;

    const backup = parse(
      localStorage.getItem(PREFIX + key + BACKUP_SUFFIX)
    );
    if (backup.ok) return backup.value;

    return fallback;
  } catch (error) {
    console.error("تعذّرت قراءة البيانات المحلية:", error);
    return fallback;
  }
}

export function saveData(key, value) {
  const storageKey = PREFIX + key;
  const backupKey = storageKey + BACKUP_SUFFIX;

  try {
    const serialized = JSON.stringify(value);
    const current = localStorage.getItem(storageKey);

    if (current !== null) {
      try {
        JSON.parse(current);
        localStorage.setItem(backupKey, current);
      } catch {
        // لا تستبدل النسخة الاحتياطية ببيانات تالفة.
      }
    }

    localStorage.setItem(storageKey, serialized);
    return true;
  } catch (error) {
    console.error(`تعذّر حفظ البيانات (${key}):`, error);
    return false;
  }
}

export function removeData(key) {
  try {
    localStorage.removeItem(PREFIX + key);
    localStorage.removeItem(PREFIX + key + BACKUP_SUFFIX);
    return true;
  } catch (error) {
    console.error(`تعذّر حذف البيانات (${key}):`, error);
    return false;
  }
}
