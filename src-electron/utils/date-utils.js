
/**
 * Converts a Date object to a SQLite-compatible ISO 8601 string.
 * SQLite handles 'YYYY-MM-DD HH:mm:ss' or 'YYYY-MM-DDTHH:mm:ss'.
 * For consistency and lexicographical comparison, we use 'YYYY-MM-DD HH:mm:ss'.
 */
function toSqliteString(date) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Returns the start and end of a given day as SQLite strings.
 * Used for SARGable range queries (start_time >= start AND start_time < end).
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0));

  return {
    start: toSqliteString(start),
    end: toSqliteString(end)
  };
}

/**
 * Returns the start and end of a given month as SQLite strings.
 */
function getMonthBoundaries(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

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
