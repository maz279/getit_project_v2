/**
 * Bangladesh Document Validator - Amazon.com/Shopee.sg-Level Document Validation
 * 
 * Complete validation for Bangladesh-specific documents:
 * - National ID (NID) validation
 * - Trade License validation
 * - TIN Certificate validation
 * - Bank Account validation
 * - Address validation with Bangladesh location hierarchy
 * - Cross-validation with OCR data
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface BangladeshLocation {
  divisions: string[];
  districts: Record<string, string[]>;
  upazilas: Record<string, string[]>;
}

export class BangladeshDocumentValidator {

  private bangladeshLocations: BangladeshLocation;

  constructor() {
    this.bangladeshLocations = this.initializeBangladeshLocations();
  }

  /**
   * Validate National ID (NID) data
   */
  async validateNID(nidData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // NID number validation
    if (!nidData.nidNumber) {
      errors.push('NID number is required');
    } else if (!this.isValidNIDNumber(nidData.nidNumber)) {
      errors.push('Invalid NID number format');
    }

    // Date of birth validation
    if (!nidData.dateOfBirth) {
      errors.push('Date of birth is required');
    } else if (!this.isValidDateOfBirth(nidData.dateOfBirth)) {
      errors.push('Invalid date of birth');
    }

    // Full name validation
    if (!nidData.fullName || nidData.fullName.trim().length === 0) {
      errors.push('Full name is required');
    } else if (!this.isValidBangladeshName(nidData.fullName)) {
      errors.push('Invalid name format');
    }

    // Father's name validation (optional but common in Bangladesh)
    if (nidData.fatherName && !this.isValidBangladeshName(nidData.fatherName)) {
      errors.push('Invalid father\'s name format');
    }

    // Mother's name validation (optional but common in Bangladesh)
    if (nidData.motherName && !this.isValidBangladeshName(nidData.motherName)) {
      errors.push('Invalid mother\'s name format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Trade License data
   */
  async validateTradeLicense(licenseData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // License number validation
    if (!licenseData.licenseNumber) {
      errors.push('Trade license number is required');
    } else if (!this.isValidTradeLicenseNumber(licenseData.licenseNumber)) {
      errors.push('Invalid trade license number format');
    }

    // Business name validation
    if (!licenseData.businessName || licenseData.businessName.trim().length === 0) {
      errors.push('Business name is required');
    } else if (licenseData.businessName.length < 2 || licenseData.businessName.length > 200) {
      errors.push('Business name must be between 2 and 200 characters');
    }

    // Business type validation
    if (!licenseData.businessType) {
      errors.push('Business type is required');
    } else if (!this.isValidBusinessType(licenseData.businessType)) {
      errors.push('Invalid business type');
    }

    // Issue date validation
    if (!licenseData.issueDate) {
      errors.push('Issue date is required');
    } else if (!this.isValidDate(licenseData.issueDate)) {
      errors.push('Invalid issue date format');
    }

    // Expiry date validation
    if (!licenseData.expiryDate) {
      errors.push('Expiry date is required');
    } else if (!this.isValidDate(licenseData.expiryDate)) {
      errors.push('Invalid expiry date format');
    } else if (new Date(licenseData.expiryDate) <= new Date()) {
      errors.push('Trade license has expired');
    }

    // Issuing authority validation
    if (!licenseData.issuingAuthority) {
      errors.push('Issuing authority is required');
    } else if (!this.isValidIssuingAuthority(licenseData.issuingAuthority)) {
      errors.push('Invalid issuing authority');
    }

    // Cross-validate issue and expiry dates
    if (licenseData.issueDate && licenseData.expiryDate) {
      if (new Date(licenseData.issueDate) >= new Date(licenseData.expiryDate)) {
        errors.push('Issue date must be before expiry date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate TIN Certificate data
   */
  async validateTIN(tinData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // TIN number validation
    if (!tinData.tinNumber) {
      errors.push('TIN number is required');
    } else if (!this.isValidTINNumber(tinData.tinNumber)) {
      errors.push('Invalid TIN number format');
    }

    // Business name validation
    if (!tinData.businessName || tinData.businessName.trim().length === 0) {
      errors.push('Business name is required');
    }

    // Registration date validation
    if (!tinData.registrationDate) {
      errors.push('Registration date is required');
    } else if (!this.isValidDate(tinData.registrationDate)) {
      errors.push('Invalid registration date format');
    }

    // Tax circle validation
    if (!tinData.taxCircle) {
      errors.push('Tax circle is required');
    } else if (!this.isValidTaxCircle(tinData.taxCircle)) {
      errors.push('Invalid tax circle');
    }

    // Zone validation
    if (!tinData.zone) {
      errors.push('Zone is required');
    } else if (!this.isValidTaxZone(tinData.zone)) {
      errors.push('Invalid tax zone');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Bank Account data
   */
  async validateBankAccount(bankData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Bank name validation
    if (!bankData.bankName) {
      errors.push('Bank name is required');
    } else if (!this.isValidBangladeshBank(bankData.bankName)) {
      errors.push('Invalid or unsupported bank');
    }

    // Branch name validation
    if (!bankData.branchName || bankData.branchName.trim().length === 0) {
      errors.push('Branch name is required');
    }

    // Account number validation
    if (!bankData.accountNumber) {
      errors.push('Account number is required');
    } else if (!this.isValidBankAccountNumber(bankData.accountNumber)) {
      errors.push('Invalid account number format');
    }

    // Account holder name validation
    if (!bankData.accountHolderName || bankData.accountHolderName.trim().length === 0) {
      errors.push('Account holder name is required');
    }

    // Account type validation
    if (!bankData.accountType) {
      errors.push('Account type is required');
    } else if (!['savings', 'current', 'business', 'fixed_deposit'].includes(bankData.accountType)) {
      errors.push('Invalid account type');
    }

    // Routing number validation (if provided)
    if (bankData.routingNumber && !this.isValidRoutingNumber(bankData.routingNumber)) {
      errors.push('Invalid routing number format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Bangladesh address
   */
  async validateBangladeshAddress(addressData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Division validation
    if (!addressData.division) {
      errors.push('Division is required');
    } else if (!this.bangladeshLocations.divisions.includes(addressData.division)) {
      errors.push('Invalid division');
    }

    // District validation
    if (!addressData.district) {
      errors.push('District is required');
    } else if (addressData.division) {
      const validDistricts = this.bangladeshLocations.districts[addressData.division] || [];
      if (!validDistricts.includes(addressData.district)) {
        errors.push('Invalid district for the selected division');
      }
    }

    // Upazila validation
    if (!addressData.upazila) {
      errors.push('Upazila is required');
    } else if (addressData.district) {
      const validUpazilas = this.bangladeshLocations.upazilas[addressData.district] || [];
      if (!validUpazilas.includes(addressData.upazila)) {
        errors.push('Invalid upazila for the selected district');
      }
    }

    // Address validation
    if (!addressData.address || addressData.address.trim().length === 0) {
      errors.push('Address is required');
    } else if (addressData.address.length < 10 || addressData.address.length > 500) {
      errors.push('Address must be between 10 and 500 characters');
    }

    // Postal code validation
    if (!addressData.postalCode) {
      errors.push('Postal code is required');
    } else if (!this.isValidBangladeshPostalCode(addressData.postalCode)) {
      errors.push('Invalid postal code format');
    }

    // Coordinates validation (optional)
    if (addressData.coordinates) {
      if (!this.isValidCoordinates(addressData.coordinates)) {
        errors.push('Invalid coordinates format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Cross-validate OCR data with provided data
   */
  async crossValidateNIDData(providedData: any, ocrData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Compare NID numbers
    if (ocrData.nidNumber && providedData.nidNumber) {
      if (this.normalizeText(ocrData.nidNumber) !== this.normalizeText(providedData.nidNumber)) {
        errors.push('NID number in document does not match provided information');
      }
    }

    // Compare names with fuzzy matching
    if (ocrData.fullName && providedData.fullName) {
      const similarity = this.calculateTextSimilarity(
        this.normalizeText(ocrData.fullName),
        this.normalizeText(providedData.fullName)
      );
      if (similarity < 0.8) { // 80% similarity threshold
        errors.push('Name in document does not closely match provided information');
      }
    }

    // Compare dates of birth
    if (ocrData.dateOfBirth && providedData.dateOfBirth) {
      const ocrDate = this.normalizeDate(ocrData.dateOfBirth);
      const providedDate = this.normalizeDate(providedData.dateOfBirth);
      if (ocrDate !== providedDate) {
        errors.push('Date of birth in document does not match provided information');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get Bangladesh location hierarchy
   */
  async getBangladeshLocationHierarchy(): Promise<BangladeshLocation> {
    return this.bangladeshLocations;
  }

  // Helper validation methods

  /**
   * Check if NID number is valid
   */
  private isValidNIDNumber(nid: string): boolean {
    // Clean NID number
    const cleanNID = nid.replace(/\D/g, '');
    
    // Bangladesh NID patterns:
    // - Old format: 13 digits
    // - New format: 10 or 17 digits
    return /^(\d{10}|\d{13}|\d{17})$/.test(cleanNID);
  }

  /**
   * Check if date of birth is valid
   */
  private isValidDateOfBirth(dob: string): boolean {
    const date = new Date(dob);
    const now = new Date();
    const hundredYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
    
    return date instanceof Date && 
           !isNaN(date.getTime()) && 
           date <= now && 
           date >= hundredYearsAgo;
  }

  /**
   * Check if Bangladesh name is valid
   */
  private isValidBangladeshName(name: string): boolean {
    // Allow Bengali, English letters, spaces, dots, and common punctuation
    const namePattern = /^[\u0980-\u09FFa-zA-Z\s\.\-']+$/;
    return namePattern.test(name) && name.trim().length >= 2 && name.trim().length <= 100;
  }

  /**
   * Check if trade license number is valid
   */
  private isValidTradeLicenseNumber(licenseNumber: string): boolean {
    // Trade license numbers vary by issuing authority
    // Generally alphanumeric, 8-20 characters
    const pattern = /^[A-Z0-9\-\/]{8,20}$/i;
    return pattern.test(licenseNumber);
  }

  /**
   * Check if business type is valid
   */
  private isValidBusinessType(businessType: string): boolean {
    const validTypes = [
      'sole_proprietorship', 'partnership', 'private_limited', 'public_limited',
      'cooperative', 'ngo', 'trust', 'association', 'others'
    ];
    return validTypes.includes(businessType);
  }

  /**
   * Check if issuing authority is valid
   */
  private isValidIssuingAuthority(authority: string): boolean {
    const validAuthorities = [
      'city_corporation', 'municipality', 'upazila_parishad', 'union_parishad',
      'district_commissioner', 'divisional_commissioner'
    ];
    return validAuthorities.includes(authority);
  }

  /**
   * Check if TIN number is valid
   */
  private isValidTINNumber(tin: string): boolean {
    // Bangladesh TIN: 12 digits
    const cleanTIN = tin.replace(/\D/g, '');
    return /^[0-9]{12}$/.test(cleanTIN);
  }

  /**
   * Check if tax circle is valid
   */
  private isValidTaxCircle(taxCircle: string): boolean {
    // Tax circles are numbered (e.g., "Circle-1", "Circle-15")
    const pattern = /^Circle-\d{1,2}$/i;
    return pattern.test(taxCircle);
  }

  /**
   * Check if tax zone is valid
   */
  private isValidTaxZone(zone: string): boolean {
    const validZones = [
      'dhaka_north', 'dhaka_south', 'chittagong', 'sylhet', 'barisal',
      'khulna', 'rajshahi', 'rangpur', 'mymensingh', 'customs_dhaka',
      'customs_chittagong', 'large_taxpayer_unit'
    ];
    return validZones.includes(zone);
  }

  /**
   * Check if Bangladesh bank is valid
   */
  private isValidBangladeshBank(bankName: string): boolean {
    const validBanks = [
      'sonali_bank', 'janata_bank', 'agrani_bank', 'rupali_bank',
      'bangladesh_krishi_bank', 'rajshahi_krishi_unnayan_bank',
      'bangladesh_development_bank', 'bangladesh_house_building_finance_corporation',
      'dutch_bangla_bank', 'brac_bank', 'eastern_bank', 'city_bank',
      'standard_chartered', 'hsbc', 'islami_bank', 'social_islami_bank',
      'ab_bank', 'bank_asia', 'southeast_bank', 'mutual_trust_bank',
      'premier_bank', 'jamuna_bank', 'one_bank', 'trust_bank',
      'ncc_bank', 'united_commercial_bank', 'pubali_bank', 'uttara_bank'
    ];
    return validBanks.includes(bankName.toLowerCase().replace(/ /g, '_'));
  }

  /**
   * Check if bank account number is valid
   */
  private isValidBankAccountNumber(accountNumber: string): boolean {
    const cleanAccount = accountNumber.replace(/[^a-zA-Z0-9]/g, '');
    return /^[0-9A-Z]{8,25}$/i.test(cleanAccount);
  }

  /**
   * Check if routing number is valid
   */
  private isValidRoutingNumber(routingNumber: string): boolean {
    const cleanRouting = routingNumber.replace(/\D/g, '');
    return /^[0-9]{9}$/.test(cleanRouting);
  }

  /**
   * Check if postal code is valid
   */
  private isValidBangladeshPostalCode(postalCode: string): boolean {
    // Bangladesh postal codes are 4 digits
    const cleanCode = postalCode.replace(/\D/g, '');
    return /^[0-9]{4}$/.test(cleanCode);
  }

  /**
   * Check if coordinates are valid
   */
  private isValidCoordinates(coordinates: any): boolean {
    if (!coordinates || typeof coordinates !== 'object') return false;
    
    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);
    
    // Bangladesh approximate bounds
    return lat >= 20.5 && lat <= 26.5 && lng >= 88.0 && lng <= 93.0;
  }

  /**
   * Check if date is valid
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Normalize text for comparison
   */
  private normalizeText(text: string): string {
    return text.toLowerCase()
               .replace(/[^\w\s]/g, '')
               .replace(/\s+/g, ' ')
               .trim();
  }

  /**
   * Normalize date for comparison
   */
  private normalizeDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  /**
   * Calculate text similarity using Levenshtein distance
   */
  private calculateTextSimilarity(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }

  /**
   * Initialize Bangladesh location hierarchy
   */
  private initializeBangladeshLocations(): BangladeshLocation {
    return {
      divisions: [
        'dhaka', 'chittagong', 'sylhet', 'barisal', 'khulna', 'rajshahi', 'rangpur', 'mymensingh'
      ],
      districts: {
        dhaka: ['dhaka', 'faridpur', 'gazipur', 'gopalganj', 'kishoreganj', 'madaripur', 'manikganj', 'munshiganj', 'narayanganj', 'narsingdi', 'rajbari', 'shariatpur', 'tangail'],
        chittagong: ['bandarban', 'brahmanbaria', 'chandpur', 'chittagong', 'comilla', 'coxs_bazar', 'feni', 'khagrachhari', 'lakshmipur', 'noakhali', 'rangamati'],
        sylhet: ['habiganj', 'moulvibazar', 'sunamganj', 'sylhet'],
        barisal: ['barguna', 'barisal', 'bhola', 'jhalokati', 'patuakhali', 'pirojpur'],
        khulna: ['bagerhat', 'chuadanga', 'jessore', 'jhenaidah', 'khulna', 'kushtia', 'magura', 'meherpur', 'narail', 'satkhira'],
        rajshahi: ['bogra', 'joypurhat', 'naogaon', 'natore', 'nawabganj', 'pabna', 'rajshahi', 'sirajganj'],
        rangpur: ['dinajpur', 'gaibandha', 'kurigram', 'lalmonirhat', 'nilphamari', 'panchagarh', 'rangpur', 'thakurgaon'],
        mymensingh: ['jamalpur', 'mymensingh', 'netrakona', 'sherpur']
      },
      upazilas: {
        // This would be a very large object with all upazilas
        // For brevity, showing just a few examples
        dhaka: ['dhanmondi', 'gulshan', 'motijheel', 'ramna', 'tejgaon', 'uttara'],
        chittagong: ['chittagong_sadar', 'hathazari', 'raozan', 'patiya', 'sitakunda'],
        sylhet: ['sylhet_sadar', 'beanibazar', 'bishwanath', 'companiganj']
      }
    };
  }
}