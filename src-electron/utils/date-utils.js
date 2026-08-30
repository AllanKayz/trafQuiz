/**
 * Utilities for SQLite date handling to ensure SARGability and consistency.
 */

/**
 * Converts a Date object to a SQLite-compatible string (YYYY-MM-DD HH:mm:ss.SSS).
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
  return date.toISOString().replace("T", " ").slice(0, 23);
}

/**
 * Returns the start and end of the day for a given date in UTC.
 * @param {Date} date
 * @returns {{start: string, end: string}}
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return {
    start: toSqliteString(start),
    end: toSqliteString(end)
  };
}

/**
 * Returns the start and end of the month for a given date in UTC.
 * @param {Date} date
 * @returns {{start: string, end: string}}
 */
function getMonthBoundaries(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));

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
