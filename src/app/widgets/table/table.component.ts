import { Component, input, computed, ViewChild, signal, Output, EventEmitter, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';

export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'number' | 'date' | 'action' | 'boolean' | 'status' | 'code' | 'amount';
  width?: string;
}

@Component({
  selector: 'app-table',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatMenuModule, MatInputModule],
  template: `
    <div class="table-container animate-fade-in">
      <div class="filter-section">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ filterPlaceholder() }}</mat-label>
          <input matInput (keyup)="applyFilter($event)" [placeholder]="filterPlaceholder()">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>
    
      <div class="table-wrapper">
        <table mat-table [dataSource]="dataSource()" matSort>
          <!-- Dynamic Columns -->
          @for (column of columns(); track column.key) {
            <ng-container [matColumnDef]="column.key">
              <th mat-header-cell *matHeaderCellDef mat-sort-header [style.width]="column.width">
                {{ column.header }}
              </th>
              <td mat-cell *matCellDef="let row">
                @if (column.type === 'status' || column.key === 'status') {
                  <span class="status-badge" [class]="getStatusClass(getCellValue(row, column))">
                    {{ getCellValue(row, column) }}
                  </span>
                } @else if (column.type === 'code') {
                  <code class="txn-code">{{ getCellValue(row, column) }}</code>
                } @else if (column.type === 'amount') {
                  <span [class]="getAmountClass(row, column)">
                    {{ getAmountValue(row, column) }}
                  </span>
                } @else {
                  {{ getCellValue(row, column) }}
                }
              </td>
            </ng-container>
          }
      
          <!-- Action Column -->
          @if (actions().length > 0) {
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button [matMenuTriggerFor]="menu" class="action-btn">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  @for (action of (row.actions || actions()); track action) {
                    <button mat-menu-item (click)="onAction(action, row)">
                      <mat-icon>{{getActionIcon(action)}}</mat-icon>
                      <span>{{ action | titlecase }}</span>
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>
          }
      
          <tr mat-header-row *matHeaderRowDef="columnKeys()"></tr>
          <tr mat-row *matRowDef="let row; columns: columnKeys();" class="hover-row"></tr>
        </table>
      </div>
    
      <mat-paginator [pageSizeOptions]="pageSizeOptions()" showFirstLastButtons></mat-paginator>
    </div>
    `,
  styles: `
    :host {
        display: block;
        font-family: 'Inter', system-ui, sans-serif;
    }

    .table-container {
      width: 100%;
      background: var(--bg-card);
      border-radius: 12px;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .filter-section {
        padding: 16px 24px;
        background: hsla(var(--primary) / 0.02);
        border-bottom: 1px solid var(--border-color);
    }

    .filter-field {
      width: 100%;
      max-width: 280px;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      background: transparent;
    }

    th.mat-header-cell {
      background: hsla(var(--primary) / 0.03);
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
    }

    td.mat-cell {
      padding: 14px 24px;
      color: var(--text-main);
      font-size: 0.875rem;
      border-bottom: 1px solid var(--border-color);
      transition: background 0.2s ease;
    }

    .hover-row:hover td {
      background-color: var(--hover-bg);
    }
    
    .status-badge {
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .status-active, .status-available, .status-completed, .status-success {
        background: hsla(142, 76%, 36%, 0.1);
        color: #16a34a;
    }

    .status-inactive, .status-unavailable, .status-cancelled, .status-error {
        background: hsla(0, 84%, 60%, 0.1);
        color: #dc2626;
    }

    .status-pending, .status-scheduled, .status-warning {
        background: hsla(38, 92%, 50%, 0.1);
        color: #ca8a04;
    }

    .txn-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8125rem;
        color: var(--primary-color);
        background: var(--hover-bg);
        padding: 2px 6px;
        border-radius: 4px;
    }

    .amount-positive {
        color: #10b981;
        font-weight: 600;
    }

    .amount-negative {
        color: #ef4444;
        font-weight: 600;
    }

    /* Actions Column */
    .mat-column-actions {
      width: 80px;
      padding-right: 24px !important;
      text-align: right;
    }
    
    .action-btn {
        color: var(--text-muted);
        transition: all 0.2s ease;
    }
    
    .action-btn:hover {
        color: var(--primary-color);
        background: var(--hover-bg);
        transform: rotate(90deg);
    }

    /* Paginator */
    mat-paginator {
        border-top: 1px solid var(--border-color);
        background: transparent;
        font-size: 0.875rem;
        color: var(--text-muted);
        padding: 8px 16px;
    }
  `
})
export class TableComponent implements AfterViewInit {
  constructor() {
    effect(() => {
      this.updateDataSource();
    });
  }
  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      edit: 'edit',
      delete: 'delete',
      flag: 'flag',
      view: 'visibility',
      activate: 'check_circle',
      deactivate: 'block',
      download: 'download',
      schedule: 'calendar_today',
      pay: 'payments',
      available: 'person_search',
      unavailable: 'person_off',
      receipt: 'receipt_long'
    };
    return icons[action] || 'more_vert';
  }

  // Input Signals
  columns = input<TableColumn[]>([]);
  data = input<any[]>([]);
  actions = input<string[]>([]);
  pageSizeOptions = input<number[]>([5, 10, 15, 25, 100]);
  filterPlaceholder = input('Filter table...');

  // Computed properties
  columnKeys = computed(() => {
    const cols = this.columns();
    const keys = cols.map(c => c.key);
    return this.actions().length > 0 ? [...keys, 'actions'] : keys;
  });

  // Signals for internal state
  dataSource = signal(new MatTableDataSource<any>([]));
  filterValue = signal('');

  // Output Events
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Output events
  @Output() rowAction = new EventEmitter<{ action: string, item: any }>();
  @Output() filterChanged = new EventEmitter<string>();

  ngAfterViewInit() {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
  }



  private updateDataSource() {
    const currentData = this.data();
    const source = this.dataSource();

    source.data = currentData;

    // Custom filter predicate
    source.filterPredicate = (data: any, filter: string) => {
      const lowerCaseFilter = filter.toLocaleLowerCase();
      return this.columns().some(column => {
        const val = data[column.key];
        const stringValue = (val !== null && val !== undefined) ? val.toString().toLocaleLowerCase() : '';
        return stringValue.includes(lowerCaseFilter);
      });
    };

    // Re-bind paginator and sort in the next tick to ensure they are available
    setTimeout(() => {
      if (this.paginator) source.paginator = this.paginator;
      if (this.sort) source.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue.set(filterValue);
    this.dataSource().filter = filterValue.trim().toLocaleLowerCase();
    this.filterChanged.emit(filterValue);

    if (this.dataSource().paginator) {
      this.dataSource().paginator?.firstPage();
    }
  }

  onAction(action: string, item: any) {
    this.rowAction.emit({ action, item });
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    const s = status.toLowerCase();
    return `status-${s}`;
  }

  getCellValue(item: any, column: TableColumn): any {
    const value = item[column.key];

    switch (column.type) {
      case 'date':
        if (!value || value === '0000-00-00 00:00:00') return 'N/A';
        const date = new Date(value);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return value;
    }
  }

  getAmountClass(row: any, column: TableColumn): string {
    const value = row[column.key];
    const type = row['type'] || '';
    if (type === 'expense' || type === 'salary' || value < 0) {
      return 'amount-negative';
    }
    return 'amount-positive';
  }

  getAmountValue(row: any, column: TableColumn): string {
    const value = row[column.key];
    const type = row['type'] || '';
    const numValue = Number(value);
    const sign = (type === 'expense' || type === 'salary' || numValue < 0) ? '-' : '+';
    const absValue = Math.abs(numValue);
    return `${sign}$${absValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

}
