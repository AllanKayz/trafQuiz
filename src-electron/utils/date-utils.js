/**
 * Converts a Date object to a SQLite-compatible datetime string (YYYY-MM-DD HH:mm:ss).
 * Uses a space separator as it is lexicographically smaller than 'T'.
 */
function toSqliteString(date) {
    const iso = date.toISOString();
    return iso.replace('T', ' ').slice(0, 19);
}

/**
 * Returns SARGable boundaries (start and next-period-start) for a specific date (UTC).
 * Useful for "today" or specific day queries using >= start AND < next.
 */
function getDateBoundaries(date = new Date()) {
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
 * Returns SARGable boundaries for a specific month (UTC).
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
