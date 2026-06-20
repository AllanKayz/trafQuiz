
/**
 * Utility to convert a date to SQLite compatible ISO string (UTC)
 * Ensures ' ' instead of 'T' to match standard SQLite/Sequelize string format
 */
function toSqliteString(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Returns boundaries for a single day (start and start of next day)
 * for SARGable range queries (Op.gte start, Op.lt next)
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
 * Returns boundaries for a month (start and start of next month)
 */
function getMonthBoundaries(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));

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
