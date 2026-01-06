import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = '/trafQuiz/public/api/admin';

  constructor(private http: HttpClient) {}

  seedLessons(count?: number, token?: string): Observable<any> {
    const url = token ? `${this.base}/seed-lessons?token=${encodeURIComponent(token)}` : `${this.base}/seed-lessons`;
    return this.http.post(url, { count });
  }

  checkLessons(token?: string): Observable<any> {
    const url = token ? `${this.base}/check-lessons?token=${encodeURIComponent(token)}` : `${this.base}/check-lessons`;
    return this.http.get(url);
  }

  getInstructors(): Observable<any> {
    return this.http.get('/trafQuiz/public/api/instructors');
  }
}
