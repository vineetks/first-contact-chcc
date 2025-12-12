import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RecordsComponent } from './records/records.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'records', component: RecordsComponent, canActivate: [authGuard] }
];
