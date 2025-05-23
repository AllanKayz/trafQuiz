import { Routes } from '@angular/router';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { LoginComponent } from './login/login.component';
import { ExamComponent } from './exam/exam.component';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MessagesComponent } from './components/messages/messages.component';
import { WidgetsComponent } from './components/widgets/widgets.component';

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
              path:'dashboard', redirectTo:'', pathMatch: 'full'
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
