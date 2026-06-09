## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGability & SQLite Index Optimization]
**Learning:** SQLite cannot use indexes for queries where the column is wrapped in a function (e.g., `strftime('%Y-%m', payment_date)` or `date(start_time)`). This makes them non-SARGable. Refactoring these to range queries (`BETWEEN` or `Op.between`) with pre-calculated UTC boundaries enables index-based searching.
**Action:** Replace date functions in `WHERE` clauses with range queries using `Op.between` and provide necessary indexes for those columns. Use `SUBSTR(column, 1, 7)` for month-based grouping in SQLite to avoid function overhead when the base query is already indexed.
