import { Component, input, computed, ViewChild, signal, Output, EventEmitter, OnChanges, AfterViewInit } from '@angular/core';
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
  type?: 'text' | 'number' | 'date' | 'action' | 'boolean';
  width?: string;
}

@Component({
  selector: 'app-table',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatMenuModule, MatInputModule],
  template: `
    <div class="table-container">
      <div class="filter-section">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ filterPlaceholder() }}</mat-label>
          <input matInput (keyup)="applyFilter($event)" [placeholder]="filterPlaceholder()">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>
    
      <table mat-table [dataSource]="dataSource()" matSort>
        <!-- Dynamic Columns -->
        @for (column of columns(); track column) {
          <ng-container [matColumnDef]="column.key">
            <th mat-header-cell *matHeaderCellDef mat-sort-header [style.width]="column.width">
              {{ column.header }}
            </th>
            <td mat-cell *matCellDef="let row">
              {{ getCellValue(row, column) }}
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
                @for (action of actions(); track action) {
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
        <tr mat-row *matRowDef="let row; columns: columnKeys();"></tr>
      </table>
    
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
      overflow: hidden;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
    }

    .filter-section {
        padding: 16px 24px;
        border-bottom: 1px solid #f1f5f9;
        background: #ffffff;
    }

    .filter-field {
      width: 100%;
      max-width: 400px;
    }

    /* Table Styles */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    th.mat-header-cell {
      background: #f8fafc;
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 16px 24px;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    td.mat-cell {
      padding: 16px 24px;
      color: #334155;
      font-size: 0.875rem;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.2s;
    }

    tr.mat-row:hover td {
      background-color: #f8fafc;
    }
    
    tr.mat-row:last-child td {
        border-bottom: none;
    }

    /* Actions Column */
    .mat-column-actions {
      width: 60px;
      padding-right: 16px !important;
      text-align: right;
    }
    
    .action-btn {
        color: #94a3b8;
    }
    
    .action-btn:hover {
        color: #4f46e5;
        background: #eef2ff;
    }

    /* Paginator */
    mat-paginator {
        border-top: 1px solid #f1f5f9;
        font-size: 0.875rem;
        color: #64748b;
    }
  `
})
export class TableComponent implements OnChanges, AfterViewInit {
  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      edit: 'edit',
      delete: 'delete',
      flag: 'flag',
      view: 'visibility'
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

  ngOnChanges() {
    this.updateDataSource();
  }

  private updateDataSource() {
    const dataSource = new MatTableDataSource(this.data());
    dataSource.paginator = this.paginator;
    dataSource.sort = this.sort;

    // Custom filter predicate
    dataSource.filterPredicate = (data: any, filter: string) => {
      const lowerCaseFilter = filter.toLocaleLowerCase();
      return this.columns().some(column => {
        const value = data[column.key]?.toString().toLocaleLowerCase();
        return value?.includes(lowerCaseFilter);
      });
    };

    this.dataSource.set(dataSource);
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

  getCellValue(item: any, column: TableColumn): any {
    const value = item[column.key];

    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return value;
    }
  }

}
