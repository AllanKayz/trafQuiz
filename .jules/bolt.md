## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Date Queries & SQLite Indexing]
**Learning:** SQLite cannot use indexes when columns are wrapped in functions like `strftime` or `date()` in the `WHERE` clause. Refactoring to range comparisons (`>=` and `<`) on the raw columns enables index usage. Additionally, using `SUBSTR` for monthly grouping is more efficient than `strftime`.
**Action:** Always refactor date-based `WHERE` clauses to use range queries. Use `EXPLAIN QUERY PLAN` to verify that indexes (especially composite ones like `(instructor_id, start_time)`) are being used correctly for search operations.
