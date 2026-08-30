## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Range Queries & Composite Indexes]
**Learning:** SQLite performance severely degrades when using `strftime` or `fn('date')` in `WHERE` clauses because they prevent index usage (Full Table SCAN). Additionally, SQLite datetime strings can inconsistently use 'T' or ' ' as separators.
**Action:** Always refactor date-based filters to use SARGable range queries (`>= start AND < next`) with UTC boundaries. Ensure composite indexes place equality filters (e.g., `instructor_id`) before range filters (e.g., `start_time`) to maximize B-tree efficiency. Use `SUBSTR(col, 1, 7)` for month grouping when the `WHERE` clause is already SARGable.
