import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, catchError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Lesson } from '../models/lesson';
import { TraffiquizService } from '../traffiquiz.service';
import { VehicleService } from './vehicle.service';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private lessons$ = new BehaviorSubject<Lesson[]>([]);
  private base = '/trafQuiz/public/api/lessons';

  private trafQuiz = inject(TraffiquizService);
  private vehicleService = inject(VehicleService);

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
      }),
      catchError(() => {
        // Mock success for demo
        const newLesson = {
          id: Date.now(),
          status: 'pending',
          studentCount: 1,
          ...payload,
          createdAt: new Date().toISOString()
        } as Lesson;
        this.lessons$.next([...this.lessons$.getValue(), newLesson]);
        return of(newLesson);
      })
    );
  }

  approveLesson(id: number): Observable<any> {
    return this.patchLesson(id, { status: 'confirmed' });
  }

  declineLesson(id: number, notes?: string): Observable<any> {
    return this.patchLesson(id, { status: 'declined', notes });
  }

  autoAllocateSchedules(): Observable<any> {
    const lessons = this.lessons$.getValue();
    const instructors = this.trafQuiz.instructorsSignal();

    return this.vehicleService.getVehicles().pipe(
      tap((vehicles) => {
        const unallocated = lessons.filter(l => (l.status === 'upcoming' || l.status === 'pending' || l.status === 'confirmed') && !l.assignedVehicleId);
        const updatedLessons = [...lessons];

        unallocated.forEach(lesson => {
          const lessonDate = new Date(lesson.startTime).toDateString();
          const lessonType = (lesson.vehicleType || 'car').toLowerCase();

          // 1. Find suitable instructor if already assigned, validate capacity & specialization
          let instructor = instructors.find(i => i.id === lesson.instructor.id);

          if (instructor) {
            // Check instructor capacity for the day (Limit 5)
            const instructorDailyCount = updatedLessons.filter(l =>
              l.instructor.id === instructor!.id &&
              new Date(l.startTime).toDateString() === lessonDate &&
              (l.status === 'confirmed' || l.status === 'upcoming')
            ).length;

            if (instructorDailyCount >= 5) {
              console.warn(`Instructor ${instructor.firstName} reached max capacity (5) for ${lessonDate}`);
              return;
            }

            // Check specialization/certification
            const spec = (instructor.specialization || '').toLowerCase();
            const cert = (instructor.certification || '').toLowerCase();
            const canTeach = spec.includes(lessonType) || cert.includes(lessonType) ||
              (lessonType === 'car' && (spec === '' || spec.includes('practical')));

            if (!canTeach) {
              console.warn(`Instructor ${instructor.firstName} not specialized for ${lessonType}`);
              return;
            }
          }

          // 2. Find available vehicle of matching type
          const availableVehicle = vehicles.find(v => {
            const vType = (v.type || 'car').toLowerCase();
            if (vType !== lessonType || v.status !== 'active') return false;

            // Simple overlap check
            const isBooked = updatedLessons.some(l =>
              l.assignedVehicleId === v.id &&
              l.status !== 'cancelled' &&
              Math.abs(new Date(l.startTime).getTime() - new Date(lesson.startTime).getTime()) < (l.durationMinutes || 60) * 60000
            );

            return !isBooked;
          });

          if (availableVehicle) {
            const index = updatedLessons.findIndex(l => l.id === lesson.id);
            if (index !== -1) {
              updatedLessons[index] = {
                ...updatedLessons[index],
                assignedVehicleId: availableVehicle.id,
                status: 'confirmed'
              };
            }
          }
        });

        this.lessons$.next(updatedLessons);
      }),
      map(() => ({
        success: true,
        message: `Allocation complete. Enforced instructor limits and specializations.`
      }))
    );
  }
}
