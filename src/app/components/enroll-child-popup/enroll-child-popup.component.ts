import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { RecordsService, ChildRecord } from '../../services/records.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-enroll-child-popup',
  imports: [CommonModule, FormsModule],
  templateUrl: './enroll-child-popup.component.html',
  styleUrl: './enroll-child-popup.component.scss'
})
export class EnrollChildPopupComponent {
  private readonly recordsService = inject(RecordsService);
  private readonly authService = inject(AuthService);

  @Input() isOpen = false;
  @Input() isEditMode = false;
  @Input() editingRecordId: string | null = null;
  @Input() existingRecord: Partial<ChildRecord> | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  currentTab: 'child' | 'parent' = 'child';
  isFirstTabSaved = false;
  successMessage = '';
  showFirstTabErrors = false;

  states: string[] = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
    'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  districtsByState: { [key: string]: string[] } = {
    'Andaman and Nicobar Islands': ['Nicobar', 'North and Middle Andaman', 'South Andaman'],
    'Andhra Pradesh': ['Alluri Sitharama Raju', 'Anakapalli', 'Anantapur', 'Annamayya', 'Bapatla', 'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Krishna', 'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'],
    'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
    'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal']
    // Add more states as needed
  };

  filteredDistricts: string[] = [];

  record: Partial<ChildRecord> = {
    babyName: '',
    dob: '',
    gender: '',
    motherName: '',
    fatherName: '',
    contactNo: '',
    address: '',
    district: '',
    state: '',
    pin: '',
    email: '',
    isVerified: false
  };

  ngOnInit(): void {
    if (this.existingRecord) {
      this.record = { ...this.existingRecord };
      this.isFirstTabSaved = true;
      if (this.record.state) {
        this.filteredDistricts = this.districtsByState[this.record.state] ?? [];
      }
    }
  }

  close(): void {
    this.resetForm();
    this.closed.emit();
  }

  resetForm(): void {
    this.record = {
      babyName: '',
      dob: '',
      gender: '',
      motherName: '',
      fatherName: '',
      contactNo: '',
      address: '',
      district: '',
      state: '',
      pin: '',
      email: '',
      isVerified: false
    };
    this.currentTab = 'child';
    this.isFirstTabSaved = false;
    this.filteredDistricts = [];
    this.showFirstTabErrors = false;
  }

  async saveFirstTab(): Promise<void> {
    // Validate required fields for first tab
    if (!this.record.babyName || !this.record.gender || !this.record.motherName ||
        !this.record.fatherName || !this.record.dob || !this.record.contactNo) {
      this.showFirstTabErrors = true;
      return;
    }

    this.showFirstTabErrors = false;

    try {
      // Set isVerified based on logged-in user
      this.record.isVerified = !!this.authService.currentUser();

      if (this.isEditMode && this.editingRecordId) {
        // Update existing record
        await this.recordsService.updateRecord(this.editingRecordId, this.record);
        this.showSuccessMessage('Basic information updated!');
      } else {
        // Create new record
        await this.recordsService.addRecord(this.record as Omit<ChildRecord, 'id' | 'createdAt'>);
        this.showSuccessMessage('Basic information saved! You can now add address details.');
      }

      this.isFirstTabSaved = true;
      this.currentTab = 'parent';

      setTimeout(() => {
        this.successMessage = '';
      }, 2000);
    } catch (error) {
      console.error('Error saving first tab:', error);
      alert('Failed to save record. Please try again.');
    }
  }

  async saveSecondTab(): Promise<void> {
    try {
      this.record.isVerified = !!this.authService.currentUser();

      if (this.isEditMode && this.editingRecordId) {
        await this.recordsService.updateRecord(this.editingRecordId, this.record);
        this.showSuccessMessage('Record updated successfully!');
      } else {
        await this.recordsService.addRecord(this.record as Omit<ChildRecord, 'id' | 'createdAt'>);
        this.showSuccessMessage('Address details saved successfully!');
      }

      this.saved.emit();
      setTimeout(() => {
        this.close();
      }, 1000);
    } catch (error) {
      console.error('Error saving second tab:', error);
      alert('Failed to save record. Please try again.');
    }
  }

  onStateChange(state: string): void {
    this.record.state = state;
    this.filteredDistricts = this.districtsByState[state] ?? [];
    this.record.district = '';
  }

  onFieldBlur(field: NgModel): void {
    field.control.markAsTouched();
  }

  onSubmit(): void {
    // Not used, buttons call saveFirstTab or saveSecondTab directly
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
  }
}
