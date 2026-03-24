## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-24 - [Aggregate Query & Index Optimization]
**Learning:** Replacing a loop that performs multiple sequential database queries with a single aggregate `GROUP BY` query significantly reduces latency by minimizing IPC and database round-trips. Furthermore, ensuring queries are SARGable (e.g., using `payment_date >= ?` instead of wrapping the column in a function) is critical for SQLite index utilization.
**Action:** Always look for patterns where multiple queries are executed in a loop to fetch time-series data and replace them with aggregate SQL queries. Ensure `WHERE` clauses use direct column comparisons to leverage indexes.
