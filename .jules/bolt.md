## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-04-27 - [SARGable Queries & Angular Map Lookups]
**Learning:** Non-SARGable queries using `strftime` or `fn('date')` in `WHERE` clauses prevent SQLite from using indexes, leading to full table scans. Additionally, nested `.find()` calls in Angular computed signals create O(N*M) complexity bottlenecks for large datasets.
**Action:** Always refactor date-based `WHERE` clauses to use range comparisons (`Op.between`) with index-friendly columns. In Angular services, convert O(N*M) lookups into O(N+M) by pre-computing Maps for metadata/foreign key relationships.
