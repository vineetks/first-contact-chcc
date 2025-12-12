import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy
} from '@angular/fire/firestore';
import {
  Auth,
  createUserWithEmailAndPassword,
  deleteUser,
  User as FirebaseUser
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { User, UserType } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly usersCollection = collection(this.firestore, 'users');

  getUsers(): Observable<User[]> {
    const q = query(this.usersCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'uid' }) as Observable<User[]>;
  }

  async createUser(email: string, password: string, firstName: string, lastName: string, contact: string, userType: UserType): Promise<void> {
    try {
      // Create user in Firebase Auth
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);

      // Create user document in Firestore
      const userRef = doc(this.firestore, 'users', credential.user.uid);
      const userData: User = {
        uid: credential.user.uid,
        email,
        firstName,
        lastName,
        contact,
        userType,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };

      await setDoc(userRef, userData);
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      // Delete user document from Firestore
      const userRef = doc(this.firestore, 'users', uid);
      await deleteDoc(userRef);

      // Note: Deleting from Firebase Auth requires admin SDK or the user to be currently signed in
      // For production, you'd use Cloud Functions with Admin SDK
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  async updateUser(uid: string, firstName: string, lastName: string, contact: string, email: string, userType: UserType): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await setDoc(userRef, {
        firstName,
        lastName,
        contact,
        email,
        userType
      }, { merge: true });
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  }

  async updateUserRole(uid: string, userType: UserType): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await setDoc(userRef, { userType }, { merge: true });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      throw new Error(error.message || 'Failed to update user role');
    }
  }
}
