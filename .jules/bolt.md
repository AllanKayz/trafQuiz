## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-16 - [IPC Handler Parallelization & Query Optimization]
**Learning:** Sequential database queries in Electron IPC handlers significantly increase latency. Parallelizing independent queries with Promise.all and replacing sequential loops with aggregate SQL queries (like for the 6-month financial chart) provides measurable performance gains.
**Action:** Always look for sequential 'await' calls in IPC handlers and parallelize them if they don't depend on each other. Use aggregate SQL queries to replace N+1-like patterns in reporting logic.
