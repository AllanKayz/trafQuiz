import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AlertComponent } from './alert/alert.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiResponse, Question, Student, studentApiResponse, Instructor, instructorApiResponse } from './trafquiz';

export interface StudentProgress {
  studentId: string;
  totalTests: number;
  averageScore: number;
  completionRate: number;
  recentActivity: {
    quizTitle: string;
    score: number;
    date: Date;
    status: 'pass' | 'fail';
  }[];
  monthlyPerformance: {
    month: string;
    score: number;
  }[];
}

/**
 * Service responsible for managing the application's data and state.
 * This service handles user authentication, data fetching for questions, students, and instructors,
 * and provides a centralized location for application state using Angular Signals.
 */
@Injectable({
  providedIn: 'root'
})
export class TraffiquizService {

  private http: HttpClient = inject(HttpClient);
  private url = 'http://localhost:84/trafQuiz/public/api/';
  public alert = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Convert user data to signal for reactive user state management.
  private userSignal = signal<any>(null);
  /** A computed signal that exposes the current user's data. */
  public currentUser = computed(() => this.userSignal());

  /**
   * Shows a snackbar notification.
   * @param message The message to display.
   * @param type The type of notification ('success', 'error', or 'info').
   * @param duration The duration in milliseconds (default: 4000).
   */
  public showNotification(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 4000) {
    let panelClass = '';
    switch (type) {
      case 'success': panelClass = 'success-snackbar'; break;
      case 'error': panelClass = 'error-snackbar'; break;
      case 'info': panelClass = 'info-snackbar'; break;
    }

    this.snackBar.open(message, 'Close', {
      duration: duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  /**
   * Shows a snackbar confirmation.
   * @param message The message to display.
   * @param action The action label (e.g., 'DELETE').
   * @returns An observable that emits when the action is clicked.
   */
  public showConfirm(message: string, action: string = 'CONFIRM'): Observable<void> {
    return this.snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    }).onAction();
  }

  // Writable signals for managing collections of data.
  /** A signal that holds the array of quiz questions. */
  public questionsSignal = signal<Question[]>([]);
  /** A signal that holds the array of students. */
  public studentsSignal = signal<any[]>([]);
  /** A signal that holds the array of instructors. */
  public instructorsSignal = signal<Instructor[]>([]);
  /** A signal that holds the array of available packages. */
  public packagesSignal = signal<any[]>([]);
  /** A signal that holds the array of instructor specializations. */
  public specializationsSignal = signal<any[]>([]);
  /** A signal that holds the array of instructor certifications. */
  public certificationsSignal = signal<any[]>([]);

  /** A signal for the exam duration in seconds. */
  examDuration = signal<number>(300); //default 10 minutes

  /** Signal for user's theme preference. */
  public themePreference = signal<'light' | 'dark' | 'system'>('system');

  /** Signal for the effectively active theme (true for dark, false for light). */
  public darkMode = signal<boolean>(false);

  // Computed signals for derived state from the main data signals.
  /** A computed signal that returns the total number of questions. */
  public totalQuestions = computed(() => this.questionsSignal().length);
  /** A computed signal that returns the number of flagged questions. */
  public flaggedQuestions = computed(() => this.questionsSignal().filter(q => q.flagged).length);
  /** A computed signal that returns the total number of students. */
  public totalStudents = computed(() => this.studentsSignal().length);
  /** A computed signal that returns the total number of instructors. */
  public totalInstructors = computed(() => this.instructorsSignal().length);

  /** Defines the menu items for different user roles. */
  private menus = {
    admin: ['Dashboard', 'Instructors', 'Students', 'Exams', 'Questions', 'Lessons', 'Scheduling', 'Vehicles', 'Finances', 'Reports', 'Messages', 'UserAccess', 'Settings'],
    instructor: ['Dashboard', 'Schedule', 'Students', 'Vehicle-Status', 'Messages', 'Settings'],
    student: ['Dashboard', 'Exam', 'Lessons', 'Reports', 'Messages', 'Payments', 'Settings'],
    icons: { dashboard: 'dashboard', questions: 'help_outline', instructors: 'person', exams: 'assignment', students: 'group', vehicles: 'directions_car', reports: 'bar_chart', settings: 'settings', scheduling: 'event', schedule: 'calendar_month', 'vehicle-status': 'car_repair', messages: 'mail', finances: 'payments', useraccess: 'admin_panel_settings', lessons: 'school', 'lessons-admin': 'admin_panel_settings', exam: 'quiz', payments: 'account_balance_wallet' }
  }

  /** Configuration for the widgets displayed on the dashboard for different user roles. */
  private widgetsConfig = {
    admin: [
      { title: 'Total Students', data: Math.floor(Math.random() * 50) + 100, footer: 'Active' },
      { title: 'Monthly Revenue', data: '$' + (Math.floor(Math.random() * 1000) + 2000), footer: 'Current month' },
      { title: 'Exams Today', data: Math.floor(Math.random() * 5) + 2, footer: 'Scheduled' },
      { title: 'Pass Rate', data: '78%', footer: 'Overall' },
      { title: 'System Alerts', data: 2, footer: 'Requires Attention', type: 'warn' }
    ],
    instructor: [
      { title: 'Next Lesson', data: '14:00', footer: 'Today' },
      { title: 'Pending Reports', data: 3, footer: 'To Review' },
      { title: 'Vehicle Status', data: 'OK', footer: 'Assigned Car' },
      { title: 'Students', data: 12, footer: 'Active' }
    ],
    student: [
      { title: 'Next Lesson', data: 'Wed, 10:00 AM', footer: 'With John Doe' },
      { title: 'Days to Exam', data: 14, footer: 'Countdown' },
      { title: 'Recent Score', data: '85%', footer: 'Road Signs Quiz' },
      { title: 'Completed', data: '6/10', footer: 'Lessons' }
    ]
  }

  /** Configuration for Quick Actions. */
  private quickActionsConfig = {
    admin: [
      { label: 'Add User', icon: 'person_add', route: '/dashboard/useraccess' },
      { label: 'View Finances', icon: 'payments', route: '/dashboard/finances' },
      { label: 'Manage Fleet', icon: 'directions_car', route: '/dashboard/vehicles' },
      { label: 'System Settings', icon: 'settings', route: '/dashboard/settings' }
    ],
    instructor: [
      { label: 'My Schedule', icon: 'calendar_today', route: '/dashboard' },
      { label: 'Grade Student', icon: 'fact_check', route: '/dashboard/students' },
      { label: 'Log Issue', icon: 'report_problem', route: '/dashboard/vehicles' },
      { label: 'Message Admin', icon: 'mail', route: '/dashboard/messages' }
    ],
    student: [
      { label: 'Start Exam', icon: 'play_circle', route: '/exam' },
      { label: 'Book Lesson', icon: 'schedule', route: '/dashboard/lessons' },
      { label: 'My Progress', icon: 'bar_chart', route: '/dashboard/reports' },
      { label: 'Make Payment', icon: 'credit_card', route: '/dashboard/payments' }
    ]
  }

  /** Configuration for the widgets displayed on the questions panel. */
  questionWidgetConfig = {
    admin: [
      { title: '100', data: 'Total Questions', footer: '' },
      { title: '11', data: 'Categories', footer: '' },
      { title: '50', data: 'Reviewed', footer: '' }
    ]
  }

  /** Configuration for the widgets displayed on the students panel. */
  studentWidgetConfig = {
    admin: [
      { title: '100', data: 'Total Students', footer: '' },
      { title: '10', data: 'Active Students', footer: '' },
      { title: '100', data: 'Pending Approvals', footer: '' },
    ]
  }

  /** Configuration for the widgets displayed on the instructors panel. */
  instructorWidgetConfig = {
    admin: [
      { title: '100', data: 'Total Instructors', footer: '' },
      { title: '10', data: 'Available Instructors', footer: '' },
      { title: '100', data: 'Job Applications', footer: '' },
    ]
  }

  /** A computed signal that returns the widgets for the current user's role. */
  public userWidgets = computed(() => {
    const user = this.userSignal();
    const role: 'admin' | 'instructor' | 'student' = user?.role || 'student';
    return this.widgetsConfig[role] || [];
  });

  public userQuickActions = computed(() => {
    const user = this.userSignal();
    const role: 'admin' | 'instructor' | 'student' = user?.role || 'student';
    return this.quickActionsConfig[role] || [];
  });

  /** A computed signal that returns the question widgets for the current user's role. */
  public userQuestionWidgets = computed(() => {
    const user = this.userSignal();
    return user ? this.questionWidgetConfig[user.role as keyof typeof this.questionWidgetConfig] : [];
  });

  /** A computed signal that returns the student widgets for the current user's role. */
  public userStudentWidgets = computed(() => {
    const user = this.userSignal();
    return user ? this.studentWidgetConfig[user.role as keyof typeof this.studentWidgetConfig] : [];
  });

  /** A computed signal that returns the instructor widgets for the current user's role. */
  public userInstructorWidgets = computed(() => {
    const user = this.userSignal();
    return user ? this.instructorWidgetConfig[user.role as keyof typeof this.instructorWidgetConfig] : [];
  });

  /** A computed signal that transforms the questions data into a format suitable for display in a table. */
  public tableQuestions = computed(() => {
    return this.questionsSignal().map(q => ({
      id: q.id,
      question: q.question,
      options: q.options.join(', '),
      correct: q.options[q.correct],
      flagged: q.flagged ? 'Yes' : 'No',
      hasImage: q.hasImage ? 'Yes' : 'No'
    }))
  });

  /** A computed signal that transforms the students data into a format suitable for display in a table. */
  public tableStudents = computed(() => {
    return this.studentsSignal().map(student => ({
      id: student.id,
      name: student.firstName + ' ' + student.lastName,
      firstName: student.firstName,
      lastName: student.lastName,
      username: '',
      email: student.email,
      phone: student.phone,
      address: student.address,
      enrollmentDate: new Date(student.enrollmentDate),
      status: student.status
    }))
  });

  /** A computed signal that transforms the instructors data into a format suitable for display in a table. */
  public tableInstructors = computed(() => {
    return this.instructorsSignal().map(instructor => ({
      id: instructor.id,
      name: instructor.firstName + ' ' + instructor.lastName,
      username: '',
      email: instructor.email,
      phone: instructor.phone,
      availability: instructor.availability,
      specialization: instructor.specialization,
      experience: instructor.experience,
      certified: instructor.certification ? 'Yes' : 'No'
    }))
  });

  /** A computed signal that transforms the packages data into a format suitable for use in form controls. */
  public packages = computed(() => {
    return this.packagesSignal().map(p => ({
      value: p.id,
      label: p.package + `- ${p.amount}`
    }))
  });

  /** A computed signal that transforms the specializations data into a format suitable for use in form controls. */
  public specializations = computed(() => {
    return this.specializationsSignal().map(s => ({
      value: s.id,
      label: s.specialization
    }))
  });

  /** A computed signal that transforms the certifications data into a format suitable for use in form controls. */
  public certifications = computed(() => {
    return this.certificationsSignal().map(c => ({
      value: c.id,
      label: c.certification
    }))
  });

  constructor() {
    this.initializeUser();
    this.initializeTheme();
  }

  /**
   * Returns the raw user object as stored in localStorage (if any).
   */
  public getRawUser(): any {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Updates the user's profile locally and emits the new state.
   */
  public updateProfile(payload: any): Observable<any> {
    const raw = this.getRawUser() || {};
    const updated = { ...raw, ...payload };
    localStorage.setItem('user', JSON.stringify(updated));
    this.userSignal.set(this.formatUser(updated));

    return this.http.post(this.url + 'updateuser', updated).pipe(
      tap((res) => res),
      catchError((err) => {
        console.warn('Profile update failed; saved locally', err);
        return of(updated);
      })
    );
  }

  public updatePreferences(prefs: any) {
    const stored = JSON.parse(localStorage.getItem('appSettings') || '{}');
    const merged = { ...stored, ...prefs };
    localStorage.setItem('appSettings', JSON.stringify(merged));

    if (merged.theme) {
      this.themePreference.set(merged.theme);
      this.syncTheme();
    }

    return merged;
  }

  private initializeTheme() {
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    if (settings.theme) {
      this.themePreference.set(settings.theme);
    }

    this.syncTheme();

    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (this.themePreference() === 'system') {
        this.darkMode.set(e.matches);
      }
    });
  }

  private syncTheme() {
    const pref = this.themePreference();
    if (pref === 'system') {
      this.darkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      this.darkMode.set(pref === 'dark');
    }
  }

  /**
   * Initializes the user state by reading user data from local storage.
   */
  private initializeUser() {
    const userJson = localStorage.getItem('user');

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.userSignal.set(this.formatUser(user));
        if (user.role === 'admin' || user.role === 'instructor') {
          this.fetchQuestions();
          this.fetchStudents();
          this.fetchInstructors();
          this.getPackages();
          this.getSpecializations();
          this.getCertifications();
        }
      } catch (e) {
        const data = {
          title: `Error`,
          message: `Error parsing user data: ${e}`,
          type: 'error',
          buttons: [
            { text: 'Close', value: 'close', color: 'warn' }
          ]
        };

        this.showNotification(`Error parsing user data: ${e}`, 'error');
      }
    }
  }

  /**
   * Formats the raw user data from the API into a more usable format for the application.
   * @param user The raw user data.
   * @returns The formatted user object.
   */
  private formatUser(user: any): any {
    switch (user['role']) {
      case 'admin':
        return {
          username: user['username'],
          role: user['role'],
          sidebar: this.menus.admin,
          sidebarIcons: this.menus.icons,
          widgets: [],
          data: []
        };
      case 'instructor':
        return {
          username: user['username'],
          role: user['role'],
          sidebar: this.menus.instructor,
          sidebarIcons: this.menus.icons,
          widgets: [],
          data: []
        };
      case 'student':
        return {
          username: user['username'],
          role: user['role'],
          sidebar: this.menus.student,
          sidebarIcons: this.menus.icons,
          widgets: [],
          data: []
        };
      default:
        return null;
    }
  }

  /**
   * Logs a user in by sending their credentials to the API.
   * @param payload The user's login credentials.
   * @returns An observable that emits the API response.
   */
  login(payload: any): Observable<any> {
    return this.http.post(this.url + 'login', payload).pipe(
      tap((response: any) => {
        if (response.status == 200) {
          localStorage.setItem('user', JSON.stringify(response));
          this.userSignal.set(this.formatUser(response));
        } else {
          this.showNotification(`Fatal error: ${response.message}`, 'error');
        }
      })
    );
  }

  /**
   * Logs the current user out.
   */
  logout() {
    localStorage.removeItem('user');
    this.userSignal.set(null);
  }

  /**
   * Requests a password reset token for the specified username.
   */
  forgotPassword(username: string): Observable<any> {
    return this.http.post(this.url + 'forgot-password', { username });
  }

  /**
   * Resets the user's password using a reset token.
   */
  resetPassword(payload: any): Observable<any> {
    return this.http.post(this.url + 'reset-password', payload);
  }

  /**
   * Fetches the exam questions from the API.
   * @param token The user's authentication token.
   */
  fetchExam(token: any) {
    this.http.get<ApiResponse[]>(this.url + 'exam?token=' + token.trim()).subscribe({
      next: (data) => {
        this.questionsSignal.set(
          data.map((item) => this.transformQuestion(item))
        );
      },
      error: (error) => {
        this.showNotification(`Error Fetching Exam Data: ${error.message || error.statusText}`, 'error');
        this.questionsSignal.set([]); // Reset on error
      }
    });
  }

  /**
   * Transforms the raw question data from the API into the `Question` interface format.
   * @param item The raw question data.
   * @returns The transformed question.
   */
  private transformQuestion(item: ApiResponse): Question {
    const options = [
      item.option_a.trim(),
      item.option_b.trim(),
      item.option_c.trim()
    ];

    return {
      id: item.id,
      question: item.question.trim(),
      options: options,
      correct: options.indexOf(item.answer),
      hasImage: this.isNotEmpty(item.photo),
      image: item.photo,
      flagged: false
    };
  }

  /**
   * Checks if a string is not null, undefined, or empty.
   * @param str The string to check.
   * @returns `true` if the string is not empty, `false` otherwise.
   */
  isNotEmpty(str: string | null | undefined): boolean {
    return str !== null && str !== undefined && str !== '';
  }

  /**
   * Saves the user's quiz responses to local storage.
   * @param responses The user's responses.
   */
  saveResponses(responses: any) {
    localStorage.setItem('quizResponses', JSON.stringify(responses));
    // Update signal if needed (example)
    // this.responsesSignal.set(responses);
  }

  /**
   * Fetches the exam duration from the API.
   * @returns An observable that emits the exam duration in seconds.
   */
  fetchExamDuration(): Observable<number> {
    return this.http.get<any>(this.url + 'time').pipe(map(response => {
      const minutes = parseInt(response.period || '30', 10);
      return minutes * 60; // Convert to seconds
    }),
      tap(duration => this.examDuration.set(duration)),
      catchError(() => {
        const fallback = 1800; // 30 minutes fallback
        this.examDuration.set(fallback);
        return of(fallback);
      })
    );
  }

  // Questions CRUD
  /**
   * Fetches all questions from the API.
   */
  fetchQuestions() {
    this.http.get<ApiResponse[]>(this.url + 'questions').subscribe({
      next: (questions) => {
        this.questionsSignal.set(questions.map((item) => this.transformQuestion(item)));
        this.questionWidgetConfig.admin[0].title = this.totalQuestions().toString();
      },
      error: (error) => {
        this.showNotification(`Error fetching questions: ${error.error?.message || error.statusText}`, 'error');
        this.questionsSignal.set([]);
      }
    });
  }

  /**
   * Deletes a question.
   * @param questionId The ID of the question to delete.
   * @returns An observable that emits the API response.
   */
  deleteQuestion(questionId: number): Observable<any> {
    return this.http.post(this.url + 'questions/delete', { id: questionId });
  }

  /**
   * Adds a new question.
   * @param question The question to add.
   * @returns An observable that emits the API response.
   */
  addQuestion(question: any): Observable<any> {
    return this.http.post(this.url + 'questions', question);
  }

  /**
   * Updates an existing question.
   * @param question The question to update.
   * @returns An observable that emits the API response.
   */
  updateQuestion(question: any): Observable<any> {
    return this.http.post(this.url + 'questions/update', question);
  }

  // Students CRUD
  /**
   * Fetches all students from the API.
   */
  fetchStudents() {
    this.http.get<studentApiResponse[]>(this.url + 'students').subscribe({
      next: (students) => {
        //this.studentsSignal.set([students]);
        this.studentsSignal.set(students.map(item => item));
        this.widgetsConfig.admin[0].data = this.totalStudents().toString();
        this.studentWidgetConfig.admin[0].title = this.totalStudents().toString();
      },
      error: (error) => {
        this.showNotification(`Error fetching students: ${error.error?.message || error.statusText}`, 'error');
      }
    });
  }

  /**
   * Adds a new student.
   * @param student The student to add.
   * @returns An observable that emits the API response.
   */
  addStudent(student: any): Observable<Student[]> {
    return this.http.post<Student[]>(this.url + 'addstudent', student);
  }

  /**
   * Updates an existing student.
   * @param student The student to update.
   * @returns An observable that emits the API response.
   */
  updateStudent(student: any): Observable<any> {
    return this.http.post(this.url + 'students/update', student);
  }

  /**
   * Deletes a student.
   * @param student The student to delete.
   * @returns An observable that emits the API response.
   */
  deleteStudent(student: Student): Observable<any> {
    return this.http.post(this.url + 'deletestudent', { id: student.id });
  }

  // Instructors CRUD
  /**
   * Fetches all instructors from the API.
   */
  fetchInstructors() {
    this.http.get<instructorApiResponse[]>(this.url + 'instructors').subscribe({
      next: (instructors) => {
        this.instructorsSignal.set(instructors.map((item: any) => item));
        this.widgetsConfig.admin[4].data = this.totalInstructors().toString();
        this.instructorWidgetConfig.admin[0].title = this.totalInstructors().toString();
      },
      error: (error) => {
        this.showNotification(`Error fetching instructors: ${error.error?.message || error.statusText}`, 'error');
      }
    })
  }

  /**
   * Adds a new instructor.
   * @param instructor The instructor to add.
   * @returns An observable that emits the API response.
   */
  addInstructor(instructor: any): Observable<any> {
    console.log(instructor);
    return this.http.post(this.url + 'addinstructor', instructor);
  }

  /**
   * Updates an existing instructor.
   * @param instructor The instructor to update.
   * @returns An observable that emits the API response.
   */
  updateInstructor(instructor: any): Observable<any> {
    return this.http.post(this.url + 'instructors/update', instructor);
  }

  /**
   * Deletes an instructor.
   * @param instructor The instructor to delete.
   * @returns An observable that emits the API response.
   */
  deleteInstructor(instructor: Instructor): Observable<any> {
    return this.http.post<Instructor[]>(this.url + 'instructors/delete', { id: instructor.id });
  }

  /**
   * Adds a new question category.
   * @param category The category to add.
   * @returns An observable that emits the API response.
   */
  addCategory(category: any): Observable<any> {
    return this.http.post(this.url + 'category', category);
  }

  /**
   * Retrieves the user's quiz responses from local storage.
   * @returns The user's responses, or `null` if they don't exist.
   */
  getStoredResponses() {
    const responses = localStorage.getItem('quizResponses');
    return responses ? JSON.parse(responses) : null
  }

  setExamTimeframe(time: any): Observable<any> {
    return this.http.post(this.url + 'timeupdate', time);
  }


  // Miscelleneous CRUD
  /**
   * Transforms the raw packages data into a format suitable for use in form controls.
   * @param data The raw packages data.
   * @returns The transformed packages data.
   */
  private transformPackagesJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.package + ' - $' + `${item.amount}`
    }))
  }

  /**
   * Fetches the available packages from the API.
   */
  getPackages() {
    this.http.get<any[]>(this.url + 'packages').subscribe({
      next: (pkgs) => {
        this.packagesSignal.set(pkgs.map(item => item));
        localStorage.setItem('packages', JSON.stringify(this.transformPackagesJson(pkgs)));
      },
      error: (error) => {
        this.showNotification(`Error fetching packages: ${error.error?.message || error.statusText}`, 'error');
      }
    });
  }

  /**
   * Updates an existing package's pricing or details.
   * @param pkg The package object to update.
   * @returns An observable that emits the API response.
   */
  updatePackage(pkg: any): Observable<any> {
    return this.http.post(this.url + 'packages/update', pkg).pipe(
      tap(() => {
        // Update local state to reflect changes immediately
        const updatedPackages = this.packagesSignal().map(p => p.id === pkg.id ? { ...p, ...pkg } : p);
        this.packagesSignal.set(updatedPackages);
        localStorage.setItem('packages', JSON.stringify(this.transformPackagesJson(updatedPackages)));
      })
    );
  }

  /**
   * Transforms the raw question categories data into a format suitable for use in form controls.
   * @param data The raw question categories data.
   * @returns The transformed question categories data.
   */
  private transformQuestionCategoriesJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.category
    }))
  }

  /**
   * Fetches the question categories from the API.
   */
  getQuestionCategories() {
    this.http.get<any[]>(this.url + 'questioncategories').subscribe({
      next: (qctgy) => {
        localStorage.setItem('questioncategories', JSON.stringify(this.transformQuestionCategoriesJson(qctgy)));
      },
      error: (error) => {
        // Suppress error for now as endpoint might not exist
        // or handle gracefully
      }
    });
  }

  /**
   * Fetches the instructor specializations from the API.
   */
  getSpecializations() {
    this.http.get<any[]>(this.url + 'specializations').subscribe({
      next: (sptzn) => {
        this.specializationsSignal.set(sptzn.map(item => item));
        localStorage.setItem('specializations', JSON.stringify(this.transformSpecializationJson(sptzn)));
      },
      error: (error) => {
        this.showNotification(`Error fetching specializations: ${error.error?.message || error.statusText}`, 'error');
      }

    });
  }

  /**
   * Transforms the raw specialization data into a format suitable for use in form controls.
   * @param data The raw specialization data.
   * @returns The transformed specialization data.
   */
  private transformSpecializationJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.specialization
    }))
  }

  /**
   * Adds a new instructor specialization.
   * @param specialization The specialization to add.
   * @returns An observable that emits the API response.
   */
  addSpecialization(specialization: any): Observable<any> {
    return this.http.post(this.url + 'addspecialization', specialization);
  }

  /**
   * Updates an existing instructor specialization.
   * @param specialization The specialization to update.
   * @returns An observable that emits the API response.
   */
  updateSpecialization(specialization: any): Observable<any> {
    return this.http.post(this.url + 'specializations/update', specialization);
  }

  /**
   * Fetches the instructor certifications from the API.
   */
  getCertifications() {
    this.http.get<any[]>(this.url + 'certifications').subscribe({
      next: (cert) => {
        this.certificationsSignal.set(cert.map(item => item));
        localStorage.setItem('certifications', JSON.stringify(this.transformCertificationJson(cert)));
      },
      error: (error) => {
        this.showNotification(`Error fetching certifications: ${error.error?.message || error.statusText}`, 'error');
      }
    });
  }

  /**
   * Transforms the raw certification data into a format suitable for use in form controls.
   * @param data The raw certification data.
   * @returns The transformed certification data.
   */
  private transformCertificationJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.certification
    }))
  }

  /**
   * Updates an existing instructor certification.
   * @param certification The certification to update.
   * @returns An observable that emits the API response.
   */
  updateCertification(certification: any): Observable<any> {
    return this.http.post(this.url + 'certifications/update', certification);
  }

  /**
   * Adds a new instructor certification.
   * @param certification The certification to add.
   * @returns An observable that emits the API response.
   */
  addCertification(certification: any): Observable<any> {
    return this.http.post(this.url + 'addcertification', certification);
  }

  /**
   * Opens a dialog to display an alert message.
   * @param data The data for the alert, including title, message, and buttons.
   * @returns A reference to the dialog.
   */
  openAlertDialog(data: any): MatDialogRef<AlertComponent> {
    return this.alert.open(AlertComponent, {
      data: data
    });
  }

  /**
   * Fetches the progress data for a student.
   * If studentId is not provided, fetches for the current user.
   * returning MOCKED data for demonstration purposes as per plan.
   */
  fetchStudentProgress(studentId?: string): Observable<StudentProgress> {
    // In a real app, this would hit an API endpoint like /api/students/{id}/progress
    const mockData: StudentProgress = {
      studentId: studentId || this.currentUser()?.username || 'current-user',
      totalTests: Math.floor(Math.random() * 20) + 5,
      averageScore: Math.floor(Math.random() * 30) + 70, // 70-100
      completionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
      recentActivity: [
        { quizTitle: 'Road Signs & Signals', score: 85, date: new Date(Date.now() - 86400000 * 2), status: 'pass' },
        { quizTitle: 'Vehicle Maintenance', score: 92, date: new Date(Date.now() - 86400000 * 5), status: 'pass' },
        { quizTitle: 'Traffic Laws', score: 65, date: new Date(Date.now() - 86400000 * 10), status: 'fail' },
        { quizTitle: 'Safety Precautions', score: 78, date: new Date(Date.now() - 86400000 * 15), status: 'pass' },
        { quizTitle: 'Highway Code', score: 88, date: new Date(Date.now() - 86400000 * 20), status: 'pass' }
      ],
      monthlyPerformance: [
        { month: 'Jan', score: 65 },
        { month: 'Feb', score: 70 },
        { month: 'Mar', score: 75 },
        { month: 'Apr', score: 82 },
        { month: 'May', score: 78 },
        { month: 'Jun', score: 88 }
      ]
    };

    return of(mockData);
  }

  // --- Financial & Payments Mocks ---

  fetchTransactions(role: string, userId: string): Observable<any[]> {
    // Generate mock transactions
    const count = role === 'student' ? 5 : 20;
    const transactions = Array.from({ length: count }, (_, i) => ({
      id: `TRX-${1000 + i}`,
      studentName: role === 'student' ? 'You' : `Student ${i + 1}`,
      description: role === 'student' ? 'Lesson Payment' : (i % 3 === 0 ? 'Exam Fee' : 'Lesson Package'),
      amount: role === 'student' ? ((i + 1) * 20) : (Math.floor(Math.random() * 200) + 50),
      type: 'credit',
      date: new Date(Date.now() - 86400000 * i * 2),
      status: Math.random() > 0.1 ? 'completed' : 'pending' // 90% success rate
    }));

    return of(transactions);
  }

  processPayment(paymentData: any): Observable<any> {
    return this.http.post(this.url + 'payment', paymentData).pipe(
      tap((res: any) => {
        this.showNotification('Payment processed successfully', 'success');
      }),
      catchError(err => {
        this.showNotification('Payment processing failed', 'error');
        return of(null);
      })
    );
  }

  fetchFinancialStats(): Observable<any> {
    const revenue = [1200, 1500, 1100, 1800, 2100, 2400]; // Last 6 months
    const expenses = [800, 900, 850, 950, 1100, 1000];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    return of({
      totalRevenue: revenue.reduce((a, b) => a + b, 0),
      totalExpenses: expenses.reduce((a, b) => a + b, 0),
      netProfit: revenue.reduce((a, b) => a + b, 0) - expenses.reduce((a, b) => a + b, 0),
      projectedRevenue: 3000, // Next month projection
      chartData: {
        labels: months,
        revenue: revenue,
        expenses: expenses,
        profit: revenue.map((r, i) => r - expenses[i])
      }
    });
  }

  // --- User Access Management (Mocked) ---

  /** Fetches all users (students and instructors) from the backend. */
  fetchAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.url + 'users').pipe(
      catchError(error => {
        this.showNotification('Error fetching users: ' + (error.error?.message || error.statusText), 'error');
        // Fallback to local logic if backend fails or for robustness
        const students = this.studentsSignal() || [];
        const instructors = this.instructorsSignal() || [];
        const allUsers = [
          ...students.map(s => ({ ...s, role: 'student', name: s.firstName + ' ' + s.lastName })),
          ...instructors.map(i => ({ ...i, role: 'instructor', name: i.firstName + ' ' + i.lastName }))
        ];
        return of(allUsers);
      })
    );
  }

  // For generic user add, we likely want to redirect to specific student/instructor add endpoints based on role
  // Or implemented a generic addUser in AdminController. For now, we'll route based on role if available.

  /**
   * Adds a new user to the system.
   * @param user The user to add.
   * @returns An observable that emits the API response.
   */
  public addUser(user: any): Observable<any> {
    if (user.role === 'student') {
      return this.addStudent({ ...user, firstName: user.name.split(' ')[0], lastName: user.name.split(' ')[1] || '' });
    }
    if (user.role === 'instructor') {
      return this.addInstructor({ ...user, firstName: user.name.split(' ')[0], lastName: user.name.split(' ')[1] || '' });
    }

    // Fallback or generic user
    return this.http.post(this.url + 'users/add', user); // Assuming endpoint exists or we rely on specific adds
  }

  /**
   * Resets a user's password (admin function).
   * @param userId The ID of the user.
   * @param newPass The new password.
   */
  public updateUserPassword(userId: string, newPass: string): Observable<any> {
    return this.http.post(this.url + 'users/password', { id: userId, password: newPass });
  }

  /**
   * Deletes a user (admin function).
   * @param userId The ID of the user to delete.
   * @param role Optional role of the user.
   */
  public deleteUser(userId: string, role?: string): Observable<any> {
    return this.http.post(this.url + 'users/delete', { id: userId, role: role });
  }
}
