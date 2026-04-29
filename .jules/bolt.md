## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-04-29 - [SARGable Queries & Supporting Indexes]
**Learning:** Using SQL functions like `strftime` or `date()` on columns in `WHERE` clauses (non-SARGable queries) prevents index usage in SQLite, leading to full table scans. Refactoring these to range queries (`BETWEEN` or `Op.between`) and adding supporting indexes significantly improves performance.
**Action:** Avoid date functions in `WHERE` clauses. Use `BETWEEN` with pre-calculated start/end timestamps. Always ensure optimized columns are backed by appropriate indexes (including composite indexes for multi-column filters).
