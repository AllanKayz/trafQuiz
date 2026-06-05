/**
 * Converts a Date object to a SQLite-compatible string format (YYYY-MM-DD HH:mm:ss.SSS).
 * This ensures SARGability and consistency with SQLite's internal date functions.
 * @param {Date} date - The date to convert.
 * @returns {string} The SQLite-compatible date string.
 */
function toSqliteString(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Returns the start and end boundaries for a given day in UTC.
 * @param {Date} date - Any date within the target day.
 * @returns {{start: string, end: string}} Start and end of the day as SQLite strings.
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return {
    start: toSqliteString(start),
    end: toSqliteString(end)
  };
}

/**
 * Returns the start and end boundaries for the current month in UTC.
 * @param {Date} date - Any date within the target month.
 * @returns {{start: string, end: string}} Start and end of the month as SQLite strings.
 */
function getMonthBoundaries(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));

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
