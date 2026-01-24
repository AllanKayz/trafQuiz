# TrafQuiz - Driving School Management System

A comprehensive, cross-platform desktop application for managing driving school operations. Built with **Electron** and **Angular**, TrafQuiz provides a modern solution for student exams, instructor scheduling, fleet management, and financial tracking.

## 🚗 Overview

TrafQuiz streamlines driving school workflows by providing tailored interfaces for three key roles: **Administrators**, **Instructors**, and **Students**. It replaces traditional paper-based systems with a digital ecosystem that handles everything from enrollment and payments to practice exams and vehicle maintenance logs.

## ✨ Key Features

### For Administrators

- **Dashboard**: Real-time overview of active students, revenue, and system alerts.
- **Metadata Management**: Centralized control over **Question Categories**, **Certifications**, **Specializations**, and **Exam Settings**.
- **User Management**: enroll students, hire instructors, and manage access credentials.
- **Financials**: Track revenue, process payments, pay salaries, and record expenses. Includes **Digital Receipts** and PDF generation.
- **Fleet Management**: Track vehicle status, maintenance logs, and fuel levels.
- **Lesson Scheduling**: Organize theory and practical lessons with auto-seeding capabilities.

### For Instructors

- **My Schedule**: View upcoming lessons and student appointments.
- **Live Reporting**: Log student progress and grading after lessons.
- **Vehicle Status**: Report vehicle issues (maintenance/fuel) directly to admin.

### For Students

- **Practice Exams**: Take timed, categorized practice tests (Rules of the Road, Signs, etc.) with instant feedback.
- **Lesson Booking**: View available slots and book driving lessons.
- **Financial History**: View payment history and download receipts.
- **Progress Tracking**: Monitor exam scores and learning curve over time.

## 🏗️ Technical Stack

- **Framework**: Electron (Desktop Wrapper)
- **Frontend**: Angular 21 (Modern Web Technologies)
- **Backend/Database**: Node.js (IPC Main Process) + SQLite
- **Styling**: Angular Material + Bootstrap 5 + Custom CSS
- **State Management**: Angular Signals

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **npm** (v9+)

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url> trafQuiz
    cd trafQuiz
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Run Development Mode**
    Runs Angular via `ng serve` and Electron concurrently.

    ```bash
    npm run electron:dev
    ```

4. **Build for Production**
    Generates a production-ready build in the `dist/` folder.

    ```bash
    npm run electron:start
    ```

## 📂 Project Structure

```text
trafQuiz/
├── src/                  # Angular Frontend
│   ├── app/
│   │   ├── components/   # Feature-based Components (Admin, Finances, Exams)
│   │   ├── services/     # Data Services (TraffiquizService, FormConfig)
│   │   └── widgets/      # Reusable UI Widgets (Tables, Forms)
├── src-electron/         # Electron Main Process
│   ├── main.js           # App Entry Point
│   ├── db.js             # SQLite Database Connection
│   ├── ipc-handlers/     # Backend Logic (CRUD, Auth, Exams)
│   └── models/           # Sequelize Models (Category, User, etc.)
└── package.json          # Project Configuration
```

## 📝 Database & Customization

The application uses a local **SQLite** database (`trafquiz_app.db`).

- **Schema**: Defined in `src-electron/sqlite_schema.sql`.
- **Initialization**: Automatically created on first run if missing.
- **Seeding**: Admin tools allow seeding random lesson data for testing.

To reset the database during development, simply delete the `.db` file and restart the application.

## 🔒 Security & Auth

- **Role-Based Access Control (RBAC)**: Distinct views and guards for Admin, Instructor, and Student.
- **Secure Password Hashing**: Uses `bcryptjs` for storing user credentials.
- **IPC Isolation**: Frontend communicates with database strictly via secure Electron `invoke/handle` channels.

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Version**: 1.0.0
**Last Updated**: January 2026
