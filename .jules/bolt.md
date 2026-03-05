## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-05 - [IPC Handler & Aggregate Optimization]
**Learning:** High latency in dashboard and finance views was caused by sequential database queries and inefficient date filtering. `Promise.all` reduced latency by up to 60%. Replacing function-based date filtering (e.g., `strftime`) with range-based comparisons (`Op.between`) ensured SQLite index utilization.
**Action:** Parallelize independent queries in IPC handlers. Use date ranges for filtering indexed columns. Replace multiple loops with single aggregate SQL queries (`GROUP BY`, `SUM(CASE...)`) for financial reporting.
