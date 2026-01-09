import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
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

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
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
export class VehiclesComponent {
  private vehicleService = inject(VehicleService);
  private dialog = inject(MatDialog);

  dataSource = new MatTableDataSource<Vehicle>([]);
  displayedColumns: string[] = ['registration', 'make', 'model', 'year', 'type', 'status', 'actions'];
  loading = false;
  error = '';

  // Form state for dialogs
  formVehicle: Partial<Vehicle> = {};
  isEditing = false;

  constructor() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.vehicleService.fetchVehicles().subscribe({
      next: (res) => {
        this.dataSource.data = res || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load vehicles';
        this.loading = false;
      }
    });
  }

  openAdd(template: any) {
    this.isEditing = false;
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
    this.formVehicle = { ...v };
    this.dialog.open(template, { width: '500px' });
  }

  save(dialogRef: any) {
    this.error = '';
    if (!this.formVehicle.make || !this.formVehicle.model || !this.formVehicle.registration) {
      this.error = 'Make, model, and registration are required';
      return;
    }

    const obs = (this.isEditing && this.formVehicle.id)
      ? this.vehicleService.updateVehicle(this.formVehicle.id, this.formVehicle)
      : this.vehicleService.addVehicle(this.formVehicle);

    obs.subscribe({
      next: () => {
        dialogRef.close();
        this.load();
      },
      error: () => {
        this.error = this.isEditing ? 'Update failed' : 'Create failed';
      }
    });
  }

  confirmDelete(id?: number) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    this.vehicleService.deleteVehicle(id).subscribe({
      next: () => this.load(),
      error: () => this.error = 'Delete failed'
    });
  }
}

