## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGability and Composite Indexing]
**Learning:** SQLite performance severely degrades when using functions like `strftime()` or `date()` on indexed columns in `WHERE` clauses, as it forces a full table scan. Refactoring these to range-based queries (e.g., `Op.between` for a full day) allows the engine to use indexes. Additionally, composite indexes (e.g., `(instructor_id, start_time)`) are crucial for handlers that filter by both a foreign key and a date range.
**Action:** Always replace non-SARGable date functions in `WHERE` clauses with range comparisons. Use `EXPLAIN QUERY PLAN` to verify that queries perform a 'SEARCH' instead of a 'SCAN'. When refactoring `Promise.all` arrays, double-check variable destructuring to prevent logic regressions.
