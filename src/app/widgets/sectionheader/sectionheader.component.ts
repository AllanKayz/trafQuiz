import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface SectionButton {
  name: string;
  icon?: string;
  action: string;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
}

@Component({
  selector: 'app-sectionheader',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="header-container animate-fade-in">
      <div class="header-content">
        <h2 class="text-gradient">{{header()}}</h2>
        <p>{{content()}}</p>
      </div>
      
      <div class="header-actions">
        @for (btn of buttons(); track btn.name) {
          <button 
            [class]="'premium-btn ' + (btn.variant || 'primary') + '-btn'"
            [class.disabled-btn]="btn.disabled"
            mat-button 
            (click)="buttonClicked.emit(btn.action)" 
            [disabled]="btn.disabled">
            @if (btn.icon) {
              <mat-icon>{{btn.icon}}</mat-icon>
            }
            <span>{{btn.name}}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 32px;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .header-container {
      background: var(--bg-card);
      padding: 24px 32px;
      border-radius: 16px;
      box-shadow: var(--shadow-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      border: 1px solid var(--border-color);
      transition: all 0.3s ease;
      position: relative;
    }

    .header-content h2 {
      margin: 0 0 4px 0;
      color: var(--text-main);
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .header-content p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.875rem;
      line-height: 1.5;
      max-width: 500px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .premium-btn {
        border-radius: 10px !important;
        padding: 8px 20px !important;
        font-weight: 700 !important;
        font-size: 0.85rem !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        height: 42px !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        letter-spacing: 0.01em !important;
    }

    .primary-btn {
        background: var(--primary-color) !important;
        color: white !important;
        box-shadow: 0 4px 15px hsla(var(--primary) / 0.25);
    }

    .primary-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px hsla(var(--primary) / 0.35);
        filter: brightness(1.1);
    }

    .outline-btn {
        background: transparent !important;
        color: var(--text-main) !important;
        border: 2px solid var(--border-color) !important;
    }

    .outline-btn:hover:not(:disabled) {
        background: var(--hover-bg) !important;
        border-color: var(--primary-color) !important;
        color: var(--primary-color) !important;
        transform: translateY(-2px);
    }

    .danger-btn {
        background: #ef4444 !important;
        color: white !important;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.25);
    }

    .danger-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
        filter: brightness(1.1);
    }

    .premium-btn mat-icon {
        margin: 0 !important;
        font-size: 18px !important;
        width: 18px !important;
        height: 18px !important;
    }

    .disabled-btn {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .header-container {
        flex-direction: column;
        align-items: flex-start;
        padding: 24px;
        gap: 24px;
      }

      .header-actions {
        width: 100%;
        flex-wrap: wrap;
      }
      
      .header-actions button {
        flex: 1;
        min-width: 140px;
      }
    }
  `]
})
export class SectionheaderComponent {
  header = input.required<string>();
  content = input.required<string>();
  buttons = input<SectionButton[]>([]);
  buttonClicked = output<string>();
}
