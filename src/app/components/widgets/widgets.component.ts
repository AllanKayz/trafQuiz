import { Component, inject, computed } from '@angular/core';
import { TraffiquizService } from '../../traffiquiz.service';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-widgets',
  standalone: true,
  imports: [StatCardComponent, MatIconModule, MatRippleModule, RouterLink],
  templateUrl: './widgets.component.html',
  styleUrl: './widgets.component.css'
})
export class WidgetsComponent {
  private service = inject(TraffiquizService);

  // Signals from Service
  widgets = this.service.userWidgets;
  quickActions = this.service.userQuickActions;
  user = this.service.currentUser;

  // Track user name for greeting
  userName = computed(() => this.user()?.firstName || 'User');
}
