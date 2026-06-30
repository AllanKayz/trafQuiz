
/**
 * Converts a Date object to a SQLite-compatible datetime string using a space separator.
 * ASCII ' ' (0x20) < 'T' (0x54), which ensures lexicographical correctness for range queries
 * across different SQLite date formats.
 * @param {Date} date
 * @returns {string} YYYY-MM-DD HH:mm:ss
 */
function toSqliteString(date) {
    return date.toISOString().replace('T', ' ').replace(/\..+/, '');
}

/**
 * Returns the start of the day and start of the next day as SQLite-compatible strings.
 * Used for SARGable range queries: column >= start AND column < next.
 * @param {Date} [date] Base date, defaults to now.
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
 * Returns the start of the month and start of the next month as SQLite-compatible strings.
 * Used for SARGable range queries: column >= start AND column < next.
 * @param {Date} [date] Base date, defaults to now.
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
