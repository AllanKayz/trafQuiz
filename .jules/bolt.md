## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGability and SQLite Date Formats]
**Learning:** SQLite index usage is blocked by date functions like `strftime` or `date()` in `WHERE` clauses. Furthermore, SQLite datetime columns in this app inconsistently use 'T' and space separators. Range queries using standard ISO strings can fail if the separator in the DB doesn't match the query.
**Action:** Always refactor date-based `WHERE` clauses into SARGable range queries (`>= start AND < next`). Use a space separator in boundary strings because ASCII ' ' (0x20) < 'T' (0x54), ensuring the range remains inclusive of both formats when using exclusive upper bounds.
