import { Component, inject, signal } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { TraffiquizService } from '../../../traffiquiz.service';

@Component({
    selector: 'app-vehicle-status',
    standalone: true,
    imports: [MatCardModule, MatIconModule, MatButtonModule],
    template: `
    <div class="vehicle-status-container fade-in">
      <header class="page-header">
        <h1>Assigned Vehicle Status</h1>
        <p>Monitor the status and maintenance of your assigned vehicles.</p>
      </header>
    
      @if (assignedVehicles().length > 0) {
        <div class="vehicle-grid">
          @for (v of assignedVehicles(); track v) {
            <mat-card class="vehicle-card">
              <mat-card-header>
                <div mat-card-avatar><mat-icon>directions_car</mat-icon></div>
                <mat-card-title>{{v.make}} {{v.model}}</mat-card-title>
                <mat-card-subtitle>{{v.registration}}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="status-info">
                  <span class="label">Status:</span>
                  <span class="value" [class]="v.status">{{v.status}}</span>
                </div>
                @if (v.notes) {
                  <p class="notes">{{v.notes}}</p>
                }
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="warn"><mat-icon>report_problem</mat-icon> Report Issue</button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      } @else {
        <div class="no-data">
          <mat-icon>no_crash</mat-icon>
          <p>No vehicles assigned to you at this moment.</p>
        </div>
      }
    
    </div>
    `,
    styles: [`
    .vehicle-status-container { padding: 24px; }
    .vehicle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; margin-top: 24px; }
    .status-info { margin: 16px 0; display: flex; gap: 8px; }
    .value.active { color: green; font-weight: bold; }
    .value.maintenance { color: orange; font-weight: bold; }
    .no-data { text-align: center; padding: 64px; color: #999; }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; }
  `]
})
export class VehicleStatusComponent {
    private vehicleService = inject(VehicleService);
    private trafService = inject(TraffiquizService);

    assignedVehicles = signal<Vehicle[]>([]);

    constructor() {
        this.vehicleService.getVehicles().subscribe(vs => {
            // Simulate "assigned" by showing all for now or filtering if user set
            this.assignedVehicles.set(vs);
        });
    }
}
