import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraffiquizService } from '../../traffiquiz.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './finances.component.html',
  styleUrl: './finances.component.css'
})
export class FinancesComponent {
  service = inject(TraffiquizService);
  user = this.service.currentUser;

  isAdmin = computed(() => this.user()?.role === 'admin');

  // Data Signals
  transactions = signal<any[]>([]);
  stats = signal<any>(null);
  isLoading = signal<boolean>(false);

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
    }
  }

  get tableColumns() {
    return this.isAdmin() ? this.adminColumns : this.displayedColumns;
  }
}
