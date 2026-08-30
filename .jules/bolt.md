## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Queries & Composite Indexes]
**Learning:** Using SQLite functions like `strftime` or `date()` in `WHERE` clauses prevents the engine from using indexes (non-SARGable). Refactoring these into range queries (`Op.between` with UTC date strings) and adding composite indexes (e.g., `[type, status, payment_date]`) converts full table SCANs into efficient SEARCHes.
**Action:** Always verify query plans with `EXPLAIN QUERY PLAN`. Replace date functions in `WHERE` clauses with direct range comparisons. Ensure composite indexes lead with equality filters followed by range filters.
