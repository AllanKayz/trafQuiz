/**
 * Converts a Date object to a SQLite-compatible ISO string with a space separator.
 * ASCII ' ' (0x20) < 'T' (0x54), which ensures correct lexicographical comparison.
 * @param {Date} date
 * @returns {string} YYYY-MM-DD HH:mm:ss
 */
function toSqliteString(date) {
    return date.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Gets the start of the current day and the start of the next day in UTC.
 * @returns {{ start: string, next: string }}
 */
function getDateBoundaries() {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    const next = new Date(start);
    next.setUTCDate(next.getUTCDate() + 1);

    return {
        start: toSqliteString(start),
        next: toSqliteString(next)
    };
}

/**
 * Gets the start of the current month and the start of the next month in UTC.
 * @returns {{ start: string, next: string }}
 */
function getMonthBoundaries() {
    const start = new Date();
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
