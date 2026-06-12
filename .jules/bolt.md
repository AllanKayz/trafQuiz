## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGability & SQLite Indexing]
**Learning:** SQLite cannot use indexes on columns wrapped in functions like `strftime` or `date()` in the `WHERE` clause (non-SARGable). Refactoring these to range queries using `BETWEEN` and providing standard UTC date boundaries in JavaScript allows SQLite to utilize B-tree indexes, drastically reducing `SCAN` operations to `SEARCH`.
**Action:** Never use `strftime` or `date()` on table columns in `WHERE` clauses. Use a utility like `getDateBoundaries()` to generate UTC range strings and use `Op.between`. Always verify index usage with `EXPLAIN QUERY PLAN`.
