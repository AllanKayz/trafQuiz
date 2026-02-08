import { Component, inject, computed } from '@angular/core';
import { TraffiquizService } from '../../traffiquiz.service';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { FormConfigService } from '../../widgets/form-config.service';

@Component({
  selector: 'app-widgets',
  standalone: true,
  imports: [StatCardComponent, MatIconModule, MatRippleModule, RouterLink],
  templateUrl: './widgets.component.html',
  styleUrl: './widgets.component.css'
})
export class WidgetsComponent {
  private service = inject(TraffiquizService);
  private dialog = inject(MatDialog);
  private formConfig = inject(FormConfigService);
  private router = inject(Router);

  // Signals from Service
  widgets = this.service.userWidgets;
  quickActions = this.service.userQuickActions;
  user = this.service.currentUser;
  isLoading = computed(() => !this.service.dashboardStats());

  // Track user name for greeting
  userName = computed(() => this.user()?.firstName || 'User');

  handleAction(action: any) {
    if (action.route) {
      this.router.navigateByUrl(action.route);
    } else if (action.action === 'quickAddUser') {
      this.quickAddUser();
    }
  }

  quickAddUser() {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: {
        title: 'Quick Add New Student',
        submitText: 'Create Student Account',
        fields: this.formConfig.getFormConfig('student'),
        initialData: {
          active: true,
          enrollmentDate: new Date()
        }
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      this.service.addStudent(data).subscribe(res => {
        if (res && res.success) {
          this.service.showNotification('Student added successfully', 'success');
          dialogRef.close();
          this.service.fetchDashboardStats(true);
          // Navigate to the students management page to complete the profile if needed
          this.router.navigate(['/dashboard/students'], { queryParams: { edit: res.data?.id || res.id } });
        }
      });
    });
  }
}
