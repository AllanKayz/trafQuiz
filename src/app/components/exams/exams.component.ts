import { Component, inject, signal, input, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraffiquizService } from '../../traffiquiz.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SectionheaderComponent } from "../../widgets/sectionheader/sectionheader.component";
import { ButtonConfigService } from '../../widgets/button-config.service';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { TableComponent, TableColumn } from '../../widgets/table/table.component';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { FormConfigService } from '../../widgets/form-config.service';
import { MetadataManagerDialogComponent } from '../../widgets/metadata-manager/metadata-manager-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    SectionheaderComponent,
    StatCardComponent,
    TableComponent,
    DynamicFormComponent
  ],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.css'
})
export class ExamsComponent implements OnInit {
  header = 'Exams Management';
  content = 'Monitor performance and schedule upcoming sessions.';

  public service = inject(TraffiquizService);
  private buttonService = inject(ButtonConfigService);
  public formConfig = inject(FormConfigService);
  private dialog = inject(MatDialog);

  allocationFields = this.formConfig.getFormConfig('exam-allocation');

  user = this.service.currentUser;
  isAdmin = computed(() => this.user()?.role === 'admin');
  menuName = 'exams';

  stats = this.service.examStats;
  recentExams = computed(() => this.stats()?.recent_exams || []);
  isLoading = signal(false);
  isAllocating = signal(false);

  filteredExams = computed(() => {
    return this.recentExams();
  });


  //Get buttons based on user role and current menu
  buttons = computed(() => {
    const user = this.user();
    if (!user) return [];
    return this.buttonService.getButtons(this.menuName, user.role);
  });

  widgetsSignal = this.service.userExamWidgets;
  widgets = input<any[]>(this.widgetsSignal());

  // Table Configurations
  tableColumns = signal<TableColumn[]>([
    { key: 'name', header: 'Session Details', type: 'text' },
    { key: 'start_time', header: 'Start Date & Time', type: 'date' },
    { key: 'end_time', header: 'End Date', type: 'date' },
    { key: 'candidates', header: 'Attendance', type: 'number' },
    { key: 'status', header: 'Status', type: 'text' }
  ]);

  // Computed Actions based on Role
  tableActions = computed(() => {
    const role = this.user()?.role;
    if (role === 'admin') {
      return ['view', 'download'];
    }
    return []; // Instructors: Read-only
  });

  tableData = computed(() => {
    return this.recentExams().map((exam: any) => ({
      ...exam,
      status: this.getExamStatus(exam)
    }));
  });

  constructor() { }

  ngOnInit() {
    if (this.isAdmin()) {
      this.loadStats();
    }
  }

  loadStats() {
    this.isLoading.set(true);
    this.service.getExamStatistics().subscribe({
      next: (data) => {
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to load exam stats", err);
        this.isLoading.set(false);
      }
    });
  }

  handleButtonAction(action: string) {
    switch (action) {
      case 'createExam':
        this.createExam();
        break;
      case 'sheduleExam':
        this.scheduleExam();
        break;
      case 'manageCategories':
        this.manageCategories();
        break;
      case 'manageTimeframe':
        this.manageTimeframe();
        break;
      case 'refreshStats':
        this.loadStats();
        break;
    }
  }

  handleTableAction(event: { action: string, item: any }) {
    const exam = event.item;

    if (!exam) return;

    switch (event.action) {
      case 'view':
        this.service.showNotification(`Viewing details for ${exam.name}`, 'info');
        break;
      case 'download':
        this.downloadResults(exam);
        break;
    }
  }

  onAutoAllocate(data: any) {
    if (data) {
      this.isAllocating.set(true);
      const dateStr = data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date;

      this.service.autoAllocateExams(dateStr, data.capacity).subscribe({
        next: (res) => {
          this.service.showNotification(res.message, 'success');
          this.service.getExamStatistics().subscribe();
          this.service.fetchExams();
          this.isAllocating.set(false);
        },
        error: (err) => {
          this.service.showNotification("Allocation Failed: " + (err.error?.message || err.message), 'error');
          this.isAllocating.set(false);
        }
      });
    }
  }

  createExam() {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      maxWidth: '95vw',
      minWidth: '400px',
      data: {
        title: 'Create New Exam Session',
        fields: this.formConfig.getFormConfig('exam'),
        submitText: 'Create Exam'
      }
    });

    dialogRef.componentInstance.submitted.subscribe(formData => {
      try {
        // Combine start date/time
        const start = new Date(formData.start_date);
        if (isNaN(start.getTime())) throw new Error('Invalid start date');

        if (formData.start_time) {
          const [startH, startM] = formData.start_time.split(':');
          start.setHours(parseInt(startH || '0'), parseInt(startM || '0'), 0, 0);
        }

        // Combine end date/time
        const end = new Date(formData.end_date || formData.start_date);
        if (isNaN(end.getTime())) throw new Error('Invalid end date');

        if (formData.end_time) {
          const [endH, endM] = formData.end_time.split(':');
          end.setHours(parseInt(endH || '0'), parseInt(endM || '0'), 0, 0);
        } else {
          // Default end time to 1 hour after start if not provided
          end.setTime(start.getTime() + 60 * 60 * 1000);
        }

        if (end <= start) {
          this.service.showNotification('End time must be after start time', 'warning');
          return;
        }

        const payload = {
          ...formData,
          start_time: start.toISOString(),
          end_time: end.toISOString()
        };

        delete payload.start_date;
        delete payload.end_date;
        delete payload.start_time;
        delete payload.end_time;

        this.service.addExam(payload).subscribe({
          next: () => {
            this.service.showNotification('Exam created successfully', 'success');
            dialogRef.close();
            this.loadStats();
          },
          error: (err) => this.service.showNotification('Error creating exam: ' + err.message, 'error')
        });
      } catch (e: any) {
        this.service.showNotification(e.message, 'error');
      }
    });
  }

  scheduleExam() {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      maxWidth: '95vw',
      minWidth: '400px',
      data: {
        title: 'Schedule Students to Exam',
        fields: this.formConfig.getFormConfig('schedule-exam'),
        submitText: 'Auto-Allocate'
      }
    });

    dialogRef.componentInstance.submitted.subscribe(formData => {
      // Find the date for the selected exam session
      const selectedExam = this.service.examsSignal().find(e => e.id == formData.exam_id);
      if (selectedExam && selectedExam.start_time) {
        const dateObj = new Date(selectedExam.start_time);
        if (!isNaN(dateObj.getTime())) {
          const date = dateObj.toISOString().split('T')[0];
          this.onAutoAllocate({ date, capacity: formData.capacity });
          dialogRef.close();
        } else {
          this.service.showNotification('Selected exam has an invalid start date', 'error');
        }
      } else {
        this.service.showNotification('Invalid exam session selected', 'error');
      }
    });
  }

  getExamStatus(exam: any): string {
    const now = new Date();
    const startTime = new Date(exam.start_time);

    // Assuming exams last 1 hour for status purposes
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    return 'completed';
  }

  manageCategories() {
    this.dialog.open(MetadataManagerDialogComponent, {
      maxWidth: '95vw',
      minWidth: '400px',
      data: {
        title: 'Manage Categories',
        entityType: 'category',
        columns: [
          { key: 'category', header: 'Category Name', type: 'text' },
          { key: 'description', header: 'Description', type: 'text' }
        ],
        dataSignal: () => this.service.categoriesSignal(),
        addMethod: (data: any) => this.service.addCategory(data),
        updateMethod: (data: any) => this.service.updateCategory(data),
        deleteMethod: (id: number) => this.service.deleteCategory(id)
      }
    });
  }

  manageTimeframe() {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      maxWidth: '95vw',
      minWidth: '350px',
      data: {
        title: 'Set Exam Timeframe',
        fields: this.formConfig.getFormConfig('exam-timeframe'),
        initialData: { period: this.service.examDuration() / 60 },
        submitText: 'Save Settings'
      }
    });

    dialogRef.componentInstance.submitted.subscribe(formData => {
      this.service.setExamTimeframe(formData).subscribe({
        next: () => {
          this.service.showNotification('Timeframe updated', 'success');
          dialogRef.close();
        },
        error: () => this.service.showNotification('Error updating timeframe', 'error')
      });
    });
  }

  downloadResults(exam: any) {
    this.service.showNotification(`Preparing results for ${exam.name}...`, 'info');
    // Implementation for downloading PDF would go here
  }

}
