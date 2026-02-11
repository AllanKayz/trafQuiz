## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-11 - [SQLite Concurrency & Angular Signal Refactoring]
**Learning:** Enabling WAL (Write-Ahead Logging) mode in SQLite via Sequelize hooks (`afterConnect`) provides a measurable boost to write performance and allows concurrent reads. Refactoring legacy Angular getters to `computed` signals prevents redundant computations during change detection cycles.
**Action:** Always enable WAL mode for SQLite in Electron apps for better responsiveness. Prioritize converting template-bound getters to `computed` signals when the underlying state is already a signal.
