// localStorage cache for diary entries.
//
// localStorage is the always-available offline cache. When the user is signed
// in, the DiaryContext additionally syncs entries to the Netlify Database via
// the /api/entries function so they can be reached from any device.

export const DAILY_DEFAULT = {
  matters: ['', '', ''],
  reflection: '',
  aligned: '',
  letGo: '',
};

export const WEEKLY_DEFAULT = {
  coreFocus: '',
  supportMove: '',
  notToDo: ['', '', ''],
  reflection: '',
  win: '',
  shrink: '',
};

const PREFIX = { daily: 'daily-', weekly: 'weekly-' };

function defaultFor(type) {
  return type === 'weekly' ? { ...WEEKLY_DEFAULT } : { ...DAILY_DEFAULT };
}

/**
 * Read a cached entry from localStorage, or a fresh default if none exists.
 */
export function localGetEntry(type, key) {
  const stored = localStorage.getItem(`${PREFIX[type]}${key}`);
  return stored ? JSON.parse(stored) : defaultFor(type);
}

/**
 * Write an entry to the localStorage cache.
 */
export function localSetEntry(type, key, value) {
  localStorage.setItem(`${PREFIX[type]}${key}`, JSON.stringify(value));
}

/**
 * Collect the keys of every cached entry of a given type (e.g. all dates that
 * have a daily entry). Used to mark days on the calendar.
 */
export function localEntryKeys(type) {
  const prefix = PREFIX[type];
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      keys.push(k.slice(prefix.length));
    }
  }
  return keys;
}

/**
 * Whether an entry has any content worth persisting. Used to avoid pushing
 * blank entries to the server during sync.
 */
export function isEmptyEntry(type, entry) {
  if (!entry) return true;
  if (type === 'weekly') {
    return (
      !entry.coreFocus &&
      !entry.supportMove &&
      !(entry.notToDo || []).some(Boolean) &&
      !entry.reflection &&
      !entry.win &&
      !entry.shrink
    );
  }
  return (
    !(entry.matters || []).some(Boolean) &&
    !entry.reflection &&
    !entry.aligned &&
    !entry.letGo
  );
}
