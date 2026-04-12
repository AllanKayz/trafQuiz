## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-06 - [IPC Handler Parallelization]
**Learning:** Significant latency reduction (20%-60%) can be achieved in Electron IPC handlers by parallelizing independent database queries with `Promise.all`. This is especially effective for dashboard-style aggregations and chart data loops.
**Action:** Identify independent queries in backend handlers and group them using `Promise.all`. Ensure correct handling of `sequelize.query` results which return as `[results, metadata]` arrays.
