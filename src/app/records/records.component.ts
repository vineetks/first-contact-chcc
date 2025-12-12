import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecordsService, ChildRecord } from '../services/records.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-records',
  imports: [FormsModule, CommonModule],
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss'
})
export class RecordsComponent implements OnInit {
  private readonly recordsService = inject(RecordsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  records: ChildRecord[] = [];
  showPopup = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  expandedRecordId: string | null = null;
  currentTab: 'child' | 'parent' = 'child';
  isFirstTabSaved = false;
  isEditMode = false;
  editingRecordId: string | null = null;

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
    'Arunachal Pradesh': ['Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Itanagar Capital Region', 'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Lepa Rada', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri', 'Namsai', 'Pakke Kessang', 'Papum Pare', 'Shi Yomi', 'Siang', 'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'],
    'Assam': ['Bajali', 'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tamulpur', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'],
    'Bihar': ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'],
    'Chandigarh': ['Chandigarh'],
    'Chhattisgarh': ['Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dakshin Bastar Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Gaurela Pendra Marwahi', 'Janjgir Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Khairagarh Chhuikhadan Gandai', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Manendragarh Chirmiri Bharatpur', 'Mohla Manpur', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sakti', 'Sarangarh Bilaigarh', 'Sukma', 'Surajpur', 'Surguja'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Dadra and Nagar Haveli', 'Daman', 'Diu'],
    'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
    'Goa': ['North Goa', 'South Goa'],
    'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kachchh', 'Kheda', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
    'Haryana': ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
    'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'],
    'Jammu and Kashmir': ['Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'],
    'Jharkhand': ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj', 'Saraikela Kharsawan', 'Simdega', 'West Singhbhum'],
    'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Vijayanagara', 'Yadgir'],
    'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
    'Ladakh': ['Changthang', 'Drass', 'Kargil', 'Leh', 'Nubra', 'Sham', 'Zanskar'],
    'Lakshadweep': ['Lakshadweep'],
    'Madhya Pradesh': ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Maihar', 'Mandla', 'Mandsaur', 'Mauganj', 'Morena', 'Narsinghpur', 'Neemuch', 'Niwari', 'Pandhurna', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'],
    'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
    'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'],
    'Meghalaya': ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'Eastern West Khasi Hills', 'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'],
    'Mizoram': ['Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saitual', 'Serchhip', 'Siaha'],
    'Nagaland': ['Chümoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Meluri', 'Mokokchung', 'Mon', 'Niuland', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyü', 'Tuensang', 'Wokha', 'Zünheboto'],
    'Odisha': ['Angul', 'Balasore', 'Bargarh', 'Bhadrak', 'Bolangir', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Keonjhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'],
    'Puducherry': ['Karaikal', 'Mahe', 'Puducherry', 'Yanam'],
    'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Firozpur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Malerkotla', 'Mansa', 'Moga', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'SAS Nagar', 'Shaheed Bhagat Singh Nagar', 'Tarn Taran'],
    'Rajasthan': ['Ajmer', 'Alwar', 'Balotra', 'Banswara', 'Baran', 'Barmer', 'Beawar', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Deeg', 'Dholpur', 'Didwana Kuchaman', 'Dudu', 'Dungarpur', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Khairthal Tijara', 'Kota', 'Kotputli Behror', 'Nagaur', 'Pali', 'Phalodi', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
    'Sikkim': ['East Sikkim', 'North Sikkim', 'Pakyong', 'Soreng', 'South Sikkim', 'West Sikkim'],
    'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi', 'Thanjavur', 'Theni', 'The Nilgiris', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'],
    'Telangana': ['Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'],
    'Tripura': ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
    'Uttar Pradesh': ['Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'],
    'Uttarakhand': ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
    'West Bengal': ['Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur']
  };

  filteredDistricts: string[] = [];

  newRecord: Partial<ChildRecord> = {
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
    this.loadRecords();

    // Check if navigated from home with openPopup state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['openPopup']) {
      this.openPopup();
    }
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
    this.currentTab = 'child';
    this.isFirstTabSaved = false;
    this.isEditMode = false;
    this.editingRecordId = null;
    // Auto-set isVerified based on whether user is logged in
    this.newRecord.isVerified = !!this.authService.currentUser();
  }

  openEditPopup(record: ChildRecord) {
    this.isEditMode = true;
    this.editingRecordId = record.id || null;
    this.showPopup = true;
    this.currentTab = 'child';
    this.isFirstTabSaved = true; // Allow editing both tabs

    // Populate form with existing record data
    this.newRecord = {
      babyName: record.babyName,
      dob: record.dob,
      gender: record.gender,
      motherName: record.motherName,
      fatherName: record.fatherName,
      contactNo: record.contactNo,
      address: record.address,
      district: record.district,
      state: record.state,
      pin: record.pin,
      email: record.email,
      isVerified: record.isVerified
    };

    // Populate districts if state is selected
    if (record.state) {
      this.filteredDistricts = this.districtsByState[record.state] || [];
    }
  }

  closePopup() {
    this.showPopup = false;
    this.currentTab = 'child';
    this.isFirstTabSaved = false;
    this.isEditMode = false;
    this.editingRecordId = null;
    this.filteredDistricts = [];
    this.resetForm();
  }

  async saveFirstTab() {
    // Validate required fields for first tab
    if (!this.newRecord.babyName || !this.newRecord.gender || !this.newRecord.motherName ||
        !this.newRecord.fatherName || !this.newRecord.dob || !this.newRecord.contactNo) {
      alert('Please fill in all required fields in the Basic Information tab');
      return;
    }

    try {
      // Set isVerified based on logged-in user
      this.newRecord.isVerified = !!this.authService.currentUser();

      if (this.isEditMode && this.editingRecordId) {
        // Update existing record
        await this.recordsService.updateRecord(this.editingRecordId, this.newRecord);
        this.showSuccessMessage('Basic information updated!');
      } else {
        // Create new record
        await this.recordsService.addRecord(this.newRecord as Omit<ChildRecord, 'id' | 'createdAt'>);
        this.showSuccessMessage('Basic information saved! You can now add address details.');
      }

      this.isFirstTabSaved = true;

      // Auto-switch to second tab
      this.currentTab = 'parent';

      // Clear the success message after 2 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 2000);
    } catch (error) {
      console.error('Error saving first tab:', error);
      alert('Failed to save record. Please try again.');
    }
  }

  async saveSecondTab() {
    try {
      this.newRecord.isVerified = !!this.authService.currentUser();

      if (this.isEditMode && this.editingRecordId) {
        // Update existing record
        await this.recordsService.updateRecord(this.editingRecordId, this.newRecord);
        this.showSuccessMessage('Record updated successfully!');
        this.closePopup();
      } else {
        // Create new record
        await this.recordsService.addRecord(this.newRecord as Omit<ChildRecord, 'id' | 'createdAt'>);
        this.showSuccessMessage('Address details saved successfully!');
      }

      setTimeout(() => {
        this.successMessage = '';
      }, 2000);
    } catch (error) {
      console.error('Error saving second tab:', error);
      alert('Failed to save record. Please try again.');
    }
  }

  onStateChange(state: string) {
    this.newRecord.state = state;
    this.filteredDistricts = this.districtsByState[state] || [];
    this.newRecord.district = ''; // Reset district when state changes
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
      district: this.newRecord.district,
      state: this.newRecord.state,
      pin: this.newRecord.pin!,
      email: this.newRecord.email,
      isVerified: this.newRecord.isVerified || false
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
    const isVerified = !!this.authService.currentUser();
    this.newRecord = {
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
      isVerified: isVerified
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

  toggleRecord(recordId: string | undefined): void {
    if (!recordId) return;
    this.expandedRecordId = this.expandedRecordId === recordId ? null : recordId;
  }

  isExpanded(recordId: string | undefined): boolean {
    return this.expandedRecordId === recordId;
  }

  getCurrentUserName(): string {
    const currentUser = this.authService.currentUser();
    return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Doctor';
  }
}
