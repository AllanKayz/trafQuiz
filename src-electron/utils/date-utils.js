/**
 * Utility functions for date manipulation to support SARGable queries in SQLite.
 * SARGable (Searchable Argument) queries allow the database to use indexes effectively.
 */

/**
 * Converts a Date object to a SQLite-compatible datetime string.
 * For exact midnight UTC, it returns 'YYYY-MM-DD' to ensure lexicographical
 * correctness when comparing against date-only strings in SQLite.
 * Otherwise, returns 'YYYY-MM-DD HH:mm:ss.SSS'.
 *
 * @param {Date} date The date to convert
 * @returns {string} SQLite formatted date or datetime string
 */
const toSqliteString = (date) => {
  const iso = date.toISOString();
  if (iso.endsWith('T00:00:00.000Z')) {
    return iso.split('T')[0];
  }
  return iso.replace('T', ' ').replace('Z', '');
};

/**
 * Gets UTC boundaries for a specific day.
 * Returns the start of the day and the start of the next day (exclusive boundary).
 *
 * @param {Date} date The reference date
 * @returns {Object} { start, next } strings
 */
const getDateBoundaries = (date = new Date()) => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
  return {
    start: toSqliteString(start),
    next: toSqliteString(next)
  };
};

/**
 * Gets UTC boundaries for a specific month.
 * Returns the start of the month and the start of the next month (exclusive boundary).
 *
 * @param {Date} date The reference date
 * @returns {Object} { start, next } strings
 */
const getMonthBoundaries = (date = new Date()) => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  return {
    start: toSqliteString(start),
    next: toSqliteString(next)
  };
};

module.exports = {
  toSqliteString,
  getDateBoundaries,
  getMonthBoundaries
};
