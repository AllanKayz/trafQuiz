## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGability and Composite Indexes]
**Learning:** Non-SARGable date functions like `strftime` and `date()` in `WHERE` clauses caused full table scans even when indexes existed. Using `Op.gte`/`Op.lt` range queries with ISO 8601 strings allows SQLite to use indexes. For composite indexes, ordering equality filters (e.g., `instructor_id`) before range filters (e.g., `start_time`) is critical for efficiency.
**Action:** Use `getDateBoundaries` or `getMonthBoundaries` to generate inclusive/exclusive UTC range strings for date queries. Replace `strftime('%Y-%m', col) = ...` with range comparisons. Use `SUBSTR(col, 1, 7)` for month grouping in aggregate queries.
