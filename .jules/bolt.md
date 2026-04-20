## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-04-17 - [Aggregate SQL & Parallelization]
**Learning:** Sequential database query loops (e.g., fetching monthly stats) are a massive bottleneck. Parallelizing independent queries with `Promise.all` and refactoring loops into single aggregate SQL queries with `GROUP BY` provides 60-70% latency reduction.
**Action:** Identify handlers with sequential `await` calls or loops and refactor them to use `Promise.all` or aggregate SQL. Ensure indexes exist on columns used in `WHERE`, `GROUP BY`, and `ORDER BY` clauses.
