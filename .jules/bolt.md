## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-10 - [IPC Handler Parallelization]
**Learning:** Sequential database queries in Electron IPC handlers are a significant source of latency. Using `Promise.all` to parallelize independent queries (e.g., aggregate statistics, multi-month charts) provides measurable performance gains (20-50% reduction in latency).
**Action:** Audit IPC handlers for sequential `await` calls that don't have data dependencies and parallelize them using `Promise.all`.
