/**
 * Formats a Date object to a SQLite-compatible string with space separator.
 * Using space separator because ' ' < 'T' in ASCII, ensuring correct lexicographical comparison.
 * @param {Date|string|number} date
 * @returns {string} YYYY-MM-DD HH:mm:ss.SSS
 */
function toSqliteString(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().replace("T", " ").replace("Z", "");
}

/**
 * Returns UTC boundaries for a given date (start of day and start of next day).
 * @param {Date|string|number} date
 * @returns {{start: string, next: string}}
 */
function getDateBoundaries(date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const next = new Date(start);
  next.setUTCDate(next.getUTCDate() + 1);

  return {
    start: toSqliteString(start),
    next: toSqliteString(next),
  };
}

/**
 * Returns UTC boundaries for the month of a given date (start of month and start of next month).
 * @param {Date|string|number} date
 * @returns {{start: string, next: string}}
 */
function getMonthBoundaries(date) {
  const start = new Date(date);
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const next = new Date(start);
  next.setUTCMonth(next.getUTCMonth() + 1);

  return {
    start: toSqliteString(start),
    next: toSqliteString(next),
  };
}

module.exports = {
  toSqliteString,
  getDateBoundaries,
  getMonthBoundaries,
};
