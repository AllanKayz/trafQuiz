/**
 * Utilities for consistent and SARGable date queries in SQLite.
 */

/**
 * Formats a Date object to a SQLite-compatible ISO string.
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
    // Replace 'T' with ' ' for standard SQLite datetime format compatibility
    return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Gets the UTC start and end (exclusive) boundaries for a given date.
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
 * Gets the UTC start and end (exclusive) boundaries for a given month.
 * @param {number} year
 * @param {number} month (1-12)
 * @returns {{start: string, next: string}}
 */
function getMonthBoundaries(year, month) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));

    const next = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

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
