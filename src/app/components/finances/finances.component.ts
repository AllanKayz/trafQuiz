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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormConfigService } from '../../widgets/form-config.service';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { TableColumn, TableComponent } from '../../widgets/table/table.component';
import { SectionheaderComponent } from '../../widgets/sectionheader/sectionheader.component';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';

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
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    TableComponent,
    SectionheaderComponent,
    StatCardComponent
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

  header = computed(() => this.isAdmin() ? 'System Finances' : 'My Payments');
  content = computed(() => this.isAdmin() ? 'Track revenue, expenses, and salary payments.' : 'View your transaction history.');

  buttons = computed(() => {
    const admin = this.isAdmin();
    if (admin) {
      return [
        { name: 'Process Payment', action: 'adminPayment', color: 'primary', icon: 'payments' },
        { name: 'Pay Salary', action: 'processSalary', color: 'accent', icon: 'payments' },
        { name: 'Record Expense', action: 'recordExpense', color: 'warn', icon: 'receipt_long' }
      ];
    }
    return [
      { name: 'Make Payment', action: 'makePayment', color: 'primary', icon: 'add' }
    ];
  });

  widgets = computed(() => {
    const data = this.stats();
    if (!data) return [];
    return [
      { title: 'Total Revenue', data: `$${data.totalRevenue.toLocaleString()}`, footer: 'Gross income' },
      { title: 'Total Expenses', data: `$${data.totalExpenses.toLocaleString()}`, footer: 'Operational costs' },
      { title: 'Net Profit', data: `$${data.netProfit.toLocaleString()}`, footer: 'After expenses' },
      { title: 'Projected', data: `$${data.projectedRevenue.toLocaleString()}`, footer: 'Monthly estimate' }
    ];
  });

  // Data Signals
  transactionDataSource = new MatTableDataSource<any>([]);
  transactions = signal<any[]>([]);
  stats = signal<any>(null);
  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');

  chartMax = computed(() => {
    const data = this.stats()?.chartData;
    if (!data) return 1000;
    const allValues = [...data.revenue, ...data.expenses];
    return Math.max(...allValues, 1000);
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Package Editing State
  editingPackageId = signal<number | null>(null);
  editBuffer = signal<any>(null);

  // Table Columns
  tableColumns = computed<TableColumn[]>(() => {
    const admin = this.isAdmin();
    const cols: TableColumn[] = [
      { key: 'payment_date', header: 'Date', type: 'date', width: '120px' },
      { key: 'transaction_id', header: 'Txn ID', type: 'code', width: '150px' },
    ];

    if (admin) {
      cols.push({ key: 'entity_name', header: 'Entity', type: 'text' });
    }

    cols.push(
      { key: 'description_full', header: 'Description', type: 'text' },
      { key: 'method', header: 'Method', type: 'text', width: '100px' },
      { key: 'amount', header: 'Amount', type: 'amount', width: '120px' },
      { key: 'status', header: 'Status', type: 'status', width: '100px' }
    );

    return cols;
  });

  // NOTE: Actions now handled per row in tableData for flexibility, but global definition helps TableComponent know what to expect
  tableActions = computed(() => {
    // We return a superset of possible actions if needed, or rely on row-specific actions
    return [];
  });

  tableData = computed(() => {
    const admin = this.isAdmin();
    return this.transactions().map(t => {
      const actions = [];
      if (t.status === 'completed') {
        actions.push('receipt');
      }
      if (admin && (t.status === 'pending' || t.status === 'partial')) {
        if (t.status === 'pending') actions.push('activate', 'flag');
        else actions.push('activate');
      }

      return {
        ...t,
        description_full: t.notes ? `${t.description} (${t.notes})` : t.description,
        actions: actions
      };
    });
  });

  constructor() {
    effect(() => {
      this.user();
      this.searchQuery();
      this.loadData();
    });
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
      this.transactions.set(res.data || []);
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

  handleTableAction(event: { action: string, item: any }) {
    if (event.action === 'activate') {
      this.approvePayment(event.item.id, 'completed');
    } else if (event.action === 'flag') {
      this.approvePayment(event.item.id, 'partial');
    } else if (event.action === 'receipt') {
      this.openReceipt(event.item);
    }
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

  handleButtonAction(action: string) {
    switch (action) {
      case 'makePayment': this.makePayment(); break;
      case 'adminPayment': this.makeAdminPayment(); break;
      case 'processSalary': this.processSalary(); break;
      case 'recordExpense': this.recordExpense(); break;
    }
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
          // Open Receipt Preview
          this.openReceipt({
            ...paymentPayload,
            transaction_id: res.transactionId,
            status: 'completed',
            payment_date: new Date()
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
          // Open Receipt Preview
          this.openReceipt({
            ...data,
            transaction_id: res.transactionId,
            status: 'completed',
            payment_date: new Date()
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

  openReceipt(transaction: any) {
    this.dialog.open(ReceiptPreviewComponent, {
      width: '450px',
      data: transaction,
      panelClass: 'receipt-dialog' // Add this class to global styles if needed or remove
    });
  }
}
