/**
 * Formats a Date object to a SQLite-compatible datetime string (YYYY-MM-DD HH:mm:ss).
 * Uses a space separator to ensure correct lexicographical comparison with both
 * 'T' and ' ' separators used by SQLite/Sequelize.
 */
function toSqliteString(date) {
  const pad = (num) => num.toString().padStart(2, '0');
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

/**
 * Returns the start and end (exclusive) boundaries for a given date.
 * Useful for SARGable range queries: [start, nextDayStart)
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    start: toSqliteString(start),
    end: toSqliteString(end)
  };
}

/**
 * Returns the start and end (exclusive) boundaries for a given month.
 * Useful for SARGable range queries: [startOfMonth, startOfNextMonth)
 */
function getMonthBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);

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
