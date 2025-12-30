import { Injectable, signal, computed, inject } from '@angular/core';
import { of } from 'rxjs';
import { AlertComponent } from './alert/alert.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

// Define the electron API as a constant
const electron = window.electron;

/**
 * Interface representing a single quiz question.
 */
export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  hasImage: boolean;
  image?: string;
  flagged: boolean;
}

/**
 * Interface representing the raw question data from the API.
 */
export interface ApiResponse {
  id: number,
  answer: string,
  option_a: string,
  option_b: string,
  option_c: string,
  photo: string,
  question: string
}

/**
 * Interface representing the raw student data from the API.
 */
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

/**
 * Interface representing a student user.
 */
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

/**
 * Interface representing an instructor user.
 */
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

/**
 * Interface representing the raw instructor data from the API.
 */
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

/**
 * Service responsible for managing the application's data and state.
 * This service handles user authentication, data fetching for questions, students, and instructors,
 * and provides a centralized location for application state using Angular Signals.
 */
@Injectable({
  providedIn: 'root'
})
export class TraffiquizService {

  private alert = inject(MatDialog);

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
        console.error('Error parsing user data', e);
      }
    }
  }

  /**
   * Formats the raw user data into a more usable format for the application.
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
   * Logs a user in.
   * @param payload The user's login credentials.
   */
  async login(payload: any) {
    const user = await electron.login(payload);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.userSignal.set(this.formatUser(user));
    }
    return user;
  }

  /**
   * Logs the current user out.
   */
  logout() {
    localStorage.removeItem('user');
    this.userSignal.set(null);
  }

  /**
   * Fetches the exam questions from the database.
   */
  async fetchQuestions() {
    try {
      const questions = await electron.getQuizzes();
      this.questionsSignal.set(questions.map(this.transformQuestion));
    } catch (error) {
      console.error('Error fetching questions', error);
    }
  }

  /**
   * Transforms the raw question data from the database into the `Question` interface format.
   * @param item The raw question data.
   * @returns The transformed question.
   */
  private transformQuestion(item: any): Question {
    return {
      id: item.id,
      question: item.question,
      options: item.options,
      correct: item.correct,
      hasImage: !!item.image,
      image: item.image,
      flagged: false
    };
  }

  /**
   * Fetches all students from the database.
   */
  async fetchStudents() {
    try {
      const students = await electron.getUsers();
      this.studentsSignal.set(students);
    } catch (error) {
      console.error('Error fetching students', error);
    }
  }

  /**
   * Fetches all instructors from the database.
   */
  async fetchInstructors() {
    try {
      const instructors = await electron.getInstructors();
      this.instructorsSignal.set(instructors);
    } catch (error) {
      console.error('Error fetching instructors', error);
    }
  }

  /**
   * Adds a new question.
   * @param question The question to add.
   */
  async addQuestion(question: any) {
    try {
      await electron.addQuiz(question);
      this.fetchQuestions();
    } catch (error) {
      console.error('Error adding question', error);
    }
  }

  /**
   * Adds a new student.
   * @param student The student to add.
   */
  async addStudent(student: any) {
    try {
      await electron.addUser(student);
      this.fetchStudents();
    } catch (error) {
      console.error('Error adding student', error);
    }
  }

  /**
   * Adds a new instructor.
   * @param instructor The instructor to add.
   */
  async addInstructor(instructor: any) {
    try {
      await electron.addInstructor(instructor);
      this.fetchInstructors();
    } catch (error) {
      console.error('Error adding instructor', error);
    }
  }

  /**
   * Fetches the available packages from the database.
   */
  async getPackages() {
    try {
      const packages = await electron.getPackages();
      this.packagesSignal.set(packages);
    } catch (error) {
      console.error('Error fetching packages', error);
    }
  }

  /**
   * Fetches the instructor specializations from the database.
   */
  async getSpecializations() {
    try {
      const specializations = await electron.getSpecializations();
      this.specializationsSignal.set(specializations);
    } catch (error) {
      console.error('Error fetching specializations', error);
    }
  }

  /**
   * Fetches the instructor certifications from the database.
   */
  async getCertifications() {
    try {
      const certifications = await electron.getCertifications();
      this.certificationsSignal.set(certifications);
    } catch (error) {
      console.error('Error fetching certifications', error);
    }
  }

  /**
   * Adds a new certification.
   * @param certification The certification to add.
   */
  async addCertification(certification: any) {
    try {
      await electron.addCertification(certification);
      this.getCertifications();
    } catch (error) {
      console.error('Error adding certification', error);
    }
  }

  /**
   * Adds a new specialization.
   * @param specialization The specialization to add.
   */
  async addSpecialization(specialization: any) {
    try {
      await electron.addSpecialization(specialization);
      this.getSpecializations();
    } catch (error) {
      console.error('Error adding specialization', error);
    }
  }

  /**
   * Updates an existing student.
   * @param student The student to update.
   */
  async updateStudent(student: any) {
    try {
      await electron.updateUser(student);
      this.fetchStudents();
    } catch (error) {
      console.error('Error updating student', error);
    }
  }

  /**
   * Updates an existing question.
   * @param question The question to update.
   */
  async updateQuestion(question: any) {
    try {
      await electron.updateQuiz(question);
      this.fetchQuestions();
    } catch (error) {
      console.error('Error updating question', error);
    }
  }

  /**
   * Updates an existing instructor.
   * @param instructor The instructor to update.
   */
  async updateInstructor(instructor: any) {
    try {
      await electron.updateInstructor(instructor);
      this.fetchInstructors();
    } catch (error) {
      console.error('Error updating instructor', error);
    }
  }

  /**
   * Updates an existing specialization.
   * @param specialization The specialization to update.
   */
  async updateSpecialization(specialization: any) {
    try {
      await electron.updateSpecialization(specialization);
      this.getSpecializations();
    } catch (error) {
      console.error('Error updating specialization', error);
    }
  }

  /**
   * Updates an existing certification.
   * @param certification The certification to update.
   */
  async updateCertification(certification: any) {
    try {
      await electron.updateCertification(certification);
      this.getCertifications();
    } catch (error) {
      console.error('Error updating certification', error);
    }
  }

  /**
   * Deletes a student.
   * @param studentId The ID of the student to delete.
   */
  async deleteStudent(studentId: number) {
    try {
      await electron.deleteUser(studentId);
      this.fetchStudents();
    } catch (error) {
      console.error('Error deleting student', error);
    }
  }

  /**
   * Deletes a question.
   * @param questionId The ID of the question to delete.
   */
  async deleteQuestion(questionId: number) {
    try {
      await electron.deleteQuiz(questionId);
      this.fetchQuestions();
    } catch (error) {
      console.error('Error deleting question', error);
    }
  }

  /**
   * Deletes an instructor.
   * @param instructorId The ID of the instructor to delete.
   */
  async deleteInstructor(instructorId: number) {
    try {
      await electron.deleteInstructor(instructorId);
      this.fetchInstructors();
    } catch (error) {
      console.error('Error deleting instructor', error);
    }
  }

  /**
   * Fetches an exam.
   * @param token The exam token.
   */
  async fetchExam(token: any) {
    try {
      const exam = await electron.fetchExam(token);
      this.questionsSignal.set(exam.map(this.transformQuestion));
    } catch (error) {
      console.error('Error fetching exam', error);
    }
  }

  /**
   * Fetches the exam duration.
   */
  async fetchExamDuration() {
    try {
      const duration = await electron.fetchExamDuration();
      this.examDuration.set(duration);
    } catch (error) {
      console.error('Error fetching exam duration', error);
    }
  }

  /**
   * Sets the exam timeframe.
   * @param time The new exam timeframe.
   */
  async setExamTimeframe(time: any) {
    try {
      return await electron.setExamTimeframe(time);
    } catch (error) {
      console.error('Error setting exam timeframe', error);
    }
  }

  /**
   * Syncs the local database with the remote server.
   */
  async sync() {
    try {
      const result = await electron.sync();
      console.log('Sync result:', result);
    } catch (error) {
      console.error('Error syncing data', error);
    }
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

}
