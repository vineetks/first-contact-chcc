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
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onLogin() {
    if (this.authService.login(this.username, this.password)) {
      // Get return url from query params or default to records
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/records';
      this.router.navigate([returnUrl]);
    } else {
      this.errorMessage = 'Invalid credentials. Please try again.';
    }
  }
}
