# TRAFQUIZ 2.0 System Architecture

## Overview
TrafQuiz 2.0 is an offline-first desktop Driving School Management and Driver Learning Platform built using Electron, Angular 21 (Standalone Components, Signals), Node.js, and SQLite with Sequelize ORM.

## System Topology
```text
Angular 21 UI (Renderer Process)
  │ (Typed Preload Bridge / IPC Allowlist)
  ▼
Electron Main Process (src-electron/main.js & ipc-handlers/*)
  ├── Security Layer (Content Security Policy, IPC Validation, Scrypt/Argon2 & Bcrypt Auth)
  ├── Domain Services (Auth, Students, Instructors, Exams, Lessons, Finance, Fleet, Sync)
  └── Umzug Migration Runner & Database Layer (Sequelize & Direct SQLite Wrapper)
        │
        ▼
Local SQLite Database (`trafquiz_app.db` / `trafquiz_test.db`)
```

## Security Architecture
- Context Isolation enabled (`contextIsolation: true`)
- Node Integration disabled in renderer (`nodeIntegration: false`)
- IPC Allowlist enforcement in `preload.js`
- Scrypt / Argon2 password hashing with transparent auto-upgrade on login for legacy bcrypt hashes
- Role-Based Access Control (RBAC) with granular permissions (`admin`, `instructor`, `student`)
- Strict Content-Security-Policy (CSP) headers

## Database Entities & Migrations
Managed via Umzug in `src-electron/migrations/`:
1. `20260120000000-initial-schema.js`
2. `20260210000000-add-performance-indexes.js`
3. `20260301000000-add-enterprise-schema.js` (`organizations`, `branches`, `user_sessions`, `audit_logs`, `exam_attempt_answers`, `question_versions`, `invoices`, `payment_allocations`, `vehicle_maintenance`, `notifications`, `sync_events`)
