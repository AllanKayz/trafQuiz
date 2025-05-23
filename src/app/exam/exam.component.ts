import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { TraffiquizService } from '../traffiquiz.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface Question {
  question: string;
  photo: string;
  option_a: string;
  option_b: string;
  option_c: string;
  answer: string;
  selectedAnswer?: string | undefined;
}

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatProgressSpinnerModule, MatProgressBarModule],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.css'
})
export class ExamComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  examForm!: FormGroup;
  timer!: number;
  score: number = 0;
  interval: any;
  isSubmited: boolean = false;
  timeUp: boolean = false;
  isStarted: boolean = false;
  isNotStarted: boolean = true;
  isPaused: boolean = false;
  pauseState: string = "Pause";
  isLoaded: boolean = false;
  responses: any;
  justData: any;

  private INITIAL_TIMER_VALUE = 300;
  private quizService: TraffiquizService = inject(TraffiquizService);
  private router: Router = inject(Router);
  private fb: FormBuilder = inject(FormBuilder);
  UserData: any;

  constructor() { }

  ngOnInit(): void {
    this.quizService.getExamTimeframe().subscribe({
      next: (res) => {
        this.justData = res;
      },
      error: (err) => {
        console.error('Error fetching exam', err);
      },
      complete: () => {
        this.INITIAL_TIMER_VALUE = parseInt(this.justData['period']);
        this.timer = this.INITIAL_TIMER_VALUE;
        this.loadQuizData();
      }
    });
  }

  startApp(): void {
    this.isStarted = true;
    this.isNotStarted = false;
    this.loadQuizData();
    this.startTimer();
  }

  closeApp(): void {
    this.stopTimer();
    this.isNotStarted = true;
    this.isStarted = false;
    this.isPaused = false;
    this.isLoaded = false;
    this.pauseState = "Pause";
    this.examForm?.reset();
    localStorage.removeItem('quizResponses');
    localStorage.removeItem('user');
    this.isSubmited = false;
    this.timeUp = false;
    this.router.navigate(['/login']);
  }

  getNewExam(): void {
    this.loadQuizData();
  }

  loadQuizData() {
    this.UserData = JSON.parse(localStorage['user']);
    this.quizService.retrieveExam(this.UserData.token).pipe(finalize(() => this.isLoaded = true)).subscribe({
      next: (res) => {
        this.questions = res;
        this.examForm = this.fb.group({});
        this.questions.forEach((question, index) => {
          this.examForm.addControl(`question${index}`, this.fb.control({ value: "", disabled: this.isSubmited || this.timeUp }));
        });
        this.timer = this.INITIAL_TIMER_VALUE;
        this.startTimer();
      },
      error: (err) => {
        if (err) {
          alert("Error fetching exam, try again");
          this.router.navigate(['/login']);
        }
        alert('Error fetching exam' + err);
      }
    });
  }


  private startTimer(): void {
    this.interval = setInterval(() => {
      if (!this.isPaused) {
        this.timer--;
        if (this.timer <= 0) {
          this.submitExam();
        }
      }
    }, 1000);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
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

  submitExam(): void {
    if (this.isSubmited) return;
    this.isSubmited = true;
    this.responses = this.examForm.value;
    this.calculateScore(this.responses);
    this.quizService.saveResponses(this.responses);
    this.stopTimer();
    this.isPaused = false;
    this.pauseState = "Pause";
  }

  calculateScore(userAnswers: any): void {
    this.score = 0;
    this.questions.forEach((question, index) => {
      const userAnswer = userAnswers[`question${index}`];
      if (userAnswer == question.answer) {
        this.score++;
      }
    });
  }

  getStoredResponses(): void {
    const storedResponses = this.quizService.getStoredResponses();
    this.questions.forEach((question, index) => {
      if (question.selectedAnswer !== storedResponses[index]?.answer) {
        question.selectedAnswer = 'wrong';
      }
    });
  }

  getOptionClass(question: Question, option: string): string {
    if (!this.isSubmited) return '';
    if (option === question.selectedAnswer && option !== question.answer) return 'wrong';
    if (option === question.answer) return 'correct';
    return '';
  }

  resetQuiz(): void {
    this.examForm?.reset();
    localStorage.removeItem('quizResponses');
    this.isSubmited = false;
    this.timeUp = false;
    this.isLoaded = false;
    this.loadQuizData();
  }

  retakeQuiz(): void {
    this.isSubmited = false;
    this.timeUp = false;
    this.isLoaded = true;
    this.stopTimer();
    this.examForm?.reset();
    localStorage.removeItem('quizResponses');

    this.timer = this.INITIAL_TIMER_VALUE;
    this.startTimer();
  }

  stopTimer(): void {
    clearInterval(this.interval);
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.examForm?.reset();
    localStorage.removeItem('quizResponses');
    localStorage.removeItem('user');
    this.isSubmited = false;
    this.timeUp = false;
    this.isLoaded = false;
  }
}
