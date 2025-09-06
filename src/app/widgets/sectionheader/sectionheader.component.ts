import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `	
	<div class="header">
    <h2>{{header()}}</h2>
    <p>{{content()}}</p>
		
    <div class="buttons">
      <button *ngFor="let btn of buttons()" mat-stroked-button (click)="buttonClicked.emit(btn.action)" [disabled]="btn.disabled">
        <mat-icon *ngIf="btn.icon">{{btn.icon}}</mat-icon>
        {{btn.name}}
      </button>
    </div>    
  </div>
  `,
  styles: `
	.header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

	.header h2 {
    color: #333;
    font-size: 28px;
    margin-bottom: 10px;
  }

  .header p {
    color: #666;
    font-size: 16px;
  }

  .buttons {
    display: flex;
    gap: 10px;
  }
	`
})

export class SectionheaderComponent {
  header = input.required();
  content = input.required();

  buttons = input<SectionButton[]>([]);
  buttonClicked = output<string>();
}
