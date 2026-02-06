import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = 'http://localhost:84/trafQuiz/public/api/admin';

  constructor(private http: HttpClient) { }

  seedLessons(count?: number, token?: string): Observable<any> {
    return from(window.electronAPI['seed-lessons']( { count }));
  }

  checkLessons(token?: string): Observable<any> {
    return from(window.electronAPI['check-lessons']());
  }

  getInstructors(): Observable<any> {
    return from(window.electronAPI['get-instructors']()).pipe(
      map((res: any) => {
        if (res.success) return res.data;
        throw new Error(res.message || 'Failed to fetch instructors');
      })
    );
  }
}
