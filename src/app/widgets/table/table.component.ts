import { Component, input, computed, ViewChild, signal, Output, EventEmitter, OnChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';

export interface TableColumn  {
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
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>{{ filterPlaceholder() }}</mat-label>
        <input matInput (keyup)="applyFilter($event)" [placeholder]="filterPlaceholder()">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <table mat-table [dataSource]="dataSource()" matSort>
        <!-- Dynamic Columns -->
        <ng-container *ngFor="let column of columns()" [matColumnDef]="column.key">
          <th mat-header-cell *matHeaderCellDef mat-sort-header [style.width]="column.width">
            {{ column.header }}
          </th>
          <td mat-cell *matCellDef="let row">
            {{ getCellValue(row, column) }}
          </td>
        </ng-container>

        <!-- Action Column -->
        <ng-container matColumnDef="actions" *ngIf="actions().length > 0">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button *ngFor="let action of actions()" mat-menu-item (click)="onAction(action, row)">
                <mat-icon>{{getActionIcon(action)}}</mat-icon>
                <span>{{ action | titlecase }}</span>
              </button>
            </mat-menu>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnKeys()"></tr>
        <tr mat-row *matRowDef="let row; columns: columnKeys();"></tr>
      </table>

      <mat-paginator [pageSizeOptions]="pageSizeOptions()" showFirstLastButtons></mat-paginator>
    </div>
  `,
  styles: `
    .table-container {
      width: 100%;
      overflow: auto;
	  padding-top: 20px;
    }

    .filter-field {
      width: 100%;
      margin-bottom: 16px;
    }

    table {
      width: 100%;
    }

    .mat-row:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }

    .mat-column-actions {
      width: 80px;
      text-align: center;
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
  @Output() rowAction = new EventEmitter<{action: string, item: any}>();
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

    if(this.dataSource().paginator) {
      this.dataSource().paginator?.firstPage();
    }
  }

  onAction(action: string, item: any) {
    this.rowAction.emit({action, item});
  }

  getCellValue(item: any, column: TableColumn): any {
    const value = item[column.key];

    switch(column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return value;
    }
  }

}
