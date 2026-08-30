/**
 * Formats a Date object as a SQLite-compatible string (YYYY-MM-DD HH:mm:ss.SSS).
 * SQLite uses UTC for its internal date functions, so we should too.
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
    return date.toISOString().replace('T', ' ').replace('Z', '').slice(0, 23);
}

/**
 * Returns the start and end of a day as SQLite-compatible strings.
 * @param {Date} date
 * @returns {{ start: string, end: string }}
 */
function getDateBoundaries(date = new Date()) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    return {
        start: toSqliteString(start),
        end: toSqliteString(end)
    };
}

/**
 * Returns the start and end of a month as SQLite-compatible strings.
 * @param {Date} date
 * @returns {{ start: string, end: string }}
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
