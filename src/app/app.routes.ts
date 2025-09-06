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
import { QuestionsComponent } from './components/questions/questions.component';
import { StudentsComponent } from './components/students/students.component';
import { FinancesComponent } from './components/finances/finances.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';

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
        path: 'vehicles',
        component: VehiclesComponent
      },
      {
        path: 'finances',
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
        path: 'useraccess',
        component: MessagesComponent
      },
      {
        path: 'dashboard', redirectTo: '', pathMatch: 'full'
      }
    ]
  },
  {
    path: 'exam',
    component: ExamComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  },
  {
    path: 'login', redirectTo: '', pathMatch: 'full'
  },
  {
    path: '**', component: PagenotfoundComponent, title: 'Error 404'
  }
];
