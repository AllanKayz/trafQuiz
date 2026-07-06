/**
 * Utility functions for SQLite date handling and SARGable queries.
 */

/**
 * Formats a Date object to a SQLite-compatible string (YYYY-MM-DD HH:mm:ss).
 * Uses UTC to ensure consistency between app and DB.
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
           `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

/**
 * Returns the start of the day and start of the next day for a given date.
 * Useful for SARGable daily range queries (>= start AND < next).
 * @param {Date} date
 * @returns {{start: string, next: string}}
 */
function getDateBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0));
    return {
        start: toSqliteString(start),
        next: toSqliteString(next)
    };
}

/**
 * Returns the start of the month and start of the next month for a given date.
 * Useful for SARGable monthly range queries (>= start AND < next).
 * @param {Date} date
 * @returns {{start: string, next: string}}
 */
function getMonthBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
    const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0));
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
