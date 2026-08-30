/**
 * Formats a Date object to a SQLite-compatible UTC ISO 8601 string.
 * SQLite handles 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DDTHH:MM:SS'
 * We'll use the space separator for consistency with standard SQL.
 */
function toSqliteString(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Returns the start and end of a given date in UTC.
 * Useful for daily range queries.
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  return { start: toSqliteString(start), end: toSqliteString(end) };
}

/**
 * Returns the start of the month for 'monthsBack' ago and the end of the current month in UTC.
 */
function getMonthBoundaries(monthsBack = 0) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { start: toSqliteString(start), end: toSqliteString(end) };
}

module.exports = {
  toSqliteString,
  getDateBoundaries,
  getMonthBoundaries
};
