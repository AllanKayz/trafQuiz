## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-26 - [Full-Stack IPC & Query Optimization]
**Learning:** Critical performance gains were achieved by parallelizing independent database queries using `Promise.all` in Electron IPC handlers and replacing sequential loop queries (N+1) with single aggregate `GROUP BY` SQL queries. Additionally, ensuring date-based queries are SARGable (using range comparisons like `>=` and `<` instead of functions like `strftime` in `WHERE` clauses) allows SQLite to utilize indexes, significantly reducing query execution time as the database grows.
**Action:** Always parallelize independent async calls. Refactor loops containing database queries into single aggregate queries. Use range comparisons for date filtering to maintain index efficiency.
