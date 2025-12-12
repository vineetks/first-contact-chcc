import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, catchError, throwError } from 'rxjs';

export interface ChildRecord {
  id?: string;
  babyName: string;
  dob: string;
  gender: string;
  motherName: string;
  fatherName: string;
  contactNo: string;
  address: string;
  pin: string;
  email?: string;
  createdAt?: Timestamp | Date;
}

@Injectable({
  providedIn: 'root'
})
export class RecordsService {
  private readonly firestore = inject(Firestore);
  private readonly recordsCollection = collection(this.firestore, 'child');

  getRecords(): Observable<ChildRecord[]> {
    try {
      const q = query(this.recordsCollection, orderBy('createdAt', 'desc'));
      return (collectionData(q, { idField: 'id' }) as Observable<ChildRecord[]>).pipe(
        catchError(error => {
          console.error('Error fetching child records:', error);
          return throwError(() => new Error('Failed to fetch child records. Please check your Firestore configuration.'));
        })
      );
    } catch (error) {
      console.error('Error creating query:', error);
      return throwError(() => new Error('Failed to create query for child records.'));
    }
  }

  async addRecord(record: Omit<ChildRecord, 'id' | 'createdAt'>): Promise<void> {
    try {
      const recordWithTimestamp = {
        ...record,
        createdAt: Timestamp.now()
      };
      await addDoc(this.recordsCollection, recordWithTimestamp);
    } catch (error) {
      console.error('Error adding child record:', error);
      throw new Error('Failed to add child record. Please try again.');
    }
  }

  async deleteRecord(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'child', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting child record:', error);
      throw new Error('Failed to delete child record. Please try again.');
    }
  }
}
