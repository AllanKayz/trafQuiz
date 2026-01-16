import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, filter } from 'rxjs/operators';
import { AlertComponent } from './alert/alert.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiResponse, Question, Student, studentApiResponse, Instructor, instructorApiResponse, StudentProgress } from './trafquiz';
import { jsPDF } from 'jspdf';



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
  private url = 'http://localhost:3000/api/';
  public alert = inject(MatDialog);

  // Convert user data to signal for reactive user state management.
  public userSignal = signal<any>(null);
  /** A computed signal that exposes the current user's data. */
  public currentUser = computed(() => this.userSignal());

  /**
   * Shows a snackbar notification.
   * @param message The message to display.
   * @param type The type of notification ('success', 'error', or 'info').
   * @param duration The duration in milliseconds (default: 4000).
   */
  public showNotification(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 4000) {
    const titles = {
      success: 'Success',
      error: 'Error',
      info: 'Information'
    };

    this.alert.open(AlertComponent, {
      width: '400px',
      data: {
        title: titles[type] || 'Notification',
        message: message,
        type: type,
        buttons: [{ text: 'OK', value: 'ok', color: type === 'error' ? 'warn' : 'primary' }]
      }
    });
  }

  /**
   * Shows a snackbar confirmation.
   * @param message The message to display.
   * @param action The action label (e.g., 'DELETE').
   * @returns An observable that emits when the action is clicked.
   */
  public showConfirm(message: string, actionLabel: string = 'CONFIRM', title: string = 'Confirmation Required'): Observable<any> {
    const dialogRef = this.alert.open(AlertComponent, {
      width: '400px',
      data: {
        title: title,
        message: message,
        type: 'warning',
        buttons: [
          { text: 'Cancel', value: 'cancel', color: 'warn' },
          { text: actionLabel, value: 'confirm', color: 'primary' }
        ]
      }
    });

    return dialogRef.afterClosed().pipe(
      filter(result => result === 'confirm')
    );
  }

  // Writable signals for managing collections of data.
  /** A signal that holds the array of quiz questions. */
  public questionsSignal = signal<Question[]>([]);
  /** A signal that holds the array of students. */
  public studentsSignal = signal<any[]>(this.loadCache('students_raw', []));
  /** A signal that holds the array of instructors. */
  public instructorsSignal = signal<Instructor[]>(this.loadCache('instructors_raw', []));
  /** A signal that holds the array of available packages. */
  public packagesSignal = signal<any[]>(this.loadCache('packages_raw', []));
  /** A signal that holds the array of instructor specializations. */
  public specializationsSignal = signal<any[]>(this.loadCache('specializations_raw', []));
  /** A signal that holds the array of instructor certifications. */
  public certificationsSignal = signal<any[]>(this.loadCache('certifications_raw', []));
  /** A signal that holds the array of vehicles. */
  public vehiclesSignal = signal<any[]>(this.loadCache('vehicles_raw', []));

  /** A signal for the exam duration in seconds. */
  examDuration = signal<number>(300); //default 10 minutes

  /** Signal for user's theme preference. */
  public themePreference = signal<'light' | 'dark' | 'system'>('system');

  /**
   * Simulates sending a push notification to the user.
   * @param title Notification title
   * @param message Notification body
   */
  public sendPushNotification(title: string, message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/assets/logo.png' });
    } else {
      this.showNotification(`${title}: ${message}`, 'info');
    }
  }

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
  /** Signal to store dynamic dashboard stats from backend. */
  public dashboardStats = signal<any>(null);
  /** Signal to store dynamic exam stats from backend. */
  public examStats = signal<any>(null);

  /** Configuration for the widgets, updated dynamically. */
  private widgetsConfig = {
    admin: [
      { id: 'students', title: 'Total Students', data: '...', footer: 'Active' },
      { id: 'revenue', title: 'Monthly Revenue', data: '...', footer: 'Current month' },
      { id: 'exams', title: 'Exams Today', data: '...', footer: 'Scheduled' },
      { id: 'pass_rate', title: 'Pass Rate', data: '...', footer: 'Overall' },
      { id: 'alerts', title: 'System Alerts', data: '...', footer: 'Requires Attention', type: 'warn' }
    ],
    instructor: [
      { id: 'next_lesson', title: 'Lessons Today', data: '...', footer: 'Today' },
      { id: 'pending_reports', title: 'Pending Reports', data: '...', footer: 'To Review' },
      { id: 'vehicle_issues', title: 'Vehicle Issues', data: '...', footer: 'Active Issues', type: 'warn' },
      { id: 'students', title: 'Assigned Students', data: '...', footer: 'Total' }
    ],
    student: [
      { id: 'lessons', title: 'Lessons Attended', data: '...', footer: 'Completed' },
      { id: 'success_rate', title: 'Success Rate', data: '...', footer: 'Average Score' },
      { id: 'exams_taken', title: 'Exams Taken', data: '...', footer: 'Total' },
      { id: 'upcoming', title: 'Upcoming Lessons', data: '...', footer: 'Scheduled' }
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

  /** Configuration for the widgets displayed on the exams panel. */
  examWidgetConfig = {
    admin: [
      { id: 'analytics', title: 'Overall Pass Rate', data: '0', footer: 'Candidates Passed', icon: 'check_circle' },
      { id: 'group', title: 'Recent Engagement', data: '0', footer: 'Candidates in last session', icon: 'people' },
      { id: 'history_edu', title: 'Total Sessions', data: '0', footer: 'Recorded Exam Sessions', icon: 'history_edu' },
    ]
  }

  /** A computed signal that returns the widgets for the current user's role. */
  /** A computed signal that returns the widgets for the current user's role with real data. */
  public userWidgets = computed(() => {
    const user = this.userSignal();
    const role: 'admin' | 'instructor' | 'student' = user?.role || 'student';
    let widgets = this.widgetsConfig[role] || [];

    // Merge real stats if available
    const stats = this.dashboardStats();
    if (!stats) return widgets;

    if (role === 'admin') {
      return this.widgetsConfig.admin.map(w => {
        switch (w.id) {
          case 'students': return { ...w, data: stats.total_students || 0 };
          case 'revenue': return { ...w, data: '$' + (stats.monthly_revenue || 0) };
          case 'exams': return { ...w, data: stats.exams_today || 0 };
          case 'alerts': return { ...w, data: stats.system_alerts || 0 };
          default: return w;
        }
      });
    } else if (role === 'student') {
      return this.widgetsConfig.student.map(w => {
        switch (w.id) {
          case 'lessons': return { ...w, data: stats.lessons_attended || 0 };
          case 'success_rate': return { ...w, data: (stats.success_rate || 0) + '%' };
          case 'exams_taken': return { ...w, data: stats.exams_taken || 0 };
          case 'upcoming': return { ...w, data: stats.upcoming_lessons || 0 };
          default: return w;
        }
      });
    } else if (role === 'instructor') {
      return this.widgetsConfig.instructor.map(w => {
        switch (w.id) {
          case 'next_lesson': return { ...w, data: stats.lessons_today || 0 };
          case 'pending_reports': return { ...w, data: stats.reports_pending || 0 };
          case 'vehicle_issues': return { ...w, data: stats.vehicle_issues || 0 };
          case 'students': return { ...w, data: stats.assigned_students || 0 };
          default: return w;
        }
      });
    }
    return widgets;
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

  /** A computed signal that returns the exams widgets for the current user's role. */
  public userExamWidgets = computed(() => {
    const user = this.userSignal();
    const role: 'admin' | 'instructor' | 'student' = user?.role || 'student';
    if (role !== 'admin') return [];

    const stats = this.examStats();
    return this.examWidgetConfig.admin.map(w => {
      if (!stats) return w;
      switch (w.id) {
        case 'analytics':
          const total = (Number(stats.pass_count) || 0) + (Number(stats.fail_count) || 0);
          const rate = total === 0 ? 0 : Math.round((Number(stats.pass_count) / total) * 100);
          return { ...w, data: rate + '%', footer: `${stats.pass_count} Candidates Passed` };
        case 'group':
          const recent = stats.recent_exams?.[0]?.candidates || 0;
          return { ...w, data: recent, footer: 'Candidates in last session' };
        case 'history_edu':
          return { ...w, data: stats.recent_exams?.length || 0, footer: 'Recorded Exam Sessions' };
        default: return w;
      }
    });
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

    // Automatically fetch relevant data when user logins or state changes
    effect(() => {
      const user = this.userSignal();
      if (user) {
        this.fetchDashboardStats();
        if (user.role === 'admin' || user.role === 'instructor') {
          this.fetchQuestions();
          this.fetchStudents();
          this.fetchInstructors();
          this.getPackages();
          this.getSpecializations();
          this.getCertifications();
        }
      }
    });

    this.startPolling();
  }

  /** Starts a polling interval to refresh dashboard stats every 30 seconds. */
  private startPolling() {
    setInterval(() => {
      const user = this.userSignal();
      if (user) {
        this.fetchDashboardStats();
        // Also refresh other key data periodically
        if (user.role === 'admin') {
          this.getExamStatistics().subscribe();
        }
      }
    }, 30000); // 30 seconds
  }

  private loadCache(key: string, defaultValue: any): any {
    const cached = localStorage.getItem(key);
    if (!cached) return defaultValue;
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn(`Failed to parse cache for ${key}`, e);
      return defaultValue;
    }
  }

  private setCache(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to set cache for ${key}`, e);
    }
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

    // Ensure ID is present for the backend to identify the user
    const backendPayload = { ...payload };
    if (!backendPayload.id && raw.id) {
      backendPayload.id = raw.id;
    }

    return this.http.post(this.url + 'updateuser', backendPayload).pipe(
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
          this.fetchDashboardStats(); // Fetch dynamic stats
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
          id: user['id'],
          username: user['username'],
          role: user['role'],
          sidebar: this.menus.admin,
          sidebarIcons: this.menus.icons,
          widgets: [],
          data: []
        };
      case 'instructor':
        return {
          id: user['id'],
          username: user['username'],
          role: user['role'],
          sidebar: this.menus.instructor,
          sidebarIcons: this.menus.icons,
          widgets: [],
          data: []
        };
      case 'student':
        return {
          id: user['id'],
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

  /**
   * Fetches all students from the API.
   */
  fetchStudents() {
    const user = this.userSignal();
    const role = user?.role || 'student';
    const userId = user?.id || '';

    this.http.get<studentApiResponse[]>(this.url + `students?role=${role}&userId=${userId}`).subscribe({
      next: (students) => {
        //this.studentsSignal.set([students]);
        this.studentsSignal.set(students.map(item => item));
        this.setCache('students_raw', students);
        this.widgetsConfig.admin[0].data = this.totalStudents().toString();
        this.studentWidgetConfig.admin[0].title = this.totalStudents().toString();
      },
      error: (error) => {
        this.showNotification(`Error fetching students: ${error.error?.message || error.statusText}`, 'error');
      }
    });
  }

  /**
   * Fetches all vehicles from the API.
   */
  fetchVehicles() {
    this.http.get<any[]>(this.url + 'vehicles').subscribe({
      next: (vehicles) => {
        this.vehiclesSignal.set(vehicles);
        this.setCache('vehicles_raw', vehicles);
      },
      error: (error) => {
        this.showNotification('Error fetching vehicles', 'error');
        // Keep existing signal data (from cache) on error
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
        this.setCache('instructors_raw', instructors);
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
        this.setCache('packages_raw', pkgs);
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
        this.setCache('specializations_raw', sptzn);
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
   * Fetches dashboard statistics from the backend.
   */
  fetchDashboardStats() {
    const user = this.userSignal();
    const role = user?.role || 'student';
    const userId = user?.id || '';

    this.http.get<any>(this.url + `admin/getAllData?role=${role}&userId=${userId}`).subscribe({
      next: (data) => {
        if (data.stats) {
          this.dashboardStats.set(data.stats);
        }
      },
      error: (err) => console.error("Failed to fetch dashboard stats", err)
    });
  }

  /**
   * Automatically allocates students to an exam.
   */
  autoAllocateExams(date: string, capacity: number): Observable<any> {
    return this.http.post(this.url + 'admin/autoAllocateExams', { date, capacity });
  }

  /**
   * Gets detailed exam statistics.
   */
  getExamStatistics(): Observable<any> {
    return this.http.get(this.url + 'admin/getExamStats').pipe(
      tap((data: any) => {
        if (data.detailed) {
          this.examStats.set(data.detailed);
        }
      })
    );
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
        this.setCache('certifications_raw', cert);
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
    const id = studentId || this.currentUser()?.id;
    return this.http.get<any>(`${this.url}students/progress?id=${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to load progress data');
        }

        // Transform API response to StudentProgress interface
        return {
          studentId: id || 'current-user',
          totalTests: response.data.examsTaken || 0,
          averageScore: response.data.averageScore || 0,
          completionRate: response.data.examsTaken > 0 ? 100 : 0,
          recentActivity: (response.data.recentExams || []).map((exam: any) => ({
            quizTitle: exam.exam_name,
            score: exam.score,
            date: new Date(exam.completed_at),
            status: exam.score >= 70 ? 'pass' : 'fail'
          })),
          monthlyPerformance: [] // Can be calculated from examHistory if needed
        };
      }),
      catchError(error => {
        this.showNotification('Failed to load progress data', 'error');
        throw error;
      })
    );
  }

  // --- Financial & Payments Mocks ---


  processPayment(paymentData: any): Observable<any> {
    return this.http.post(this.url + 'payments/process', paymentData).pipe(
      tap((res: any) => {
        this.showNotification('Payment processed successfully', 'success');
      }),
      catchError(err => {
        this.showNotification('Payment processing failed', 'error');
        return of(null);
      })
    );
  }

  approvePayment(paymentId: number, status: string): Observable<any> {
    return this.http.post(this.url + 'payments/approve', { id: paymentId, status }).pipe(
      tap((res: any) => {
        if (res.success) this.showNotification(`Payment ${status} successfully`, 'success');
      }),
      catchError(err => {
        this.showNotification('Failed to update payment status', 'error');
        return of(null);
      })
    );
  }

  fetchFinancialStats(): Observable<any> {
    return this.http.get<any>(`${this.url}finances/stats`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to load financial statistics');
        }

        const data = response.data;
        const overview = data.overview;

        const months = data.monthlyStats?.map((m: any) => m.month) || [];
        const revenue = data.monthlyStats?.map((m: any) => parseFloat(m.income)) || [];
        const expenses = data.monthlyStats?.map((m: any) => parseFloat(m.expenses)) || [];

        return {
          totalRevenue: parseFloat(overview.total_income || 0),
          totalExpenses: parseFloat(overview.total_expenses || 0),
          netProfit: parseFloat(overview.net_profit || 0),
          projectedRevenue: (parseFloat(overview.total_income || 0) / (months.length || 1)) * 1.1,
          chartData: {
            labels: months,
            revenue: revenue,
            expenses: expenses
          },
          categoriesBreakdown: data.categoriesBreakdown
        };
      }),
      catchError(error => {
        this.showNotification('Error loading finances: ' + error.message, 'error');
        return of({
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          monthlyStats: [],
          categoriesBreakdown: []
        });
      })
    );
  }

  /**
   * Fetches financial transactions from the API.
   * @param userId Optional filter by user ID.
   * @param query Optional search query.
   * @returns An observable that emits the API response.
   */
  fetchTransactions(userId?: string | number, query?: string): Observable<any> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId.toString());
    if (query) params = params.set('query', query);

    return this.http.get<any>(this.url + 'finances/transactions', { params }).pipe(
      catchError(error => {
        this.showNotification('Failed to load transactions', 'error');
        return of({ success: false, message: 'Failed to load transactions', data: [] });
      })
    );
  }

  processSalary(payload: any): Observable<any> {
    return this.http.post<any>(this.url + 'finances/salary', payload).pipe(
      tap(res => {
        if (res.success) this.showNotification('Salary processed successfully', 'success');
      }),
      catchError(err => {
        this.showNotification('Failed to process salary', 'error');
        return of(null);
      })
    );
  }

  recordExpense(payload: any): Observable<any> {
    return this.http.post<any>(this.url + 'finances/expense', payload).pipe(
      tap(res => {
        if (res.success) this.showNotification('Expense recorded successfully', 'success');
      }),
      catchError(err => {
        this.showNotification('Failed to record expense', 'error');
        return of(null);
      })
    );
  }

  /**
   * Generates and downloads a PDF receipt for a payment.
   * @param data The payment data including transactionId, studentName, amount, etc.
   */
  public generateReceipt(data: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80); // Dark Blue
    doc.text('TrafQuiz System', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(127, 140, 141); // Gray
    doc.text('Official Payment Receipt', pageWidth / 2, 30, { align: 'center' });

    // Divider
    doc.setDrawColor(189, 195, 199);
    doc.line(20, 35, pageWidth - 20, 35);

    // Transaction Details
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);

    let y = 50;
    const lineSpacing = 10;

    const details = [
      { label: 'Transaction ID:', value: data.transactionId || 'N/A' },
      { label: 'Date:', value: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() },
      { label: 'Amount Paid:', value: `$${parseFloat(data.amount || 0).toFixed(2)}` },
      { label: 'Payment Method:', value: (data.method || 'cash').toUpperCase() },
      { label: 'Category:', value: (data.category || 'student_payment').replace('_', ' ').toUpperCase() }
    ];

    if (data.studentName || data.firstName) {
      const name = data.studentName || `${data.firstName} ${data.lastName || ''}`;
      details.push({ label: 'Client Name:', value: name });
    } else if (data.studentId || data.userId) {
      // Try to lookup name from students list
      const targetId = data.studentId || data.userId;
      const student = this.studentsSignal().find(s => s.id === targetId || s.user_id === targetId);
      if (student) {
        details.push({ label: 'Client Name:', value: `${student.firstName} ${student.lastName}` });
      } else {
        // Fallback to username if we are the student
        const current = this.currentUser();
        if (current && (current.id === targetId || current.username)) {
          details.push({ label: 'Client Name:', value: current.username });
        }
      }
    }

    if (data.notes) {
      details.push({ label: 'Notes:', value: data.notes });
    }

    details.forEach(detail => {
      doc.setFont('helvetica', 'bold');
      doc.text(detail.label, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(detail.value), 60, y);
      y += lineSpacing;
    });

    // Divider
    y += 5;
    doc.line(20, y, pageWidth - 20, y);
    y += 15;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(149, 165, 166);
    doc.text('Thank you for your payment!', pageWidth / 2, y, { align: 'center' });
    doc.text('This is a computer-generated receipt.', pageWidth / 2, y + 5, { align: 'center' });

    // Save PDF
    const filename = `Receipt_${data.transactionId || 'Payment'}.pdf`;
    doc.save(filename);
    this.showNotification('Receipt downloaded', 'success');
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

  /**
   * Deletes the current user's account (requires password confirmation)
   * @param userId The ID of the user
   * @param password The user's password for confirmation
   */
  public deleteAccount(userId: string, password: string): Observable<any> {
    return this.http.post(`${this.url}account/delete`, { userId, password }).pipe(
      tap(() => {
        this.logout();
      }),
      catchError(error => {
        this.showNotification('Failed to delete account. Check password.', 'error');
        throw error;
      })
    );
  }

  /**
   * Sends a message to another user
   * @param recipientId The ID of the message recipient
   * @param senderId The ID of the message sender
   * @param message The message content
   * @returns An observable that emits the API response
   */
  public sendMessage(recipientId: string, senderId: string, message: string): Observable<any> {
    return this.http.post(`${this.url}messages/send`, {
      recipientId,
      senderId,
      message
    });
  }
}
