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
    <div class="header-container">
      <div class="header-content">
        <h2>{{header()}}</h2>
        <p>{{content()}}</p>
      </div>
      
      <div class="header-actions">
        @for (btn of buttons(); track btn.name) {
          <button 
            [class.primary-btn]="!btn.disabled"
            mat-flat-button 
            (click)="buttonClicked.emit(btn.action)" 
            [disabled]="btn.disabled">
            @if (btn.icon) {
              <mat-icon>{{btn.icon}}</mat-icon>
            }
            {{btn.name}}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 24px;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .header-container {
      background: var(--bg-card);
      padding: 24px 32px;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px var(--shadow-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      border: var(--glass-border);
      backdrop-filter: var(--glass-blur);
      transition: box-shadow 0.3s ease;
    }

    .header-container:hover {
      box-shadow: 0 10px 15px -3px var(--shadow-color);
    }

    .header-content {
      flex: 1;
    }

    .header-content h2 {
      margin: 0 0 8px 0;
      color: var(--text-main);
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }

    .header-content p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .header-container {
        flex-direction: column;
        align-items: flex-start;
        padding: 20px;
      }

      .header-actions {
        width: 100%;
        flex-wrap: wrap;
      }
      
      .header-actions button {
        flex: 1;
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
