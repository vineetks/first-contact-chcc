import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  user,
  User as FirebaseUser
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  Timestamp
} from '@angular/fire/firestore';

export type UserType = 'ADMIN' | 'DOCTOR' | 'STAFF' | 'ANONYMOUS';

export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  contact?: string;
  userType: UserType;
  createdAt?: Timestamp | Date;
  lastLogin?: Timestamp | Date;
  disabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    // Subscribe to Firebase Auth state changes
    user(this.auth).subscribe(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Load user data from Firestore
        const userDoc = await this.getUserFromFirestore(firebaseUser.uid);
        this.currentUserSignal.set(userDoc);
      } else {
        this.currentUserSignal.set(null);
      }
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);

      // Get or create user document from Firestore
      let userDoc = await this.getUserFromFirestore(credential.user.uid);

      if (!userDoc) {
        // Create user document if it doesn't exist
        const emailUsername = email.split('@')[0];
        userDoc = await this.createUserDocument(
          credential.user.uid,
          credential.user.email || email,
          emailUsername, // firstName
          '' // lastName (empty for auto-created accounts)
        );
      } else {
        // Update last login timestamp
        await this.updateLastLogin(credential.user.uid);
      }

      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSignal.set(null);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: UserType): boolean {
    const user = this.currentUser();
    return user !== null && user.userType === role;
  }

  hasAnyRole(roles: UserType[]): boolean {
    const user = this.currentUser();
    return user !== null && roles.includes(user.userType);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  private async getUserFromFirestore(uid: string): Promise<User | null> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user from Firestore:', error);
      return null;
    }
  }

  private async createUserDocument(uid: string, email: string, firstName: string, lastName: string, contact?: string): Promise<User> {
    const userRef = doc(this.firestore, 'users', uid);
    const userData: User = {
      uid,
      email,
      firstName,
      lastName,
      contact: contact || '',
      userType: 'ANONYMOUS', // Default role
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now()
    };
    await setDoc(userRef, userData);
    this.currentUserSignal.set(userData);
    return userData;
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await setDoc(userRef, { lastLogin: Timestamp.now() }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }
}
