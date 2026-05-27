## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Date Queries & SQLite Indexing]
**Learning:** Functions like `strftime` or `date()` in `WHERE` clauses make queries non-SARGable, forcing SQLite to perform full table scans even if an index exists on the date column. Replacing these with `BETWEEN` range queries allows the engine to leverage B-tree indexes. Additionally, `SUBSTR(date_col, 1, 7)` is significantly faster than `strftime('%Y-%m', date_col)` for grouping when the range is already filtered.
**Action:** Always refactor date-based filters to use `Op.between` with start/end boundaries calculated in JS (using UTC). Verify with `EXPLAIN QUERY PLAN` to ensure a `SEARCH` plan instead of `SCAN`.
