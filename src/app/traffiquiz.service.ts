import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  hasImage: boolean;
  image?: string;
  flagged: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TraffiquizService {

  /*
  private http = inject(HttpClient);
  getQuestion: Observable<any> {
    return this.http.get();
  }*/


  questions: Question[] = [
    {
      id: 1,
      question: "What is the maximum speed limit in a residential area unless otherwise posted?",
      options: ["25 mph", "35 mph", "45 mph"],
      correct: 0,
      hasImage: false,
      flagged: false
    },
    {
      id: 2,
      question: "What does this traffic sign indicate?",
      options: [
        "Stop completely before proceeding",
        "Yield to oncoming traffic",
        "Merge lanes ahead"
      ],
      correct: 1,
      hasImage: true,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBvbHlnb24gcG9pbnRzPSIxMDAsMjAgMTgwLDE4MCAyMCwxODAiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iI0ZGMDAwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHRleHQgeD0iMTAwIiB5PSIxMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDAiPllJRUxEPC90ZXh0Pjwvc3ZnPg==",
      flagged: false
    },
    {
      id: 3,
      question: "When are you required to use headlights?",
      options: [
        "Only when it's completely dark outside",
        "Between sunset and sunrise, and when visibility is reduced",
        "Only during heavy rain or snow"
      ],
      correct: 1,
      hasImage: false,
      flagged: false
    },
    {
      id: 4,
      question: "In this parking scenario, where is it legal to park?",
      options: [
        "Position A - Next to the fire hydrant",
        "Position B - In the crosswalk area",
        "Position C - 15 feet from the fire hydrant"
      ],
      correct: 2,
      hasImage: true,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNGNUY1RjUiLz48cmVjdCB4PSIwIiB5PSIxMDAiIHdpZHRoPSI0MDAiIGhlaWdodD0iNTAiIGZpbGw9IiM2NjY2NjYiLz48cmVjdCB4PSIxODAiIHk9IjkwIiB3aWR0aD0iNDAiIGhlaWdodD0iNzAiIGZpbGw9IiNGRjAwMDAiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSI4NSIgcj0iOCIgZmlsbD0iI0ZGRkZGRiIvPjxyZWN0IHg9IjMwIiB5PSIxNjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzAwN0JGRiIvPjx0ZXh0IHg9IjYwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRiI+QTwvdGV4dD48cmVjdCB4PSIxMzAiIHk9IjE2MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDA3QkZGIi8+PHRleHQgeD0iMTYwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRiI+QjwvdGV4dD48cmVjdCB4PSIyNzAiIHk9IjE2MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDA3QkZGIi8+PHRleHQgeD0iMzAwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRiI+QzwvdGV4dD48cmVjdCB4PSIzNDAiIHk9IjE2MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDA3QkZGIi8+PHRleHQgeD0iMzcwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRiI+RDwvdGV4dD48cmVjdCB4PSIzNDAiIHk9IjUwIiB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIGZpbGw9IiM4ODg4ODgiLz48dGV4dCB4PSIzNzAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiNGRkYiPkRyaXZld2F5PC90ZXh0PjxyZWN0IHg9IjEyMCIgeT0iMTUwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48dGV4dCB4PSIyMDAiIHk9IjIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIj5GaXJlIEh5ZHJhbnQ8L3RleHQ+PC9zdmc+",
      flagged: false
    },
    {
      id: 5,
      question: "What should you do when approaching a school bus with flashing red lights?",
      options: [
        "Slow down and proceed with caution",
        "Stop completely until lights stop flashing",
        "Change lanes and pass quickly"
      ],
      correct: 1,
      hasImage: false,
      flagged: false
    }
  ];

  private http: HttpClient = inject(HttpClient);
  private url = 'http://localhost:84/trafQuiz/public/api/';
  private loggedUser: any;

  private menus = {
    admin: ['Dashboard', 'Messages', 'Instructors', 'Students', 'Exams', 'Questions', 'Lessons', 'Vehicles', 'Finances', 'Reports', 'User Access', 'Settings'],
    instructor: ['Dashboard', 'Schedule', 'Students', 'Feedbacks', 'Vehicle Status', 'Messages', 'Settings'],
    student: ['Dashboard', 'Exam', 'Lessons', 'Progress Reports', 'Messages', 'Payments', 'Settings'],
    icons: {
      dashboard: '📊',
      questions: '❓',
      instructors: '👨‍🏫',
      exams: '📝',
      students: '👥',
      vehicles: '🚗',
      reports: '📈',
      settings: '⚙️',
    }
  }

  private widgets = {
    admin: [],
    instructor: [],
    student: []
  }

  getExamTimeframe(): Observable<any> {
    return this.http.get(this.url + 'time');
  }

  login(payload: any): Observable<any> {
    return this.http.post(this.url + 'login', payload);
  }

  retrieveExam(token: any): Observable<any> {
    return this.http.get(this.url + 'exam?token=' + token.trim());
  }

  getStoredResponses() {
    const responses = localStorage.getItem('quizResponses');
    return responses ? JSON.parse(responses) : null
  }

  saveResponses(responses: any) {
    localStorage.setItem('quizResponses', JSON.stringify(responses));
  }

  getAdminData(token: any): Observable<any> {
    return this.http.get(this.url + 'admin?token=' + token.trim());
  }

  setExamTimeframe(time: any): Observable<any> {
    return this.http.post(this.url + 'timeupdate', time);
  }

  addStudent(studentDetails: any): Observable<any> {
    return this.http.post(this.url + 'addstudent', studentDetails);
  }

  updateStudent(updateDetails: any): Observable<any> {
    return this.http.post(this.url + 'updatestudent', updateDetails);
  }

  deleteStudent(studentId: any): Observable<any> {
    return this.http.post(this.url + 'deletestudent', studentId);
  }

  getUser() {
    this.loggedUser = JSON.parse(localStorage['user']);
    switch (this.loggedUser['role']) {
      case 'admin':
        this.loggedUser = {
          username: this.loggedUser['username'],
          sidebar: this.menus.admin,
          sidebarIcons: this.menus.icons,
          widgets: [],
          data: []
        }
        break;
      case 'instructor':
        this.loggedUser = {
          username: this.loggedUser['username'],
          sidebar: this.menus.instructor,
          widgets: [],
          data: []
        }
        break;
      case 'student':
        this.loggedUser = {
          username: this.loggedUser['username'],
          sidebar: this.menus.student,
          sidebarIcons: this.menus.icons,
          widgets: [],
          data: []
        }
        break;
      default:
        this.loggedUser = null;
    }
    return this.loggedUser;
  }
}
