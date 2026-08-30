## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGability & Lexicographical SQLite Dates]
**Learning:** SQLite's `DATETIME` columns often store mixed formats (ISO 8601 with 'T' or space separators). Using `strftime` or `fn('date')` in `WHERE` clauses is non-SARGable and forces full table scans. Range queries (`>=` and `<`) with boundary strings using space separators (' ') are robust because ASCII space < 'T', ensuring correct lexicographical comparison.
**Action:** Replace date functions in `WHERE` clauses with range queries using exclusive upper bounds. Ensure boundary strings use space as a separator to handle both SQLite date variants consistently.
