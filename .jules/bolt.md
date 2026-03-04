## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-04 - [Database Aggregation & Parallelization]
**Learning:** Sequential database queries in Electron IPC handlers create cumulative latency. Refactoring loops of independent queries into single aggregate SQL queries (using `SUM(CASE WHEN...)`) and using `Promise.all` for parallel execution provides massive speedups for dashboard and analytical views.
**Action:** Audit IPC handlers for sequential `await` calls and loops containing database queries. Replace with aggregate SQL or `Promise.all` to minimize main process blocking and I/O wait time.
