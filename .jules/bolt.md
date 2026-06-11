## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Queries & Composite Indexing]
**Learning:** SQLite cannot use indexes for queries where the column is wrapped in a function (e.g., `date(start_time)` or `strftime('%Y-%m', payment_date)`). Refactoring these into `BETWEEN` range queries on raw columns enables index-based `SEARCH` instead of full table `SCAN`. Composite indexes should follow the "Equality, then Range" rule (e.g., `(student_id, completed_at)`).
**Action:** Use `Op.between` for date filters. Always verify with `EXPLAIN QUERY PLAN` to ensure indexed search. Double-check UTC boundary logic in utility functions to avoid off-by-one errors in time ranges.
