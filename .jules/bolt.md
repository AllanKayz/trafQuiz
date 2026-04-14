## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-14 - [IPC Handler & SQLite Optimization]
**Learning:** Significant performance gains in Electron IPC handlers come from parallelizing independent database queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries. In SQLite, avoiding date functions like `strftime` or `date()` in `WHERE` clauses by using range comparisons (`BETWEEN`) is crucial for index utilization.
**Action:** audit IPC handlers for sequential `await` calls that can be parallelized. Replace monthly query loops with aggregate queries using `GROUP BY`. Always prefer `BETWEEN` for date range filters to ensure SARGability.
