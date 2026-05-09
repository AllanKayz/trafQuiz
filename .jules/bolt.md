## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-04-27 - [SARGable Date Queries]
**Learning:** Using database functions like `strftime` or `fn('date')` in `WHERE` clauses makes queries non-SARGable, preventing the database from using indexes on date/time columns. Replacing these with range comparisons (`Op.between` or `>=`/`<`) allows SQLite to utilize indexes, dramatically reducing latency as the dataset grows.
**Action:** Always refactor date-based filters to use range comparisons. Use `Date.UTC` to calculate consistent start/end boundaries for day or month filters to ensure reliability across environments and alignment with SQLite's internal UTC handling.
