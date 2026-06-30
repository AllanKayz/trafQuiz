## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Date Queries & Composite Indexes]
**Learning:** Using functions like `strftime` or `date()` in SQLite `WHERE` clauses on indexed columns prevents the engine from using the index (non-SARGable). Refactoring to range queries (e.g., `>= start AND < next`) with UTC boundaries allows `SEARCH` instead of `SCAN`. Additionally, `SUBSTR(col, 1, 7)` is more efficient than `strftime('%Y-%m', col)` for grouping by month when the query is already narrowed by a SARGable range.
**Action:** Always refactor date-based `WHERE` clauses to use range queries. Use `getDateBoundaries()` and `getMonthBoundaries()` helpers to ensure consistency.
