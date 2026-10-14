# TRAFQUIZ 2.0 — MODERNIZATION & ARCHITECTURE AUDIT

**Date**: February 2026
**Repository**: `https://github.com/AllanKayz/trafQuiz`
**Target Branch**: `dev-executable`
**Author**: Senior Software Architect / Engineering Team

---

## 1. Executive Summary

This document presents a comprehensive system audit of **TrafQuiz**, a desktop Driving School Management and Driver Learning Platform built with Electron, Angular 21, Node.js, and SQLite (Sequelize ORM). The objective of this audit is to map the current system architecture, identify security and performance risks, outline technical debt, and establish an incremental modernization plan for TRAFQUIZ 2.0 without breaking existing database schemas or user functionality.

---

## 2. Current System Architecture & Technology Stack

### 2.1 Technology Stack
* **Desktop Wrapper**: Electron `^28.3.3`
* **Frontend Framework**: Angular `^21.0.6` (Standalone component architecture, Angular Signals, RxJS)
* **UI Components & Styling**: Angular Material `^21.0.5`, Angular CDK `^21.0.5`, Bootstrap 5 (partial transition to Material)
* **Charts & PDF**: `chart.js` `^4.5.1`, `ng2-charts` `^8.0.0`, `jspdf` `^4.0.0`
* **Desktop Runtime & Backend**: Node.js CJS, `sqlite3` `^5.1.7`, `sequelize` `^6.37.7`, `umzug` `^3.8.2`
* **Security & Auth**: `bcryptjs` `^3.0.3`, custom session store in memory/Electron IPC state
* **Calendar & Utilities**: `angular-calendar` `^0.32.0`, `date-fns` `^4.1.0`

### 2.2 System Architecture Layers
```text
Angular 21 UI (Renderer Process)
  ├── Components (Admin, Student, Instructor, Finance, Fleet, Exams)
  └── TraffiquizService (Bridge wrapper calling window.electronAPI)
        │
        ▼ (IPC Invoke / Handle Channel)
Preload API (src-electron/preload.js)
        │
        ▼
Electron Main Process (src-electron/main.js & ipc-handlers/*)
  ├── Authentication & Authorization Checks
  ├── IPC Handlers (Auth, Dashboard, Exams, Students, Finance, Vehicles)
  ├── Umzug Database Migration Runner (src-electron/migration-runner.js)
  └── Sequelize Models & Direct SQLite Wrapper (src-electron/database.js, db.js)
        │
        ▼
Local SQLite Persistence (trafquiz_app.db / trafquiz_test.db)
```

---

## 3. Detailed Component Analysis

### 3.1 Electron Layer Architecture
* **Entry Point**: `src-electron/main.js`
* **Window Configuration**: Frameless window (`frame: false`), context isolation enabled (`contextIsolation: true`), Node integration disabled (`nodeIntegration: false`).
* **IPC Isolation**: Exposes API via `src-electron/preload.js` through `window.electronAPI`.
* **Weaknesses**:
  1. Content Security Policy (CSP) is missing or not enforced in `main.js` / `index.html`.
  2. Direct IPC channel allowlist/schema validation is lacking; raw arguments are passed to IPC handlers.
  3. External link handling (`shell.openExternal`) is not sandboxed or restricted.

### 3.2 Frontend Architecture (Angular 21)
* **Architecture**: Standalone components with Angular Signals for reactive state (`questionsSignal`, `currentExamSignal`, `activeUserSignal`).
* **Routing**: Defined in `src/app/app.routes.ts` with guards (`AuthGuard`, `RoleGuard`).
* **Services**: `TraffiquizService` centralizes Electron IPC execution for Angular components.
* **Weaknesses**:
  1. Bootstrap styles remain mixed with Angular Material components.
  2. Lack of runtime schema validation on data received from Electron or user inputs.
  3. UI feedback during background operations (like exam auto-saving or database backup) needs enhancement.

### 3.3 Database Structure & Migrations
* **Engine**: SQLite persistent storage.
* **ORM & Tooling**: Sequelize `^6.37.7` with Umzug migration runner (`src-electron/migration-runner.js`).
* **Existing Models**: `User`, `Student`, `Instructor`, `Vehicle`, `Lesson`, `Exam`, `Question`, `Category`, `Payment`, `SystemLicense`, `ExamTimeframe`, `Message`.
* **Migrations**:
  - `20260120000000-initial-schema.js` (Initial table schemas)
  - `20260210000000-add-performance-indexes.js` (Composite indexes on `payments`, `student_exams`, `lessons`)
* **Weaknesses**:
  1. Missing key enterprise entities: `Organizations`, `Branches`, `AuditLogs`, `UserSessions`, `ExamAttemptAnswers`, `QuestionVersions`, `Invoices`, `PaymentAllocations`, `VehicleMaintenance`, `Notifications`, `SyncEvents`.
  2. Financial monetary figures use standard floating-point numbers in some queries rather than minor units (cents).
  3. Missing soft-delete support on critical master tables.

### 3.4 Security & Authentication Mechanisms
* **Current Hashing**: `bcryptjs` with salt rounds.
* **Session Management**: Session state held in memory within Electron process handlers; no persistent session table (`UserSessions`) for cross-restart validation or multi-device revocation.
* **RBAC**: Handled in IPC handlers via `sessionUser` context and in Angular via `RoleGuard`.
* **Weaknesses**:
  1. `bcryptjs` should be transparently upgraded to `Argon2id` on login while preserving backward compatibility for existing password hashes.
  2. Password complexity requirements and rate limiting / lockout on brute force attempts are missing.
  3. Need centralized audit logging (`AuditLogs`) for privileged operations (e.g., student deletion, payment reversals, license changes).

### 3.5 Licensing System
* **Current Implementation**: Offline system license model in `system_license.js` and `license_key.js`.
* **Weaknesses**:
  1. System license verification relies on local DB state that can be easily modified if unencrypted/unsigned.
  2. Needs cryptographic signature verification (public/private key signing) for offline activation and product tier enforcement (Basic, Professional, Enterprise).

---

## 4. Risks & Technical Debt

| Area | Identification / Risk Description | Severity | Impact |
| :--- | :--- | :--- | :--- |
| **Security** | Lack of Content Security Policy and lack of input validation schemas on IPC channels. | High | Potential IPC injection or remote payload execution. |
| **Data Integrity** | Lack of persistent attempt-level answer storage (`ExamAttemptAnswers`) during exams; state is lost if app crashes abruptly without recovery. | High | Loss of student examination progress. |
| **Data Architecture** | Lack of multi-branch / multi-school scoping fields (`organizationId`, `branchId`). | Medium | Prevents multi-school scaling or cloud synchronization. |
| **Finance Integrity** | Floating-point calculations for currency amounts instead of integer minor units (cents). | Medium | Potential precision/rounding errors in financial reporting. |
| **Testing** | Limited E2E test coverage for full student-to-exam-to-payment lifecycle. | Medium | Potential regressions during feature refactoring. |

---

## 5. Backward Compatibility & Data Preservation Strategy

1. **Database Schema Continuity**: All existing tables (`users`, `students`, `instructors`, `vehicles`, `lessons`, `exams`, `questions`, `payments`, `system_licenses`) will be preserved. New fields will be added via Umzug migrations with default values.
2. **Password Auto-Upgrade**: Existing `bcrypt` password hashes will continue to authenticate successfully. Upon successful login, passwords will be re-hashed using `Argon2id` and updated in the database transparently.
3. **Data Integrity Guarantee**: Historical student records, examination scores, and financial transactions will never be truncated or modified destructively.

---

## 6. Target Modernization Roadmap (TRAFQUIZ 2.0)

1. **Phase 1: Electron Security & IPC Hardening**: CSP headers, context isolation enforcement, IPC allowlisting & Zod runtime validation.
2. **Phase 2: Database Extensions & Migration Pipeline**: Umzug migrations for `Organizations`, `Branches`, `AuditLogs`, `UserSessions`, `ExamAttemptAnswers`, `QuestionVersions`, `Invoices`, `PaymentAllocations`, `VehicleMaintenance`, `Notifications`, `SyncEvents`.
3. **Phase 3: Domain Services & RBAC**: Domain-driven refactoring of IPC logic into service modules; granular permission checks (`students.view`, `finance.create_payment`, etc.).
4. **Phase 4: Password Security & Session Engine**: `Argon2id` auto-upgrade, `UserSessions` tracking, inactivity timeout, brute-force rate limiting.
5. **Phase 5: Examination System 2.0 & Crash Recovery**: Local SQLite exam state persistence (`ExamAttemptAnswers`), question versioning, learning analytics & readiness metrics.
6. **Phase 6: Domain Modules Modernization**: Multi-branch support, Fleet maintenance tracking, Financial minor-unit accounting & PDF invoicing, Scheduling conflict resolution.
7. **Phase 7: Offline Sync Queue, Backup & Restore**: Local `SyncQueue` and `SyncEvents` infrastructure, AES-256 encrypted database backup/restore wizard, DB integrity checks.
8. **Phase 8: UX/UI Polish & Accessibility**: Modernized Angular Material components, Signals state management, Dark/Light theme toggle, WCAG 2.2 AA accessibility.
9. **Phase 9: Automated Testing & CI/CD**: Integration test suite, Playwright E2E workflows, GitHub Actions workflow for cross-platform builds.
10. **Phase 10: Documentation & Release Packaging**: Technical documentation updates (`ARCHITECTURE.md`, `SECURITY.md`, `DATABASE.md`, etc.), cross-platform packaging configs.
