## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGability and SQLite Date Indexing]
**Learning:** Using SQL functions like `strftime`, `date()`, or Sequelize `fn('date')` in `WHERE` clauses makes queries non-SARGable, forcing full table scans even if an index exists. Additionally, SQLite's string-based date comparison requires consistent formatting. Sequelize often stores dates with a 'T' or space separator and millisecond precision.
**Action:** Always refactor date-based filters to range queries (`Op.between`, `Op.gte`, `Op.lt`). Create a standard utility to generate ISO 8601 UTC strings (using a space instead of 'T' for broad compatibility) to ensure lexicographical comparison correctly leverages B-Tree indexes. Use `EXPLAIN QUERY PLAN` to verify `SEARCH` instead of `SCAN`.
