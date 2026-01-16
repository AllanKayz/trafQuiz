import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, catchError, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Vehicle } from '../models/vehicle';
import { TraffiquizService } from '../traffiquiz.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private vehicles$ = new BehaviorSubject<Vehicle[]>([]);
  private base = 'http://localhost:84/trafQuiz/public/api/vehicles';

  constructor(private http: HttpClient, private trafService: TraffiquizService) {
    this.fetchVehicles().subscribe({ error: () => this.loadMock() });
  }

  fetchVehicles(role?: string, userId?: string | number): Observable<Vehicle[]> {
    let url = this.base;
    if (role && userId) {
      url += `?role=${role}&userId=${userId}`;
    }
    return this.http.get<Vehicle[]>(url).pipe(
      tap(vs => this.vehicles$.next(vs)),
      catchError((err) => {
        this.trafService.showNotification('Vehicle API fetch failed; falling back to mock', 'info');
        return of([] as Vehicle[]);
      })
    );
  }

  private loadMock() {
    const mock: Vehicle[] = [
      { id: 1, make: 'Toyota', model: 'Corolla', year: 2018, registration: 'ABC-123', type: 'car', status: 'active', notes: 'Small sedan' },
      { id: 2, make: 'Isuzu', model: 'D-Max', year: 2019, registration: 'TRK-001', type: 'truck', status: 'active', notes: 'Work truck' },
      { id: 3, make: 'Honda', model: 'CBR', year: 2020, registration: 'MOT-09', type: 'motorcycle', status: 'maintenance', notes: 'Needs servicing' }
    ];
    this.vehicles$.next(mock);
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.vehicles$.asObservable();
  }

  reportIssue(issue: { vehicleId: number; instructorId: number; description: string; severity: string }): Observable<any> {
    return this.http.post(this.base + '/report-issue', issue).pipe(
      tap(() => this.trafService.showNotification('Issue reported successfully', 'success')),
      catchError((err) => {
        this.trafService.showNotification('Failed to report issue', 'error');
        throw err;
      })
    );
  }

  logActivity(log: { vehicleId: number; instructorId: number; mileage: number; fuelLevel: number; notes?: string }): Observable<any> {
    return this.http.post(this.base + '/log-activity', log).pipe(
      tap(() => this.trafService.showNotification('Log recorded successfully', 'success')),
      catchError((err) => {
        this.trafService.showNotification('Failed to record log', 'error');
        throw err;
      })
    );
  }

  addVehicle(vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.base + '/add', vehicle).pipe(
      tap((v) => this.vehicles$.next([...this.vehicles$.getValue(), v])),
      catchError(() => {
        const items = this.vehicles$.getValue();
        const max = items.reduce((m, it) => Math.max(m, it.id), 0);
        const newV: Vehicle = { id: max + 1, make: vehicle.make || '', model: vehicle.model || '', year: vehicle.year || new Date().getFullYear(), registration: vehicle.registration || '', type: vehicle.type || '', status: vehicle.status || 'active', notes: vehicle.notes || '', createdAt: new Date().toISOString() };
        this.vehicles$.next([...items, newV]);
        return of(newV);
      })
    );
  }

  updateVehicle(id: number, vehicle: Partial<Vehicle>) {
    return this.http.post(this.base + '/update', { id, ...vehicle }).pipe(
      tap(() => {
        const updated = this.vehicles$.getValue().map(v => v.id === id ? { ...v, ...vehicle, updatedAt: new Date().toISOString() } : v);
        this.vehicles$.next(updated);
      }),
      catchError(() => {
        const updated = this.vehicles$.getValue().map(v => v.id === id ? { ...v, ...vehicle, updatedAt: new Date().toISOString() } : v);
        this.vehicles$.next(updated);
        return of({ success: true });
      })
    );
  }

  deleteVehicle(id: number) {
    return this.http.post(this.base + '/delete', { id }).pipe(
      tap(() => {
        const remaining = this.vehicles$.getValue().filter(v => v.id !== id);
        this.vehicles$.next(remaining);
      }),
      catchError(() => {
        const remaining = this.vehicles$.getValue().filter(v => v.id !== id);
        this.vehicles$.next(remaining);
        return of({ success: true });
      })
    );
  }
}
