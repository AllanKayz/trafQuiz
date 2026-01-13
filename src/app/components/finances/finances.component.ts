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
  searchQuery = signal<string>('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Package Editing State
  editingPackageId = signal<number | null>(null);
  editBuffer = signal<any>(null);

  // Table Columns
  displayedColumns: string[] = ['id', 'date', 'transactionId', 'description', 'amount', 'status'];
  adminColumns: string[] = ['date', 'type', 'entityName', 'transactionId', 'description', 'amount', 'status', 'actions'];

  constructor() {
    effect(() => {
      this.user();
      this.searchQuery();
      this.loadData();
    }, { allowSignalWrites: true });
  }

  ngAfterViewInit() {
    this.transactionDataSource.paginator = this.paginator;
  }

  loadData() {
    const role = this.user()?.role || 'student';
    const userId = role === 'student' ? this.user()?.id : undefined;
    const query = this.searchQuery();

    this.isLoading.set(true);

    // Fetch Transactions
    this.service.fetchTransactions(userId, query).subscribe(res => {
      this.transactionDataSource.data = res.data || [];
      this.transactionDataSource.paginator = this.paginator;
      this.isLoading.set(false);
    });

    // Fetch Admin Stats if applicable
    if (this.isAdmin()) {
      this.service.fetchFinancialStats().subscribe(data => {
        this.stats.set(data);
      });
      // Ensure packages, instructors, and vehicles are loaded for forms
      this.service.getPackages();
      this.service.fetchInstructors();
      this.service.fetchVehicles();
    }
  }

  get tableColumns() {
    return this.isAdmin() ? this.adminColumns : this.displayedColumns;
  }

  applyFilter() {
    // Handled by effect on searchQuery
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
        this.service.showNotification('Package updated', 'success');
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
      const paymentPayload = { ...data, userId: this.user()?.id };

      this.service.processPayment(paymentPayload).subscribe(res => {
        if (res && res.success) {
          dialogRef.close();
          this.loadData();
          // Generate receipt with transaction ID from response
          this.service.generateReceipt({
            ...paymentPayload,
            transactionId: res.transactionId
          });
        }
      });
    });
  }

  makeAdminPayment() {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: {
        title: 'Process Student Payment',
        submitText: 'Record Payment',
        fields: this.formConfig.getFormConfig('admin-payment'),
        initialData: {
          isNewStudent: false,
          method: 'card'
        }
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      this.service.processPayment({ ...data, status: 'completed' }).subscribe(res => {
        if (res && res.success) {
          dialogRef.close();
          this.loadData();
          if (data.isNewStudent) this.service.fetchStudents();
          // Generate receipt
          this.service.generateReceipt({
            ...data,
            transactionId: res.transactionId
          });
        }
      });
    });
  }

  processSalary() {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: 'Process Instructor Salary',
        submitText: 'Pay Salary',
        fields: this.formConfig.getFormConfig('admin-salary'),
        initialData: { method: 'cash' }
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      this.service.processSalary(data).subscribe(res => {
        if (res && res.success) {
          dialogRef.close();
          this.loadData();
        }
      });
    });
  }

  recordExpense() {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: 'Record Business Expense',
        submitText: 'Record Expense',
        fields: this.formConfig.getFormConfig('admin-expense'),
        initialData: { method: 'cash', category: 'other' }
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      this.service.recordExpense(data).subscribe(res => {
        if (res && res.success) {
          dialogRef.close();
          this.loadData();
        }
      });
    });
  }

  approvePayment(id: number, status: string) {
    this.service.approvePayment(id, status).subscribe(res => {
      if (res && res.success) {
        this.loadData();
      }
    });
  }
}

