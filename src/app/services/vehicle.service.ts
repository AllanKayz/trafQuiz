import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Vehicle } from '../models/vehicle';
import { TraffiquizService } from '../traffiquiz.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private vehicles$ = new BehaviorSubject<Vehicle[]>([]);
  private base = 'http://localhost:84/trafQuiz/public/api/vehicles';

  constructor(private http: HttpClient, private trafService: TraffiquizService) {
    this.fetchVehicles().subscribe({ error: () => this.loadMock() });

    if (window.electronAPI) {
      window.electronAPI.on('data-change', (payload: any) => {
        if (payload.entity === 'vehicles') {
          console.log('Real-time vehicle update received');
          this.fetchVehicles().subscribe();
        }
      });
    }
  }

  fetchVehicles(role?: string, userId?: string | number): Observable<Vehicle[]> {
    return from(window.electronAPI['get-vehicles']( { role, userId })).pipe(
      map((res: any) => {
        if (res.success) return res.data;
        throw new Error(res.message || 'Failed to fetch vehicles');
      }),
      tap(vs => this.vehicles$.next(vs)),
      catchError((err) => {
        this.trafService.showNotification('Vehicle IPC fetch failed; falling back to mock', 'info');
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
    return from(window.electronAPI['report-vehicle-issue']( issue)).pipe(
      tap((res: any) => {
        if (res.success) this.trafService.showNotification('Issue reported successfully', 'success');
      }),
      catchError((err) => {
        this.trafService.showNotification('Failed to report issue', 'error');
        throw err;
      })
    );
  }

  logActivity(log: { vehicleId: number; instructorId: number; mileage: number; fuelLevel: number; notes?: string }): Observable<any> {
    return from(window.electronAPI['log-vehicle-activity']( log)).pipe(
      tap((res: any) => {
        if (res.success) this.trafService.showNotification('Log recorded successfully', 'success');
      }),
      catchError((err) => {
        this.trafService.showNotification('Failed to record log', 'error');
        throw err;
      })
    );
  }

  addVehicle(vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return from(window.electronAPI['add-vehicle']( vehicle)).pipe(
      map((res: any) => {
        if (res.success) return res.data;
        throw new Error(res.message || 'Failed to add vehicle');
      }),
      tap((v) => this.vehicles$.next([...this.vehicles$.getValue(), v])),
      catchError((err) => {
        this.trafService.showNotification('Failed to add vehicle: ' + err.message, 'error');
        throw err;
      })
    );
  }

  updateVehicle(id: number, vehicle: Partial<Vehicle>) {
    return from(window.electronAPI['update-vehicle']( { id, ...vehicle })).pipe(
      tap((res: any) => {
        if (res.success) {
          const updated = this.vehicles$.getValue().map(v => v.id === id ? { ...v, ...vehicle, updatedAt: new Date().toISOString() } : v);
          this.vehicles$.next(updated);
        }
      }),
      catchError(() => {
        const updated = this.vehicles$.getValue().map(v => v.id === id ? { ...v, ...vehicle, updatedAt: new Date().toISOString() } : v);
        this.vehicles$.next(updated);
        return of({ success: true });
      })
    );
  }

  deleteVehicle(id: number) {
    return from(window.electronAPI['delete-vehicle']( id)).pipe(
      tap((res: any) => {
        if (res.success) {
          const remaining = this.vehicles$.getValue().filter(v => v.id !== id);
          this.vehicles$.next(remaining);
        }
      }),
      catchError(() => {
        const remaining = this.vehicles$.getValue().filter(v => v.id !== id);
        this.vehicles$.next(remaining);
        return of({ success: true });
      })
    );
  }
}
