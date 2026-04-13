## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-13 - [Parallel I/O and Angular Map Optimization]
**Learning:** Significant latency reduction (29-47%) achieved by parallelizing independent sequential database queries using Promise.all in Electron IPC handlers. On the frontend, replacing array .find() lookups within .map() loops with computed Map lookups optimized complexity from O(N*M) to O(N+M).
**Action:** Always audit IPC handlers for sequential 'await' calls that can be executed in parallel. Use computed Maps in Angular services to optimize cross-collection data joining.
