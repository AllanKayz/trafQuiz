## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-09 - [Parallelizing IPC Database Queries]
**Learning:** Sequential `await` calls for independent database queries in Electron IPC handlers significantly increase latency. In this codebase, metrics-heavy handlers (Dashboard, Finances) were particularly affected by this pattern.
**Action:** Use `Promise.all` to parallelize independent database operations in IPC handlers. Always ensure entity lookups (e.g., finding a student ID by user ID) are completed before parallelizing dependent metric queries.
