## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-15 - [Dashboard IPC Parallelization & SARGable Queries]
**Learning:** Sequential await calls in IPC handlers for complex dashboards create significant latency. Parallelizing with Promise.all and using SARGable range queries (Op.between) instead of date functions ensures SQLite index utilization and reduces total response time.
**Action:** Always audit IPC handlers for independent queries that can be parallelized, and avoid using SQL functions on indexed columns in WHERE clauses.
