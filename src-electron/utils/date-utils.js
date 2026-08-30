/**
 * Formats a Date object to a SQLite-compatible DATETIME string (YYYY-MM-DD HH:mm:ss.SSS) in UTC.
 * @param {Date} date
 * @returns {string}
 */
function formatToSQLite(date) {
    return date.toISOString().replace('T', ' ').slice(0, 23);
}

/**
 * Returns the start and end boundaries for a given date in UTC.
 * Defaults to the current day.
 * @param {Date} [date]
 * @returns {{ start: string, end: string }}
 */
function getDateBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
    return {
        start: formatToSQLite(start),
        end: formatToSQLite(end)
    };
}

/**
 * Returns the start and end boundaries for the current month in UTC.
 * @returns {{ start: string, end: string }}
 */
function getCurrentMonthBoundaries() {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    return {
        start: formatToSQLite(start),
        end: formatToSQLite(end)
    };
}

/**
 * Returns the start and end boundaries for a range of months ending at the current month.
 * @param {number} monthsToLookBack
 * @returns {{ start: string, end: string }}
 */
function getRecentMonthsBoundaries(monthsToLookBack = 6) {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsToLookBack - 1), 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    return {
        start: formatToSQLite(start),
        end: formatToSQLite(end)
    };
}

module.exports = {
    formatToSQLite,
    getDateBoundaries,
    getCurrentMonthBoundaries,
    getRecentMonthsBoundaries
};
