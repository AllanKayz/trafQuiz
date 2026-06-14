/**
 * Formats a JavaScript Date object into a SQLite-compatible string: YYYY-MM-DD HH:mm:ss.SSS
 * @param {Date} date
 * @returns {string}
 */
function toSqliteString(date) {
    if (!(date instanceof Date) || isNaN(date)) return null;
    return date.toISOString().replace('T', ' ').slice(0, 23);
}

/**
 * Calculates the UTC start and end boundaries for a given date.
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
 * Calculates the UTC start and end boundaries for the month of a given date.
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
