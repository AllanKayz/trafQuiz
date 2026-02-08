import { Component, inject, ViewChild, AfterViewInit, computed, signal, TemplateRef } from '@angular/core';
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
import { MatCardModule } from '@angular/material/card';
import { toSignal } from '@angular/core/rxjs-interop';
import { Vehicle } from '../../models/vehicle';
import { VehicleService } from '../../services/vehicle.service';
import { TraffiquizService } from '../../traffiquiz.service';
import { TableColumn, TableComponent } from '../../widgets/table/table.component';
import { SectionheaderComponent } from '../../widgets/sectionheader/sectionheader.component';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { FormConfigService } from '../../widgets/form-config.service';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';
import { SkeletonLoaderComponent } from '../../widgets/skeleton-loader/skeleton-loader.component';

Chart.register(...registerables);

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
    MatProgressSpinnerModule,
    MatCardModule,
    TableComponent,
    SectionheaderComponent,
    StatCardComponent,
    BaseChartDirective,
    SkeletonLoaderComponent
  ],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent {
  private vehicleService = inject(VehicleService);
  private trafService = inject(TraffiquizService);
  private dialog = inject(MatDialog);
  private formConfig = inject(FormConfigService);

  user = this.trafService.currentUser;
  isAdmin = computed(() => this.user()?.role === 'admin');

  header = 'Vehicle Fleet Management';
  content = 'Monitor and manage company vehicles and maintenance status.';

  buttons = computed(() => {
    if (this.isAdmin()) {
      return [
        { name: 'Register Vehicle', action: 'addVehicle', color: 'primary', icon: 'add_directions_car' }
      ];
    }
    return [];
  });


  tableData = signal<Vehicle[]>([]);

  widgets = computed(() => {
    const data = this.tableData();
    const active = data.filter(v => v.status === 'active').length;
    const maintenance = data.filter(v => v.status === 'maintenance').length;
    return [
      { title: 'Total Fleet', data: data.length.toString(), footer: 'Total vehicles' },
      { title: 'Active', data: active.toString(), footer: 'Ready for use' },
      { title: 'Maintenance', data: maintenance.toString(), footer: 'Under repair' }
    ];
  });

  loading = false;
  error: string | null = null;

  tableColumns = signal<TableColumn[]>([
    { key: 'registration', header: 'Reg. Number', type: 'text' },
    { key: 'make', header: 'Make', type: 'text' },
    { key: 'model', header: 'Model', type: 'text' },
    { key: 'year', header: 'Year', type: 'number' },
    { key: 'type', header: 'Type', type: 'text' },
    { key: 'status', header: 'Status', type: 'text' }
  ]);

  tableActions = computed(() => {
    const actions = ['Log Activity', 'Report Issue'];
    if (this.isAdmin()) {
      actions.push('edit', 'delete');
    }
    return actions;
  });

  chartData = computed<ChartData<'doughnut'>>(() => {
    const data = this.tableData();
    const active = data.filter(v => v.status === 'active').length;
    const maintenance = data.filter(v => v.status === 'maintenance').length;
    const retired = data.filter(v => v.status === 'retired').length;

    return {
      labels: ['Active', 'Maintenance', 'Retired'],
      datasets: [
        {
          data: [active, maintenance, retired],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          hoverBackgroundColor: ['#059669', '#d97706', '#dc2626'],
          borderWidth: 0
        }
      ]
    };
  });

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    },
    cutout: '70%'
  };

  constructor() {
    this.load();
  }

  handleButtonAction(action: string) {
    if (action === 'addVehicle') this.openAdd();
  }

  handleTableAction(event: { action: string, item: any }) {
    switch (event.action) {
      case 'Log Activity':
        this.openLog(event.item);
        break;
      case 'Report Issue':
        this.openIssue(event.item);
        break;
      case 'edit':
        this.openEdit(event.item);
        break;
      case 'delete':
        this.confirmDelete(event.item.id);
        break;
    }
  }

  load() {
    this.loading = true;
    this.error = null;
    this.vehicleService.fetchVehicles(this.user()?.role, this.user()?.id).subscribe({
      next: (res) => {
        this.tableData.set(res || []);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load vehicles. Please try again later.';
        this.trafService.showNotification('Failed to load vehicles', 'error');
        this.loading = false;
      }
    });
  }

  openAdd() {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: 'Register Vehicle',
        submitText: 'Register',
        fields: this.formConfig.getFormConfig('vehicle'),
        initialData: {
          year: new Date().getFullYear(),
          type: 'car',
          status: 'active'
        }
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data) => {
      this.save(data, dialogRef);
    });
  }

  openEdit(v: Vehicle) {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: 'Update Vehicle',
        submitText: 'Save Changes',
        fields: this.formConfig.getFormConfig('vehicle'),
        initialData: v
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data) => {
      this.save({ ...data, id: v.id }, dialogRef);
    });
  }

  save(data: any, dialogRef: any) {
    const obs = (data.id)
      ? this.vehicleService.updateVehicle(data.id, data)
      : this.vehicleService.addVehicle(data);

    obs.subscribe({
      next: () => {
        this.trafService.showNotification(`Vehicle ${data.id ? 'updated' : 'added'} successfully`, 'success');
        dialogRef.close();
        this.load();
      },
      error: () => {
        this.trafService.showNotification(data.id ? 'Update failed' : 'Create failed', 'error');
        dialogRef.componentInstance.loading.set(false);
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

  openLog(v: Vehicle) {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '400px',
      data: {
        title: `Log Activity: ${v.registration}`,
        submitText: 'Save Log',
        fields: this.formConfig.getFormConfig('vehicle-log'),
        initialData: {}
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data) => {
      this.submitLog(v.id!, data, dialogRef);
    });
  }

  submitLog(vehicleId: number, data: any, dialogRef: any) {
    this.vehicleService.logActivity({ vehicleId, instructorId: this.user()?.id!, ...data } as any).subscribe({
      next: () => {
        this.trafService.showNotification('Activity logged successfully', 'success');
        dialogRef.close();
        this.load();
      },
      error: () => {
        this.trafService.showNotification('Failed to log activity', 'error');
        dialogRef.componentInstance.loading.set(false);
      }
    });
  }

  openIssue(v: Vehicle) {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '400px',
      data: {
        title: `Report Issue: ${v.registration}`,
        submitText: 'Report Issue',
        fields: this.formConfig.getFormConfig('vehicle-issue'),
        initialData: {}
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data) => {
      this.submitIssue(v.id!, data, dialogRef);
    });
  }

  submitIssue(vehicleId: number, data: any, dialogRef: any) {
    this.vehicleService.reportIssue({ vehicleId, instructorId: this.user()?.id!, ...data } as any).subscribe({
      next: () => {
        this.trafService.showNotification('Issue reported successfully', 'success');
        dialogRef.close();
      },
      error: () => {
        this.trafService.showNotification('Failed to report issue', 'error');
        dialogRef.componentInstance.loading.set(false);
      }
    });
  }
}
