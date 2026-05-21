## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Date Queries & Composite Indexes]
**Learning:** Using SQL functions like `strftime` or `date()` in `WHERE` clauses prevents SQLite from using indexes (non-SARGable). Refactoring these to `Op.between` range queries with pre-calculated UTC date strings (e.g., `YYYY-MM-DD HH:mm:ss.SSS`) enables indexed 'SEARCH' behavior. Furthermore, composite indexes (e.g., `(instructor_id, start_time)`) are critical when filtering by both a foreign key and a date range to ensure a 'COVERING INDEX' or efficient search.
**Action:** Use `getDateBoundaries` helper for all date-based filtering. Always verify with `EXPLAIN QUERY PLAN` to ensure 'SEARCH' instead of 'SCAN'. Precede range filters with equality filters in composite indexes.
