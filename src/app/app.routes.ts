import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Printers } from './printers/printers';
import { Users } from './users/users';
import { Designations } from './designations/designations';
import { Home } from './home/home';
import { authGuard } from './auth-guard'; // Added the hyphen

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: '',
    component: Home,
    canActivate: [authGuard],   // 🔐 protect all children
    children: [

      {
        path: 'printers',
        component: Printers,
        data: { roles: ['System Administrator', 'Manager', 'Level 1 Employee'] }
      },

      {
        path: 'users',
        component: Users,
        data: { roles: ['System Administrator'] }
      },

      {
        path: 'designations',
        component: Designations,
        data: { roles: ['System Administrator'] }
      }

    ]
  }

];
