## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-04-27 - [SARGable Queries & Computed Maps]
**Learning:** SQLite indexes cannot be used when columns are wrapped in functions (non-SARGable). Refactoring `fn('date')` or `strftime` into `Op.between` range queries yields measurable latency drops. In Angular, using computed Maps for O(1) lookups in large list transformations prevents O(N*M) rendering bottlenecks.
**Action:** Use `Op.between` for date filters in IPC handlers. Use computed Maps for lookups when mapping large arrays in Angular services.
