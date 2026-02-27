## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-01 - [IPC Query Parallelization & Aggregation]
**Learning:** Significant performance gains in Electron apps can be achieved by parallelizing independent I/O tasks using `Promise.all` in IPC handlers and reducing database round-trips by replacing sequential query loops with aggregate SQL queries using `GROUP BY`. Additionally, using range-based comparisons (`Op.between`) instead of SQL functions (`strftime`) in `WHERE` clauses ensures that the database engine can utilize available indexes.
**Action:** Always audit IPC handlers for sequential `await` calls of independent queries and replace them with `Promise.all`. For time-series or multi-entity stats, prefer single aggregate queries over multiple individual queries. Use range-based filtering for indexed date columns.
