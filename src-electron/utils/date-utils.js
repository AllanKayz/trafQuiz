/**
 * Formats a Date object as a SQLite-compatible string.
 * Uses 'YYYY-MM-DD HH:mm:ss' format with space as separator for SARGability.
 * @param {Date} date - The date to format.
 * @returns {string} The formatted string.
 */
function toSqliteString(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Gets the start and end (exclusive next day) boundaries for a given date.
 * Useful for SARGable range queries.
 * @param {Date|string} date - The date.
 * @returns {{start: string, next: string}} UTC boundary strings.
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
 * Gets the start and end (exclusive next month) boundaries for a given month.
 * @param {number} year - The year.
 * @param {number} month - The month (1-12).
 * @returns {{start: string, next: string}} UTC boundary strings.
 */
function getMonthBoundaries(year, month) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));

    const next = new Date(Date.UTC(year, month, 1, 0, 0, 0));

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
