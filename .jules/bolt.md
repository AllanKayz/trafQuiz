## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Range Queries & Composite Indexes]
**Learning:** Non-SARGable date filters (using `strftime` or `date()` on columns) prevent SQLite from using indexes even if they exist. Refactoring these to `Op.gte`/`Op.lt` range queries with ISO strings (replacing 'T' with space) enables `SEARCH` instead of `SCAN`. Composite indexes with equality filters before range filters further optimize these queries.
**Action:** Always check `EXPLAIN QUERY PLAN` for date-based queries. Refactor function-wrapped column filters to range-based filters and ensure composite indexes align with the filter order.
