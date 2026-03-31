## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-31 - [Electron IPC & SQLite Query Optimization]
**Learning:** Significant latency reduction in Electron IPC handlers can be achieved by parallelizing independent database queries with `Promise.all` and replacing sequential query loops (e.g., fetching 6 months of data) with single aggregate SQL queries using `GROUP BY` and `CASE` statements.
**Action:** Audit IPC handlers for sequential `await` calls and loops that perform database queries. Use `Promise.all` for concurrency and refactor loops into aggregate SQL queries where possible.
