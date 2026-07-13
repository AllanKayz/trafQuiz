/**
 * Formats a Date object to a SQLite-compatible ISO 8601 string.
 * Uses a space separator instead of 'T' to ensure consistency.
 * If the date is exactly at midnight UTC, it returns just 'YYYY-MM-DD'
 * to avoid lexicographical comparison issues in SQLite.
 */
function toSqliteString(date) {
  const iso = date.toISOString();
  if (iso.endsWith('T00:00:00.000Z')) {
    return iso.split('T')[0];
  }
  return iso.replace('T', ' ').replace('Z', '');
}

/**
 * Gets SARGable date boundaries for a specific day.
 * Returns an object with { start, next } as SQLite-compatible strings.
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));

  return {
    start: toSqliteString(start),
    next: toSqliteString(next)
  };
}

/**
 * Gets SARGable date boundaries for a specific month.
 * Returns an object with { start, next } as SQLite-compatible strings.
 */
function getMonthBoundaries(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));

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
