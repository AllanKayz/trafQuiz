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
    { key: 'start_time', header: 'Date', type: 'date' },
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
        this.service.showNotification('Create Exam functionality coming soon', 'info');
        break;
      case 'sheduleExam':
        this.service.showNotification('Schedule Exam functionality coming soon', 'info');
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
          this.loadStats();
          this.isAllocating.set(false);
        },
        error: (err) => {
          this.service.showNotification("Allocation Failed: " + (err.error?.message || err.message), 'error');
          this.isAllocating.set(false);
        }
      });
    }
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

  downloadResults(exam: any) {
    this.service.showNotification(`Preparing results for ${exam.name}...`, 'info');
    // Implementation for downloading PDF would go here
  }

}
