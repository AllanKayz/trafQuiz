/**
 * Utilities for generating SQLite-compatible date strings and boundaries
 * to ensure SARGability in database queries.
 */

/**
 * Gets the start and end of a given date (defaults to today)
 * @param {Date} [date]
 * @returns {{start: string, end: string}}
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString().replace('T', ' ').slice(0, 23),
    end: end.toISOString().replace('T', ' ').slice(0, 23)
  };
}

/**
 * Gets the start and end of the current month
 * @returns {{start: string, end: string}}
 */
function getMonthBoundaries() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    start: start.toISOString().replace('T', ' ').slice(0, 23),
    end: end.toISOString().replace('T', ' ').slice(0, 23)
  };
}

module.exports = {
  getDateBoundaries,
  getMonthBoundaries
};
