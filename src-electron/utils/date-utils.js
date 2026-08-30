/**
 * Utilities for date manipulation and SQLite compatibility.
 */

/**
 * Returns the start and end of a day in SQLite-compatible string format.
 * @param {Date} date - The date to get boundaries for.
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
 * Returns the start and end of a month in SQLite-compatible string format.
 * @param {number} year
 * @param {number} month - 0-indexed (0 = Jan, 11 = Dec)
 * @returns {{start: string, end: string}}
 */
function getMonthBoundaries(year, month) {
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return {
    start: toSqliteString(start),
    end: toSqliteString(end)
  };
}

/**
 * Formats a Date object to a SQLite-compatible string: YYYY-MM-DD HH:mm:ss.SSS
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '').slice(0, 23);
}

module.exports = {
  getDateBoundaries,
  getMonthBoundaries,
  toSqliteString
};
