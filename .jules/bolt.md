## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-01 - [SARGable Date Queries & Functional Integrity]
**Learning:** Replacing non-SARGable date functions (like `fn('date')` or `strftime` in `WHERE` clauses) with range queries (`Op.between`) is critical for index utilization in SQLite. However, "optimizing" by adding arbitrary filters (e.g., limiting reports to the last 12 months) is a functional regression and should be avoided unless specified.
**Action:** Always prefer `Op.between` with pre-calculated start/end dates for filtering. Ensure that performance optimizations do not change the set of data returned to the user unless explicitly requested.
