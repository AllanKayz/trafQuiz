## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-04-28 - [SARGable Queries & Index Utilization]
**Learning:** Using `strftime` or `sequelize.fn('date')` in `WHERE` clauses (non-SARGable) prevents SQLite from using indexes, leading to full table scans. Range-based comparisons (`Op.between`) are necessary for efficient date filtering on indexed columns.
**Action:** Always prefer `Op.between` for date range queries. When using raw SQL, convert `toISOString()` to SQLite-compatible `YYYY-MM-DD HH:MM:SS` format and use `>=` / `<=` operators instead of date functions.
