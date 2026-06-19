## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Range Queries & SQLite String Lexicography]
**Learning:** SQLite date filtering using functions like `strftime` or `date()` prevents index usage (non-SARGable). Refactoring to range queries (e.g., `BETWEEN`) enables index `SEARCH`. However, SQLite string comparisons are sensitive to separators ('T' vs ' '). Because ' ' (ASCII 32) < 'T' (ASCII 84), a range end like `2026-05-10 23:59:59` will exclude database records stored as `2026-05-10T...`.
**Action:** Use `Op.gte` for the start and `Op.lt` for the start of the *next* period (e.g., `date >= '2026-05-10' AND date < '2026-05-11'`) to ensure robust SARGable queries that are independent of internal string separators.
