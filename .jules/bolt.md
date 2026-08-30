## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGability & Composite Indexes]
**Learning:** SQLite performance bottlenecks often stem from non-SARGable `WHERE` clauses using functions like `strftime` or `fn('date')` which force full table scans. Replacing these with `Op.between` range queries on indexed columns, especially using composite indexes `(equality_col, range_col)`, dramatically reduces latency.
**Action:** Use `EXPLAIN QUERY PLAN` to detect full table `SCAN`. Refactor date filters to range queries. Ensure composite indexes prioritize columns used in equality filters before range filters. Use `SUBSTR` for grouping by month to avoid `strftime` overhead.
