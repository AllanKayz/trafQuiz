## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SARGable Date Queries & SQLite Lexicographical Edge Case]
**Learning:** Using `strftime` or `date()` functions in `WHERE` clauses prevents SQLite from using indexes (non-SARGable). However, refactoring to range queries (`>= start AND < next`) revealed a SQLite edge case: a date-only string (e.g., '2024-05-01') is lexicographically smaller than its datetime equivalent ('2024-05-01 00:00:00.000'), causing inclusive lower bounds to fail if formats are mixed.
**Action:** Use a centralized `date-utils.js` to ensure consistent date formatting. For inclusive lower bounds, always ensure the comparison string is either the same length or lexicographically smaller than the stored value (e.g., use 'YYYY-MM-DD' for midnight UTC).
