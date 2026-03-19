## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-12 - [SQL Range Queries & IPC Scoping]
**Learning:** SQLite performance is heavily dependent on index utilization; using functions like `strftime` or `date()` in `WHERE` clauses inhibits index usage. Additionally, in large IPC handlers with multiple role-based branches, common variables like date ranges should be defined at the top scope to avoid redundant calculations and `const` redeclaration syntax errors.
**Action:** Use `BETWEEN` or comparison operators with pre-calculated date strings for SQLite index-friendly queries. Centralize common variable declarations in IPC handlers.
