import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TraffiquizService } from '../../traffiquiz.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    MatTooltipModule
  ],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.css'
})
export class ExamsComponent implements OnInit {
  public service = inject(TraffiquizService);
  private fb = inject(FormBuilder);

  user = this.service.currentUser;
  isAdmin = computed(() => this.user()?.role === 'admin');

  stats = signal<any>(null);
  recentExams = signal<any[]>([]);
  searchControl = new FormControl('');
  isLoading = signal(false);
  isAllocating = signal(false);

  filteredExams = computed(() => {
    const query = this.searchControl.value?.toLowerCase() || '';
    const exams = this.recentExams();
    if (!query) return exams;
    return exams.filter(e =>
      e.name?.toLowerCase().includes(query) ||
      e.start_time?.toLowerCase().includes(query)
    );
  });

  autoAllocateForm: FormGroup;

  constructor() {
    this.autoAllocateForm = this.fb.group({
      date: [new Date(), Validators.required],
      capacity: [20, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    if (this.isAdmin()) {
      this.loadStats();
    }

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      // Logic handled by computed signal
    });
  }

  loadStats() {
    this.isLoading.set(true);
    this.service.getExamStatistics().subscribe({
      next: (data) => {
        if (data.detailed) {
          this.stats.set(data.detailed);
          this.recentExams.set(data.detailed.recent_exams || []);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to load exam stats", err);
        this.isLoading.set(false);
      }
    });
  }

  onAutoAllocate() {
    if (this.autoAllocateForm.valid) {
      this.isAllocating.set(true);
      const val = this.autoAllocateForm.value;
      const dateStr = val.date.toISOString().split('T')[0];

      this.service.autoAllocateExams(dateStr, val.capacity).subscribe({
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

  // Helper getters
  get passRate() {
    const s = this.stats();
    if (!s) return 0;
    const total = (Number(s.pass_count) || 0) + (Number(s.fail_count) || 0);
    return total === 0 ? 0 : Math.round((Number(s.pass_count) / total) * 100);
  }
}
