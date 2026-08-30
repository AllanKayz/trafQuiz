## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-26 - [IPC Parallelization & Query Aggregation]
**Learning:** IPC handlers often become bottlenecks when they perform multiple sequential database queries. Parallelizing independent queries with `Promise.all` and refactoring sequential query loops into single aggregate SQL queries (e.g., for monthly financial charts) significantly reduces latency.
**Action:** Identify IPC handlers with multiple `await` database calls and use `Promise.all` for independent operations. Replace reporting loops with aggregate queries using `GROUP BY` and conditional `SUM`.

## 2026-05-10 - [SQLite Date Lexicographical Comparison]
**Learning:** In SQLite, a date-only string (e.g., '2024-05-01') is lexicographically less than its datetime equivalent with a time component (e.g., '2024-05-01 00:00:00.000'). Using full datetime strings for inclusive lower-bound range queries can accidentally exclude records stored as date-only strings.
**Action:** For inclusive lower bounds in SARGable range queries, use the shortest common date format ('YYYY-MM-DD') if the target is midnight UTC, ensuring both date-only and datetime records are correctly captured.
