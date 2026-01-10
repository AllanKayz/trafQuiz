import { Component, inject, signal, effect, computed, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraffiquizService } from '../../traffiquiz.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormConfigService } from '../../widgets/form-config.service';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './finances.component.html',
  styleUrl: './finances.component.css'
})
export class FinancesComponent implements AfterViewInit {
  service = inject(TraffiquizService);
  dialog = inject(MatDialog);
  formConfig = inject(FormConfigService);
  user = this.service.currentUser;

  isAdmin = computed(() => this.user()?.role === 'admin');
  packages = this.service.packagesSignal;

  // Data Signals
  transactionDataSource = new MatTableDataSource<any>([]);
  stats = signal<any>(null);
  isLoading = signal<boolean>(false);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Package Editing State
  editingPackageId = signal<number | null>(null);
  editBuffer = signal<any>(null);

  // Table Columns
  displayedColumns: string[] = ['id', 'date', 'description', 'amount', 'status'];
  adminColumns: string[] = ['id', 'studentName', 'date', 'description', 'amount', 'status'];

  constructor() {
    effect(() => {
      this.loadData();
    });
  }

  ngAfterViewInit() {
    this.transactionDataSource.paginator = this.paginator;
  }

  loadData() {
    const role = this.user()?.role || 'student';
    const userId = this.user()?.id;
    this.isLoading.set(true);

    // Fetch Transactions
    this.service.fetchTransactions(role, userId).subscribe(data => {
      this.transactionDataSource.data = data;
      this.transactionDataSource.paginator = this.paginator;
      this.isLoading.set(false);
    });

    // Fetch Admin Stats if applicable
    if (this.isAdmin()) {
      this.service.fetchFinancialStats().subscribe(data => {
        this.stats.set(data);
      });
      // Ensure packages are loaded
      this.service.getPackages();
    }
  }

  get tableColumns() {
    return this.isAdmin() ? this.adminColumns : this.displayedColumns;
  }

  startEdit(pkg: any) {
    this.editingPackageId.set(pkg.id);
    this.editBuffer.set({ ...pkg });
  }

  cancelEdit() {
    this.editingPackageId.set(null);
    this.editBuffer.set(null);
  }

  savePackage() {
    const pkg = this.editBuffer();
    if (!pkg) return;

    this.service.updatePackage(pkg).subscribe(res => {
      if (res.status === 200) {
        this.editingPackageId.set(null);
        this.editBuffer.set(null);
      }
    });
  }

  makePayment() {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: 'Complete Your Payment',
        submitText: 'Process Payment',
        fields: this.formConfig.getFormConfig('payment'),
        initialData: {}
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      this.service.processPayment(data).subscribe(res => {
        if (res.status === 200) {
          dialogRef.close();
          this.loadData(); // Refresh transaction list
          this.service.showNotification('Your payment has been processed successfully.', 'success');
        }
      });
    });
  }
}
