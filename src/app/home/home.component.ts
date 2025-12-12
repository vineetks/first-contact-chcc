import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { EnrollChildPopupComponent } from '../components/enroll-child-popup/enroll-child-popup.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule, EnrollChildPopupComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private authService = inject(AuthService);

  showEnrollPopup = false;

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  openEnrollPopup(): void {
    this.showEnrollPopup = true;
  }

  closeEnrollPopup(): void {
    this.showEnrollPopup = false;
  }

  onRecordSaved(): void {
    this.showEnrollPopup = false;
  }
}
