## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Range Queries & Lexicographical SQLite Dates]
**Learning:** SQLite performance is severely degraded by using date functions like `strftime` or `date()` in `WHERE` clauses, as they prevent index usage (non-SARGable). Additionally, SQLite datetime strings can use either 'T' or space as a separator; since ASCII space < 'T', using a space-separated boundary with an exclusive upper bound (e.g., `>= '2025-01-01 00:00:00' AND < '2025-01-02 00:00:00'`) ensures correct lexicographical filtering regardless of the internal format.
**Action:** Always refactor date function filters into range queries (`Op.gte`/`Op.lt`) and use a utility to generate consistent space-separated UTC boundaries. Use `SUBSTR(col, 1, 7)` for efficient grouping by month on already-filtered result sets.
