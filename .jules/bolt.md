## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Queries & Composite Indexes]
**Learning:** Non-SARGable date functions like `strftime` or `fn('date')` in WHERE clauses prevent SQLite from using indexes. Replacing them with range queries (`Op.between`) and adding composite indexes (e.g., `type, status, date`) provides massive speedups for dashboards and reporting.
**Action:** Use range comparisons for timestamps. When creating composite indexes, put equality-filtered columns (status, type) before range-filtered columns (date) to ensure optimal B-tree traversal.
