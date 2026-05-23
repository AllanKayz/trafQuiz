/**
 * Utility to get start and end dates for SARGable SQLite queries
 */
function getDateBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return {
    start: start.toISOString().replace('T', ' ').slice(0, 23),
    end: end.toISOString().replace('T', ' ').slice(0, 23)
  };
}

/**
 * Get start and end of the current month
 */
function getMonthBoundaries(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  return {
    start: start.toISOString().replace('T', ' ').slice(0, 23),
    end: end.toISOString().replace('T', ' ').slice(0, 23)
  };
}

module.exports = {
  getDateBoundaries,
  getMonthBoundaries
};
