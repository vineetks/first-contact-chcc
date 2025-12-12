import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UsersService } from '../services/users.service';
import { AuthService, User, UserType } from '../services/auth.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);

  users$!: Observable<User[]>;
  errorMessage = '';
  successMessage = '';
  isCreating = false;
  isUpdating = false;
  showCreateModal = false;
  showUpdateModal = false;

  newUser = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userType: '' as UserType | ''
  };

  editingUser: User | null = null;
  updatedUser = {
    uid: '',
    firstName: '',
    lastName: '',
    email: '',
    userType: '' as UserType
  };

  get currentUserId(): string | undefined {
    return this.authService.currentUser()?.uid;
  }

  ngOnInit(): void {
    this.users$ = this.usersService.getUsers();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      userType: ''
    };
    this.errorMessage = '';
  }

  openUpdateModal(user: User): void {
    this.editingUser = user;
    this.updatedUser = {
      uid: user.uid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType
    };
    this.showUpdateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.editingUser = null;
    this.errorMessage = '';
  }

  async onCreateUser(): Promise<void> {
    if (!this.newUser.userType) {
      this.errorMessage = 'Please select a user type';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isCreating = true;

    try {
      await this.usersService.createUser(
        this.newUser.email,
        this.newUser.password,
        this.newUser.firstName,
        this.newUser.lastName,
        this.newUser.userType as UserType
      );

      this.successMessage = 'User created successfully!';
      this.closeCreateModal();

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to create user';
    } finally {
      this.isCreating = false;
    }
  }

  async onUpdateUser(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    this.isUpdating = true;

    try {
      await this.usersService.updateUser(
        this.updatedUser.uid,
        this.updatedUser.firstName,
        this.updatedUser.lastName,
        this.updatedUser.email,
        this.updatedUser.userType
      );

      this.successMessage = 'User updated successfully!';
      this.closeUpdateModal();

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to update user';
    } finally {
      this.isUpdating = false;
    }
  }

  async onUpdateUserRole(uid: string, userType: UserType): Promise<void> {
    try {
      await this.usersService.updateUserRole(uid, userType);
      this.successMessage = 'User role updated successfully!';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to update user role';
    }
  }

  async onDeleteUser(uid: string, email: string): Promise<void> {
    if (uid === this.currentUserId) {
      this.errorMessage = 'You cannot delete your own account';
      return;
    }

    if (!confirm(`Are you sure you want to delete user ${email}?`)) {
      return;
    }

    try {
      await this.usersService.deleteUser(uid);
      this.successMessage = 'User deleted successfully!';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to delete user';
    }
  }

  formatDate(date: Timestamp | Date | undefined): string {
    if (!date) return 'N/A';

    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    return jsDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
