## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-19 - [End-to-End Performance Optimization]
**Learning:** Significant performance gains were achieved by combining database indexing, IPC parallelization, and frontend O(1) Map lookups. Aggregate SQL queries (GROUP BY) are far superior to sequential query loops for reporting. Sargable range queries (Op.between) are essential for SQLite to utilize indexes on date/time columns.
**Action:** Always parallelize independent database queries in IPC handlers. Use aggregate queries for time-series data. Ensure date-based filters use range comparisons to leverage indexes.
