# TrafQuiz - Technical Documentation & Architecture Specification

## 1. Executive Summary

### High-Level Purpose
**TrafQuiz** is a comprehensive, offline-first desktop application designed to digitize, automate, and streamline all operational workflows for driving schools. Built on a hybrid architecture leveraging **Electron** and **Angular 21**, TrafQuiz integrates student practice examinations, instructor scheduling, vehicle fleet management, and financial transaction tracking into a unified management ecosystem.

### Business Domain & Target Usage Scenarios
TrafQuiz addresses the core operational demands of driving academies through role-tailored interfaces:
- **Student Exam & Learning Management**: Interactive, timed practice tests with immediate grading, detailed score breakdowns, and historical performance tracking across official testing categories (e.g., Rules of the Road, Road Signs, Vehicle Mechanics, and Driving Safety).
- **Instructor Operations**: Visual lesson scheduling, student progress reporting, availability management, and direct vehicle issue reporting.
- **Administrative Oversight**: Comprehensive dashboard analytics, user account lifecycle management, financial accounting (revenue tracking, instructor salary processing, expense logging, digital receipt/PDF generation), fleet maintenance monitoring, and automated examination capacity allocation.

### Architectural Style
- **Cross-Platform Desktop Application**: Operates primarily as an Electron desktop app with IPC (Inter-Process Communication) bridging a node-based main process backend to an Angular single-page frontend.
- **Offline-First Storage**: Local embedded SQLite database ensures complete offline availability without requiring external cloud connectivity.
- **Optional Hybrid Backend**: Includes an Express REST API and Socket.io sidecar server (`server.js`) capable of providing web access and real-time messaging capabilities across local networks.

---

## 2. Technology Stack

### Frontend (Renderer Process)
- **Framework**: Angular 21 (Modern Standalone Component architecture, Reactive Forms, Angular Signals state management).
- **UI Component Libraries**: Angular Material 21 (`@angular/material`, `@angular/cdk`), Bootstrap 5 CSS framework.
- **Data Visualization & Calendar**: `Chart.js` 4.5 (`ng2-charts` 8.0), `angular-calendar` 0.32 (`date-fns` 4.1).
- **Client Utilities & PDF Generation**: `jsPDF` 4.0 (for client-side digital receipts and invoice PDF generation), RxJS 7.8, `zone.js` 0.16.

### Backend (Main Process)
- **Runtime**: Electron 28.3 (Node.js runtime handling native system integration, frameless window controls, and IPC channels).
- **Database Engine**: SQLite 3 (managed via `sqlite3` driver 5.1.7).
- **ORM & Query Engine**: Sequelize 6.37 (Object-Relational Mapping with raw SQL fallback for high-performance aggregations).
- **Database Migrations**: Umzug 3.8 (programmatic, sequential database schema migration manager).
- **Security & Cryptography**: `bcryptjs` 3.0 (secure salt-based password hashing).
- **Sidecar Web Server**: Express 4.18, `cors` 2.8, `body-parser` 1.20, `socket.io` (for optional HTTP API and real-time WebSocket communication).

### Database & Storage
- **Primary Engine**: SQLite 3 (`trafquiz_app.db` for production/development; `trafquiz_test.db` during automated testing execution).
- **Indexing & Performance Strategy**: SARGable range queries, composite indexes on critical temporal and foreign key columns, and conditional aggregation queries.

### Infrastructure & Tooling
- **Build System**: Angular CLI 21 (`@angular/cli`), TypeScript 5.9.
- **Packaging & Distribution**: Electron Forge (`@electron-forge/cli` with `@electron-forge/maker-zip` and `@electron-forge/plugin-auto-unpack-natives`).
- **Development Tooling**: `concurrently` (simultaneous Angular development server and Electron startup), `wait-on`.

---

## 3. Directory & Folder Structure

```text
trafQuiz/
├── .jules/                       # Agent memory logs and performance journal
├── public/                       # Static public application assets (e.g., logo icons)
├── scripts/                      # Performance benchmarking and automation scripts
│   └── benchmark-performance.js # Baseline execution & latency testing script
├── src/                          # Angular 21 Frontend Source (Renderer Process)
│   ├── index.html                # Main application HTML entry template
│   ├── main.ts                   # Angular application bootstrapper
│   ├── styles.css                # Global stylesheet and custom component overrides
│   └── app/                      # Application core module logic
│       ├── app.component.ts      # Root component with custom window controls
│       ├── app.routes.ts         # Client-side router configuration & role guards
│       ├── app.config.ts         # Angular providers (animations, HTTP interceptors)
│       ├── auth.interceptor.ts   # Client-side authentication interceptor
│       ├── loading.service.ts    # Global spinner/loading state service
│       ├── traffiquiz.service.ts # Core service wrapping IPC calls with Signals
│       ├── admin/                # Admin sub-views (Finances, Fleet, User Mgmt)
│       ├── alert/                # Reusable toast and alert notification components
│       ├── components/           # Specific feature components (Exams, Lessons)
│       ├── dashboard/            # Role-specific dashboard layouts (Admin, Instructor)
│       ├── exam/                 # Student practice test execution UI
│       ├── login/                # Auth login, signup, and password reset forms
│       ├── models/               # TypeScript interfaces and data models
│       ├── pagenotfound/         # 404 router fallback view
│       ├── services/             # Helper services (form configurations, dialogs)
│       └── widgets/              # Shared UI widgets (Data tables, stat cards, modals)
├── src-electron/                 # Electron Main Process Source (Backend)
│   ├── main.js                   # Main entry point, BrowserWindow lifecycle, IPC loading
│   ├── preload.js                # Context-isolated secure preload bridge (`electronAPI`)
│   ├── database.js               # Sequelize ORM initialization & connection management
│   ├── db.js                     # Direct raw SQL execution wrapper using sqlite3
│   ├── migration-runner.js       # Database schema migration runner using Umzug
│   ├── server.js                 # Express HTTP server & Socket.io implementation
│   ├── questions.json            # Seed dataset containing ~1,600 driving questions
│   ├── ipc-handlers/             # Modular IPC backend controllers
│   │   ├── admin-handler.js      # Metadata, certs, packages, and specializations
│   │   ├── auth-handler.js       # User login, registration, password reset, account CRUD
│   │   ├── dashboard-handler.js  # High-performance analytical metric aggregations
│   │   ├── exam-handler.js       # Practice test evaluation, history, slot allocation
│   │   ├── finances-handler.js   # Income, expense, salary processing, transactions
│   │   ├── instructors-handler.js# Instructor CRUD and availability tracking
│   │   ├── lessons-handler.js    # Driving lesson scheduling and logging
│   │   ├── messages-handler.js   # In-app messaging and media upload handling
│   │   ├── misc-handler.js       # Question category settings & durations
│   │   ├── questions-handler.js  # Question bank management & statistics
│   │   ├── reports-handler.js    # Student progress reports & score trajectories
│   │   ├── students-handler.js   # Student enrollment & profile management
│   │   └── vehicles-handler.js   # Fleet vehicle status, logs, and maintenance
│   ├── migrations/               # Database schema and index migrations
│   ├── models/                   # Sequelize data models
│   ├── routes/                   # Express REST API routes (for web sidecar mode)
│   └── utils/                    # Shared backend utilities (UTC date utilities)
├── tests/                        # Automated integration test suite
│   └── integration/              # Database & IPC handler integration tests
├── angular.json                  # Angular CLI build & workspace configuration
├── forge.config.js               # Electron Forge build and packaging configuration
├── package.json                  # Core dependencies, environment scripts, metadata
└── tsconfig.json                 # TypeScript compiler options
```

### Key Folder Responsibilities
- **`src/app/services/traffiquiz.service.ts`**: The central communication hub for the frontend. It abstracts IPC invocations behind strongly typed JavaScript methods and exposes reactive Angular `Signal` state for real-time UI updates.
- **`src-electron/ipc-handlers/`**: Core backend application logic organized into functional domain handlers. Each file listens for explicit IPC invocation channels and interacts with Sequelize models or raw SQLite database queries.
- **`src-electron/models/`**: Houses Sequelize entity definitions specifying database column mappings, data types, and primary key relationships.
- **`src-electron/migrations/`**: Contains sequential JavaScript database migrations executed automatically on startup by Umzug to apply schema changes and performance indexes.

---

## 4. System Architecture & Data Flow

```text
  +-----------------------------------------------------------------------+
  |                           ELECTRON RENDERER                           |
  |                                                                       |
  |   +-----------------------+               +-----------------------+   |
  |   |   Angular 21 Views    | ------------> | TraffiquizService     |   |
  |   | (Components, Signals) | <------------ | (IPC Communication)   |   |
  |   +-----------------------+               +-----------------------+   |
  +-------------------------------------------------------|---------------+
                                                          | window.electronAPI.invoke()
                                                          v
  +-----------------------------------------------------------------------+
  |                           ELECTRON MAIN PROCESS                       |
  |                                                                       |
  |   +-----------------------+               +-----------------------+   |
  |   |     Preload Bridge    | ------------> |  IPC Handler Router   |   |
  |   |     (preload.js)      |               | (ipcMain.handle)      |   |
  |   +-----------------------+               +-----------------------+   |
  |                                                       |               |
  |                                                       v               |
  |                                           +-----------------------+   |
  |                                           | Sequelize Models /    |   |
  |                                           | Raw SQL Aggregations  |   |
  |                                           +-----------------------+   |
  |                                                       |               |
  +-------------------------------------------------------|---------------+
                                                          v
                                              +-----------------------+
                                              |    SQLite Database    |
                                              |  (trafquiz_app.db)    |
                                              +-----------------------+
```

### Request / Response Workflow
1. **User Action**: User triggers an event (e.g., submitting an exam, fetching dashboard analytics) in an Angular component.
2. **Service Invocation**: The component invokes a method on `TraffiquizService`.
3. **IPC Channel Transmission**: `TraffiquizService` calls `window.electronAPI.invoke(channel, data)`, which passes data across Electron's context isolation boundary via `preload.js`.
4. **Backend Handler Execution**: Electron's main process catches the channel event via `ipcMain.handle(channel, handler)` in `src-electron/ipc-handlers/`.
5. **Database Operation**: The IPC handler interacts with SQLite using Sequelize ORM methods or raw SQL queries (`db.js`).
6. **Data Return**: Result sets or success/error responses are returned asynchronously to the Angular Renderer and exposed through Angular Signals or Promises.

### Authentication & Authorization Mechanism
- **Password Hashing**: User credentials are stored securely using `bcryptjs` with a salt factor of 10.
- **Session Management**: Upon successful login (`login` IPC channel), the user profile and role details are maintained in memory in `TraffiquizService` using Angular `Signal<User | null>`.
- **Role-Based Access Control (RBAC)**:
  - Client-side navigation guards (`authGuard`, `adminGuard`) enforce role permissions (`admin`, `instructor`, `student`) on Angular router routes.
  - IPC backend channels validate payload parameters and filter data queries according to user roles (e.g., student-specific progress or instructor-specific scheduled lessons).

---

## 5. Database Schema & Data Models

The SQLite database structure consists of the following core tables managed via Sequelize ORM models and Umzug migrations:

```text
                      +-------------------+
                      |       users       |
                      +-------------------+
                      | PK: id            |
                      | username, password|
                      | role, fullName    |
                      +-------------------+
                       /        |        \
                      /         |         \
                     v          v          v
     +-------------------+ +------------+ +-------------------+
     |     students      | | instructors| |     messages      |
     +-------------------+ +------------+ +-------------------+
     | PK: id            | | PK: id     | | PK: id            |
     | FK: user_id       | | FK: user_id| | FK: sender_id     |
     | dob, status       | | spec, status| | FK: recipient_id  |
     +-------------------+ +------------+ +-------------------+
       |          |              |
       |          v              v
       |    +-----------+ +------------+
       |    | lessons   | | vehicles   |
       |    +-----------+ +------------+
       |    | FK: stud. | | PK: id     |
       |    | FK: inst. | | license... |
       |    | FK: veh.  | +------------+
       |    +-----------+
       v
 +---------------+      +-------------------+
 | student_exams | ---> |       exams       |
 +---------------+      +-------------------+
 | FK: student_id|      | PK: id            |
 | FK: exam_id   |      | FK: category_id   |
 +---------------+      +-------------------+
                                  |
                                  v
                        +-------------------+
                        |    categories     |
                        +-------------------+
                        | PK: id, name      |
                        +-------------------+
```

### Table Specifications

#### `users`
- Stores authentication credentials and general user profiles.
- **Columns**: `id` (INTEGER, PK, Auto-increment), `username` (STRING, Unique), `password` (STRING), `email` (STRING), `role` (ENUM: `'admin'`, `'instructor'`, `'student'`), `fullName` (STRING), `phone` (STRING), `license_no` (STRING), `resetToken` (STRING), `resetTokenExpiry` (DATE).

#### `students`
- Extends `users` for student-specific details.
- **Columns**: `id` (INTEGER, PK), `user_id` (INTEGER, FK -> `users.id`), `date_of_birth` (STRING), `address` (TEXT), `status` (STRING: `'active'`, `'inactive'`, `'graduated'`), `enrolled_date` (STRING).

#### `instructors`
- Extends `users` for instructor profiles.
- **Columns**: `id` (INTEGER, PK), `user_id` (INTEGER, FK -> `users.id`), `specialization` (STRING), `hire_date` (STRING), `status` (STRING: `'active'`, `'on_leave'`, `'inactive'`).

#### `categories`
- Question taxonomy and practice domain categories.
- **Columns**: `id` (INTEGER, PK), `name` (STRING, Unique), `description` (TEXT).

#### `questions`
- Question bank for practice tests and exams.
- **Columns**: `id` (INTEGER, PK), `category_id` (INTEGER, FK -> `categories.id`), `question_text` (TEXT), `options` (JSON/TEXT array), `correct_answer` (INTEGER), `explanation` (TEXT).

#### `exams`
- Practice examination templates and schedules.
- **Columns**: `id` (INTEGER, PK), `title` (STRING), `category_id` (INTEGER, FK -> `categories.id`), `start_time` (STRING/DATETIME), `duration_minutes` (INTEGER), `total_questions` (INTEGER), `passing_score` (INTEGER).

#### `student_exams`
- Execution logs and grading results for exams completed by students.
- **Columns**: `id` (INTEGER, PK), `student_id` (INTEGER, FK -> `students.id`), `exam_id` (INTEGER, FK -> `exams.id`), `score` (INTEGER), `passed` (BOOLEAN), `answers` (JSON/TEXT), `completed_at` (DATETIME).

#### `lessons`
- Practical driving and theoretical classroom lessons.
- **Columns**: `id` (INTEGER, PK), `student_id` (INTEGER, FK -> `students.id`), `instructor_id` (INTEGER, FK -> `instructors.id`), `vehicle_id` (INTEGER, FK -> `vehicles.id`), `type` (STRING: `'driving'`, `'theory'`), `status` (STRING: `'scheduled'`, `'completed'`, `'cancelled'`), `start_time` (DATETIME), `end_time` (DATETIME), `notes` (TEXT).

#### `vehicles`
- Fleet inventory and status records.
- **Columns**: `id` (INTEGER, PK), `make` (STRING), `model` (STRING), `year` (INTEGER), `license_plate` (STRING, Unique), `status` (STRING: `'active'`, `'maintenance'`, `'out_of_service'`), `fuel_level` (INTEGER), `last_maintenance` (DATE).

#### `payments`
- Financial ledger recording income, salaries, and operating expenses.
- **Columns**: `id` (INTEGER, PK), `user_id` (INTEGER, FK -> `users.id`), `type` (STRING: `'income'`, `'salary'`, `'expense'`), `amount` (FLOAT), `payment_date` (DATETIME), `payment_method` (STRING), `status` (STRING: `'paid'`, `'pending'`, `'failed'`), `description` (TEXT).

#### `messages`
- Internal messaging and notifications.
- **Columns**: `id` (INTEGER, PK), `conversation_id` (STRING), `sender_id` (INTEGER, FK -> `users.id`), `recipient_id` (INTEGER, FK -> `users.id`), `content` (TEXT), `attachment_url` (STRING), `is_read` (BOOLEAN), `created_at` (DATETIME).

### Key Performance Indexes
To ensure optimal query execution times across large datasets, the following indexes are declared in database migrations:
- `payments_type_date_idx`: Composite index on `payments(type, payment_date)`.
- `payments_date_idx`: Index on `payments(payment_date)`.
- `student_exams_student_date_idx`: Composite index on `student_exams(student_id, completed_at)`.
- `lessons_instructor_time_idx`: Composite index on `lessons(instructor_id, start_time)`.
- `exams_start_time_idx`: Index on `exams(start_time)`.
- `questions_answer_idx`: Index on `questions(correct_answer)`.

---

## 6. API Endpoints & Routes Catalog

### Primary Desktop IPC Channels (`ipcRenderer.invoke` / `ipcMain.handle`)

| Category | Channel Name | Auth / Role Required | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | `login` | Public | Authenticates user credentials and returns user profile & role. |
| **Authentication** | `logout` | Authenticated | Terminates user session. |
| **Authentication** | `get-user-info` | Authenticated | Retrieves profile information for a user ID. |
| **Authentication** | `update-user` | Authenticated | Updates user profile details (name, email, phone). |
| **Authentication** | `update-user-password` | Authenticated | Updates password for a given user ID. |
| **Authentication** | `forgot-password` | Public | Generates password reset token for a username. |
| **Authentication** | `reset-password` | Public | Resets password using valid reset token. |
| **User Management** | `get-all-users` | Admin | Fetches list of all registered users in the system. |
| **User Management** | `add-user` | Admin | Registers a new user account. |
| **User Management** | `delete-user` | Admin | Deletes user account and associated student/instructor records. |
| **Dashboard** | `get-dashboard-stats` | Authenticated | Computes aggregated role-specific dashboard KPIs. |
| **Students** | `get-students` | Admin / Instructor | Retrieves student records with optional search filters. |
| **Students** | `add-student` | Admin | Creates new student profile and linked user account. |
| **Students** | `update-student` | Admin | Updates existing student profile data. |
| **Students** | `delete-student` | Admin | Removes student profile from system. |
| **Instructors** | `get-instructors` | Authenticated | Lists all registered driving instructors. |
| **Instructors** | `add-instructor` | Admin | Adds a new driving instructor profile. |
| **Instructors** | `update-instructor` | Admin | Modifies instructor specialization or status. |
| **Instructors** | `delete-instructor` | Admin | Deletes an instructor record. |
| **Questions** | `get-question-stats` | Admin | Returns count metrics per question category. |
| **Questions** | `get-questions` | Authenticated | Fetches paginated question bank items. |
| **Questions** | `add-question` | Admin | Creates a new practice question. |
| **Questions** | `update-question` | Admin | Updates question text, options, or answer key. |
| **Questions** | `bulk-add-questions` | Admin | Imports multiple question records in bulk. |
| **Questions** | `delete-question` | Admin | Removes question from question pool. |
| **Exams** | `get-exam-questions` | Student | Generates randomized test question set for an exam. |
| **Exams** | `get-exams` | Authenticated | Lists upcoming or available exam schedules. |
| **Exams** | `add-exam` | Admin | Creates new exam schedule template. |
| **Exams** | `update-exam` | Admin | Modifies exam details or passing thresholds. |
| **Exams** | `delete-exam` | Admin | Cancels and removes an exam schedule. |
| **Exams** | `get-exam-statistics` | Admin | Computes global exam attempt and pass-rate metrics. |
| **Exams** | `get-exam-timeframe` | Authenticated | Retrieves configured exam operating timeframe settings. |
| **Exams** | `set-exam-timeframe` | Admin | Updates exam operating timeframe settings. |
| **Exams** | `auto-allocate-exams` | Admin | Automatically schedules exam slots based on capacity. |
| **Lessons** | `get-lessons` | Authenticated | Retrieves driving lessons matching date/role filters. |
| **Lessons** | `add-lesson` | Admin / Student | Books a new theory or practical driving lesson. |
| **Lessons** | `update-lesson` | Admin / Instructor | Modifies lesson status (completed, cancelled, notes). |
| **Lessons** | `delete-lesson` | Admin | Cancels and removes lesson booking. |
| **Finances** | `get-financial-stats` | Admin | Aggregates income, expenses, and pending salaries. |
| **Finances** | `get-transactions` | Admin | Fetches paginated ledger transactions with filters. |
| **Finances** | `add-payment` | Admin | Records new student fee or tuition payment. |
| **Finances** | `update-payment-status` | Admin | Updates payment status (`paid`, `pending`, `failed`). |
| **Finances** | `process-salary` | Admin | Logs instructor salary payout transaction. |
| **Finances** | `record-expense` | Admin | Records fleet or operational expense entry. |
| **Vehicles** | `get-vehicles` | Authenticated | Retrieves vehicle inventory and operational statuses. |
| **Vehicles** | `add-vehicle` | Admin | Registers new vehicle in driving school fleet. |
| **Vehicles** | `update-vehicle` | Admin | Modifies vehicle details or maintenance status. |
| **Vehicles** | `delete-vehicle` | Admin | Removes vehicle from active fleet inventory. |
| **Vehicles** | `report-vehicle-issue` | Instructor | Submits maintenance or mechanical fault report. |
| **Vehicles** | `log-vehicle-activity` | Instructor | Logs fuel refill or mileage usage entry. |
| **Reports** | `get-student-progress` | Admin / Student | Generates historical exam score trajectories. |
| **Messages** | `get-conversations` | Authenticated | Fetches active chat conversations for user. |
| **Messages** | `get-messages` | Authenticated | Retrieves message history for conversation ID. |
| **Messages** | `send-message` | Authenticated | Dispatches internal message to recipient. |
| **Messages** | `mark-messages-read` | Authenticated | Marks received messages in conversation as read. |
| **Messages** | `upload-attachment` | Authenticated | Saves chat media attachment to disk. |
| **Window Controls** | `window:minimize` | Public | Minimizes native Electron browser window. |
| **Window Controls** | `window:maximize` | Public | Toggles maximization state of native window. |
| **Window Controls** | `window:close` | Public | Closes application window. |

---

### Sidecar REST API Endpoints (`server.js`)

| HTTP Method | Route / Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | None | Returns backend status check (`{ status: "ok" }`). |
| `POST` | `/api/auth/login` | None | Authenticates web user credentials. |
| `GET` | `/api/students` | Admin | Retrieves student listing via HTTP. |
| `POST` | `/api/students` | Admin | Creates student record via HTTP. |
| `GET` | `/api/instructors` | Authenticated | Retrieves instructor listing via HTTP. |
| `GET` | `/api/questions` | Authenticated | Retrieves question bank via HTTP. |
| `GET` | `/api/lessons` | Authenticated | Fetches lesson schedule via HTTP. |
| `GET` | `/api/vehicles` | Authenticated | Fetches fleet status via HTTP. |

---

## 7. Environment Variables & Configuration

TrafQuiz uses environment configurations to adapt runtime modes:

| Variable Name | Purpose | Default Value | Sensitivity Level |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Controls execution mode (`development`, `test`, `production`). | `development` | Low |
| `PORT` | Defines Express REST sidecar server listening port. | `3000` | Low |

### Database File Path Resolution
Database path selection automatically resolves based on `NODE_ENV`:
- **Test Mode (`NODE_ENV=test`)**: Targets `src-electron/trafquiz_test.db`.
- **Development Mode (`NODE_ENV=development`)**: Targets `src-electron/trafquiz_app.db`.
- **Production Mode**: Resolves to native OS user data directory via Electron's `app.getPath('userData')/trafquiz_app.db`.

---

## 8. Local Setup & Development Guide

### Prerequisites
- **Node.js**: Version 18.x or higher (v21+ recommended).
- **npm**: Version 9.x or higher.
- **C++ Compiler Tools** (for native `sqlite3` bindings rebuilds if necessary): Python 3.x and Build Tools for your OS (e.g., `build-essential` on Linux or Visual Studio C++ Build Tools on Windows).

### Sequential Setup Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url> trafQuiz
   cd trafQuiz
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Concurrent Development Mode**
   Runs Angular CLI via `ng serve` and launches Electron dev window with hot reload:
   ```bash
   npm run electron:dev
   ```

4. **Build Production Desktop Bundle**
   Compiles Angular production bundle and runs Electron:
   ```bash
   npm run electron:start
   ```

5. **Package Executable with Electron Forge**
   ```bash
   npx electron-forge package
   ```

---

## 9. Key Features & Workflows

### 1. Student Practice Examination System
- **Randomized Question Draw**: When a student launches an exam, `get-exam-questions` selects questions across designated categories.
- **Timed Execution & Real-Time Grading**: Frontend monitors remaining exam duration. Upon completion, answers are validated and score metrics are written to `student_exams`.
- **Progress Trajectories**: Score history and pass rates are calculated via `get-student-progress` using SQL window functions for progress charts.

### 2. Fleet & Vehicle Issue Monitoring
- **Real-Time Fleet Status**: Instructors and Admins view vehicle availability (`active`, `maintenance`, `out_of_service`).
- **Issue Reporting Workflow**: Instructors log maintenance requests (`report-vehicle-issue`), updating vehicle flags and notifying administrators.

### 3. Financial Management & Digital Receipts
- **Ledger Tracking**: Tracks income (tuition payments), expenses (fuel/repairs), and salary payouts.
- **PDF Generation**: Calculates transaction records and generates digital receipts locally using `jsPDF`.

---

## 10. Testing, Quality & Tooling

### Test Execution Commands

- **Run Frontend Unit Tests**
  ```bash
  npm test
  ```

- **Run Integration Test Suite**
  ```bash
  NODE_ENV=test node tests/integration/run-tests.js
  ```

- **Run IPC Performance Benchmark Suite**
  ```bash
  node scripts/benchmark-performance.js
  ```

### Performance & Optimization Verification
- **Query SARGability**: SQL queries on temporal ranges (`payments`, `student_exams`, `lessons`) utilize `Op.gte` and `Op.lt` boundary parameters to maximize SQLite index hits (`SEARCH TABLE USING INDEX`).
- **Aggregation Optimization**: High-frequency dashboard stats combine summary aggregations into single conditional queries (`SUM(CASE WHEN ...)`), reducing round-trips and IPC overhead.
