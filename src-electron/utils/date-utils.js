/**
 * Formats a Date object to a SQLite-compatible string 'YYYY-MM-DD HH:mm:ss'.
 * Uses a space separator instead of 'T' to ensure correct lexicographical
 * comparison in SQLite, as ' ' < 'T'.
 */
function toSqliteString(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Returns UTC boundaries for a given day.
 * @param {Date|string|number} date
 * @returns {{start: string, next: string}}
 */
function getDateBoundaries(date = new Date()) {
  const d = new Date(date);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));

  return {
    start: toSqliteString(start),
    next: toSqliteString(next)
  };
}

/**
 * Returns UTC boundaries for a given month.
 * @param {Date|string|number} date
 * @returns {{start: string, next: string}}
 */
function getMonthBoundaries(date = new Date()) {
  const d = new Date(date);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));

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
