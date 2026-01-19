import { Component, inject, ViewChild, AfterViewInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Vehicle } from '../../models/vehicle';
import { VehicleService } from '../../services/vehicle.service';
import { TraffiquizService } from '../../traffiquiz.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements AfterViewInit {
  private vehicleService = inject(VehicleService);
  private trafService = inject(TraffiquizService);
  private dialog = inject(MatDialog);

  user = this.trafService.currentUser;
  isAdmin = computed(() => this.user()?.role === 'admin');

  dataSource = new MatTableDataSource<Vehicle>([]);
  displayedColumnsSignal = computed(() => {
    const base = ['registration', 'make', 'model', 'year', 'type', 'status', 'actions'];
    return base;
  });

  loading = false;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Form state for dialogs
  formVehicle: Partial<Vehicle> = {};
  isEditing = false;

  // Logs/Issue Data
  logData = { mileage: 0, fuelLevel: 0, notes: '' };
  issueData = { description: '', severity: 'low' };

  constructor() {
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  load() {
    this.loading = true;
    this.error = null;
    // Note: service fetchVehicles calls API, API filters by role (Instructor sees only assigned).
    this.vehicleService.fetchVehicles(this.user()?.id).subscribe({
      next: (res) => {
        this.dataSource.data = res || [];
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load vehicles. Please try again later.';
        this.trafService.showNotification('Failed to load vehicles', 'error');
        this.loading = false;
      }
    });
  }

  openAdd(template: any) {
    this.isEditing = false;
    this.error = null;
    this.formVehicle = {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      registration: '',
      type: 'car',
      status: 'active',
      notes: ''
    };
    this.dialog.open(template, { width: '500px' });
  }

  openEdit(v: Vehicle, template: any) {
    this.isEditing = true;
    this.error = null;
    this.formVehicle = { ...v };
    this.dialog.open(template, { width: '500px' });
  }

  save(dialogRef: any) {
    if (!this.formVehicle.make || !this.formVehicle.model || !this.formVehicle.registration) {
      this.trafService.showNotification('Make, model, and registration are required', 'error');
      return;
    }

    const obs = (this.isEditing && this.formVehicle.id)
      ? this.vehicleService.updateVehicle(this.formVehicle.id, this.formVehicle)
      : this.vehicleService.addVehicle(this.formVehicle);

    obs.subscribe({
      next: () => {
        this.trafService.showNotification(`Vehicle ${this.isEditing ? 'updated' : 'added'} successfully`, 'success');
        dialogRef.close();
        this.load();
      },
      error: () => {
        this.error = this.isEditing ? 'Update failed' : 'Create failed';
        this.trafService.showNotification(this.error, 'error');
      }
    });
  }

  confirmDelete(id?: number) {
    if (!id) return;

    this.trafService.showConfirm('Delete this vehicle?', 'DELETE').subscribe(() => {
      this.vehicleService.deleteVehicle(id).subscribe({
        next: () => {
          this.trafService.showNotification('Vehicle deleted', 'success');
          this.load();
        },
        error: () => this.trafService.showNotification('Delete failed', 'error')
      });
    });
  }

  openLog(v: Vehicle, template: any) {
    this.formVehicle = { ...v };
    this.logData = { mileage: 0, fuelLevel: 0, notes: '' };
    this.dialog.open(template, { width: '400px' });
  }

  submitLog(dialogRef: any) {
    const payload = {
      vehicleId: this.formVehicle.id!,
      instructorId: this.user()?.id!,
      mileage: this.logData.mileage,
      fuelLevel: this.logData.fuelLevel,
      notes: this.logData.notes
    };

    this.vehicleService.logActivity(payload as any).subscribe(() => {
      dialogRef.close();
      this.load();
    });
  }

  openIssue(v: Vehicle, template: any) {
    this.formVehicle = { ...v };
    this.issueData = { description: '', severity: 'low' };
    this.dialog.open(template, { width: '400px' });
  }

  submitIssue(dialogRef: any) {
    const payload = {
      vehicleId: this.formVehicle.id!,
      instructorId: this.user()?.id!,
      description: this.issueData.description,
      severity: this.issueData.severity
    };
    this.vehicleService.reportIssue(payload as any).subscribe(() => {
      dialogRef.close();
    });
  }
}
