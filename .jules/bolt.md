## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-02 - [IPC Query & SQLite Optimization]
**Learning:** Significant latency reduction in IPC handlers is achieved by parallelizing independent database queries with `Promise.all`. For SQLite specifically, replacing date functions in WHERE clauses (like `strftime`) with range-based comparisons (`Op.between` or `>=` AND `<`) is critical to enable index utilization (SARGability).
**Action:** Parallelize sequential `await` calls in handlers. Always use range-based date filters instead of functional ones to ensure the database can use performance indexes.
