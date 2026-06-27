/**
 * Converts a Date object to a SQLite-compatible ISO string with a space separator.
 * Using space instead of 'T' ensures lexicographical compatibility with both formats,
 * as ' ' < 'T' in ASCII.
 * @param {Date} date
 * @returns {string} YYYY-MM-DD HH:mm:ss
 */
function toSqliteString(date) {
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Gets UTC boundaries for a single day.
 * @param {Date} [date] Base date, defaults to now.
 * @returns {{start: string, next: string}}
 */
function getDateBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
    return {
        start: toSqliteString(start),
        next: toSqliteString(next)
    };
}

/**
 * Gets UTC boundaries for a month.
 * @param {Date} [date] Base date, defaults to now.
 * @returns {{start: string, next: string}}
 */
function getMonthBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
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
