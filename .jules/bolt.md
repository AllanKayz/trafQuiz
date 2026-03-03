## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-03 - [IPC and Angular Service Parallelization]
**Learning:** Sequential `await` calls in Electron IPC handlers (like `get-dashboard-stats`) create cumulative latency. Parallelizing independent queries with `Promise.all` and replacing $O(N)$ query loops with aggregate SQL queries (e.g., in `finances-handler.js`) provides measurable performance boosts. In Angular, transitioning from $O(N \cdot M)$ array searches to $O(N+M)$ Map lookups in `computed` signals is critical for scaling data-heavy views.
**Action:** Always audit IPC handlers for independent queries that can be parallelized. Use `Map` structures for cross-collection lookups in Angular Services to maintain $O(N)$ complexity.
