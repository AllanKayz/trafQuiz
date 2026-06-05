## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGability & Composite Indexing]
**Learning:** SQLite cannot use indexes for queries where columns are wrapped in functions (e.g., `strftime` or `fn('date')`) in the `WHERE` clause (non-SARGable). Refactoring these to range queries (`Op.between`) with UTC-safe boundaries enables index usage. Furthermore, composite indexes must be ordered with equality filters before range filters for maximum efficiency.
**Action:** Always use range queries for dates instead of date-manipulation functions. Use `EXPLAIN QUERY PLAN` to verify that queries perform a `SEARCH` on an index rather than a `SCAN`. Ensure composite indexes are properly ordered.
