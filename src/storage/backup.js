const PREFIX = "nahw-al-tagheer:";
const BACKUP_SUFFIX = ":backup";
const MANAGED_KEYS = new Set([
  "nahw-al-taghyir-v1",
  "nahw-al-taghyir-journal-v2",
  "nahw-al-tagheer-quotes",
]);

function isManagedKey(key) {
  return key.startsWith(PREFIX) || MANAGED_KEYS.has(key);
}
const FORMAT = "nahw-al-tagheer-backup";
const VERSION = 1;

export function exportBackup() {
  const data = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key && isManagedKey(key)) {
      data[key] = localStorage.getItem(key);
    }
  }

  const backup = {
    format: FORMAT,
    version: VERSION,
    createdAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nahw-al-tagheer-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return Object.keys(data).length;
}

export async function importBackup(file) {
  if (!file) throw new Error("لم يتم اختيار ملف.");
  if (file.size === 0) throw new Error("الملف فارغ.");
  if (file.size > 10 * 1024 * 1024) throw new Error("حجم الملف أكبر من الحد المسموح (10 ميغابايت).");

  let backup;
  try {
    backup = JSON.parse(await file.text());
  } catch {
    throw new Error("الملف ليس JSON صالحًا.");
  }

  if (
    backup?.format !== FORMAT ||
    backup?.version !== VERSION ||
    !backup.data ||
    typeof backup.data !== "object" ||
    Array.isArray(backup.data)
  ) {
    throw new Error("ملف النسخة الاحتياطية غير صالح أو غير مدعوم.");
  }

  const entries = Object.entries(backup.data);

  if (entries.some(([key, value]) =>
    typeof key !== "string" ||
    !isManagedKey(key) ||
    typeof value !== "string" ||
    (key.endsWith(BACKUP_SUFFIX)
      ? false
      : !isValidJson(value))
  )) {
    throw new Error("يحتوي الملف على بيانات غير صالحة.");
  }

  // احتفظ بكل البيانات الحالية حتى يمكن التراجع عند فشل الاستعادة.
  const previous = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isManagedKey(key)) {
      previous[key] = localStorage.getItem(key);
    }
  }

  try {
    // استبدل بيانات التطبيق بالنسخة المستوردة كاملة.
    for (const key of Object.keys(previous)) {
      localStorage.removeItem(key);
    }

    for (const [key, value] of entries) {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    // أعد البيانات السابقة إذا تعذّرت الاستعادة.
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && isManagedKey(key)) {
          localStorage.removeItem(key);
        }
      }
      for (const [key, value] of Object.entries(previous)) {
        localStorage.setItem(key, value);
      }
    } catch (rollbackError) {
      console.error("تعذّر استرجاع البيانات السابقة بالكامل:", rollbackError);
    }
    throw error;
  }

  // حدّث التطبيق بعد نجاح الاستعادة.
  window.location.reload();

  return entries.length;
}

function isValidJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
