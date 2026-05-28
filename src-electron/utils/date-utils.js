/**
 * Utility functions for date manipulation to ensure SARGability in SQLite queries.
 */

/**
 * Formats a Date object to a SQLite-compatible DATETIME string (YYYY-MM-DD HH:mm:ss.SSS).
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
    return date.toISOString().replace('T', ' ').slice(0, 23);
}

/**
 * Gets the start and end boundaries for a specific day.
 * @param {Date} [baseDate=new Date()]
 * @returns {{start: string, end: string}}
 */
function getDateBoundaries(baseDate = new Date()) {
    const start = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), 23, 59, 59, 999));

    return {
        start: toSqliteString(start),
        end: toSqliteString(end)
    };
}

/**
 * Gets the start and end boundaries for a specific month.
 * @param {number} year
 * @param {number} month (0-11)
 * @returns {{start: string, end: string}}
 */
function getMonthBoundaries(year, month) {
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    return {
        start: toSqliteString(start),
        end: toSqliteString(end)
    };
}

module.exports = {
    getDateBoundaries,
    getMonthBoundaries,
    toSqliteString
};
