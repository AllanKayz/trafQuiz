## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-13 - [O(N*M) Mapping Optimization]
**Learning:** Even within `computed` signals, performing repeated `.find()` calls on a large secondary signal inside a `.map()` of a primary signal creates an O(N*M) bottleneck.
**Action:** Create intermediate `computed` Map signals for secondary data. This reduces complexity to O(N+M) and provides O(1) lookups during the main mapping process.
