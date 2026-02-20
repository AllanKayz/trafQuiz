## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-11 - [Multi-Layer Performance Boost]
**Learning:** Significant performance gains were achieved by attacking the stack at three levels: Database (comprehensive indexing on date/status fields), Backend IPC (parallelizing independent I/O using Promise.all and replacing loops with aggregate SQL), and Frontend (O(1) Map lookups for derived state).
**Action:** When auditing IPC handlers, look for sequential awaits of independent queries. In SQL, replace time-series loops with GROUP BY. In Angular Services, use computed Maps to optimize O(N*M) list transformations.
