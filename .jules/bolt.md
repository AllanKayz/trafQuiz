## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-17 - [IPC Handler & Aggregate SQL Optimization]
**Learning:** Sequential database queries in Electron IPC handlers create a performance bottleneck. Parallelizing them with `Promise.all` and refactoring loops that perform multiple similar queries into a single aggregate SQL query with `GROUP BY` and `CASE` statements provides massive latency reductions (up to 75%).
**Action:** Identify IPC handlers with sequential `await` calls or loops containing queries. Use `Promise.all` for independent queries and single aggregate SQL for periodic/charted data. Add supporting indexes for any new filter/grouping columns.
