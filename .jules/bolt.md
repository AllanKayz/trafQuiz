## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-01 - [Parallelization & Aggregate Optimization]
**Learning:** IPC handlers performing multiple independent database queries (dashboard, progress, question stats) are a major source of latency. Parallelizing these using `Promise.all` and replacing sequential O(N) query loops (financial charts) with single aggregate SQL queries significantly improves responsiveness.
**Action:** Always parallelize independent queries in IPC handlers. Use aggregate SQL (`SUM(CASE...)`, `GROUP BY`) instead of application-level loops for multi-period data fetching.
