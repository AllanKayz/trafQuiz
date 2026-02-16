## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-11 - [Full-Stack Performance Orchestration]
**Learning:** Measurable speed boosts are achieved by combining SQLite PRAGMAs (WAL, synchronous=NORMAL), sargable date queries (Op.between vs strftime), and frontend O(1) lookup maps.
**Action:** Enable WAL mode for all SQLite connections. Replace non-sargable functions in WHERE clauses to ensure index utilization. Use computed Maps in Angular to avoid O(N*M) bottlenecks in list transformations.
