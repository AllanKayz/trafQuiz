# Traffquiz

An application for administering traffic quiz tests.

## Project Structure

The project is an Angular application with a standard structure. The main application code is located in the `src/app` directory.

### Core Components

*   `AppComponent`: The root component of the application.
*   `LoginComponent`: Handles user authentication.
*   `DashboardComponent`: The main view for logged-in users.
*   `ExamComponent`: Displays the quiz.

### Services

*   `TraffiquizService`: Manages the application's data and state, including user authentication, data fetching, and state management using Angular Signals.

## Getting Started

1.  Install the dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm start
    ```
3.  Open your browser to `http://localhost:4200/`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Admin utilities

New admin endpoints are available for development convenience:

- POST `/trafQuiz/public/api/admin/seed-lessons` — seeds sample lessons; accepts JSON `{ "count": <number> }` to seed multiple items.
- GET `/trafQuiz/public/api/admin/check-lessons` — quick health check, returns `{ count: number, db: boolean }`.

These endpoints require a `token` query parameter for minimal access control (e.g., `?token=YOUR_TOKEN`), consistent with other admin routes.
