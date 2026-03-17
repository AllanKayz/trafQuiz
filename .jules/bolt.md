## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-12 - [Backend & Database Performance Overhaul]
**Learning:** Significant latency in IPC handlers was caused by three main factors: sequential execution of independent database queries, N+1 query patterns in loops (financial stats), and index-unfriendly date filtering using `strftime` or `date()` on columns in WHERE clauses.
**Action:** Always parallelize independent async operations with `Promise.all`. Replace loops that perform database queries with single aggregate queries using `GROUP BY` and `SUM(CASE...)`. Use range-based filtering (`BETWEEN`) for dates to ensure index utilization (SARGability).
