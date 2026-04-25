## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-17 - [IPC Handler Parallelization & SQL Aggregation]
**Learning:** Sequential database queries in Electron IPC handlers are a common bottleneck. Parallelizing independent queries with `Promise.all` and refactoring monthly report loops into single aggregate SQL queries (using `SUM(CASE WHEN...)`) provides massive latency reductions. Also, always set Date to the 1st before subtracting months to avoid overflow errors.
**Action:** Audit IPC handlers for sequential `await` calls on independent data. Replace reporting loops with aggregate queries. Ensure missing indexes on filter/sort columns are added via migrations.
