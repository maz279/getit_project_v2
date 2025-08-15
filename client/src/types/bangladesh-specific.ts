// Bangladesh-specific type definitions for GetIt Platform
// Supports Amazon/Shopee-level enterprise features

export interface BangladeshAddress {
  division: string;
  district: string;
  upazila: string;
  ward?: string;
  area: string;
  postalCode: string;
  fullAddress: string;
}

export interface NationalID {
  nidNumber: string;
  name: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  address: BangladeshAddress;
  photo?: string;
  verified: boolean;
  verificationDate?: Date;
}

export interface TradeLicense {
  licenseNumber: string;
  businessName: string;
  businessType: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
  businessAddress: BangladeshAddress;
  ownerName: string;
  verified: boolean;
  verificationDate?: Date;
  document?: string;
}

export interface TaxIdentificationNumber {
  tinNumber: string;
  taxpayerName: string;
  businessName?: string;
  registrationDate: Date;
  taxCircle: string;
  verified: boolean;
  verificationDate?: Date;
  document?: string;
}

export interface BankAccountInfo {
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  branchName: string;
  routingNumber: string;
  accountType: 'savings' | 'current' | 'business';
  verified: boolean;
  verificationDate?: Date;
  document?: string;
}

export interface KYCVerification {
  id: string;
  vendorId: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'incomplete';
  
  // Identity Verification
  nationalId?: NationalID;
  
  // Business Verification
  tradeLicense?: TradeLicense;
  tin?: TaxIdentificationNumber;
  
  // Financial Verification
  bankAccount?: BankAccountInfo;
  
  // Business Address Verification
  businessAddress: BangladeshAddress;
  businessAddressVerified: boolean;
  
  // Additional Information
  contactNumber: string;
  alternateNumber?: string;
  email: string;
  website?: string;
  
  // Verification Process
  submissionDate: Date;
  reviewDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  verificationNotes?: string;
  
  // Documents
  documents: {
    nidCopy?: string;
    tradeLicenseCopy?: string;
    tinCertificate?: string;
    bankStatement?: string;
    businessPhotos?: string[];
    ownerPhoto?: string;
  };
  
  // Verification Score
  verificationScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  
  // Compliance
  complianceStatus: {
    bangladeshBankCompliant: boolean;
    ecommerceRegulationCompliant: boolean;
    taxCompliant: boolean;
    dataProtectionCompliant: boolean;
  };
}

// Bangladesh Divisions and Districts
export const BANGLADESH_DIVISIONS = {
  dhaka: {
    name: 'Dhaka',
    nameBn: 'ঢাকা',
    districts: [
      'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj',
      'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi',
      'Rajbari', 'Shariatpur', 'Tangail'
    ]
  },
  chattogram: {
    name: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    districts: [
      'Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla',
      'Cox\'s Bazar', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali',
      'Rangamati'
    ]
  },
  rajshahi: {
    name: 'Rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      'Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Chapainawabganj',
      'Pabna', 'Rajshahi', 'Sirajganj'
    ]
  },
  rangpur: {
    name: 'Rangpur',
    nameBn: 'রংপুর',
    districts: [
      'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari',
      'Panchagarh', 'Rangpur', 'Thakurgaon'
    ]
  },
  khulna: {
    name: 'Khulna',
    nameBn: 'খুলনা',
    districts: [
      'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna',
      'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'
    ]
  },
  barishal: {
    name: 'Barishal',
    nameBn: 'বরিশাল',
    districts: [
      'Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'
    ]
  },
  sylhet: {
    name: 'Sylhet',
    nameBn: 'সিলেট',
    districts: [
      'Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'
    ]
  },
  mymensingh: {
    name: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      'Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'
    ]
  }
} as const;

// Mobile number format validation
export interface MobileNumber {
  countryCode: '+880';
  operator: 'grameenphone' | 'robi' | 'banglalink' | 'teletalk' | 'airtel';
  number: string; // 11 digits starting with operator prefix
  formatted: string; // +880XXXXXXXXXX
  verified: boolean;
}

// Festival and Cultural Events
export const BANGLADESH_FESTIVALS = {
  eid_ul_fitr: { name: 'Eid ul-Fitr', nameBn: 'ঈদুল ফিতর' },
  eid_ul_adha: { name: 'Eid ul-Adha', nameBn: 'ঈদুল আযহা' },
  durga_puja: { name: 'Durga Puja', nameBn: 'দুর্গা পূজা' },
  kali_puja: { name: 'Kali Puja', nameBn: 'কালী পূজা' },
  pohela_boishakh: { name: 'Pohela Boishakh', nameBn: 'পহেলা বৈশাখ' },
  independence_day: { name: 'Independence Day', nameBn: 'স্বাধীনতা দিবস' },
  victory_day: { name: 'Victory Day', nameBn: 'বিজয় দিবস' },
  language_day: { name: 'International Mother Language Day', nameBn: 'আন্তর্জাতিক মাতৃভাষা দিবস' }
} as const;

// Payment Methods specific to Bangladesh
export interface BDPaymentMethod {
  id: string;
  name: string;
  nameBn: string;
  type: 'mobile_banking' | 'internet_banking' | 'card' | 'cash';
  provider: string;
  logo: string;
  enabled: boolean;
  processingFee: number;
  minimumAmount: number;
  maximumAmount: number;
  currencies: string[];
}

// Courier Services in Bangladesh
export interface BDCourierService {
  id: string;
  name: string;
  nameBn: string;
  coverage: string[]; // Districts covered
  serviceTypes: ('standard' | 'express' | 'same_day' | 'pickup_point')[];
  baseRate: number;
  weightRates: { maxWeight: number; rate: number }[];
  estimatedDelivery: string;
  trackingEnabled: boolean;
  cashOnDeliverySupported: boolean;
  logo: string;
  apiEndpoint?: string;
  isActive: boolean;
}

// Regulatory Compliance
export interface ComplianceRequirement {
  id: string;
  category: 'bangladesh_bank' | 'ecommerce_regulation' | 'tax_law' | 'data_protection';
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  mandatory: boolean;
  deadline?: Date;
  documentRequired: string[];
  verificationMethod: string;
  penaltyForNonCompliance?: string;
}