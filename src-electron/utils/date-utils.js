
/**
 * Utility functions for consistent SQLite date formatting and range boundaries.
 */

/**
 * Formats a JavaScript Date object into a SQLite-compatible DATETIME string.
 * Format: YYYY-MM-DD HH:mm:ss.SSS
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }
  return date.toISOString().replace('T', ' ').slice(0, 23);
}

/**
 * Returns the start and end of a day for SARGable range queries.
 * @param {Date|string} date
 * @returns {{ start: string, end: string }}
 */
function getDateBoundaries(date = new Date()) {
  const d = new Date(date);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));

  return {
    start: toSqliteString(start),
    end: toSqliteString(end)
  };
}

/**
 * Returns the start and end of a month for SARGable range queries.
 * @param {Date|string} date
 * @returns {{ start: string, end: string }}
 */
function getMonthBoundaries(date = new Date()) {
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
