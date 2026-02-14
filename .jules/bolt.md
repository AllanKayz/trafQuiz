## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-14 - [SQLite & Signal Scaling]
**Learning:** SQLite write performance in Electron can be drastically improved by enabling WAL mode and setting synchronous to NORMAL. Furthermore, O(N*M) bottlenecks in Angular `computed` signals (due to `.find()` lookups inside `.map()`) can be optimized to O(N+M) using intermediate `computed` Maps. Database queries using `strftime` on indexed columns are anti-patterns that prevent index usage; range-based comparisons are preferred.
**Action:** Always enable WAL mode in SQLite. Use `computed` Maps for O(1) lookups in Angular services. Refactor `WHERE` clauses to use index-friendly range comparisons instead of functions on columns.
