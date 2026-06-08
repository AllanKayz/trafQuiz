/**
 * Utility functions for SQLite date handling and SARGability
 */

/**
 * Converts a Date object to a SQLite-compatible string
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
  return date.toISOString().replace('T', ' ');
}

/**
 * Gets the start and end of a given day for SARGable range queries
 * @param {Date} date
 * @returns {{start: string, end: string}}
 */
function getDateBoundaries(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();

  const start = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));

  return {
    start: start.toISOString().replace('T', ' ').slice(0, 19),
    end: end.toISOString().replace('T', ' ')
  };
}

/**
 * Gets the start and end of a month for SARGable range queries
 * @param {number} year
 * @param {number} month 1-indexed month (1 = Jan, 12 = Dec)
 * @returns {{start: string, end: string}}
 */
function getMonthBoundaries(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return {
    start: start.toISOString().replace('T', ' ').slice(0, 19),
    end: end.toISOString().replace('T', ' ')
  };
}

module.exports = {
  toSqliteString,
  getDateBoundaries,
  getMonthBoundaries
};
