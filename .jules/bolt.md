## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Queries & Composite Indexes]
**Learning:** Using SQL functions (like `strftime` or `date()`) on columns in `WHERE` clauses prevents SQLite from using indexes, leading to full table scans (non-SARGable queries). Range queries using `Op.between` with pre-calculated UTC date strings are significantly more efficient. Composite indexes that lead with equality filters (e.g., `student_id`) and follow with range filters (e.g., `completed_at`) provide the best performance for time-series data.
**Action:** Replace non-SARGable date functions in `WHERE` clauses with range comparisons. Use composite indexes for queries that filter by multiple columns or perform grouping on time-series data.
