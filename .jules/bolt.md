## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable SQLite Date Queries]
**Learning:** SQLite index usage (SARGability) is broken when using functions like `date()` or `strftime()` in `WHERE` clauses. Additionally, SQLite date comparison is lexicographical. Since ASCII space (' ') is less than 'T', using space as a separator in boundary strings (e.g., 'YYYY-MM-DD HH:mm:ss') ensures compatibility with both 'T' and space-separated DATETIME formats in the database.
**Action:** Use range-based queries (`Op.gte`/`Op.lt`) with UTC boundaries and space separators for all date-filtered queries to ensure index usage (SEARCH vs SCAN).
