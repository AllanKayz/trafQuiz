/**
 * Converts a Date object to a SQLite-compatible string (UTC).
 * Format: YYYY-MM-DD HH:mm:ss.SSS
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
    return date.toISOString().replace('T', ' ').slice(0, 23);
}

/**
 * Returns the start and end of a specific day in UTC.
 * @param {Date} date
 * @returns {{start: string, end: string}}
 */
function getDateBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    return {
        start: toSqliteString(start),
        end: toSqliteString(end)
    };
}

/**
 * Returns the start and end of a specific month in UTC.
 * @param {Date} date
 * @returns {{start: string, end: string}}
 */
function getMonthBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));

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
