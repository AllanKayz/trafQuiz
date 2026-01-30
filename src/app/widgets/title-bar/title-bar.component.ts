import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TraffiquizService } from '../../traffiquiz.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="title-bar" [class.dark-theme]="themeService.isDarkMode()">
      <div class="logo-area">
        <img src="assets/logo.png" alt="TrafQuiz" class="app-logo">
        <span class="app-title">TrafQuiz</span>
      </div>
      <div class="controls-area">
        <div class="app-actions">
          @if (service.currentUser()) {
          <button mat-icon-button class="action-btn" (click)="onLogout()" matTooltip="Logout">
            <mat-icon>logout</mat-icon>
          </button>
          }
          <button mat-icon-button class="action-btn" (click)="themeService.toggleTheme()"
            [matTooltip]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <mat-icon>{{themeService.isDarkMode() ? 'light_mode' : 'dark_mode'}}</mat-icon>
          </button>
        </div>
        <div class="window-controls">
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
      align-items: stretch;
      -webkit-app-region: no-drag;
      height: 100%;
    }

    .app-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 8px;
      position: relative;
    }

    .app-actions::after {
      content: '';
      position: absolute;
      right: 0;
      top: 20%;
      height: 60%;
      width: 1px;
      background: var(--border-color);
      opacity: 0.5;
    }

    .window-controls {
      display: flex;
      height: 100%;
    }

    .action-btn {
      width: 30px !important;
      height: 30px !important;
      border-radius: 6px !important;
      color: var(--text-muted);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn:hover {
      color: var(--primary-color);
      background-color: var(--hover-bg);
      transform: translateY(-1px);
    }

    .action-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
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
  themeService = inject(ThemeService);
  private router = inject(Router);

  onLogout() {
    this.service.logout();
    this.router.navigate(['/login']);
  }

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
