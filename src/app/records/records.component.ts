import { Component } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface NewbornRecord {
  id: string;
  babyName: string;
  dob: string;
  gender: string;
  motherName: string;
  fatherName: string;
  contactNo: string;
  address: string;
  pin: string;
  email?: string;
}

@Component({
  selector: 'app-records',
  imports: [FormsModule, CommonModule],
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss'
})
export class RecordsComponent {
  records: NewbornRecord[] = [];
  showPopup = false;

  newRecord: Partial<NewbornRecord> = {
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

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.resetForm();
  }

  onSubmit() {
    const record: NewbornRecord = {
      id: Date.now().toString(),
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

    this.records.unshift(record);
    this.closePopup();
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

  deleteRecord(id: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.records = this.records.filter(r => r.id !== id);
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
