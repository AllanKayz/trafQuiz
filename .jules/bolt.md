## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Date Queries & Composite Indexes]
**Learning:** Using SQLite functions like `strftime` or `date()` in WHERE clauses prevents index usage (non-SARGable). Moving date boundary calculations to JavaScript and using `BETWEEN` or range operators enables the SQLite query planner to perform indexed `SEARCH` instead of full table `SCAN`. Composite indexes (e.g., `(student_id, completed_at)`) are particularly effective for time-series data grouped by entity.
**Action:** Replace `strftime` in WHERE clauses with range comparisons. Ensure date strings are formatted as `YYYY-MM-DD HH:mm:ss.SSS` using UTC to match SQLite's internal storage and avoid timezone drift. Use `EXPLAIN QUERY PLAN` to verify.
