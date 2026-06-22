## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SQLite SARGability & ISO String Quirks]
**Learning:** SQLite's string comparison for DATETIME columns is sensitive to the ISO 8601 separator. While Sequelize might store dates with a space (e.g., "YYYY-MM-DD HH:mm:ss"), 'toISOString()' returns a 'T' separator. Comparisons like 'Record >= ...T...' can fail lexicographically against space-separated strings.
**Action:** Always ensure date boundary strings used in raw SQL or Sequelize range queries match the stored format. A safe pattern is 'date.toISOString().replace("T", " ")' for SQLite compatibility. Use 'EXPLAIN QUERY PLAN' to verify that range queries ('Op.gte'/'Op.lt') result in 'SEARCH' rather than 'SCAN'.
