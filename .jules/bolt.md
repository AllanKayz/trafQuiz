## 2026-02-10 - [Database & Angular Optimization]
**Learning:** Foundational performance wins in this codebase involve adding missing database indexes on foreign keys in SQLite and optimizing Angular component templates by moving expensive filtering/mapping into computed signals.
**Action:** Always check the initial schema for missing indexes on foreign keys. In Angular, avoid calling methods that perform filtering/mapping directly in templates; use computed signals or memoization instead.

## 2026-02-12 - [SQLite WAL & Signal Initialization]
**Learning:** SQLite performance in Electron is significantly improved by enabling WAL mode and synchronous=NORMAL via Sequelize's afterConnect hook, but the hook must correctly handle the asynchronous nature of the sqlite3 driver using Promises. Additionally, redundant IPC calls on startup can be avoided by relying on Angular signal effects for initial data loading, provided the initialization logic is correctly ordered.
**Action:** Always return a Promise in Sequelize afterConnect hooks for SQLite PRAGMAs. Ensure signal effects are registered before setting the initial state to avoid double-fetching or missing the initial reaction.
