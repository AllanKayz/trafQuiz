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
      height: 32px;
      background: var(--bg-body); /* Follows app background */
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      -webkit-app-region: drag;
      user-select: none;
      border-bottom: 1px solid var(--border-color);
      transition: background-color 0.3s, color 0.3s, border-color 0.3s;
    }

    /* 
       Optional: Make title bar slightly distinct or "glassy" 
       if desired, but matching body is safest for consistency.
    */

    .logo-area {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .app-logo {
      height: 20px;
      width: 20px;
    }

    .app-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-main);
    }

    .controls-area {
      display: flex;
      -webkit-app-region: no-drag;
    }

    .control-btn {
      width: 40px !important;
      height: 32px !important;
      line-height: 32px !important;
      border-radius: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-main);
      transition: background-color 0.2s;
    }
    
    .control-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .control-btn:hover {
      background-color: var(--hover-bg);
    }

    .close-btn:hover {
      background-color: #ef4444 !important; /* Red-500 */
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
