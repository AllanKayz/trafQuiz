## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-06 - [SQLite Index SARGability & IPC Parallelization]
**Learning:** SQLite queries using `strftime` or `fn('date')` on indexed columns (like `start_time`) are not SARGable, meaning they bypass indexes and trigger full table scans. Additionally, sequential `await` calls for independent database counts in IPC handlers create unnecessary latency bottlenecks.
**Action:** Replace functional date transformations in WHERE clauses with index-friendly range comparisons (e.g., `Op.between` for today's start/end). Always wrap independent database queries in `Promise.all` to reduce total IPC latency to the duration of the longest single query.
