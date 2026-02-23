## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-23 - [IPC Handler & Aggregation Optimization]
**Learning:** Sequential database queries in IPC handlers (especially loops) are major bottlenecks. Combining monthly stat queries into a single SQL query with 'GROUP BY' and 'SUM(CASE WHEN...)' reduced query count by 91% in the finance handler. Also confirmed that replacing 'sequelize.fn()' with 'Op.between' is essential for SQLite index utilization.
**Action:** When fetching dashboard or chart data, always look for opportunities to use aggregate SQL functions and parallelize independent queries with 'Promise.all'.
