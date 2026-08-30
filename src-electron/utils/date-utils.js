/**
 * Converts a Date object to a SQLite-compatible datetime string (YYYY-MM-DD HH:mm:ss).
 * Using space as separator ensures it is less than 'T' in lexicographical comparison.
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
}

/**
 * Returns SARGable boundaries for a specific day.
 * @param {Date} date
 * @returns {{start: string, next: string}}
 */
function getDateBoundaries(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0));
  return {
    start: toSqliteString(start),
    next: toSqliteString(next)
  };
}

/**
 * Returns SARGable boundaries for a specific month.
 * @param {Date} date
 * @returns {{start: string, next: string}}
 */
function getMonthBoundaries(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return {
    start: toSqliteString(start),
    next: toSqliteString(next)
  };
}

module.exports = {
  toSqliteString,
  getDateBoundaries,
  getMonthBoundaries
};
