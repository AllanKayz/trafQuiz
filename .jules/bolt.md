## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-15 - [IPC Handler Parallelization & Aggregate SQL]
**Learning:** Sequential database queries in Electron IPC handlers are a major latency source. Parallelizing them with `Promise.all` provides immediate wins. For monthly statistics, replacing N+1 query loops with a single aggregate SQL query using `CASE` statements and `GROUP BY` is significantly more efficient. Additionally, SQLite indexes are only utilized if `WHERE` clauses use direct range comparisons (`BETWEEN` or `>=`/`<`) instead of functions like `strftime` or `fn('date')`.
**Action:** Always audit IPC handlers for sequential `await` calls to independent queries and parallelize them. Prefer aggregate queries over loops for report generation. Use date ranges for filtering on indexed columns.
