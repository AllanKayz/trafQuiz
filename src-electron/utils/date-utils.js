/**
 * Converts a Date object to a SQLite-compatible ISO 8601 string (UTC).
 * Uses a space separator instead of 'T' for lexicographical comparison compatibility
 * with standard SQLite/Sequelize date storage.
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
    return date.toISOString().replace('T', ' ');
}

/**
 * Returns UTC boundaries for a given date (start of day and start of next day).
 * Useful for SARGable range queries: [start, next)
 * @param {Date} date
 * @returns {{start: string, next: string}}
 */
function getDateBoundaries(date) {
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
 * Returns UTC boundaries for a given month (start of month and start of next month).
 * Useful for SARGable range queries: [start, next)
 * @param {Date} date
 * @returns {{start: string, next: string}}
 */
function getMonthBoundaries(date) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(1);

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
