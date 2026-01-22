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
      padding: 32px 40px;
      border-radius: 24px;
      box-shadow: 0 10px 15px -3px var(--shadow-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 32px;
      border: var(--glass-border);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .header-container::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, var(--primary-color), transparent);
        opacity: 0.5;
    }

    .header-content {
      flex: 1;
    }

    .header-content h2 {
      margin: 0 0 6px 0;
      color: var(--text-main);
      font-size: 1.875rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }

    .header-content p {
      margin: 0;
      color: var(--text-muted);
      font-size: 1rem;
      line-height: 1.6;
      max-width: 600px;
    }

    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .premium-btn {
        background: var(--primary-color) !important;
        color: white !important;
        border-radius: 12px !important;
        padding: 10px 24px !important;
        font-weight: 600 !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .premium-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -5px var(--primary-color);
        filter: brightness(1.1);
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
