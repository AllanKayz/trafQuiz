import { Routes } from '@angular/router';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { LoginComponent } from './login/login.component';
import { ExamComponent } from './exam/exam.component';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MessagesComponent } from './components/messages/messages.component';
import { WidgetsComponent } from './components/widgets/widgets.component';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { ExamsComponent } from './components/exams/exams.component';
import { InstructorsComponent } from './components/instructors/instructors.component';
import { LessonsComponent } from './components/lessons/lessons.component';
import { AdminToolsComponent } from './components/admin/admin-tools.component';
import { QuestionsComponent } from './components/questions/questions.component';
import { StudentsComponent } from './components/students/students.component';
import { FinancesComponent } from './components/finances/finances.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';
import { UserAccessComponent } from './components/user-access/user-access.component';

/**
 * Defines the routes for the application.
 */
export const routes: Routes = [
  {
    // The default route, which displays the login component.
    path: '',
    component: LoginComponent,
    title: 'TraffiQuiz'
  },
  {
    // The dashboard route, which is the main view for logged-in users.
    // It contains nested routes for the different sections of the dashboard.
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: WidgetsComponent
      },
      {
        path: 'messages',
        component: MessagesComponent
      },
      {
        path: 'instructors',
        component: InstructorsComponent
      },
      {
        path: 'students',
        component: StudentsComponent
      },
      {
        path: 'exams',
        component: ExamsComponent
      },
      {
        path: 'questions',
        component: QuestionsComponent
      },
      {
        path: 'lessons',
        component: LessonsComponent
      },
      {
        path: 'lessons-admin',
        component: AdminToolsComponent
      },
      {
        path: 'scheduling',
        loadComponent: () => import('./components/admin/scheduling/scheduling.component').then(m => m.SchedulingComponent)
      },
      {
        path: 'vehicles',
        component: VehiclesComponent
      },
      {
        path: 'finances',
        component: FinancesComponent
      },
      {
        path: 'payments',
        component: FinancesComponent
      },
      {
        path: 'reports',
        component: ReportsComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'admin-tools',
        component: AdminToolsComponent
      },
      {
        path: 'useraccess',
        component: UserAccessComponent
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
    // The exam route, which displays the quiz.
    path: 'exam',
    component: ExamComponent
  },
  {
    // The admin route, for administrative tasks.
    path: 'admin',
    component: AdminComponent
  },
  {
    // A redirect from '/login' to the default route.
    path: 'login', redirectTo: '', pathMatch: 'full'
  },
  {
    // A wildcard route that displays a "page not found" message for any other routes.
    path: '**', component: PagenotfoundComponent, title: 'Error 404'
  }
];
