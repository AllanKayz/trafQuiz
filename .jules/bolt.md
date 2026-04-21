## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-21 - [Backend IPC Optimization]
**Learning:** Sequential database queries in Electron IPC handlers often create unnecessary latency. Parallelizing independent queries with `Promise.all` and refactoring query loops into single aggregate SQL queries (e.g., for financial charts) provides significant performance gains (measured ~32% to ~58% latency reduction).
**Action:** Audit IPC handlers for sequential `await` calls that can be parallelized. Replace loops that query database per-iteration with a single aggregate query using `GROUP BY`.
