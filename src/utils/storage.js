// localStorage utilities for daily and weekly entries

/**
 * Get daily entry from localStorage
 */
export function getDailyEntry(dateKey) {
  const stored = localStorage.getItem(`daily-${dateKey}`);
  return stored ? JSON.parse(stored) : {
    matters: ['', '', ''],
    reflection: '',
    aligned: '',
    letGo: '',
  };
}

/**
 * Save daily entry to localStorage
 */
export function saveDailyEntry(dateKey, entry) {
  localStorage.setItem(`daily-${dateKey}`, JSON.stringify(entry));
}

/**
 * Get weekly entry from localStorage
 */
export function getWeeklyEntry(weekKey) {
  const stored = localStorage.getItem(`weekly-${weekKey}`);
  return stored ? JSON.parse(stored) : {
    coreFocus: '',
    supportMove: '',
    notToDo: ['', '', ''],
    reflection: '',
    win: '',
    shrink: '',
  };
}

/**
 * Save weekly entry to localStorage
 */
export function saveWeeklyEntry(weekKey, entry) {
  localStorage.setItem(`weekly-${weekKey}`, JSON.stringify(entry));
}
