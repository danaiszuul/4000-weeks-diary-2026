// Life weeks calculation utilities

export const LIFE_EXPECTANCY = 90;
export const TOTAL_WEEKS = LIFE_EXPECTANCY * 52; // 4680 weeks

/**
 * Get the user's birthday from localStorage or fall back to a legacy birth year.
 */
export function getBirthDate() {
  const stored = localStorage.getItem('birthDate');
  if (stored) return stored;

  const legacyYear = localStorage.getItem('birthYear');
  return legacyYear ? `${legacyYear}-01-01` : null;
}

/**
 * Set the user's birthday in localStorage.
 */
export function setBirthDate(dateKey) {
  localStorage.setItem('birthDate', dateKey);
  localStorage.setItem('birthYear', dateKey.slice(0, 4));
}

/**
 * Get the user's birth year from localStorage or return null.
 */
export function getBirthYear() {
  const birthDate = getBirthDate();
  return birthDate ? parseInt(birthDate.slice(0, 4), 10) : null;
}

/**
 * Set the user's birth year in localStorage.
 */
export function setBirthYear(year) {
  localStorage.setItem('birthYear', year.toString());
  if (!localStorage.getItem('birthDate')) {
    localStorage.setItem('birthDate', `${year}-01-01`);
  }
}

/**
 * Calculate current life week based on birthday or birth year.
 */
export function getCurrentLifeWeek(birthdayOrYear) {
  if (!birthdayOrYear) return null;

  const birthDate =
    typeof birthdayOrYear === 'number'
      ? new Date(birthdayOrYear, 0, 1)
      : parseDateKey(birthdayOrYear);
  const today = new Date();
  const diffTime = today - birthDate;
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  return diffWeeks;
}

/**
 * Calculate weeks remaining
 */
export function getWeeksRemaining(currentWeek) {
  if (currentWeek === null) return null;
  return Math.max(0, TOTAL_WEEKS - currentWeek);
}

/**
 * Calculate life progress percentage
 */
export function getLifeProgress(currentWeek) {
  if (currentWeek === null) return 0;
  return Math.min(100, (currentWeek / TOTAL_WEEKS) * 100);
}

/**
 * Get current week of year (1-52)
 */
export function getWeekOfYear(date = new Date()) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Format date for display
 */
export function formatDate(date = new Date()) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${days[date.getDay()]} · ${months[date.getMonth()]} ${date.getDate()} · ${date.getFullYear()}`;
}

/**
 * Get date key (YYYY-MM-DD) in the user's local timezone so the diary day
 * matches the calendar day regardless of UTC offset.
 */
export function getDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse a YYYY-MM-DD key back into a Date at local midnight.
 */
export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Whether two dates fall on the same calendar day.
 */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Get week key for localStorage (YYYY-WW)
 */
export function getWeekKey(date = new Date()) {
  const year = date.getFullYear();
  const week = getWeekOfYear(date);
  return `${year}-${week.toString().padStart(2, '0')}`;
}
