import { Injectable, inject} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TraffiquizService {
  private http: HttpClient = inject(HttpClient);
  private url = 'http://localhost:84/trafQuiz/public/api/';
  private loggedUser: any;

  private menus = {
    admin:['Dashboard', 'Messages','Instructors', 'Students', 'Exams', 'Lessons','Vehicles', 'Finances', 'Reports', 'User Access', 'Settings'],
    instructor: ['Dashboard', 'Schedule', 'Students', 'Feedbacks', 'Vehicle Status', 'Messages', 'Settings'],
    student: ['Dashboard', 'Exam', 'Lessons', 'Progress Reports', 'Messages', 'Payments', 'Settings']
  }

  private widgets = {
    admin: [],
    instructor: [],
    student: []
  }

  getExamTimeframe(): Observable<any> {
	return this.http.get(this.url + 'time');
  }

  login(payload:any): Observable<any> {
    return this.http.post(this.url + 'login', payload);
  }

  retrieveExam(token:any):Observable<any> {
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

  updateStudent(updateDetails: any):Observable<any> {
    return this.http.post(this.url + 'updatestudent', updateDetails);
  }

  deleteStudent(studentId: any): Observable<any> {
    return this.http.post(this.url + 'deletestudent', studentId);
  }

  getUser() {
	this.loggedUser = JSON.parse(localStorage['user']);
	switch(this.loggedUser['role']) {
		case 'admin':
		this.loggedUser = {
			username: this.loggedUser['username'],
			sidebar: this.menus.admin,
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
