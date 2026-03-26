## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-12 - [IPC Handler & Aggregate Query Optimization]
**Learning:** IPC handlers performing multiple independent database queries (e.g., dashboard, progress, questions) should use `Promise.all` to execute them in parallel, reducing total latency. For time-series charts (e.g., finances), replacing sequential loops with a single SQL `GROUP BY` and `SUM(CASE...)` query provides a significant performance boost by reducing database round-trips.
**Action:** Parallelize independent queries in IPC handlers. Use aggregate SQL queries for data visualization instead of procedural loops. Ensure date comparisons in queries are index-friendly (using range `Op.between` instead of functions like `strftime` on columns).
