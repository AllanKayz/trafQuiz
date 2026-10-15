# 🚗 TrafQuiz — Driving School Management System

<p align="center">
  <img src="docs/assets/screenshot/admin-dashboard.png" alt="TrafQuiz Admin Dashboard" width="100%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <a href="#-key-features"><img src="https://img.shields.io/badge/Angular-21.0-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 21"></a>
  <a href="#-technical-stack"><img src="https://img.shields.io/badge/Electron-28.3-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron"></a>
  <a href="#-technical-stack"><img src="https://img.shields.io/badge/SQLite-3.0-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"></a>
  <a href="#-technical-stack"><img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.style=for-the-badge" alt="License"></a>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Role Capabilities Matrix](#-role-capabilities-matrix)
- [Application Screenshots Gallery](#-application-screenshots-gallery)
- [Architecture & Technical Stack](#-architecture--technical-stack)
- [Installation & Setup](#-installation--setup)
- [Database & Migrations](#-database--migrations)
- [Security & Authentication](#-security--authentication)
- [Performance & Optimization](#-performance--optimization)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚗 Overview

**TrafQuiz** is a comprehensive, cross-platform desktop management application engineered specifically for driving schools, instructors, and student drivers. Built with **Electron** and **Angular 21** and powered by a local, high-performance **SQLite** database, TrafQuiz eliminates paper-based administrative friction.

Whether handling student enrollments, organizing theoretical exam banks, scheduling driving lessons, calculating financial revenues, or monitoring fleet vehicle health, TrafQuiz delivers a seamless desktop application experience.

---

## ✨ Key Features

- 🔑 **Multi-Role Access Control (RBAC)**: Dedicated interfaces tailored for **Administrators**, **Instructors**, and **Students**.
- 📝 **Intelligent Practice Exam Suite**: Categorized practice exams with timed limits, automated scoring, and question review.
- 📅 **Dynamic Lesson Scheduling & Auto-Allocation**: Calendar-based scheduling for practical and theoretical lessons.
- 💵 **Financial Management & Digital Receipts**: Revenue/expense tracking, salary payments, auto-generated PDF receipts via `jsPDF`.
- 🚘 **Fleet & Maintenance Management**: Vehicle registration, maintenance activity logs, fuel level monitoring, and issue reporting.
- 📊 **Real-time Analytics & Progress Dashboards**: Visual charts powered by `Chart.js` & `ng2-charts` tracking student progress and revenues.
- 🔒 **Enterprise-Grade Security**: Scrypt-based password hashing, IPC channel isolation, and automated audit logging.

---

## ⚡ Role Capabilities Matrix

| Feature / Workspace | 👑 Administrator | 👨‍🏫 Instructor | 🎓 Student |
| :--- | :---: | :---: | :---: |
| **System Dashboard & Global Metrics** | ✅ Full | 🟡 Limited | 🟡 Personal |
| **User & Staff Account Management** | ✅ Full | ❌ No | ❌ No |
| **Question Bank & Category Editor** | ✅ Full | 👁️ Read-Only | ❌ No |
| **Exam Duration & Timeframe Control** | ✅ Full | ❌ No | ❌ No |
| **Interactive Practice Exams** | 👁️ Preview | 👁️ Preview | ✅ Full |
| **Lesson Booking & Calendar** | ✅ Full | ✅ Schedule View | ✅ Book Slots |
| **Vehicle Fleet & Maintenance Reports** | ✅ Full | 🟡 Issue Logging | ❌ No |
| **Financial Accounting & Invoicing** | ✅ Full | ❌ No | 🟡 Payment Log |
| **Download PDF Digital Receipts** | ✅ Full | ❌ No | ✅ Full |
| **System Settings & Dark Theme** | ✅ Full | ✅ Full | ✅ Full |

---

## 🖼️ Application Screenshots Gallery

### 🔒 Authentication
<p align="center">
  <img src="docs/assets/screenshot/login-screen.png" alt="Login Screen" width="80%" style="border-radius: 6px; margin-bottom: 12px;" />
</p>

---

### 👑 Administrator Workspace

<details open>
<summary><b>Click to expand/collapse Administrator Views</b></summary>

| Admin Dashboard | Student Management |
| :---: | :---: |
| <img src="docs/assets/screenshot/admin-dashboard.png" width="400"/> | <img src="docs/assets/screenshot/students-management.png" width="400"/> |

| Instructors Management | Exams Management |
| :---: | :---: |
| <img src="docs/assets/screenshot/instructors-management.png" width="400"/> | <img src="docs/assets/screenshot/exams-management.png" width="400"/> |

| Question Bank Editor | Financials & Digital Receipts |
| :---: | :---: |
| <img src="docs/assets/screenshot/questions-bank.png" width="400"/> | <img src="docs/assets/screenshot/financials-invoicing.png" width="400"/> |

| Fleet & Vehicle Maintenance | Interactive Lesson Calendar |
| :---: | :---: |
| <img src="docs/assets/screenshot/fleet-management.png" width="400"/> | <img src="docs/assets/screenshot/scheduling-calendar.png" width="400"/> |

</details>

---

### 👨‍🏫 Instructor Workspace

<details>
<summary><b>Click to expand/collapse Instructor Views</b></summary>

| Instructor Schedule Calendar | Vehicle Health & Issue Reporting |
| :---: | :---: |
| <img src="docs/assets/screenshot/instructor-schedule.png" width="400"/> | <img src="docs/assets/screenshot/vehicle-status-report.png" width="400"/> |

</details>

---

### 🎓 Student Workspace

<details>
<summary><b>Click to expand/collapse Student Views</b></summary>

| Practice Exam Module | Progress & Score Analytics |
| :---: | :---: |
| <img src="docs/assets/screenshot/student-practice-exam.png" width="400"/> | <img src="docs/assets/screenshot/student-progress-reports.png" width="400"/> |

</details>

---

## 🏗️ Architecture & Technical Stack

TrafQuiz adopts a clean, decoupled architecture separating the desktop process lifecycle from the Angular application tier.

```text
               +-------------------------------------------------------+
               |                  Electron Main Process                 |
               |  (Node.js, SQLite, IPC Main Handlers, Umzug Migrations)|
               +---------------------------+---------------------------+
                                           |
                                 IPC Channels (invoke / handle)
                                           |
               +---------------------------v---------------------------+
               |                 Electron Preload Script               |
               |         (Context Isolation & Context Bridge)          |
               +---------------------------+---------------------------+
                                           |
                                     window.electronAPI
                                           |
               +---------------------------v---------------------------+
               |                Angular 21 Frontend Application        |
               |   (Signals, Angular Material, Tailwind, Chart.js)     |
               +-------------------------------------------------------+
```

### Stack Summary

- **Frontend Framework**: Angular 21 (Modern Standalone Components & Signals)
- **Desktop Wrapper**: Electron 28
- **Database & ORM**: SQLite3 with Sequelize ORM & raw SQL performance optimizations
- **Schema Migrations**: Umzug (Automated execution on app launch)
- **UI & Styling**: Angular Material, Bootstrap 5, Tailwind CSS, & Angular Calendar
- **PDF Generation**: `jsPDF` for financial receipt export

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AllanKayz/trafQuiz.git
   cd trafQuiz
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Mode (Concurrent Angular + Electron)**
   ```bash
   npm run electron:dev
   ```

4. **Production Build & Launch**
   ```bash
   npm run electron:start
   ```

---

## 🗄️ Database & Migrations

TrafQuiz uses an embedded **SQLite** database managed via Sequelize and Umzug migrations.

- **Development DB**: `src-electron/trafquiz_app.db`
- **Test DB**: `src-electron/trafquiz_test.db`
- **Automatic Migration**: Migrations run automatically when starting the application main process.

<details>
<summary><b>View Key Database Tables</b></summary>

- `users` (id, username, password, role, email, ...)
- `students` (id, user_id, firstName, lastName, phone, address, status, ...)
- `instructors` (id, user_id, firstName, lastName, license_number, experience, salary, availability, ...)
- `vehicles` (id, registration, make, model, year, status, fuel_level, instructor_id, ...)
- `questions` (id, question, option_a, option_b, option_c, answer, category_id, photo, ...)
- `exams` (id, title, date, duration, pass_score, ...)
- `student_exams` (id, student_id, exam_id, score, status, completed_at, ...)
- `payments` (id, student_id, amount, payment_date, type, method, status, ...)

</details>

---

## 🔒 Security & Authentication

- **Scrypt Password Hashing**: Modern scrypt password hashing with automatic transparent hashing upgrade for legacy bcrypt records.
- **Strict IPC Security**: IPC communication is bounded by strict channel validation in `src-electron/preload.js`.
- **Role-Based Guards**: Frontend route protection and backend handler permission checks prevent unauthorized cross-role data access (IDOR protection).
- **Audit Logging**: Sensitive actions (logins, password resets, financial creations) are recorded in the system audit logs.

---

## ⚡ Performance & Optimization

- **SARGable Database Queries**: Date filtering uses range queries (`>= start AND < end`) to enable full SQLite B-tree index coverage (`COVERING INDEX`).
- **Composite Performance Indexes**: High-volume queries are accelerated with composite indexes (`payments_type_date_idx`, `student_exams_student_date_idx`, `lessons_instructor_time_idx`).
- **Data Contract & Column Aliasing**: Efficient SQL column projections reduce overhead during multi-record fetches.

---

## 🧪 Testing & Quality Assurance

TrafQuiz maintains an automated integration test suite verifying IPC handler logic, database interactions, authentication workflows, and security boundary isolation.

To run the integration tests:

```bash
NODE_ENV=test node tests/integration/run-tests.js
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m 'Add amazing feature'`.
4. Run integration tests to ensure all checks pass.
5. Push to your branch and open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full details.
