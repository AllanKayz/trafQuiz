## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Range Queries & SQLite Indexing]
**Learning:** Using SQL functions like `strftime` or `date()` on indexed columns in a `WHERE` clause prevents SQLite from using the index (non-SARGable). Refactoring these to range queries (`BETWEEN`) with pre-calculated UTC date boundaries enables indexed `SEARCH` instead of full table `SCAN`.
**Action:** Always prefer `Op.between` with ISO/UTC strings for date filtering. Centralize date boundary logic in utilities to ensure consistency between JS and SQLite's internal UTC representation.
