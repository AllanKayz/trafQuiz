import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';

@Component({
    selector: 'app-widgets',
    imports: [CommonModule, StatCardComponent],
    templateUrl: './widgets.component.html',
    styleUrl: './widgets.component.css'
})
export class WidgetsComponent {
  header = 'next lesson';
  data = 24;
  footer = 'June';
}
