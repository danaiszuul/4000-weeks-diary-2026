// Life weeks calculation utilities

export const LIFE_EXPECTANCY = 90;
export const TOTAL_WEEKS = LIFE_EXPECTANCY * 52; // 4680 weeks

/**
 * Get the user's birth year from localStorage or return null
 */
export function getBirthYear() {
  const stored = localStorage.getItem('birthYear');
  return stored ? parseInt(stored, 10) : null;
}

/**
 * Set the user's birth year in localStorage
 */
export function setBirthYear(year) {
  localStorage.setItem('birthYear', year.toString());
}

/**
 * Calculate current life week based on birth year
 */
export function getCurrentLifeWeek(birthYear) {
  if (!birthYear) return null;
  
  const birthDate = new Date(birthYear, 0, 1); // Jan 1 of birth year
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
 * Get date key for localStorage (YYYY-MM-DD)
 */
export function getDateKey(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Get week key for localStorage (YYYY-WW)
 */
export function getWeekKey(date = new Date()) {
  const year = date.getFullYear();
  const week = getWeekOfYear(date);
  return `${year}-${week.toString().padStart(2, '0')}`;
}
