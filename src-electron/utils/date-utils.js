/**
 * Converts a Date object to a SQLite-compatible ISO 8601 string (YYYY-MM-DD HH:mm:ss.SSS).
 * We use ' ' as a separator because it ensures correct lexicographical comparison
 * even if the database contains records with 'T' separator (since ' ' < 'T').
 */
function toSqliteString(date) {
  return date.toISOString().replace('T', ' ');
}

/**
 * Returns UTC boundaries for a single day.
 * Returns 'start' (inclusive) and 'next' (exclusive, start of next day).
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0));
  return {
    start: toSqliteString(start),
    next: toSqliteString(next)
  };
}

/**
 * Returns UTC boundaries for a month.
 * Returns 'start' (inclusive) and 'next' (exclusive, start of next month).
 */
function getMonthBoundaries(date = new Date()) {
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
