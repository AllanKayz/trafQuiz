import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AlertComponent } from './alert/alert.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  hasImage: boolean;
  image?: string;
  flagged: boolean;
}

export interface ApiResponse {
  id: number,
  answer: string,
  option_a: string,
  option_b: string,
  option_c: string,
  photo: string,
  question: string
}

export interface studentApiResponse {
  id: number,
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: string,
  status: string,
  enrollmentDate: Date
}

export interface Student {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  password: string;
  package: number;
}

export interface Instructor {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  license: string;
  specialization: string;
  certification: string;
  experience: number;
  availability: boolean;
  password: string;
}

export interface instructorApiResponse {
  id: number,
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  license: string,
  specialization: string,
  certification: string,
  experience: number,
  availability: boolean,
  employmentDate: Date
}

@Injectable({
  providedIn: 'root'
})
export class TraffiquizService {

  private http: HttpClient = inject(HttpClient);
  private url = 'http://localhost:84/trafQuiz/public/api/';
  public alert = inject(MatDialog);

  // Convert user data to signal
  private userSignal = signal<any>(null);
  public currentUser = computed(() => this.userSignal());

  // Convert questions/students to a writable signal
  public questionsSignal = signal<Question[]>([]);
  public studentsSignal = signal<any[]>([]);
  public instructorsSignal = signal<Instructor[]>([]);
  public packagesSignal = signal<any[]>([]);
  public specializationsSignal = signal<any[]>([]);
  public certificationsSignal = signal<any[]>([]);

  // Signal for exam duration (in seconds)
  examDuration = signal<number>(300); //default 10 minutes

  // Create computed signals for derived states
  public totalQuestions = computed(() => this.questionsSignal().length);
  public flaggedQuestions = computed(() => this.questionsSignal().filter(q => q.flagged).length);
  public totalStudents = computed(() => this.studentsSignal().length);
  public totalInstructors = computed(() => this.instructorsSignal().length);

  private menus = {
    admin: ['Dashboard', 'Instructors', 'Students', 'Exams', 'Questions', 'Lessons', 'Vehicles', 'Finances', 'Reports', 'Messages', 'User Access', 'Settings'],
    instructor: ['Dashboard', 'Schedule', 'Students', 'Feedbacks', 'Vehicle Status', 'Messages', 'Settings'],
    student: ['Dashboard', 'Exam', 'Lessons', 'Progress Reports', 'Messages', 'Payments', 'Settings'],
    icons: { dashboard: '📊', questions: '❓', instructors: '👨‍🏫', exams: '📝', students: '👥', vehicles: '🚗', reports: '📈', settings: '⚙️' }
  }

  // Widgets configurations
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

  // Computed private signals for user widgets
  public userWidgets = computed(() => {
    const user = this.userSignal();
    return user ? this.widgetsConfig[user.role as keyof typeof this.widgetsConfig] : [];
  });

  // Computed Questions panel Widgets for user
  public userQuestionWidgets = computed(() => {
    const user = this.userSignal();
    return user ? this.questionWidgetConfig[user.role as keyof typeof this.questionWidgetConfig] : [];
  });

  // Computed Students panel Widgets for user
  public userStudentWidgets = computed(() => {
    const user = this.userSignal();
    return user ? this.studentWidgetConfig[user.role as keyof typeof this.studentWidgetConfig] : [];
  });

  public userInstructorWidgets = computed(() => {
    const user = this.userSignal();
    return user ? this.instructorWidgetConfig[user.role as keyof typeof this.instructorWidgetConfig] : [];
  });

  // Computed signal for table ready questions
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

  logout() {
    localStorage.removeItem('user');
    this.userSignal.set(null);
  }

  // Convert exam retrieval to signal-based approach
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

  // Helper function to transform API response
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

  // Update local storage and signal atomically
  saveResponses(responses: any) {
    localStorage.setItem('quizResponses', JSON.stringify(responses));
    // Update signal if needed (example)
    // this.responsesSignal.set(responses);
  }

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

  deleteQuestion(questionId: number): Observable<any> {
    return this.http.delete(this.url + `questions/${questionId}`);
  }

  addQuestion(question: any): Observable<any> {
    return this.http.post(this.url + 'questions', question);
  }

  updateQuestion(question: any): Observable<any> {
    return this.http.put(this.url + `questions/${question.id}`, question);
  }

  // Students CRUD
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

  addStudent(student: any): Observable<Student[]> {
    return this.http.post<Student[]>(this.url + 'addstudent', student);
  }

  updateStudent(student: any): Observable<any> {
    return this.http.put(this.url + `students/${student.id}`, student);
  }

  deleteStudent(student: Student): Observable<any> {
    return this.http.delete(this.url + `deletestudent/${student.id}`);
  }

  // Instructors CRUD
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

  addInstructor(instructor: any): Observable<any> {
	console.log(instructor);
    return this.http.post(this.url + 'addinstructor', instructor);
  }

  updateInstructor(instructor: any): Observable<any> {
    return this.http.put(this.url + `instructors/${instructor.id}`, instructor);
  }

  deleteInstructor(instructor: Instructor): Observable<any> {
    return this.http.delete<Instructor[]>(this.url + `deleteinstructor/${instructor.id}`);
  }


  addCategory(category: any): Observable<any> {
    return this.http.post(this.url + 'category', category);
  }

  getStoredResponses() {
    const responses = localStorage.getItem('quizResponses');
    return responses ? JSON.parse(responses) : null
  }

  // To be removed section
  getAdminData(token: any): Observable<any> {
    return this.http.get(this.url + 'admin?token=' + token.trim());
  }

  setExamTimeframe(time: any): Observable<any> {
    return this.http.post(this.url + 'timeupdate', time);
  }

  deleteStudet(studentId: any): Observable<any> {
    return this.http.post(this.url + 'deletestudent', studentId);
  }

  // Miscelleneous CRUD
  private transformPackagesJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.package + ' - $' + `${item.amount}`
    }))
  }

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

  private transformQuestionCategoriesJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.category
    }))
  }

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
  
  private transformSpecializationJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.specialization
    }))
  }
  
  addSpecialization(specialization: any): Observable<any> {
    return this.http.post(this.url + 'addspecialization', specialization);
  }

  updateSpecialization(specialization: any): Observable<any> {
    return this.http.put(this.url + `specializations/${specialization.id}`, specialization);
  }


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
  
  private transformCertificationJson(data: any): any {
    return data.map((item: any) => ({
      value: item.id,
      label: item.certification
    }))
  }
  
  updateCertification(certification: any): Observable<any> {
    return this.http.put(this.url + `certifications/${certification.id}`, certification);
  }

  addCertification(certification: any): Observable<any> {
    return this.http.post(this.url + 'addcertification', certification);
  }

  // Alerts Processing
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
