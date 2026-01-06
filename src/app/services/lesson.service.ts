import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Lesson } from '../models/lesson';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private lessons$ = new BehaviorSubject<Lesson[]>([]);
  private base = '/trafQuiz/public/api/lessons';

  constructor(private http: HttpClient) {
    // Initialise from backend, fallback to mock data on error
    this.fetchLessons().subscribe({ error: () => this.loadMockData() });
  }

  private loadMockData() {
    const now = new Date();
    const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60000).toISOString();

    const lessons: Lesson[] = [
      {
        id: 1,
        title: 'Road Safety Basics',
        subject: 'Traffic Rules',
        startTime: addMinutes(now, 60),
        durationMinutes: 60,
        instructor: { id: 10, name: 'John Doe' },
        location: 'Room 101',
        status: 'upcoming',
        studentCount: 12,
        notes: 'Bring your learner permit.'
      },
      {
        id: 2,
        title: 'Practical Driving - Car',
        subject: 'Practical',
        startTime: addMinutes(now, 180),
        durationMinutes: 90,
        instructor: { id: 11, name: 'Jane Smith' },
        location: 'Parking Lot B',
        status: 'upcoming',
        studentCount: 3,
        notes: 'Meet in the parking lot 10 mins before start.'
      },
      {
        id: 3,
        title: 'Theory Refresher',
        subject: 'Theory',
        startTime: addMinutes(now, -1440),
        durationMinutes: 45,
        instructor: { id: 12, name: 'Peter Lee' },
        location: 'Online (Zoom)',
        onlineLink: 'https://meet.example.com/abc',
        status: 'completed',
        studentCount: 18,
        notes: 'Recording available.'
      }
    ];

    this.lessons$.next(lessons);
  }

  fetchLessons(range?: string): Observable<Lesson[]> {
    const url = range ? `${this.base}?range=${encodeURIComponent(range)}` : this.base;
    return this.http.get<Lesson[]>(url).pipe(
      tap((ls) => this.lessons$.next(ls)),
      catchError((err) => {
        console.warn('Lesson API fetch failed, falling back to mock', err);
        return of([] as Lesson[]);
      })
    );
  }

  getLessons(range?: string): Observable<Lesson[]> {
    // Return observable of BehaviorSubject, but also trigger fetch if a range is requested
    if (range) {
      this.fetchLessons(range).subscribe();
    }
    return this.lessons$.asObservable();
  }

  getLesson(id: number): Observable<Lesson | undefined> {
    const url = `${this.base}?id=${id}`;
    return this.http.get<Lesson>(url).pipe(
      catchError(() => of(this.lessons$.getValue().find((l) => l.id === id)))
    );
  }

  joinLesson(id: number): Observable<any> {
    const url = `${this.base}/join`;
    return this.http.post(url, { id }).pipe(
      catchError(() => of({ success: true, meetingLink: 'https://meet.example.com/abc' }))
    );
  }

  cancelLesson(id: number): Observable<any> {
    const url = `${this.base}/cancel`;
    return this.http.post(url, { id }).pipe(
      tap(() => {
        const updated = this.lessons$.getValue().map((l) => (l.id === id ? { ...l, status: 'cancelled' } : l)) as Lesson[];
        this.lessons$.next(updated);
      }),
      catchError(() => {
        const updated = this.lessons$.getValue().map((l) => (l.id === id ? { ...l, status: 'cancelled' } : l)) as Lesson[];
        this.lessons$.next(updated);
        return of({ success: true });
      })
    );
  }

  patchLesson(id: number, payload: Partial<Lesson>): Observable<any> {
    const url = `${this.base}/update`;
    return this.http.post(url, { id, ...payload }).pipe(
      tap(() => {
        const updated = this.lessons$.getValue().map((l) => (l.id === id ? { ...l, ...payload, updatedAt: new Date().toISOString() } : l)) as Lesson[];
        this.lessons$.next(updated);
      }),
      catchError(() => {
        const updated = this.lessons$.getValue().map((l) => (l.id === id ? { ...l, ...payload, updatedAt: new Date().toISOString() } : l)) as Lesson[];
        this.lessons$.next(updated);
        return of({ success: true });
      })
    );
  }

  addLesson(payload: Partial<Lesson>, token?: string): Observable<any> {
    const url = token ? `${this.base}/add?token=${encodeURIComponent(token)}` : `${this.base}/add`;
    return this.http.post<Lesson>(url, payload).pipe(
      tap((newLesson) => {
        const updated = [...this.lessons$.getValue(), newLesson];
        this.lessons$.next(updated);
      })
    );
  }
}

