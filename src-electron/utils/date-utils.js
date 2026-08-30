
/**
 * Converts a Date object to a SQLite-compatible datetime string (YYYY-MM-DD HH:mm:ss).
 * Uses a space separator as it's lexicographically smaller than 'T'.
 */
function toSqliteString(date) {
    const pad = (num) => num.toString().padStart(2, '0');
    const yyyy = date.getUTCFullYear();
    const mm = pad(date.getUTCMonth() + 1);
    const dd = pad(date.getUTCDate());
    const hh = pad(date.getUTCHours());
    const min = pad(date.getUTCMinutes());
    const ss = pad(date.getUTCSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

/**
 * Returns the UTC boundaries for today.
 * Start: YYYY-MM-DD 00:00:00
 * Next:  YYYY-MM-DD 00:00:00 of the next day (exclusive upper bound for range queries)
 */
function getDateBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const next = new Date(start);
    next.setUTCDate(next.getUTCDate() + 1);

    return {
        start: toSqliteString(start),
        next: toSqliteString(next)
    };
}

/**
 * Returns the UTC boundaries for the current month.
 */
function getMonthBoundaries(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
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
