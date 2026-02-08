import { Component, inject, OnDestroy, computed, signal, effect, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TraffiquizService } from '../traffiquiz.service';
import { Router, NavigationEnd } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-exam',
  standalone: true,
    imports: [ReactiveFormsModule, FormsModule, MatProgressSpinnerModule, MatProgressBarModule, MatSelectModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './exam.component.html',
    styleUrl: './exam.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamComponent implements OnDestroy {
  private router = inject(Router);

  currentQuestionIndex = signal(0);
  userAnswers = signal<{ [key: number]: number }>({});
  flaggedQuestions = signal<Set<number>>(new Set());
  timeRemaining = signal(0); // 0 minutes
  showResults = signal(false);
  examResults = signal<{ score: number, percentage: number, passed: boolean } | null>(null);
  isPaused: boolean = false;
  pauseState: string = "Pause";
  loading = signal(true);
  UserData: any;

  private timerSubscription?: Subscription;
  public baseDuration = signal(1800); // Default fallback duration
  public examService = inject(TraffiquizService);
  public alert = inject(MatDialog);


  // Signals for questions
  questions = this.examService.questionsSignal;
  totalQuestions = computed(() => this.questions().length);

  // Computed signals
  currentQuestion = computed(() => {
    const index = this.currentQuestionIndex();
    return this.questions()[index];
  });

  // Signal for exam token
  examToken = signal<string>('');

  progressPercentage = computed(() => {
    return ((this.currentQuestionIndex() + 1) / this.totalQuestions()) * 100;
  });

  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeRemaining() / 60);
    const seconds = this.timeRemaining() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  constructor() {
    const rawUser = this.examService.getRawUser();
    if (rawUser) {
      this.UserData = rawUser;
      this.examToken.set(this.UserData.token);
    } else {
      this.router.navigate(['/login']);
    }
    this.startNewExam(); // Start immediately

    // Watch for questions to be loaded and start exam
    effect(() => {
      if (this.questions().length > 0 && this.loading()) {
        this.baseDuration.set(this.examService.examDuration());
        this.timeRemaining.set(this.baseDuration());
        this.loading.set(false);
        this.restartTimer();
      }
    });
  }

  // Method to start a fresh exam
  startNewExam() {
    this.loading.set(true);
    // Clear previous questions to ensure effect triggers on new data
    this.examService.questionsSignal.set([]);

    // Fetch new Questions
    this.examService.fetchExam(this.examToken());

    // Reset exam state
    this.currentQuestionIndex.set(0);
    this.userAnswers.set({});
    this.flaggedQuestions.set(new Set());
    this.showResults.set(false);
    this.examResults.set(null);

    // Timer will be started by effect when data arrives
  }

  private restartTimer() {
    this.timerSubscription?.unsubscribe();
    this.startTimer();
  }

  startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      const newTime = this.timeRemaining() - 1;
      if (!this.isPaused) {
        this.timeRemaining.set(newTime);
        if (newTime <= 0) {
          this.timerSubscription?.unsubscribe();
          this.submitExam(true); // Force submit when time runs out
        }
      }
    });
  }

  pauseTimer(): void {
    if (this.pauseState === "Pause") {
      this.isPaused = true;
      this.pauseState = "Resume";
    } else {
      this.isPaused = false;
      this.pauseState = "Pause";
    }
  }

  selectOption(optionIndex: number) {
    const answers = { ...this.userAnswers() };
    answers[this.currentQuestionIndex()] = optionIndex;
    this.userAnswers.set(answers);
  }

  previousQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(idx => idx - 1);
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex() < this.totalQuestions() - 1) {
      this.currentQuestionIndex.update(idx => idx + 1);
    }
  }

  toggleFlag(): void {
    const currentIndex = this.currentQuestionIndex();
    const flagged = new Set(this.flaggedQuestions());

    if (flagged.has(currentIndex)) {
      flagged.delete(currentIndex);
    } else {
      flagged.add(currentIndex);
    }

    this.flaggedQuestions.set(flagged);
  }

  jumpToNextFlagged() {
    const flagged = Array.from(this.flaggedQuestions());
    if (flagged.length === 0) return;

    // Sort flagged indices
    flagged.sort((a, b) => a - b);

    // Find next flagged index after current position
    const nextIndex = flagged.findIndex(i => i > this.currentQuestionIndex());

    if (nextIndex >= 0) {
      this.currentQuestionIndex.set(flagged[nextIndex]);
    } else {
      // Wrap around to first flagged question
      this.currentQuestionIndex.set(flagged[0]);
    }
  }

  submitExam(force: boolean = false) {
    const flagged = Array.from(this.flaggedQuestions());
    if (flagged.length === 0 || force) {
      this.timerSubscription?.unsubscribe();

      let score = 0;
      this.questions().forEach((question, index) => {
        if (this.userAnswers()[index] === question.correct) {
          score++;
        }
      });

      const percentage = Math.round((score / this.totalQuestions()) * 100);
      const passed = percentage >= 88;

      // Prepare results data for alert
      const data = {
        title: passed ? 'Congratulations!' : 'Better luck next time',
        message: `You scored ${score} out of ${this.totalQuestions()} (${percentage}%)`,
        type: passed ? 'success' : 'error',
        buttons: [
          { text: '🔄 Restart Exam', value: 'same', color: 'primary' },
          { text: '🆕 New Exam', value: 'new', color: 'accent' },
          { text: 'Close', value: 'close', color: 'warn' }
        ]
      };


      const dialogRef = this.openAlertDialog(data);
      dialogRef.afterClosed().subscribe(result => {
        switch (result) {
          case 'same':
            this.restartExam(true);
            break;
          case 'new':
            this.restartExam(false);
            break;
          case 'close':
            this.closeExam();
            break;
        }
      });

      this.showResults.set(true);

    } else {
      this.examService.showNotification('Unflag questions flagged to make a submission', 'error');
    }
  }

  // Restart method allowing choice
  restartExam(sameQuestions: boolean = true) {
    if (sameQuestions) {
      // Reset with same questions
      this.currentQuestionIndex.set(0);
      this.userAnswers.set({});
      this.flaggedQuestions.set(new Set());
      this.timerSubscription?.unsubscribe()
      this.timeRemaining.set(this.baseDuration());
      this.showResults.set(false);
      this.startTimer();
    } else {
      // Start a completely new exam
      this.startNewExam();
    }
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  openAlertDialog(data: any): MatDialogRef<AlertComponent> {
    return this.alert.open(AlertComponent, {
      data: data
    });

    /*
    this.alert.afterClosed().subscribe(result => {

    });
    */
  }

  closeModal() {
    this.showResults.set(false);
  }

  closeExam(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }
}
