import { Component, Inject, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableComponent, TableColumn } from '../table/table.component';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { FormConfigService } from '../form-config.service';
import { TraffiquizService } from '../../traffiquiz.service';
import { Observable } from 'rxjs';

export interface MetadataManagerData {
  title: string;
  entityType: string;
  columns: TableColumn[];
  dataSignal: () => any[];
  addMethod: (data: any) => Observable<any>;
  updateMethod: (data: any) => Observable<any>;
  deleteMethod: (id: number) => Observable<any>;
}

@Component({
  selector: 'app-metadata-manager-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, TableComponent],
  template: `
    <div class="metadata-manager">
      <div class="dialog-header">
        <h2>{{ data.title }}</h2>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div class="actions-bar">
          <button mat-raised-button color="primary" (click)="openForm()">
            <mat-icon>add</mat-icon>
            Add New
          </button>
        </div>

        <div class="scrolling-container">
          <app-table 
            [columns]="data.columns" 
            [data]="data.dataSignal()" 
            [actions]="['edit', 'delete']"
            (rowAction)="handleAction($event)">
          </app-table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metadata-manager {
      padding: 24px;
      min-width: 600px;
      max-width: 90vw;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    h2 { 
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .actions-bar {
      margin-bottom: 16px;
    }
    .scrolling-container {
      max-height: 60vh;
      overflow-y: auto;
      @supports (scrollbar-width: thin) {
        scrollbar-width: thin;
        scrollbar-color: var(--primary-color) transparent;
      }
      padding-right: 8px;
    }
    .scrolling-container::-webkit-scrollbar {
      width: 6px;
    }
    .scrolling-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .scrolling-container::-webkit-scrollbar-thumb {
      background: var(--primary-color);
      border-radius: 10px;
    }
  `]
})
export class MetadataManagerDialogComponent {
  private dialog = inject(MatDialog);
  private formConfig = inject(FormConfigService);
  private service = inject(TraffiquizService);

  constructor(
    public dialogRef: MatDialogRef<MetadataManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MetadataManagerData
  ) { }

  handleAction(event: any) {
    console.log('MetadataManager - Action:', event);
    if (event.action === 'edit') {
      this.openForm(event.item);
    } else if (event.action === 'delete') {
      this.confirmDelete(event.item);
    }
  }

  openForm(item?: any) {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      maxWidth: '95vw',
      minWidth: '350px',
      data: {
        title: (item ? 'Edit ' : 'Add ') + this.data.title.replace('Manage ', ''),
        fields: this.formConfig.getFormConfig(this.data.entityType),
        initialData: item || {},
        submitText: item ? 'Update' : 'Add'
      }
    });

    dialogRef.componentInstance.submitted.subscribe(formData => {
      // Merge ID if updating, otherwise use formData as is
      const payload = item ? { ...formData, id: item.id } : formData;
      const action = item ? this.data.updateMethod(payload) : this.data.addMethod(payload);

      action.subscribe({
        next: (res) => {
          if (res && res.success) {
            this.service.showNotification('Saved successfully', 'success');
            dialogRef.close();
          } else {
            this.service.showNotification((res ? res.message : 'Unknown error') || 'Error saving', 'error');
          }
        },
        error: (err) => this.service.showNotification('Error saving: ' + err, 'error')
      });
    });
  }

  confirmDelete(item: any) {
    this.service.showConfirm(`Are you sure you want to delete this ${this.data.entityType}?`, 'DELETE')
      .subscribe(() => {
        this.data.deleteMethod(item.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.service.showNotification('Deleted successfully', 'success');
            } else {
              this.service.showNotification(res.message || 'Error deleting', 'error');
            }
          },
          error: (err) => this.service.showNotification('Error deleting', 'error')
        });
      });
  }
}
