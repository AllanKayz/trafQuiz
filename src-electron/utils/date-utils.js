/**
 * Utility functions for date manipulations to ensure SARGable queries in SQLite.
 * SQLite storage format: YYYY-MM-DD HH:mm:ss.SSS
 */

/**
 * Returns start and end of a specific date in UTC.
 * @param {Date|string|number} date - The date to get boundaries for.
 * @returns {{start: string, end: string}}
 */
function getDateBoundaries(date = new Date()) {
  const d = new Date(date);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));

  return {
    start: start.toISOString().replace('T', ' ').slice(0, 23),
    end: end.toISOString().replace('T', ' ').slice(0, 23)
  };
}

/**
 * Returns start and end of a specific month in UTC.
 * @param {number} year
 * @param {number} month (0-11)
 * @returns {{start: string, end: string}}
 */
function getMonthBoundaries(year, month) {
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return {
    start: start.toISOString().replace('T', ' ').slice(0, 23),
    end: end.toISOString().replace('T', ' ').slice(0, 23)
  };
}

module.exports = {
  getDateBoundaries,
  getMonthBoundaries
};
