import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecordsService, ChildRecord } from '../services/records.service';

@Component({
  selector: 'app-records',
  imports: [FormsModule, CommonModule],
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss'
})
export class RecordsComponent implements OnInit {
  private readonly recordsService = inject(RecordsService);

  records: ChildRecord[] = [];
  showPopup = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  newRecord: Partial<ChildRecord> = {
    babyName: '',
    dob: '',
    gender: '',
    motherName: '',
    fatherName: '',
    contactNo: '',
    address: '',
    pin: '',
    email: ''
  };

  ngOnInit(): void {
    this.loadRecords();
  }

  private loadRecords(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.recordsService.getRecords().subscribe({
      next: (records) => {
        this.records = records;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading records:', error);
        this.errorMessage = error.message || 'Failed to load child records. Please check your internet connection and Firestore configuration.';
        this.isLoading = false;
      }
    });
  }

  retryLoading(): void {
    this.loadRecords();
  }

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.resetForm();
  }

  async onSubmit() {
    const record: Omit<ChildRecord, 'id' | 'createdAt'> = {
      babyName: this.newRecord.babyName!,
      dob: this.newRecord.dob!,
      gender: this.newRecord.gender!,
      motherName: this.newRecord.motherName!,
      fatherName: this.newRecord.fatherName!,
      contactNo: this.newRecord.contactNo!,
      address: this.newRecord.address!,
      pin: this.newRecord.pin!,
      email: this.newRecord.email
    };

    try {
      await this.recordsService.addRecord(record);
      this.showSuccessMessage('Child record added successfully!');
      this.closePopup();
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Failed to add record. Please try again.');
    }
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  resetForm(form?: NgForm) {
    this.newRecord = {
      babyName: '',
      dob: '',
      gender: '',
      motherName: '',
      fatherName: '',
      contactNo: '',
      address: '',
      pin: '',
      email: ''
    };

    if (form) {
      form.resetForm();
    }
  }

  async deleteRecord(id?: string) {
    if (!id) return;

    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await this.recordsService.deleteRecord(id);
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record. Please try again.');
      }
    }
  }

  getThisMonthCount(): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.records.filter(record => {
      const recordDate = new Date(record.dob);
      return recordDate.getMonth() === currentMonth &&
             recordDate.getFullYear() === currentYear;
    }).length;
  }

  getThisWeekCount(): number {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return this.records.filter(record => {
      const recordDate = new Date(record.dob);
      return recordDate >= weekAgo && recordDate <= now;
    }).length;
  }

  onFieldBlur(field: NgModel): void {
    field.control.markAsTouched();
  }
}
