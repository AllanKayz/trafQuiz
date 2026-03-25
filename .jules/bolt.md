## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-03-12 - [Batch Aggregate Queries & Signal Maps]
**Learning:** Replacing sequential database queries in loops with a single SQL `GROUP BY` and `SUM(CASE...)` aggregate query provides the most significant performance boost in dashboard/reporting views. Additionally, using `computed` Maps in Angular Services for lookups reduces transformation complexity from O(N*M) to O(N+M) during list rendering.
**Action:** Prioritize batching sequential queries into aggregate SQL where possible. Use lookup Maps for cross-referenced data in Angular signals to keep component rendering lightning fast.
