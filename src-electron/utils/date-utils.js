/**
 * Utility functions for date manipulation to ensure SARGable queries in SQLite.
 */

/**
 * Converts a JavaScript Date object to a SQLite-compatible string (YYYY-MM-DD HH:mm:ss.SSS).
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
    if (!(date instanceof Date) || isNaN(date)) return null;
    return date.toISOString().replace('T', ' ').slice(0, 23);
}

/**
 * Returns the start and end of a given day in UTC.
 * @param {Date|string} date
 * @returns {{start: string, end: string}}
 */
function getDateBoundaries(date = new Date()) {
    const d = new Date(date);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));

    return {
        start: toSqliteString(start),
        end: toSqliteString(end)
    };
}

/**
 * Returns the start and end of the current month in UTC.
 * @returns {{start: string, end: string}}
 */
function getMonthBoundaries() {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

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
