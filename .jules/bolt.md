## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-17 - [Query Parallelization & Consolidation]
**Learning:** Replacing sequential `await` calls with `Promise.all` for independent database queries in Electron IPC handlers reduces latency significantly. Furthermore, refactoring loops that execute multiple queries into a single aggregate SQL query with `GROUP BY` provides a massive performance boost (e.g., ~70% reduction in `get-financial-stats` latency).
**Action:** Always look for sequential independent queries and use `Promise.all`. Refactor reporting loops into aggregate queries with index-friendly date filters.
