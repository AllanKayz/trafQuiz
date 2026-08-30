/**
 * Utility to convert a Date object to a SQLite-compatible string format 'YYYY-MM-DD HH:mm:ss'.
 * Uses a space separator for better lexicographical comparison in SQLite.
 */
function toSqliteString(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const iso = date.toISOString();
  return iso.replace('T', ' ').split('.')[0];
}

/**
 * Returns the start of today and the start of tomorrow as SQLite-compatible strings.
 * Used for SARGable range queries (>= start AND < next).
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
 * Returns the start of the current month and the start of the next month as SQLite-compatible strings.
 * Used for SARGable range queries (>= start AND < next).
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
