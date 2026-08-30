/**
 * Utility functions for consistent date boundary calculations.
 * These ensure that date ranges are SARGable (Searchable Argument) for SQLite,
 * allowing the use of indexes by avoiding functions like strftime on indexed columns.
 */

/**
 * Returns the start and end of a given date (defaulting to today) in UTC ISO format.
 * Format: YYYY-MM-DD HH:mm:ss.SSS (compatible with SQLite's DATETIME)
 * @param {Date} date - The reference date
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
 * Returns the start and end of a month for a given date in UTC ISO format.
 * @param {Date} date - The reference date
 * @returns {{start: string, end: string}}
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
