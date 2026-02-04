
import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TraffiquizService } from '../traffiquiz.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, MatIconModule, ReactiveFormsModule, MatButtonModule, MatTooltipModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private router = inject(Router);
  private trafQuizService = inject(TraffiquizService);

  isSidenavCollapsed = signal(false);
  user = this.trafQuizService.currentUser;
  isLoggedIn = computed(() => !!this.user());
  menuItems = computed(() => this.isLoggedIn() ? this.user()?.sidebar : []);
  icons = computed(() => this.user()?.sidebarIcons || {});

  public widgetsSignal = this.trafQuizService.userWidgets;

  constructor() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      // Fetch dynamic data
      this.trafQuizService.fetchDashboardStats();
    }
  }

  toggleSidenav() {
    this.isSidenavCollapsed.update(prev => !prev);
  }
}
