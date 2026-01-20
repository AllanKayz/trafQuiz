import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, tap, filter } from 'rxjs/operators';
import { AlertComponent } from './alert/alert.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiResponse, Question, Student, studentApiResponse, Instructor, instructorApiResponse, StudentProgress } from './trafquiz';
import { jsPDF } from 'jspdf';

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}

/**
 * Service responsible for managing the application's data and state.
 * This service handles user authentication via Electron IPC,
 * and provides a centralized location for application state using Angular Signals.
 */
@Injectable({
  providedIn: 'root'
})
export class TraffiquizService {

  public alert = inject(MatDialog);

  // Convert user data to signal for reactive user state management.
  public userSignal = signal<any>(null);
  /** A computed signal that exposes the current user's data. */
  public currentUser = computed(() => this.userSignal());

  /**
   * Shows a snackbar notification.
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
  public questionsSignal = signal<Question[]>([]);
  public studentsSignal = signal<any[]>(this.loadCache('students_raw', []));
  public instructorsSignal = signal<Instructor[]>(this.loadCache('instructors_raw', []));
  public packagesSignal = signal<any[]>(this.loadCache('packages_raw', []));
  public specializationsSignal = signal<any[]>(this.loadCache('specializations_raw', []));
  public certificationsSignal = signal<any[]>(this.loadCache('certifications_raw', []));
  public vehiclesSignal = signal<any[]>(this.loadCache('vehicles_raw', []));

  /** A signal for the exam duration in seconds. */
  examDuration = signal<number>(300); //default 10 minutes

  /** Signal for user's theme preference. */
  public themePreference = signal<'light' | 'dark' | 'system'>('system');

  /**
   * Simulates sending a push notification to the user.
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

  // Computed signals
  public totalQuestions = computed(() => this.questionsSignal().length);
  public flaggedQuestions = computed(() => this.questionsSignal().filter(q => q.flagged).length);
  public totalStudents = computed(() => this.studentsSignal().length);
  public totalInstructors = computed(() => this.instructorsSignal().length);

  /** Defines the menu items for different user roles. */
  private menus = {
    admin: ['Dashboard', 'Instructors', 'Students', 'Exams', 'Questions', 'Lessons', 'Scheduling', 'Vehicles', 'Finances', 'Reports', 'Messages', 'UserAccess', 'Settings'],
    instructor: ['Dashboard', 'Schedule', 'Students', 'Vehicle-Status', 'Messages', 'Settings'],
    student: ['Dashboard', 'Exam', 'Lessons', 'Reports', 'Messages', 'Payments', 'Settings'],
    icons: { dashboard: 'dashboard', questions: 'help_outline', instructors: 'person', exams: 'assignment', students: 'group', vehicles: 'directions_car', reports: 'bar_chart', settings: 'settings', scheduling: 'event', schedule: 'calendar_month', 'vehicle-status': 'car_repair', messages: 'mail', finances: 'payments', useraccess: 'admin_panel_settings', lessons: 'school', 'lessons-admin': 'admin_panel_settings', exam: 'quiz', payments: 'account_balance_wallet' }
  }

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
      { label: 'My Schedule', icon: 'calendar_today', route: '/dashboard/schedule' },
      { label: 'Grade Student', icon: 'fact_check', route: '/dashboard/students' },
      { label: 'Log Issue', icon: 'report_problem', route: '/dashboard/vehicle-status' },
      { label: 'Message Admin', icon: 'mail', route: '/dashboard/messages' }
    ],
    student: [
      { label: 'Start Exam', icon: 'play_circle', route: '/exam' },
      { label: 'Book Lesson', icon: 'schedule', route: '/dashboard/lessons' },
      { label: 'My Progress', icon: 'bar_chart', route: '/dashboard/reports' },
      { label: 'Make Payment', icon: 'credit_card', route: '/dashboard/payments' }
    ]
  }

  questionWidgetConfig = {
    admin: [
      { title: '100', data: 'Total Questions', footer: '' },
      { title: '11', data: 'Categories', footer: '' },
      { title: '50', data: 'Reviewed', footer: '' }
    ]
  }

  studentWidgetConfig = {
    admin: [
      { title: '100', data: 'Total Students', footer: '' },
      { title: '10', data: 'Active Students', footer: '' },
      { title: '100', data: 'Pending Approvals', footer: '' },
    ]
  }

  instructorWidgetConfig = {
    admin: [
      { title: '100', data: 'Total Instructors', footer: '' },
      { title: '10', data: 'Available Instructors', footer: '' },
      { title: '100', data: 'Job Applications', footer: '' },
    ]
  }

  examWidgetConfig = {
    admin: [
      { id: 'analytics', title: 'Overall Pass Rate', data: '0', footer: 'Candidates Passed', icon: 'check_circle' },
      { id: 'group', title: 'Recent Engagement', data: '0', footer: 'Candidates in last session', icon: 'people' },
      { id: 'history_edu', title: 'Total Sessions', data: '0', footer: 'Recorded Exam Sessions', icon: 'history_edu' },
    ]
  }

  // Computed signals for user widgets based on role and stats
  public userWidgets = computed(() => {
    const user = this.userSignal();
    const role: 'admin' | 'instructor' | 'student' = user?.role || 'student';
    let widgets = this.widgetsConfig[role] || [];
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

  public userQuestionWidgets = computed(() => {
    const user = this.userSignal();
    return user ? this.questionWidgetConfig[user.role as keyof typeof this.questionWidgetConfig] : [];
  });

  public userStudentWidgets = computed(() => {
    const user = this.userSignal();
    return user ? this.studentWidgetConfig[user.role as keyof typeof this.studentWidgetConfig] : [];
  });

  public userInstructorWidgets = computed(() => {
    const user = this.userSignal();
    return user ? this.instructorWidgetConfig[user.role as keyof typeof this.instructorWidgetConfig] : [];
  });

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

  public packages = computed(() => {
    return this.packagesSignal().map(p => ({
      value: p.id,
      label: p.package + `- ${p.amount}`
    }))
  });

  public specializations = computed(() => {
    return this.specializationsSignal().map(s => ({
      value: s.id,
      label: s.specialization
    }))
  });

  public certifications = computed(() => {
    return this.certificationsSignal().map(c => ({
      value: c.id,
      label: c.certification
    }))
  });

  constructor() {
    this.initializeUser();
    this.initializeTheme();

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

  private startPolling() {
    setInterval(() => {
      const user = this.userSignal();
      if (user) {
        this.fetchDashboardStats();
        if (user.role === 'admin') {
          this.getExamStatistics().subscribe();
        }
      }
    }, 30000);
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

  public getRawUser(): any {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  // Profile update via IPC
  public updateProfile(payload: any): Observable<any> {
    const raw = this.getRawUser() || {};
    const updated = { ...raw, ...payload };
    localStorage.setItem('user', JSON.stringify(updated));
    this.userSignal.set(this.formatUser(updated));

    const backendPayload = { ...payload };
    if (!backendPayload.id && raw.id) {
      backendPayload.id = raw.id;
    }

    return from(window.electronAPI.invoke('update-user', backendPayload)).pipe(
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
          this.fetchDashboardStats();
        }
      } catch (e) {
        this.showNotification(`Error parsing user data: ${e}`, 'error');
      }
    }
  }

  private formatUser(user: any): any {
    let actualUser = user;
    if (user && user.roleData) {
      actualUser = { ...user, ...user.roleData };
    }

    // Check role from actualUser
    const role = actualUser?.role;

    switch (role) {
      case 'admin':
        return {
          id: actualUser.id,
          username: actualUser.username || actualUser.name,
          role: role,
          sidebar: this.menus.admin,
          sidebarIcons: this.menus.icons,
          widgets: [],
          data: []
        };
      case 'instructor':
        return {
          id: actualUser.user_id || actualUser.id, // Ensure we have users.id
          instructor_id: actualUser.user_id ? actualUser.id : null, // instructors.id
          username: actualUser.username || actualUser.name,
          role: role,
          sidebar: this.menus.instructor,
          sidebarIcons: this.menus.icons,
          widgets: [],
          data: []
        };
      case 'student':
        return {
          id: actualUser.user_id || actualUser.id, // Ensure we have users.id
          student_id: actualUser.user_id ? actualUser.id : null, // students.id
          username: actualUser.username || actualUser.name,
          role: role,
          sidebar: this.menus.student,
          sidebarIcons: this.menus.icons,
          widgets: [],
          data: []
        };
      default:
        return null;
    }
  }

  // --- IPC METHODS ---

  login(payload: any): Observable<any> {
    return from(window.electronAPI.invoke('login', payload)).pipe(
      tap((response: any) => {
        if (response.success) {
          const sessionData = { ...response.user, roleData: response.roleData };
          localStorage.setItem('user', JSON.stringify(sessionData));
          this.userSignal.set(this.formatUser(sessionData));
        } else {
          this.showNotification(`Fatal error: ${response.message}`, 'error');
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.userSignal.set(null);
  }

  forgotPassword(username: string): Observable<any> {
    return from(window.electronAPI.invoke('forgot-password', { username }));
  }

  resetPassword(payload: any): Observable<any> {
    return from(window.electronAPI.invoke('reset-password', payload));
  }


  fetchExam(token: any) {
    const user = this.userSignal();
    const studentId = user?.id; // Pass student ID for fair distribution

    from(window.electronAPI.invoke('get-exam-questions', studentId)).subscribe({
      next: (res: any) => {
        if (res.success) {
          const mappedQuestions = res.data.questions.map((item: any) => this.transformQuestion(item));
          this.questionsSignal.set(mappedQuestions);

          // Update duration signal
          if (res.data.duration) {
            // Convert minutes to seconds
            this.examDuration.set(res.data.duration * 60);
          } else {
            this.examDuration.set(30 * 60); // Default 30 mins
          }

        } else {
          this.showNotification(`Error Fetching Exam Data: ${res.message}`, 'error');
        }
      },
      error: (error) => {
        this.showNotification(`Error Fetching Exam Data: ${error.message}`, 'error');
        this.questionsSignal.set([]);
      }
    });
  }

  getStoredResponses() {
    const responses = localStorage.getItem('quizResponses');
    return responses ? JSON.parse(responses) : null
  }

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

  isNotEmpty(str: string | null | undefined): boolean {
    return str !== null && str !== undefined && str !== '';
  }

  saveResponses(responses: any) {
    localStorage.setItem('quizResponses', JSON.stringify(responses));
  }

  fetchExamDuration(): Observable<number> {
    return from(window.electronAPI.invoke('get-exam-duration')).pipe(
      map((response: any) => {
        const minutes = parseInt(response.data?.period || '30', 10);
        return minutes * 60;
      }),
      tap(duration => this.examDuration.set(duration)),
      catchError(() => {
        const fallback = 1800;
        this.examDuration.set(fallback);
        return of(fallback);
      })
    );
  }

  // Questions CRUD
  fetchQuestions() {
    from(window.electronAPI.invoke('get-questions')).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.questionsSignal.set(res.data.map((item: any) => this.transformQuestion(item)));
          this.questionWidgetConfig.admin[0].title = this.totalQuestions().toString();
        }
      },
      error: (error) => {
        this.showNotification(`Error fetching questions: ${error}`, 'error');
        this.questionsSignal.set([]);
      }
    });
  }

  deleteQuestion(questionId: number): Observable<any> {
    return from(window.electronAPI.invoke('delete-question', { id: questionId }));
  }

  addQuestion(question: any): Observable<any> {
    return from(window.electronAPI.invoke('add-question', question));
  }

  updateQuestion(question: any): Observable<any> {
    return from(window.electronAPI.invoke('update-question', question));
  }

  // Students CRUD
  fetchStudents() {
    const user = this.userSignal();
    const role = user?.role || 'student';
    const userId = user?.id || '';
    const instructorId = role === 'instructor' ? user?.instructor_id : null;

    from(window.electronAPI.invoke('get-students', { role, userId, instructorId })).subscribe({
      next: (res: any) => {
        if (res.success) {
          const students = res.data;
          this.studentsSignal.set(students);
          this.setCache('students_raw', students);
          this.widgetsConfig.admin[0].data = this.totalStudents().toString();
          this.studentWidgetConfig.admin[0].title = this.totalStudents().toString();
        }
      },
      error: (error) => {
        this.showNotification(`Error fetching students: ${error}`, 'error');
      }
    });
  }

  fetchVehicles() {
    from(window.electronAPI.invoke('get-vehicles')).subscribe({
      next: (res: any) => {
        if (res.success) {
          const vehicles = res.data;
          this.vehiclesSignal.set(vehicles);
          this.setCache('vehicles_raw', vehicles);
        }
      },
      error: () => this.showNotification('Error fetching vehicles', 'error')
    });
  }

  addStudent(student: any): Observable<any> {
    return from(window.electronAPI.invoke('add-student', student));
  }

  updateStudent(student: any): Observable<any> {
    return from(window.electronAPI.invoke('update-student', student));
  }

  deleteStudent(student: Student): Observable<any> {
    return from(window.electronAPI.invoke('delete-student', { id: student.id }));
  }

  // Instructors CRUD
  fetchInstructors() {
    from(window.electronAPI.invoke('get-instructors')).subscribe({
      next: (res: any) => {
        if (res.success) {
          const instructors = res.data;
          this.instructorsSignal.set(instructors);
          this.setCache('instructors_raw', instructors);
          this.widgetsConfig.admin[4].data = this.totalInstructors().toString();
          this.instructorWidgetConfig.admin[0].title = this.totalInstructors().toString();
        }
      },
      error: (error) => {
        this.showNotification(`Error fetching instructors: ${error}`, 'error');
      }
    })
  }

  addInstructor(instructor: any): Observable<any> {
    return from(window.electronAPI.invoke('add-instructor', instructor));
  }

  updateInstructor(instructor: any): Observable<any> {
    return from(window.electronAPI.invoke('update-instructor', instructor));
  }

  deleteInstructor(instructor: Instructor): Observable<any> {
    return from(window.electronAPI.invoke('delete-instructor', { id: instructor.id }));
  }


  addCategory(category: any): Observable<any> {
    return from(window.electronAPI.invoke('add-category', category));
  }

  setExamTimeframe(time: any): Observable<any> {
    return from(window.electronAPI.invoke('set-exam-timeframe', time));
  }

  // Miscellaneous
  private transformPackagesJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.package + ' - $' + `${item.amount}`
    }))
  }

  getPackages() {
    from(window.electronAPI.invoke('get-packages')).subscribe({
      next: (res: any) => {
        if (res.success) {
          const pkgs = res.data;
          this.packagesSignal.set(pkgs);
          this.setCache('packages_raw', pkgs);
          localStorage.setItem('packages', JSON.stringify(this.transformPackagesJson(pkgs)));
        }
      },
      error: (error) => {
        this.showNotification(`Error fetching packages: ${error}`, 'error');
      }
    });
  }

  updatePackage(pkg: any): Observable<any> {
    return from(window.electronAPI.invoke('update-package', pkg)).pipe(
      tap(() => {
        const updatedPackages = this.packagesSignal().map(p => p.id === pkg.id ? { ...p, ...pkg } : p);
        this.packagesSignal.set(updatedPackages);
        localStorage.setItem('packages', JSON.stringify(this.transformPackagesJson(updatedPackages)));
      })
    );
  }

  private transformQuestionCategoriesJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.category
    }))
  }

  getQuestionCategories() {
    from(window.electronAPI.invoke('get-question-categories')).subscribe({
      next: (res: any) => {
        if (res.success) {
          localStorage.setItem('question_categories', JSON.stringify(this.transformQuestionCategoriesJson(res.data)));
        }
      }
    });
  }

  getSpecializations() {
    from(window.electronAPI.invoke('get-specializations')).subscribe({
      next: (res: any) => {
        if (res.success) {
          const sptzn = res.data;
          this.specializationsSignal.set(sptzn);
          this.setCache('specializations_raw', sptzn);
          localStorage.setItem('specializations', JSON.stringify(this.transformSpecializationJson(sptzn)));
        }
      },
      error: (error) => {
        this.showNotification(`Error fetching specializations: ${error}`, 'error');
      }
    });
  }

  private transformSpecializationJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.specialization
    }))
  }

  fetchDashboardStats() {
    const user = this.userSignal();
    const role = user?.role || 'student';
    const userId = user?.id || '';

    from(window.electronAPI.invoke('get-dashboard-stats', { role, userId })).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.dashboardStats.set(res.data);
        }
      },
      error: (err) => console.error("Failed to fetch dashboard stats", err)
    });
  }

  autoAllocateExams(date: string, capacity: number): Observable<any> {
    return from(window.electronAPI.invoke('auto-allocate-exams', { date, capacity }));
  }

  getExamStatistics(): Observable<any> {
    return from(window.electronAPI.invoke('get-exam-statistics')).pipe(
      tap(res => {
        if (res.success) this.examStats.set(res.data);
      })
    );
  }

  addSpecialization(specialization: any): Observable<any> {
    return from(window.electronAPI.invoke('add-specialization', specialization));
  }

  updateSpecialization(specialization: any): Observable<any> {
    return from(window.electronAPI.invoke('update-specialization', specialization));
  }

  getCertifications() {
    from(window.electronAPI.invoke('get-certifications')).subscribe({
      next: (res: any) => {
        if (res.success) {
          const cert = res.data;
          this.certificationsSignal.set(cert);
          this.setCache('certifications_raw', cert);
          localStorage.setItem('certifications', JSON.stringify(this.transformCertificationJson(cert)));
        }
      },
      error: (error) => {
        this.showNotification(`Error fetching certifications: ${error}`, 'error');
      }
    });
  }

  private transformCertificationJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.certification
    }))
  }

  updateCertification(certification: any): Observable<any> {
    return from(window.electronAPI.invoke('update-certification', certification));
  }

  addCertification(certification: any): Observable<any> {
    return from(window.electronAPI.invoke('add-certification', certification));
  }

  openAlertDialog(data: any): MatDialogRef<AlertComponent> {
    return this.alert.open(AlertComponent, {
      data: data
    });
  }

  fetchStudentProgress(studentId?: string): Observable<any> {
    const user = this.userSignal();
    const payload = studentId ? { studentId } : { userId: user?.id };
    return from(window.electronAPI.invoke('get-student-progress', payload)).pipe(
      map(res => res.success ? res.data : null),
      catchError(err => {
        this.showNotification(`Error fetching progress: ${err}`, 'error');
        return of(null);
      })
    );
  }

  // --- Financial & Payments Mocks ---

  processPayment(paymentData: any): Observable<any> {
    return from(window.electronAPI.invoke('add-payment', paymentData)).pipe(
      tap(res => {
        if (res.success) this.showNotification('Payment processed successfully', 'success');
      })
    );
  }

  approvePayment(paymentId: number, status: string): Observable<any> {
    return from(window.electronAPI.invoke('update-payment-status', { id: paymentId, status })).pipe(
      tap(() => this.showNotification(`Payment ${status} successfully`, 'success'))
    );
  }

  fetchFinancialStats(): Observable<any> {
    return from(window.electronAPI.invoke('get-financial-stats')).pipe(
      map((res: any) => res.success ? res.data : {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        projectedRevenue: 0,
        chartData: { labels: [], revenue: [], expenses: [] },
        categoriesBreakdown: []
      })
    );
  }

  fetchTransactions(userId?: string | number, query?: string): Observable<any> {
    return from(window.electronAPI.invoke('get-transactions', { userId, query })).pipe(
      map((res: any) => res.success ? { success: true, data: res.data } : { success: false, data: [] })
    );
  }

  processSalary(payload: any): Observable<any> {
    return from(window.electronAPI.invoke('process-salary', payload)).pipe(
      tap(res => {
        if (res.success) this.showNotification('Salary processed successfully', 'success');
      })
    );
  }

  recordExpense(payload: any): Observable<any> {
    return from(window.electronAPI.invoke('record-expense', payload)).pipe(
      tap(res => {
        if (res.success) this.showNotification('Expense recorded successfully', 'success');
      })
    );
  }

  // Receipt generation (unchanged logic mostly)
  public generateReceipt(data: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text('TrafQuiz System', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(127, 140, 141);
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
      const targetId = data.studentId || data.userId;
      const student = this.studentsSignal().find(s => s.id === targetId || s.user_id === targetId);
      if (student) {
        details.push({ label: 'Client Name:', value: `${student.firstName} ${student.lastName}` });
      } else {
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

  fetchAllUsers(): Observable<any[]> {
    return from(window.electronAPI.invoke('get-all-users')).pipe(
      map((res: any) => res.success ? res.data : [])
    );
  }

  public addUser(user: any): Observable<any> {
    if (user.role === 'student') {
      return this.addStudent({ ...user, firstName: user.name?.split(' ')[0] || user.firstName, lastName: user.name?.split(' ')[1] || user.lastName || '' });
    } else if (user.role === 'instructor') {
      return this.addInstructor({ ...user, firstName: user.name?.split(' ')[0] || user.firstName, lastName: user.name?.split(' ')[1] || user.lastName || '' });
    }
    return from(window.electronAPI.invoke('add-user', user));
  }

  public updateUserPassword(userId: string, newPass: string): Observable<any> {
    return from(window.electronAPI.invoke('update-user-password', { id: userId, password: newPass }));
  }

  public deleteUser(userId: string, role?: string): Observable<any> {
    return from(window.electronAPI.invoke('delete-user', { id: userId, role }));
  }

  public deleteAccount(userId: string, password: string): Observable<any> {
    return from(window.electronAPI.invoke('delete-account', { id: userId, password })).pipe(tap(() => this.logout()));
  }

  public sendMessage(recipientId: string, senderId: string, message: string): Observable<any> {
    const user = this.userSignal();
    const payload = {
      recipientId,
      senderId,
      senderName: user?.username || 'User',
      text: message
    };
    return from(window.electronAPI.invoke('send-message', payload));
  }
}
