## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-06-08 - [SARGable SQLite Date Queries]
**Learning:** Non-SARGable date filters in SQLite (e.g., `strftime("%Y-%m", col)`, `fn('date', col)`) force full table scans by preventing index usage. Using range queries (`col BETWEEN ? AND ?`) with pre-calculated UTC-safe strings enables the query optimizer to use B-tree indexes.
**Action:** Use range comparisons for date filters and ensure relevant columns (like `payment_date`, `completed_at`, `start_time`) are indexed. For grouping by month, use `SUBSTR(col, 1, 7)` in the `SELECT` and `GROUP BY` while keeping the `WHERE` clause SARGable.
