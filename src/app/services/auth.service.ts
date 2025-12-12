import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  constructor(private router: Router) {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSignal.set(JSON.parse(savedUser));
    }
  }

  login(username: string, password: string): boolean {
    // Simple authentication - in production, this would call an API
    if (username && password) {
      const user: User = {
        username: username,
        email: `${username}@hospital.com`
      };
      this.currentUserSignal.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/home']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
