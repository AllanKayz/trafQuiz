/**
 * Utility functions for handling dates in a way that is compatible with SQLite
 * and ensures SARGability (Search ARGument ABLE) for database indexes.
 */

/**
 * Converts a JavaScript Date object to a SQLite-compatible date string format:
 * YYYY-MM-DD HH:mm:ss.SSS
 * @param {Date} date - The date to convert
 * @returns {string} - The formatted date string
 */
function toSqliteString(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }
  return date.toISOString().replace('T', ' ').slice(0, 23);
}

/**
 * Gets the start and end boundaries for a specific day in UTC.
 * @param {Date|string} dateInput - The date to get boundaries for
 * @returns {Object} - { start, end } as SQLite-compatible strings
 */
function getDateBoundaries(dateInput) {
  const d = new Date(dateInput);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));

  return {
    start: toSqliteString(start),
    end: toSqliteString(end)
  };
}

/**
 * Gets the start and end boundaries for a specific month in UTC.
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @returns {Object} - { start, end } as SQLite-compatible strings
 */
function getMonthBoundaries(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return {
    start: toSqliteString(start),
    end: toSqliteString(end)
  };
}

module.exports = {
  toSqliteString,
  getDateBoundaries,
  getMonthBoundaries
};
