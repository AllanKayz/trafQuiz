/**
 * Utility functions for date handling in SQLite/Sequelize
 */

/**
 * Formats a Date object to a SQLite-compatible string.
 * If the date is exactly at midnight UTC, it returns YYYY-MM-DD.
 * Otherwise, it returns YYYY-MM-DD HH:mm:ss.SSS.
 */
function toSqliteString(date) {
    const iso = date.toISOString();
    if (iso.endsWith('T00:00:00.000Z')) {
        return iso.split('T')[0];
    }
    return iso.replace('T', ' ').replace('Z', '');
}

/**
 * Returns the start of today and start of tomorrow as SQLite strings
 */
function getDateBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const next = new Date(start);
    next.setUTCDate(start.getUTCDate() + 1);

    return {
        start: toSqliteString(start),
        next: toSqliteString(next)
    };
}

/**
 * Returns the start of the current month and start of the next month as SQLite strings
 */
function getMonthBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    const next = new Date(start);
    next.setUTCMonth(start.getUTCMonth() + 1);

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
