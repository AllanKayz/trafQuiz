/**
 * Converts a Date object to a SQLite-compatible ISO 8601 string (UTC).
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Gets the start of the day and the start of the next day as UTC ISO strings.
 * Useful for SARGable range queries (Op.gte / Op.lt).
 * @param {Date} [date]
 * @returns {{start: string, next: string}}
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const next = new Date(start);
  next.setUTCDate(start.getUTCDate() + 1);

  return {
    start: toSqliteString(start),
    next: toSqliteString(next)
  };
}

/**
 * Gets the start of the month and the start of the next month as UTC ISO strings.
 * @param {Date} [date]
 * @returns {{start: string, next: string}}
 */
function getMonthBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const next = new Date(start);
  next.setUTCMonth(start.getUTCMonth() + 1);

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
