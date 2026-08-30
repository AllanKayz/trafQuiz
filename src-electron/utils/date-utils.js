/**
 * Formats a Date object into a SQLite-compatible string (YYYY-MM-DD HH:mm:ss).
 * Using a space as separator instead of 'T' for better SQLite compatibility in some versions.
 */
function toSqliteString(date) {
  const iso = date.toISOString();
  return iso.replace("T", " ").split(".")[0];
}

/**
 * Returns SARGable boundaries for a single day.
 * @param {Date} date - Any date within the target day.
 * @returns {{start: string, next: string}} ISO strings for the start of the day and start of the next day.
 */
function getDateBoundaries(date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const next = new Date(start);
  next.setUTCDate(start.getUTCDate() + 1);

  return {
    start: toSqliteString(start),
    next: toSqliteString(next),
  };
}

/**
 * Returns SARGable boundaries for a full month.
 * @param {Date} date - Any date within the target month.
 * @returns {{start: string, next: string}} ISO strings for the start of the month and start of the next month.
 */
function getMonthBoundaries(date) {
  const start = new Date(date);
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const next = new Date(start);
  next.setUTCMonth(start.getUTCMonth() + 1);

  return {
    start: toSqliteString(start),
    next: toSqliteString(next),
  };
}

module.exports = {
  toSqliteString,
  getDateBoundaries,
  getMonthBoundaries,
};
