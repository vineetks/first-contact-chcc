import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Auth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

  currentUser: User | null = null;
  errorMessage = '';
  successMessage = '';
  isUpdatingProfile = false;
  isUpdatingPassword = false;

  profileForm = {
    firstName: '',
    lastName: '',
    contact: '',
    email: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();
    if (this.currentUser) {
      this.profileForm = {
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        contact: this.currentUser.contact || '',
        email: this.currentUser.email
      };
    }
  }

  async onUpdateProfile(): Promise<void> {
    if (!this.currentUser) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isUpdatingProfile = true;

    try {
      const userRef = doc(this.firestore, 'users', this.currentUser.uid);
      await setDoc(userRef, {
        firstName: this.profileForm.firstName,
        lastName: this.profileForm.lastName,
        contact: this.profileForm.contact
      }, { merge: true });

      this.successMessage = 'Profile updated successfully!';

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to update profile';
    } finally {
      this.isUpdatingProfile = false;
    }
  }

  async onChangePassword(): Promise<void> {
    if (!this.currentUser || !this.auth.currentUser) return;

    this.errorMessage = '';
    this.successMessage = '';

    // Validate passwords
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage = 'New passwords do not match';
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isUpdatingPassword = true;

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        this.auth.currentUser.email!,
        this.passwordForm.currentPassword
      );
      await reauthenticateWithCredential(this.auth.currentUser, credential);

      // Update password
      await updatePassword(this.auth.currentUser, this.passwordForm.newPassword);

      this.successMessage = 'Password changed successfully!';

      // Reset form
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Current password is incorrect';
      } else {
        this.errorMessage = error.message || 'Failed to change password';
      }
    } finally {
      this.isUpdatingPassword = false;
    }
  }
}
