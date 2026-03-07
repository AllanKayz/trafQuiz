## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-01 - [Parallelization & Aggregate Optimization]
**Learning:** Sequential database queries in Electron IPC handlers create additive latency. Aggregate SQL queries with GROUP BY are significantly faster than individual queries in a loop.
**Action:** Use Promise.all() for concurrent database requests. Replace loops containing queries with single aggregate SQL statements where possible. Use Op.between for date ranges to ensure index utilization in SQLite.
