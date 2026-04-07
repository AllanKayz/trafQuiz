## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-07 - [IPC & SQL Optimization]
**Learning:** Sequential `await` calls in IPC handlers (e.g., `get-dashboard-stats`) create a cumulative latency bottleneck. SQLite functions like `strftime` or `date()` in `WHERE` clauses are non-SARGable and bypass indexes.
**Action:** Use `Promise.all` for parallelizing independent database queries. Replace function-based date filtering with index-friendly range comparisons (`Op.between`). For periodic data (e.g., 6-month charts), replace sequential query loops with a single aggregate `GROUP BY` query to minimize database round-trips.
