## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [Optimization vs Functional Parity]
**Learning:** While technical optimizations like adding missing filters (e.g., `status='completed'`) or truncating historical data (e.g., 12-month limit) can improve query performance, they represent functional regressions if not explicitly requested. Performance optimization must maintain strict data parity with the original code.
**Action:** Always verify that optimized queries return the exact same result set as the original non-SARGable queries. Avoid adding business logic filters during technical refactoring.
