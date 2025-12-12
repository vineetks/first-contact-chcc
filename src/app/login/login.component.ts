import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async onLogin() {
    this.errorMessage = '';
    this.isLoading = true;

    try {
      await this.authService.login(this.email, this.password);
      // Get return url from query params or default to records
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/records';
      this.router.navigate([returnUrl]);
    } catch (error: any) {
      this.errorMessage = error.message || 'Invalid credentials. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
