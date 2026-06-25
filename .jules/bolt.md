## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Date Ranges & Lexicographical Safety]
**Learning:** SQLite datetime columns in this app inconsistently use both 'T' and space separators. Because ASCII space < 'T', using an inclusive 'T' boundary (e.g., `2026-01-01T23:59:59`) would exclude records with space separators (e.g., `2026-01-01 20:00:00`). Using `strftime` or `date()` functions in `WHERE` clauses makes queries non-SARGable.
**Action:** Always refactor date filters to range queries (`>= start AND < next`). Use a space separator in boundary strings and an exclusive upper bound (start of the next period) to ensure all valid datetime strings are captured correctly and indexes are utilized.
