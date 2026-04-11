## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-06 - [Parallelization & Aggregate Optimization]
**Learning:** Significant latency reduction can be achieved in Electron IPC handlers by parallelizing independent database queries with `Promise.all` and replacing sequential loops of queries with single aggregate SQL queries using `GROUP BY` and `CASE WHEN`.
**Action:** Always look for sequential `await` calls in handlers that can be parallelized. For chart data or multi-period metrics, prefer one complex SQL query over multiple simple ones in a loop.
