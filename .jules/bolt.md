## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-04-27 - [SARGable Queries & Targeted Indexing]
**Learning:** SQLite cannot use indexes on columns when they are wrapped in functions like `strftime` or `date` in the `WHERE` clause. Replacing these with range comparisons (`Op.between`) allows the engine to leverage indexes, drastically reducing latency for date-heavy dashboard queries.
**Action:** Always refactor `strftime` or `fn('date')` filters into index-friendly range queries. Add composite indexes for frequently filtered/sorted column groups like `(payment_date, type, status)`.
