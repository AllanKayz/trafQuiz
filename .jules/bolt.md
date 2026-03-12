## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-12 - [IPC Handler Parallelization & SARGability]
**Learning:** Significant latency in IPC handlers often comes from sequential database queries. Parallelizing them with `Promise.all` can reduce response time by N-fold. Additionally, using functions on indexed columns (e.g., `strftime` or `fn('date')`) prevents index usage (non-SARGable); range-based comparisons (e.g., `Op.between`) are necessary for performance.
**Action:** Audit IPC handlers for sequential `await` calls and replace with `Promise.all`. Always use range comparisons for date filters on indexed columns.
