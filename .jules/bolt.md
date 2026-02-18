## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-18 - [IPC and Signal Optimization]
**Learning:** Sequential queries in IPC handlers and O(N*M) lookups in Angular signals are major bottlenecks. `Promise.all` and single aggregate queries (GROUP BY) provide massive wins in Electron apps. Computed Maps in Angular signals transform O(N*M) array searches into O(N+M) mapping operations.
**Action:** Parallelize independent queries with `Promise.all`. Replace sequential loops with aggregate SQL queries. Use computed Maps for constant-time lookups in Angular data transformations.
