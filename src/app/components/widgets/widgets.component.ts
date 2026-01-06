
import { Component, inject, input } from '@angular/core';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { TraffiquizService } from '../../traffiquiz.service';

@Component({
  selector: 'app-widgets',
  imports: [StatCardComponent],
  templateUrl: './widgets.component.html',
  styleUrl: './widgets.component.css'
})
export class WidgetsComponent {
  private trafQuizService = inject(TraffiquizService);
  private widgetsSignal = this.trafQuizService.userWidgets;
  widgets = input<any[]>(this.widgetsSignal());
}
