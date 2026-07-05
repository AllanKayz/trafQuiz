/**
 * Formats a Date object to a SQLite-compatible string with space separator.
 * @param {Date} date
 * @returns {string} YYYY-MM-DD HH:mm:ss
 */
function toSqliteString(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    const y = date.getUTCFullYear();
    const m = pad(date.getUTCMonth() + 1);
    const d = pad(date.getUTCDate());
    const h = pad(date.getUTCHours());
    const min = pad(date.getUTCMinutes());
    const s = pad(date.getUTCSeconds());
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

/**
 * Returns the start of the day and start of the next day for SARGable range queries.
 * @param {Date} date
 * @returns {{start: string, next: string}}
 */
function getDateBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const next = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return {
        start: toSqliteString(start),
        next: toSqliteString(next)
    };
}

/**
 * Returns the start of the month and start of the next month for SARGable range queries.
 * @param {Date} date
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
