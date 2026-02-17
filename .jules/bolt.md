## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-17 - [Query Aggregation & Parallelization]
**Learning:** Significant performance gains can be achieved by replacing loops that perform sequential queries (N+1 patterns) with single aggregate queries using SQL groupings. Parallelizing independent database calls using Promise.all also significantly reduces perceived latency in IPC handlers.
**Action:** Always look for loops containing database queries and replace them with set-based SQL operations. Use Promise.all for independent stats-gathering queries.
