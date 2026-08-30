## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Date Queries in SQLite]
**Learning:** SQLite performance degrades significantly when using functions like `strftime` or `fn('date')` in `WHERE` clauses as they prevent index usage (non-SARGable). Inconsistent date formats (using 'T' vs space separators) in this codebase require a consistent formatting utility and exclusive upper bounds for reliable range queries.
**Action:** Use `Op.gte` and `Op.lt` with exclusive upper bounds and the `toSqliteString` utility (space separator) for all date range queries to ensure SARGability and index usage.
