## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-17 - [IPC & Query Optimization]
**Learning:** Sequential database queries in Electron IPC handlers are a major latency bottleneck. Replacing a 12-query loop with a single aggregate SQL query using `strftime` and `SUM(CASE WHEN...)` reduced latency by ~74% in financial reporting.
**Action:** Use `Promise.all` for parallelizing independent queries. Refactor sequential query loops into aggregate SQL queries with index-friendly date range filters.
