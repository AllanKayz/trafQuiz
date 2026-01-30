import { Routes } from '@angular/router';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

/**
 * Defines the routes for the application.
 * All major dashboard components are lazy-loaded for performance.
 */
export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    title: 'TraffiQuiz'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./components/widgets/widgets.component').then(m => m.WidgetsComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./components/messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'instructors',
        loadComponent: () => import('./components/instructors/instructors.component').then(m => m.InstructorsComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./components/students/students.component').then(m => m.StudentsComponent)
      },
      {
        path: 'exams',
        loadComponent: () => import('./components/exams/exams.component').then(m => m.ExamsComponent)
      },
      {
        path: 'questions',
        loadComponent: () => import('./components/questions/questions.component').then(m => m.QuestionsComponent)
      },
      {
        path: 'lessons',
        loadComponent: () => import('./components/lessons/lessons.component').then(m => m.LessonsComponent)
      },
      {
        path: 'lessons-admin',
        loadComponent: () => import('./components/admin/admin-tools.component').then(m => m.AdminToolsComponent)
      },
      {
        path: 'scheduling',
        loadComponent: () => import('./components/admin/scheduling/scheduling.component').then(m => m.SchedulingComponent)
      },
      {
        path: 'vehicles',
        loadComponent: () => import('./components/vehicles/vehicles.component').then(m => m.VehiclesComponent)
      },
      {
        path: 'finances',
        loadComponent: () => import('./components/finances/finances.component').then(m => m.FinancesComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./components/finances/finances.component').then(m => m.FinancesComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'metadata',
        loadComponent: () => import('./components/admin/admin-tools.component').then(m => m.AdminToolsComponent)
      },
      {
        path: 'useraccess',
        loadComponent: () => import('./components/user-access/user-access.component').then(m => m.UserAccessComponent)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./components/instructors/schedule/schedule.component').then(m => m.ScheduleComponent)
      },
      {
        path: 'vehicle-status',
        loadComponent: () => import('./components/instructors/vehicle-status/vehicle-status.component').then(m => m.VehicleStatusComponent)
      },
      {
        path: 'dashboard', redirectTo: '', pathMatch: 'full'
      }
    ]
  },
  {
    path: 'exam',
    loadComponent: () => import('./exam/exam.component').then(m => m.ExamComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'login', redirectTo: '', pathMatch: 'full'
  },
  {
    path: '**', component: PagenotfoundComponent, title: 'Error 404'
  }
];
