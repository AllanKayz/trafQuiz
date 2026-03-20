## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-20 - [IPC Handler Parallelization & Query Aggregation]
**Learning:** This codebase frequently uses sequential `await` calls for independent database queries in Electron IPC handlers, leading to cumulative latency. Specifically, the `finances-handler` exhibited an anti-pattern of looping database queries to build time-series chart data.
**Action:** Always use `Promise.all` for independent queries in IPC handlers. Replace loops that query database stats per-period with a single aggregate SQL query using `GROUP BY` and `SUM(CASE WHEN ...)` to minimize round-trips and leverage SQLite indexes.
