## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.
## 2026-02-15 - [Date Range & O(1) Lookups]
**Learning:** SQLite performance in Electron apps can be significantly improved by avoiding SQL functions in WHERE clauses that prevent index usage (SARGability). Angular table performance is greatly enhanced by using computed Maps for O(1) lookups instead of Array.find() in templates or derived signals.
**Action:** Always use date range queries (Op.between) instead of strftime/fn('date'). Implement O(1) Map lookups for signals that join related data for table rendering.
