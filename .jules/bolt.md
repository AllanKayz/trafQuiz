## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Queries & Composite Index Ordering]
**Learning:** Using SQL functions like `strftime` or `date()` on columns in `WHERE` clauses is a major performance anti-pattern in SQLite as it prevents index usage. Composite indexes must be ordered with equality-filtered columns (e.g., `student_id`, `type`) preceding range-filtered columns (e.g., `completed_at`, `payment_date`) to maximize B-tree efficiency.
**Action:** Always refactor date functions in `WHERE` clauses to `Op.between` range queries with pre-calculated UTC boundaries. Ensure composite indexes follow the "Equality, Sort, Range" (ESR) rule where applicable.
