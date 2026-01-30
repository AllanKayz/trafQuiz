import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../loading.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule],
    template: `
    <div class="loader-overlay" *ngIf="loadingService.isLoading()">
      <div class="loader-content">
        <mat-spinner diameter="60" color="primary"></mat-spinner>
        <p class="loader-text">Loading...</p>
      </div>
    </div>
  `,
    styles: [`
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(var(--background), 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease-out;
    }

    .loader-content {
      background: var(--bg-card);
      padding: 32px 48px;
      border-radius: 20px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .loader-text {
      margin: 0;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-size: 0.85rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class LoaderComponent {
    public loadingService = inject(LoadingService);
}
