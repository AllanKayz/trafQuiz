import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AlertComponent } from './alert/alert.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {  ApiResponse, Question, Student, studentApiResponse, Instructor, instructorApiResponse } from './trafquiz';

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

  // Convert user data to signal for reactive user state management.
  private userSignal = signal<any>(null);
  /** A computed signal that exposes the current user's data. */
  public currentUser = computed(() => this.userSignal());

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
    admin: ['Dashboard', 'Instructors', 'Students', 'Exams', 'Questions', 'Lessons', 'Vehicles', 'Finances', 'Reports', 'Messages', 'User Access', 'Settings'],
    instructor: ['Dashboard', 'Schedule', 'Students', 'Feedbacks', 'Vehicle Status', 'Messages', 'Settings'],
    student: ['Dashboard', 'Exam', 'Lessons', 'Progress Reports', 'Messages', 'Payments', 'Settings'],
    icons: { dashboard: '📊', questions: '❓', instructors: '👨‍🏫', exams: '📝', students: '👥', vehicles: '🚗', reports: '📈', settings: '⚙️' }
  }

  /** Configuration for the widgets displayed on the dashboard for different user roles. */
  private widgetsConfig = {
    admin: [
      { title: 'Total Students', data: 0, footer: 'Since last month' },
      { title: 'Revenue', data: '$2,450', footer: 'Current month' },
      { title: 'Exams Today', data: 12, footer: 'Scheduled' },
      { title: 'Pass Rate', data: 72, footer: 'A High Success Record' },
      { title: 'Total Instructors', data: 15, footer: 'Since last month' }
    ],
    instructor: [
      { title: 'Next Lesson', data: 24, footer: 'June' },
      { title: 'Students Today', data: 3, footer: 'Scheduled' },
      { title: 'Messages', data: 5, footer: 'Unread' }
    ],
    student: [
      { title: 'Next Lesson', data: 24, footer: 'June' },
      { title: 'Progress', data: '75%', footer: 'Overall' },
      { title: 'Days Left', data: 15, footer: 'Until Exam' }
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
    return user ? this.widgetsConfig[user.role as keyof typeof this.widgetsConfig] : [];
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
   * Attempts to call backend update endpoint if available; otherwise updates local storage.
   */
  public updateProfile(payload: any): Observable<any> {
    // Update local copy immediately
    const raw = this.getRawUser() || {};
    const updated = { ...raw, ...payload };
    localStorage.setItem('user', JSON.stringify(updated));
    // Update the formatted signal as well
    this.userSignal.set(this.formatUser(updated));

    // Attempt backend sync; endpoint may not exist yet. Return observable that resolves even if request fails.
    return this.http.post(this.url + 'updateuser', updated).pipe(
      tap((res) => res),
      catchError((err) => {
        console.warn('Profile update failed; saved locally', err);
        return of(updated);
      })
    );
  }

  /**
   * Persist user preferences locally.
   */
  public updatePreferences(prefs: any) {
    const stored = JSON.parse(localStorage.getItem('appSettings') || '{}');
    const merged = { ...stored, ...prefs };
    localStorage.setItem('appSettings', JSON.stringify(merged));
    return merged;
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

        this.openAlertDialog(data);
        console.error('Error parsing user data', e);
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
          console.error('Fatal error', response.message);
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
        console.error('Error Fetching Data', error);
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
        const data = {
          title: `Error: ${error.status} (${error.statusText})`,
          message: `Error fetching questions /c: ${error.error.message}`,
          type: 'error',
          buttons: [
            { text: 'Close', value: 'close', color: 'warn' }
          ]
        };

        this.openAlertDialog(data);
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
    return this.http.delete(this.url + `questions/${questionId}`);
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
    return this.http.put(this.url + `questions/${question.id}`, question);
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
        const data = {
          title: `Error: ${error.status} (${error.statusText})`,
          message: `Error fetching students: ${error.error.message}`,
          type: 'error',
          buttons: [
            { text: 'Close', value: 'close', color: 'warn' }
          ]
        };

        this.openAlertDialog(data);
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
    return this.http.put(this.url + `students/${student.id}`, student);
  }

  /**
   * Deletes a student.
   * @param student The student to delete.
   * @returns An observable that emits the API response.
   */
  deleteStudent(student: Student): Observable<any> {
    return this.http.delete(this.url + `deletestudent/${student.id}`);
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
        const data = {
          title: `Error: ${error.status} (${error.statusText})`,
          message: `Error fetching instructors: ${error.error.message}`,
          type: 'error',
          buttons: [
            { text: 'Close', value: 'close', color: 'warn' }
          ]
        };

        this.openAlertDialog(data);
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
    return this.http.put(this.url + `instructors/${instructor.id}`, instructor);
  }

  /**
   * Deletes an instructor.
   * @param instructor The instructor to delete.
   * @returns An observable that emits the API response.
   */
  deleteInstructor(instructor: Instructor): Observable<any> {
    return this.http.delete<Instructor[]>(this.url + `deleteinstructor/${instructor.id}`);
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
        const data = {
          title: `Error: ${error.status} (${error.statusText})`,
          message: `Error fetching packages: ${error.error.message}`,
          type: 'error',
          buttons: [
            { text: 'Close', value: 'close', color: 'warn' }
          ]
        };

        this.openAlertDialog(data);
      }
    });
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
        const data = {
          title: `Error: ${error.status} (${error.statusText})`,
          message: `Error fetching categories: ${error.error.message}`,
          type: 'error',
          buttons: [
            { text: 'Close', value: 'close', color: 'warn' }
          ]
        };

        this.openAlertDialog(data);
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
        const data = {
          title: `Error: ${error.status} (${error.statusText})`,
          message: `Error fetching specializations: ${error.error.message}`,
          type: 'error',
          buttons: [
            { text: 'Close', value: 'close', color: 'warn' }
          ]
        };

        this.openAlertDialog(data);
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
    return this.http.put(this.url + `specializations/${specialization.id}`, specialization);
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
        const data = {
          title: `Error: ${error.status} (${error.statusText})`,
        message: `Error fetching certifications: ${error.error.message}`,
          type: 'error',
          buttons: [
            { text: 'Close', value: 'close', color: 'warn' }
          ]
        };

        this.openAlertDialog(data);
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
    return this.http.put(this.url + `certifications/${certification.id}`, certification);
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

    /*
    this.alert.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
    });
    */
  }

}
