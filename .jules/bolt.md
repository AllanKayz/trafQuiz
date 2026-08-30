## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Range Queries & Conditional Aggregation]
**Learning:** SQLite performance degrades when using functions like `strftime` or `fn('date')` in `WHERE` clauses as they prevent index usage (non-SARGable). Additionally, multiple summary queries for different categories (e.g., income/expense) can be consolidated into a single database call using conditional aggregation to minimize IPC latency.
**Action:** Replace date function filters with `Op.between` range queries and use UTC-based boundary helpers. Consolidate summary queries using `SUM(CASE WHEN ...)` to reduce round-trips.
