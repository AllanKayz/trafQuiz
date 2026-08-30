/**
 * Utility functions for SQLite-compatible date handling.
 * SQLite stores dates as strings, and SARGable queries require specific formatting.
 */

/**
 * Formats a Date object to SQLite DATETIME string: YYYY-MM-DD HH:mm:ss.SSS
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }
  return date.toISOString().replace('T', ' ').slice(0, 23);
}

/**
 * Gets the start and end of a day in UTC/SQLite format.
 * @param {Date} date
 * @returns {{ start: string, end: string }}
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
 * Gets the start and end of a month in UTC/SQLite format.
 * @param {Date} date
 * @returns {{ start: string, end: string }}
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
