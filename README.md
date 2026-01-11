# TrafQuiz - Driving School Management System

A comprehensive web application for managing driving school operations, including student management, instructor scheduling, exam administration, and financial tracking.

## 🚗 Overview

TrafQuiz is a full-stack driving school management system that provides role-based interfaces for administrators, instructors, and students. The application streamlines the entire driving school workflow from student enrollment to exam administration and progress tracking.

## ✨ Key Features

### For Administrators

- **Dashboard** - Real-time metrics and system overview
- **Student Management** - Enrollment, progress tracking, and user management
- **Instructor Management** - Staff assignments, certifications, and specializations
- **Exam Management** - Question bank management and exam configuration
- **Lesson Scheduling** - Auto-allocation and manual scheduling tools
- **Vehicle Fleet Management** - Track vehicles, assignments, and maintenance
- **Financial Management** - Transaction tracking, revenue analytics, and package management
- **Reporting & Analytics** - Performance metrics and business insights
- **User Access Control** - Role-based permissions and password management
- **Messaging System** - Internal communication platform

### For Instructors

- **Schedule Management** - Daily lesson calendar and availability
- **Student Progress Tracking** - Monitor assigned students and add progress notes
- **Vehicle Status** - Assigned vehicle information and status
- **Performance Reports** - Track teaching effectiveness
- **Messaging** - Communication with admin and students

### For Students

- **Practice Exams** - Interactive quiz system with timed tests
- **Lesson Booking** - Schedule and manage driving lessons
- **Progress Dashboard** - View completion status and scores
- **Payment Management** - Track payments and select packages
- **Performance Reports** - Detailed analytics and exam history
- **Messaging** - Communication with instructors and admin

## 🏗️ Architecture

### Frontend

- **Framework**: Angular 21.x
- **UI Library**: Angular Material + Bootstrap 5
- **State Management**: Angular Signals (reactive state)
- **Styling**: CSS with Material Design theming
- **Key Service**: `TraffiquizService` - Centralized state and API communication

### Backend

- **Language**: PHP 8.x
- **Architecture**: MVC pattern with custom routing
- **Database**: MySQL (via XAMPP)
- **API**: RESTful JSON API
- **Security**: Session-based authentication, password hashing, SQL injection protection

### Project Structure

```
trafQuiz/
├── public/                    # Public web root
│   └── api/                   # Backend API
│       ├── index.php         # API router
│       └── .htaccess         # Apache config
├── src/                       # PHP backend source
│   ├── Controllers/          # API controllers
│   ├── Models/               # Data models
│   ├── Core/                 # Core utilities (Router, Database, Auth)
│   └── Middleware/           # CORS, Rate limiting
├── src/                       # Angular frontend source
│   ├── app/
│   │   ├── components/       # Feature components
│   │   ├── services/         # Angular services
│   │   ├── models/           # TypeScript interfaces
│   │   └── widgets/          # Reusable UI components
│   └── assets/               # Static assets
├── scripts/                   # Database scripts
└── dist/                      # Production build output
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **XAMPP** (Apache + MySQL + PHP 8.x)
- **Composer** (PHP dependency manager)

### Installation

1. **Clone the repository**

   ```bash
   cd c:\xampp\htdocs
   git clone <repository-url> trafQuiz
   cd trafQuiz
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   composer install
   ```

4. **Configure the database**
   - Start XAMPP (Apache + MySQL)
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Create a new database named `traffiquiz`
   - Import the database schema:

     ```bash
     mysql -u root -p traffiquiz < traffiquiz_normalized.sql
     ```

5. **Configure the backend**
   - Update database credentials in `src/Core/Config.php` if needed
   - Default configuration uses:
     - Host: `localhost`
     - User: `root`
     - Password: (empty)
     - Database: `traffiquiz`

6. **Update API URL (if needed)**
   - Frontend API URL is configured in `src/app/traffiquiz.service.ts`
   - Default: `http://localhost:84/trafQuiz/public/api/`
   - Adjust port number based on your XAMPP configuration

### Running the Application

1. **Start XAMPP**
   - Ensure Apache and MySQL services are running
   - Access on port 84 (or your configured port)

2. **Start the Angular development server**

   ```bash
   npm start
   ```

   The application will open at `http://localhost:4200/`

3. **Access the application**
   - **Frontend**: `http://localhost:4200/`
   - **Backend API**: `http://localhost:84/trafQuiz/public/api/`

### Default Login Credentials

Check your database for existing users or create new ones:

- **Admin**: username determined by database
- **Instructor**: username determined by database
- **Student**: username determined by database
- **Guest**: Direct access to exam without login

## 📚 API Documentation

Comprehensive API documentation is available in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

### Key Endpoints

- `POST /login` - User authentication
- `GET /exam` - Fetch exam questions
- `GET /students` - Retrieve all students (admin)
- `GET /instructors` - Retrieve all instructors
- `GET /lessons` - Get available lessons
- `GET /vehicles` - Vehicle fleet information
- `GET /finances/transactions` - Financial transaction history
- `GET /students/progress` - Student progress tracking
- `POST /payments/process` - Process payment transactions

### Admin Utilities

Development-friendly endpoints for testing:

- `POST /admin/seed-lessons?token=YOUR_TOKEN` - Seed sample lessons
- `GET /admin/check-lessons?token=YOUR_TOKEN` - Health check

## 🛠️ Build & Deployment

### Development Build

```bash
npm run build
```

Outputs to `dist/` directory

### Production Build

```bash
npm run build --configuration=production
```

Optimized build with minification and tree-shaking

### Watch Mode (Development)

```bash
npm run watch
```

Continuous rebuild on file changes

## 🎨 Features in Detail

### Role-Based Dashboard

Each user role sees a customized dashboard with relevant widgets and quick actions:

- **Dynamic Widgets**: Context-aware metrics and statistics
- **Quick Actions**: Role-specific shortcuts
- **Responsive Design**: Mobile-friendly interface

### Exam System

- **Timed Tests**: Configurable exam duration
- **Question Bank**: Categorized questions with images
- **Progress Tracking**: Flagging and review capabilities
- **Score Analytics**: Performance metrics and history

### Messaging System

- **Conversations**: Thread-based messaging
- **Real-time Updates**: Notifications for new messages
- **User-to-User**: Direct communication between roles

### Theming

- **Light/Dark Mode**: System preference detection
- **Material Design**: Consistent UI components
- **Custom Themes**: Configurable color schemes

## 🔒 Security Features

- **Authentication**: Session-based user authentication
- **Password Hashing**: PHP `password_hash()` with `PASSWORD_DEFAULT`
- **SQL Injection Protection**: Prepared statements throughout
- **Rate Limiting**: API request throttling (100 req/min per IP)
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Server-side validation for all endpoints

## 🐛 Development Tools

### Debug Mode

Check database connectivity and API status at runtime

### Browser DevTools

- Angular DevTools extension for component inspection
- Network tab for API debugging

### Testing

```bash
npm test
```

Runs unit tests via Karma + Jasmine

## 📝 Database Schema

Key tables:

- `users` - User authentication and roles
- `students` - Student profiles and enrollment
- `instructors` - Instructor information and certifications
- `questions` - Exam question bank
- `lessons` - Lesson schedules and assignments
- `vehicles` - Fleet management
- `payments` - Transaction records
- `packages` - Service packages and pricing
- `messages` - Internal messaging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Angular Team for the excellent framework
- Angular Material for UI components
- Bootstrap for responsive utilities
- XAMPP for local development environment

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: January 2026
