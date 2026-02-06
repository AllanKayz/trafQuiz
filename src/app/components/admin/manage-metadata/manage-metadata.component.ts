import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TraffiquizService } from '../../../traffiquiz.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormConfigService } from '../../../widgets/form-config.service';
import { DynamicFormComponent } from '../../../widgets/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-manage-metadata',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './manage-metadata.component.html',
  styleUrl: './manage-metadata.component.css'
})
export class ManageMetadataComponent {
  service = inject(TraffiquizService);
  dialog = inject(MatDialog);
  configService = inject(FormConfigService);

  // Data Signals (computed from service)
  categories = computed(() => {
    // Service returns {value, label}, need to map if using raw data or use existing signal
    // Service getQuestionCategories stores in localStorage, but doesn't expose a signal directly for list?
    // Wait, getQuestionCategories in service stores in localStorage only...
    // I should check TraffiquizService again.
    // It seems getQuestionCategories just updates localStorage. That's not ideal for reactivity.
    // I might need to add a signal for categories in service or fetch them locally here.
    // FOR NOW, I will fetch them manually on init.
    return this._categories();
  });

  _categories = signal<any[]>([]);
  certifications = this.service.certificationsSignal; // These are {value, label} or raw? Service uses raw in signal.
  specializations = this.service.specializationsSignal;

  examDurationMinutes = computed(() => Math.round(this.service.examDuration() / 60));
  editableDuration = signal<number>(30);

  displayedColumns = ['name', 'description', 'actions'];

  constructor() {
    effect(() => {
      this.editableDuration.set(this.examDurationMinutes());
    }, { allowSignalWrites: true });

    this.loadCategories();
    this.service.getCertifications();
    this.service.getSpecializations();
    this.service.fetchExamDuration().subscribe();
  }

  loadCategories() {
    // Service doesn't expose categories signal properly, let's fetch raw
    window.electronAPI['get-question-categories']().then((res: any) => {
      if (res.success) {
        this._categories.set(res.data);
      }
    });
  }

  // --- Actions ---

  openForm(type: 'category' | 'certification' | 'specialization', item?: any) {
    const title = item ? `Edit ${type}` : `Add ${type}`;
    const submitText = item ? 'Save Changes' : 'Create';
    const configName = type;

    // Special handling for initial data map
    let initialData = {};
    if (item) {
      if (type === 'category') {
        initialData = { category: item.category || item.name, description: item.description, id: item.id };
      } else {
        initialData = { ...item };
      }
    }

    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title,
        submitText,
        fields: this.configService.getFormConfig(configName),
        initialData
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      const payload = item ? { ...data, id: item.id } : data;
      let obs;

      if (type === 'category') {
        obs = item ? this.service.updateCategory(payload) : this.service.addCategory(payload);
      } else if (type === 'certification') {
        obs = item ? this.service.updateCertification(payload) : this.service.addCertification(payload);
      } else if (type === 'specialization') {
        obs = item ? this.service.updateSpecialization(payload) : this.service.addSpecialization(payload);
      }

      if (obs) {
        obs.subscribe(res => {
          if (res?.success) {
            this.service.showNotification(`${type} saved successfully`, 'success');
            dialogRef.close();
            // Refresh logic
            if (type === 'category') this.loadCategories(); // Manual refresh for categories
            if (type === 'certification') this.service.getCertifications(); // Should auto-update signal
            if (type === 'specialization') this.service.getSpecializations();
          }
        });
      }
    });
  }

  deleteItem(type: 'category' | 'certification' | 'specialization', id: number) {
    this.service.showConfirm(`Are you sure you want to delete this ${type}?`).subscribe(() => {
      let obs;
      if (type === 'category') obs = this.service.deleteCategory(id);
      if (type === 'certification') obs = this.service.deleteCertification(id);
      if (type === 'specialization') obs = this.service.deleteSpecialization(id);

      if (obs) {
        obs.subscribe(res => {
          this.service.showNotification('Deleted successfully', 'success');
          if (type === 'category') this.loadCategories();
        });
      }
    });
  }

  updateTimeframe() {
    this.service.setExamTimeframe({ period: this.editableDuration() }).subscribe(res => {
      if (res.success) {
        this.service.showNotification('Exam duration updated', 'success');
      }
    });
  }
}
