import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { TraffiquizService } from '../../../traffiquiz.service';
import { DynamicFormComponent } from '../../../widgets/dynamic-form/dynamic-form.component';
import { FormConfigService } from '../../../widgets/form-config.service';

@Component({
  selector: 'app-vehicle-status',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="vehicle-status-container fade-in">
      <header class="page-header">
        <h1>Assigned Vehicle Status</h1>
        <p>Monitor the status and maintenance of your assigned vehicles.</p>
      </header>
    
      @if (assignedVehicles().length > 0) {
        <div class="vehicle-grid">
          @for (v of assignedVehicles(); track v.id) {
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
                <div class="stats-layout-row" style="display:flex; gap:16px; margin-bottom:16px;">
                  <div class="stat-item">
                    <mat-icon style="font-size:18px; width:18px; height:18px; vertical-align:middle;">speed</mat-icon>
                    <span style="font-size:14px; margin-left:4px;">{{v.mileage || 0}} km</span>
                  </div>
                  <div class="stat-item">
                    <mat-icon style="font-size:18px; width:18px; height:18px; vertical-align:middle;">local_gas_station</mat-icon>
                    <span style="font-size:14px; margin-left:4px;">{{v.fuelLevel || 0}}%</span>
                  </div>
                </div>
                @if (v.notes) {
                  <p class="notes" style="font-style:italic; color:#666;">{{v.notes}}</p>
                }
              </mat-card-content>
              <mat-card-actions style="display:flex; justify-content: space-between; padding: 16px;">
                <button mat-stroked-button color="primary" (click)="openLogActivityDialog(v)">
                  <mat-icon>edit_note</mat-icon> Log Activity
                </button>
                <button mat-stroked-button color="warn" (click)="openReportIssueDialog(v)">
                  <mat-icon>report_problem</mat-icon> Report Issue
                </button>
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
    .vehicle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin-top: 24px; }
    .status-info { margin: 16px 0 8px 0; display: flex; gap: 8px; align-items: center; }
    .label { font-weight: 500; font-size: 14px; }
    .value { font-size: 14px; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; }
    .value.active { background: #e8f5e9; color: #2e7d32; }
    .value.maintenance { background: #fff3e0; color: #ef6c00; }
    .no-data { text-align: center; padding: 64px; color: #999; border: 2px dashed #eee; border-radius: 8px; margin-top: 24px; }
    .no-data mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.5; }
  `]
})
export class VehicleStatusComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private trafService = inject(TraffiquizService);
  private dialog = inject(MatDialog);
  private formConfig = inject(FormConfigService);

  assignedVehicles = signal<Vehicle[]>([]);

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    const user = this.trafService.userSignal();
    if (user) {
      this.vehicleService.fetchVehicles(user.role, user.id as number).subscribe(vs => {
        this.assignedVehicles.set(vs);
      });
    }
  }

  openReportIssueDialog(vehicle: Vehicle) {
    const dialogRef: MatDialogRef<DynamicFormComponent> = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: `Report Issue for ${vehicle.make} ${vehicle.model}`,
        fields: this.formConfig.getFormConfig('vehicle-issue'),
        submitText: 'Submit Report',
        initialData: {}
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      const user = this.trafService.userSignal();
      if (user) {
        this.vehicleService.reportIssue({
          vehicleId: vehicle.id,
          instructorId: user.id as number,
          description: data.description,
          severity: data.severity
        }).subscribe(() => {
          this.trafService.sendPushNotification('Maintenance Alert', `Issue reported for ${vehicle.make} ${vehicle.model}`);
          dialogRef.close();
        });
      }
    });
  }

  openLogActivityDialog(vehicle: Vehicle) {
    const dialogRef: MatDialogRef<DynamicFormComponent> = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: `Log Activity for ${vehicle.make} ${vehicle.model}`,
        fields: this.formConfig.getFormConfig('vehicle-log'),
        submitText: 'Record Log',
        initialData: {
          mileage: vehicle.mileage || 0,
          fuelLevel: vehicle.fuelLevel || 100
        }
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      const user = this.trafService.userSignal();
      if (user) {
        this.vehicleService.logActivity({
          vehicleId: vehicle.id,
          instructorId: user.id as number,
          mileage: data.mileage,
          fuelLevel: data.fuelLevel,
          notes: data.notes
        }).subscribe(() => {
          this.loadVehicles(); // Refresh to see updated stats
          this.trafService.sendPushNotification('Vehicle Updated', `Status logged for ${vehicle.make} ${vehicle.model}`);
          dialogRef.close();
        });
      }
    });
  }
}
