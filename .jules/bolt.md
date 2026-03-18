## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-12 - [Backend IPC & SQLite Optimization]
**Learning:** Sequential database queries in Electron IPC handlers significantly increase latency. Furthermore, using SQLite functions like `strftime` or `date()` in `WHERE` clauses prevents the use of indexes (non-SARGable).
**Action:** Parallelize independent database queries using `Promise.all`. Replace function-based date filtering with index-friendly range queries (e.g., `Op.between` or `>=` and `<`).
