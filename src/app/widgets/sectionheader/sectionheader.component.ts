import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface SectionButton {
  name: string;
  icon?: string;
  action: string;
  disabled?: boolean;
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
            class="premium-btn"
            [class.disabled-btn]="btn.disabled"
            mat-flat-button 
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
        background: var(--primary-color) !important;
        color: white !important;
        border-radius: 8px !important;
        padding: 8px 18px !important;
        font-weight: 600 !important;
        font-size: 0.875rem !important;
        transition: all 0.2s ease !important;
    }

    .premium-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px hsla(var(--primary) / 0.4);
        filter: brightness(1.05);
    }

    .premium-btn mat-icon {
        margin-right: 8px;
        font-size: 20px;
        width: 20px;
        height: 20px;
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
