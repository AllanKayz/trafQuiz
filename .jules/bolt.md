## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-22 - [SQLite WAL & Query Aggregation]
**Learning:** SQLite performance in Electron apps is bottlenecked by the default journal mode. Enabling WAL mode and `synchronous=NORMAL` significantly improves concurrency. Additionally, replacing $O(N)$ query loops with a single $O(1)$ aggregate query (GROUP BY) and avoiding function calls on columns in WHERE clauses (maintaining SARGability) provides the biggest measurable wins in stats-heavy dashboards.
**Action:** Default to WAL mode for SQLite. Audit IPC handlers for sequential `await` patterns and looping queries. Always use date range comparisons instead of `strftime` on indexed columns.
