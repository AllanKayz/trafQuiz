/**
 * Utility functions for SQLite date handling and SARGable queries.
 */

/**
 * Formats a Date object to a SQLite-compatible string.
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toISOString();
}

/**
 * Gets the start and next day boundaries for SQLite range queries.
 * Returns YYYY-MM-DD strings to be robust against 'T' vs ' ' separators.
 * @param {Date|string} date
 * @returns {{start: string, next: string}}
 */
function getDateBoundaries(date) {
    const d = new Date(date);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
    return {
        start: start.toISOString().split('T')[0],
        next: next.toISOString().split('T')[0]
    };
}

/**
 * Gets the start and next month boundaries for SQLite range queries.
 * @param {Date|string} date
 * @returns {{start: string, next: string}}
 */
function getMonthBoundaries(date) {
    const d = new Date(date);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    return {
        start: start.toISOString().split('T')[0],
        next: next.toISOString().split('T')[0]
    };
}

module.exports = {
    toSqliteString,
    getDateBoundaries,
    getMonthBoundaries
};
