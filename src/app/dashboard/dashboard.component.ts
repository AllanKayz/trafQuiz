import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TraffiquizService } from '../traffiquiz.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, MatToolbarModule, MatIconModule, MatInputModule, MatSidenavModule, MatListModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule],
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
    }
  }

  toggleSidenav() {
    this.isSidenavCollapsed.update(prev => !prev);
  }

  sidenavLink() {
    const subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/dashboard/exam') {
          this.router.navigate(['/exam']);
        }
        subscription.unsubscribe();
      }
    });
  }

  onLogout() {
    this.trafQuizService.logout();
    this.router.navigate(['/login']);
  }
  
}
