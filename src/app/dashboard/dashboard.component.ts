import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { TraffiquizService } from '../traffiquiz.service';


@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterModule, MatToolbarModule, MatIconModule, MatInputModule, MatSidenavModule, MatListModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnDestroy {
  private router: Router = inject(Router);
  private trafQuisService: TraffiquizService = inject(TraffiquizService);

  public isLoggedIn: boolean = false;
  public isSidenavCollapsed: boolean = false;
  public menuItems: string[] = [];
  public icons!: any;
  public userRole!: string;
  public user!: any;

  constructor() {
    this.user = this.trafQuisService.getUser();
    if (this.user) {
      this.isLoggedIn = true;
      this.menuItems = this.user.sidebar;
      this.icons = this.user.sidebarIcons;
      console.log(this.icons);
    } else {
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
    }
  }

  toggleSidenav() {
    this.isSidenavCollapsed = !this.isSidenavCollapsed;
  }

  onLogout() {

  }

  ngOnDestroy(): void {

  }
}
