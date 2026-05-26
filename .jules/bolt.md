## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Queries & Composite Indexes]
**Learning:** SQLite cannot use indexes on columns wrapped in functions like `strftime` or `date()`. Refactoring these "non-SARGable" filters into `Op.between` range queries against raw `DATETIME` strings (formatted as `YYYY-MM-DD HH:mm:ss.SSS`) unlocks dramatic performance gains. Composite indexes (e.g., `instructor_id, start_time`) further optimize queries that filter on multiple criteria.
**Action:** Avoid wrapping indexed columns in SQL functions in `WHERE` clauses. Use `getDateBoundaries` utility to generate range strings and verify index usage with `EXPLAIN QUERY PLAN`.
