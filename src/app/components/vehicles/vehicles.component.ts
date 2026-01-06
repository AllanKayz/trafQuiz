import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Vehicle } from '../../models/vehicle';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent {
  vehicles: Vehicle[] = [];
  loading = false;
  error = '';

  // Modal / form state
  showModal = false;
  isEditing = false;
  formVehicle: Partial<Vehicle> = {};

  constructor(private vehicleService: VehicleService) {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.vehicleService.getVehicles().subscribe({
      next: (res) => { this.vehicles = res || []; this.loading = false; },
      error: (err) => { this.error = 'Failed to load vehicles'; this.loading = false; }
    });
  }

  openAdd() {
    this.isEditing = false;
    this.formVehicle = { make: '', model: '', year: new Date().getFullYear(), registration: '', type: 'car', status: 'active', notes: '' };
    this.showModal = true;
  }

  openEdit(v: Vehicle) {
    this.isEditing = true;
    this.formVehicle = { ...v };
    this.showModal = true;
  }

  save() {
    this.error = '';
    if (!this.formVehicle.make || !this.formVehicle.model) {
      this.error = 'Make and model are required';
      return;
    }

    if (this.isEditing && this.formVehicle.id) {
      this.vehicleService.updateVehicle(this.formVehicle.id, this.formVehicle).subscribe({ next: () => { this.showModal = false; this.load(); }, error: () => { this.error = 'Update failed'; } });
    } else {
      this.vehicleService.addVehicle(this.formVehicle).subscribe({ next: () => { this.showModal = false; this.load(); }, error: () => { this.error = 'Create failed'; } });
    }
  }

  confirmDelete(id?: number) {
    if (!id) return;
    if (!confirm('Delete this vehicle?')) return;
    this.vehicleService.deleteVehicle(id).subscribe({ next: () => this.load(), error: () => this.error = 'Delete failed' });
  }

  closeModal() { this.showModal = false; this.error = ''; }
}

