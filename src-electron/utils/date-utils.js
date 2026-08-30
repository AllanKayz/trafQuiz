/**
 * Date utilities for generating SQLite-compatible, SARGable date strings.
 * SQLite stores DATETIME as ISO8601 strings. Using range queries (Op.between)
 * on these strings allows the query planner to use indexes effectively.
 */

/**
 * Generates UTC date boundaries for common time ranges.
 * @param {string} range - The range type ('today', 'thisMonth', 'last6Months')
 * @returns {object} { start: string, end: string } - Formatted as YYYY-MM-DD HH:mm:ss.SSS
 */
function getDateBoundaries(range) {
  const now = new Date();
  let start, end;

  switch (range) {
    case "today":
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      break;
    case "thisMonth":
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      break;
    default:
      start = new Date(0);
      end = now;
  }

  return {
    start: start.toISOString().replace("T", " ").slice(0, 23),
    end: end.toISOString().replace("T", " ").slice(0, 23)
  };
}

module.exports = { getDateBoundaries };
