## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-01 - [I/O Parallelism and SQLite Index Utilization]
**Learning:** Sequential database queries in Electron IPC handlers significantly increase latency. Furthermore, using SQL functions like `strftime` or Sequelize's `fn('date')` on indexed columns prevents SQLite from utilizing those indexes (SARGability issue).
**Action:** Group independent database queries using `Promise.all`. Always prefer range-based comparisons (e.g., `Op.between`) over date functions for filtering to ensure index hits. Refactor loops performing repeated queries into single aggregate queries with `GROUP BY` and `SUM(CASE...)`.
