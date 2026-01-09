import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraffiquizService } from '../../traffiquiz.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
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
export class FinancesComponent {
  service = inject(TraffiquizService);
  dialog = inject(MatDialog);
  formConfig = inject(FormConfigService);
  user = this.service.currentUser;

  isAdmin = computed(() => this.user()?.role === 'admin');
  packages = this.service.packagesSignal;

  // Data Signals
  transactions = signal<any[]>([]);
  stats = signal<any>(null);
  isLoading = signal<boolean>(false);

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

  loadData() {
    const role = this.user()?.role || 'student';
    const userId = this.user()?.id;
    this.isLoading.set(true);

    // Fetch Transactions
    this.service.fetchTransactions(role, userId).subscribe(data => {
      this.transactions.set(data);
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
          this.service.openAlertDialog({
            title: 'Success',
            message: 'Your payment has been processed successfully.',
            type: 'success',
            buttons: [{ text: 'Great!', value: 'ok', color: 'primary' }]
          });
        }
      });
    });
  }
}
