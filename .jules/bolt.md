## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-28 - [IPC Handler Parallelization & Aggregate Queries]
**Learning:** Significant latency reduction in Electron IPC handlers can be achieved by parallelizing independent database queries with `Promise.all` and replacing N+1 query loops (common in financial reporting) with single aggregate SQL queries using `GROUP BY` and `CASE` statements. Additionally, index-friendly date range comparisons (`Op.between`) are significantly faster than using `strftime` or `date()` functions on columns in `WHERE` clauses.
**Action:** When an IPC handler performs multiple independent queries, wrap them in `Promise.all`. Audit reporting handlers for sequential loops that can be replaced with aggregate queries. Always prefer index-friendly range comparisons for date filters.
