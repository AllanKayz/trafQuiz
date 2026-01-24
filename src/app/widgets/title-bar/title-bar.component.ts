import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TraffiquizService } from '../../traffiquiz.service';

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="title-bar" [class.dark-theme]="service.darkMode()">
      <div class="logo-area">
        <img src="assets/logo.png" alt="TrafQuiz" class="app-logo">
        <span class="app-title">TrafQuiz</span>
      </div>
      <div class="controls-area">
        <button mat-icon-button class="control-btn" (click)="minimize()">
          <mat-icon>remove</mat-icon>
        </button>
        <button mat-icon-button class="control-btn" (click)="maximize()">
          <mat-icon>crop_square</mat-icon>
        </button>
        <button mat-icon-button class="control-btn close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .title-bar {
      height: 38px;
      background: var(--bg-sidebar);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      -webkit-app-region: drag;
      user-select: none;
      border-bottom: 1px solid var(--border-color);
      transition: all 0.3s ease;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .app-logo {
      height: 22px;
      width: 22px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .app-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
      letter-spacing: 0.02em;
    }

    .controls-area {
      display: flex;
      -webkit-app-region: no-drag;
      height: 100%;
    }

    .control-btn {
      width: 46px !important;
      height: 100% !important;
      border-radius: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-main);
      transition: all 0.2s;
      opacity: 0.8;
    }
    
    .control-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .control-btn:hover {
      background-color: var(--hover-bg);
      opacity: 1;
    }

    .close-btn:hover {
      background-color: #e81123 !important; /* Windows Standard Close Red */
      color: white !important;
    }
  `]
})
export class TitleBarComponent {
  service = inject(TraffiquizService);

  minimize() {
    window.electronAPI.invoke('window:minimize');
  }

  maximize() {
    window.electronAPI.invoke('window:maximize');
  }

  close() {
    window.electronAPI.invoke('window:close');
  }
}
