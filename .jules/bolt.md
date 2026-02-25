## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-25 - [IPC & Query Optimization]
**Learning:** IPC handlers with sequential database queries create significant latency. Replacing loops of queries with a single aggregate SQL query (GROUP BY) and using Promise.all for independent requests reduces database round-trips by >90%. Additionally, using Op.between for date ranges instead of function-based filtering (strftime) is critical for SQLite index utilization.
**Action:** Parallelize independent DB calls in IPC handlers. Use aggregate queries instead of loops. Avoid functions on columns in WHERE clauses to maintain SARGability.
