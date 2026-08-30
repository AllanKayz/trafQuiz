
/**
 * Utility functions for date manipulation and SQLite compatibility.
 */

/**
 * Converts a Date object to a SQLite-compatible string (YYYY-MM-DD HH:mm:ss.SSS).
 * SQLite uses this format for precise comparisons and SARGability.
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  // format: YYYY-MM-DD HH:mm:ss.SSS
  return date.toISOString().replace('T', ' ').slice(0, 23);
}

/**
 * Gets the start and end of the day for a given date.
 * @param {Date} date
 * @returns {{start: string, end: string}}
 */
function getDateBoundaries(date) {
  const d = new Date(date);

  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));

  return {
    start: toSqliteString(start),
    end: toSqliteString(end)
  };
}

/**
 * Gets the start and end of the month for a given date.
 * @param {Date} date
 * @returns {{start: string, end: string}}
 */
function getMonthBoundaries(date) {
  const d = new Date(date);

  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));

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
