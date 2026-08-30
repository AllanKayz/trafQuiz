/**
 * Date utilities for SARGable SQLite queries.
 * Standardizes date formatting and boundary calculation to leverage indexes.
 */

/**
 * Converts a Date object to a SQLite-compatible string (YYYY-MM-DD HH:mm:ss).
 * Uses a space separator instead of 'T' for better lexicographical comparison in SQLite.
 */
function toSqliteString(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
}

/**
 * Returns the start of the day and the start of the next day as SQLite strings.
 * Used for range queries: [start, next).
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const next = new Date(start);
  next.setUTCDate(next.getUTCDate() + 1);
  return {
    start: toSqliteString(start),
    next: toSqliteString(next)
  };
}

/**
 * Returns the start of the current month and the start of the next month as SQLite strings.
 * Used for range queries: [start, next).
 */
function getMonthBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const next = new Date(start);
  next.setUTCMonth(next.getUTCMonth() + 1);
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
