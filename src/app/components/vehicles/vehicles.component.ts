import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
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

  dataSource = new MatTableDataSource<Vehicle>([]);
  displayedColumns: string[] = ['registration', 'make', 'model', 'year', 'type', 'status', 'actions'];
  loading = false;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Form state for dialogs
  formVehicle: Partial<Vehicle> = {};
  isEditing = false;

  constructor() {
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  load() {
    this.loading = true;
    this.error = null;
    this.vehicleService.fetchVehicles().subscribe({
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
}
