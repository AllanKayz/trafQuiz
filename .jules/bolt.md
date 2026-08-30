## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGability & Composite Indexes]
**Learning:** Using SQLite functions like `strftime` or `date()` in `WHERE` clauses makes queries non-SARGable, preventing index usage even if an index exists. Refactoring these to range queries (`BETWEEN`) using standardized date strings (`YYYY-MM-DD HH:mm:ss.SSS`) enables `SEARCH` behavior. Composite indexes should place equality-filtered columns (e.g., `student_id`) before range-filtered columns (e.g., `completed_at`).
**Action:** Always check `EXPLAIN QUERY PLAN`. Avoid date functions in `WHERE` clauses; use `Op.between` with pre-formatted UTC date boundaries. Create composite indexes ordered by cardinality and filter type (equality then range).
