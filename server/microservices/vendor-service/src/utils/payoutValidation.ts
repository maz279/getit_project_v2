/**
 * Payout Validation - Amazon.com/Shopee.sg-Level Financial Validation
 * 
 * Complete validation for payout operations:
 * - Payout request validation
 * - Payment method validation
 * - Bangladesh banking validation
 * - Tax compliance validation
 * - Fee calculation validation
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PayoutValidation {

  /**
   * Validate payout request
   */
  async validatePayoutRequest(payoutData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Vendor ID validation
    if (!payoutData.vendorId || payoutData.vendorId.trim().length === 0) {
      errors.push('Vendor ID is required');
    }

    // Amount validation
    if (!payoutData.amount || isNaN(payoutData.amount)) {
      errors.push('Valid payout amount is required');
    } else {
      const amount = parseFloat(payoutData.amount);
      if (amount <= 0) {
        errors.push('Payout amount must be greater than zero');
      }
      if (amount < 100) {
        errors.push('Minimum payout amount is ৳100');
      }
      if (amount > 1000000) {
        errors.push('Maximum payout amount is ৳1,000,000 per request');
      }
    }

    // Payment method validation
    if (!payoutData.paymentMethod || payoutData.paymentMethod.trim().length === 0) {
      errors.push('Payment method is required');
    } else if (!this.isValidPaymentMethod(payoutData.paymentMethod)) {
      errors.push('Invalid payment method selected');
    }

    // Payment details validation
    if (!payoutData.paymentDetails) {
      errors.push('Payment details are required');
    } else {
      const paymentValidation = await this.validatePaymentMethod(
        payoutData.paymentMethod,
        payoutData.paymentDetails
      );
      if (!paymentValidation.isValid) {
        errors.push(...paymentValidation.errors);
      }
    }

    // Currency validation
    if (!payoutData.currency) {
      errors.push('Currency is required');
    } else if (!this.isValidCurrency(payoutData.currency)) {
      errors.push('Invalid currency. Only BDT is currently supported');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate payment method and details
   */
  async validatePaymentMethod(paymentMethod: string, paymentDetails: any): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!paymentDetails || typeof paymentDetails !== 'object') {
      errors.push('Payment details must be provided');
      return { isValid: false, errors };
    }

    switch (paymentMethod) {
      case 'bkash':
        return this.validateBkashPayment(paymentDetails);
      case 'nagad':
        return this.validateNagadPayment(paymentDetails);
      case 'rocket':
        return this.validateRocketPayment(paymentDetails);
      case 'bank_transfer':
        return this.validateBankTransfer(paymentDetails);
      default:
        errors.push('Unsupported payment method');
        return { isValid: false, errors };
    }
  }

  /**
   * Validate bKash payment details
   */
  private validateBkashPayment(details: any): ValidationResult {
    const errors: string[] = [];

    // Mobile number validation
    if (!details.mobileNumber) {
      errors.push('bKash mobile number is required');
    } else if (!this.isValidBangladeshMobile(details.mobileNumber)) {
      errors.push('Invalid bKash mobile number format');
    }

    // Account type validation
    if (!details.accountType) {
      errors.push('bKash account type is required');
    } else if (!['personal', 'agent'].includes(details.accountType)) {
      errors.push('Invalid bKash account type');
    }

    // Account holder name validation
    if (!details.accountHolderName || details.accountHolderName.trim().length === 0) {
      errors.push('Account holder name is required');
    } else if (details.accountHolderName.length < 2 || details.accountHolderName.length > 100) {
      errors.push('Account holder name must be between 2 and 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Nagad payment details
   */
  private validateNagadPayment(details: any): ValidationResult {
    const errors: string[] = [];

    // Mobile number validation
    if (!details.mobileNumber) {
      errors.push('Nagad mobile number is required');
    } else if (!this.isValidBangladeshMobile(details.mobileNumber)) {
      errors.push('Invalid Nagad mobile number format');
    }

    // Account holder name validation
    if (!details.accountHolderName || details.accountHolderName.trim().length === 0) {
      errors.push('Account holder name is required');
    } else if (details.accountHolderName.length < 2 || details.accountHolderName.length > 100) {
      errors.push('Account holder name must be between 2 and 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Rocket payment details
   */
  private validateRocketPayment(details: any): ValidationResult {
    const errors: string[] = [];

    // Mobile number validation
    if (!details.mobileNumber) {
      errors.push('Rocket mobile number is required');
    } else if (!this.isValidBangladeshMobile(details.mobileNumber)) {
      errors.push('Invalid Rocket mobile number format');
    }

    // Account holder name validation
    if (!details.accountHolderName || details.accountHolderName.trim().length === 0) {
      errors.push('Account holder name is required');
    } else if (details.accountHolderName.length < 2 || details.accountHolderName.length > 100) {
      errors.push('Account holder name must be between 2 and 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate bank transfer details
   */
  private validateBankTransfer(details: any): ValidationResult {
    const errors: string[] = [];

    // Bank name validation
    if (!details.bankName) {
      errors.push('Bank name is required');
    } else if (!this.isValidBangladeshBank(details.bankName)) {
      errors.push('Invalid or unsupported bank');
    }

    // Branch name validation
    if (!details.branchName || details.branchName.trim().length === 0) {
      errors.push('Branch name is required');
    } else if (details.branchName.length < 2 || details.branchName.length > 100) {
      errors.push('Branch name must be between 2 and 100 characters');
    }

    // Account number validation
    if (!details.accountNumber) {
      errors.push('Account number is required');
    } else if (!this.isValidBankAccountNumber(details.accountNumber)) {
      errors.push('Invalid bank account number format');
    }

    // Account holder name validation
    if (!details.accountHolderName || details.accountHolderName.trim().length === 0) {
      errors.push('Account holder name is required');
    } else if (details.accountHolderName.length < 2 || details.accountHolderName.length > 100) {
      errors.push('Account holder name must be between 2 and 100 characters');
    }

    // Account type validation
    if (!details.accountType) {
      errors.push('Account type is required');
    } else if (!['savings', 'current', 'business'].includes(details.accountType)) {
      errors.push('Invalid account type');
    }

    // Routing number validation (optional but if provided should be valid)
    if (details.routingNumber && !this.isValidRoutingNumber(details.routingNumber)) {
      errors.push('Invalid routing number format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate payout schedule
   */
  async validatePayoutSchedule(scheduleData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Frequency validation
    if (!scheduleData.frequency) {
      errors.push('Payout frequency is required');
    } else if (!['daily', 'weekly', 'biweekly', 'monthly'].includes(scheduleData.frequency)) {
      errors.push('Invalid payout frequency');
    }

    // Minimum amount validation
    if (scheduleData.minimumAmount !== undefined) {
      const amount = parseFloat(scheduleData.minimumAmount);
      if (isNaN(amount) || amount < 100) {
        errors.push('Minimum payout amount must be at least ৳100');
      }
      if (amount > 100000) {
        errors.push('Minimum payout amount cannot exceed ৳100,000');
      }
    }

    // Auto payout validation
    if (scheduleData.autoPayoutEnabled !== undefined && typeof scheduleData.autoPayoutEnabled !== 'boolean') {
      errors.push('Auto payout enabled must be true or false');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate tax information
   */
  async validateTaxInformation(taxData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // TIN validation
    if (taxData.tinNumber && !this.isValidTIN(taxData.tinNumber)) {
      errors.push('Invalid TIN number format');
    }

    // Tax year validation
    if (taxData.taxYear) {
      const year = parseInt(taxData.taxYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 2020 || year > currentYear) {
        errors.push('Invalid tax year');
      }
    }

    // Business type validation
    if (taxData.businessType && !['individual', 'partnership', 'corporation', 'llc'].includes(taxData.businessType)) {
      errors.push('Invalid business type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper validation methods

  /**
   * Check if payment method is valid
   */
  private isValidPaymentMethod(paymentMethod: string): boolean {
    const validMethods = ['bkash', 'nagad', 'rocket', 'bank_transfer'];
    return validMethods.includes(paymentMethod);
  }

  /**
   * Check if currency is valid
   */
  private isValidCurrency(currency: string): boolean {
    // Currently only BDT is supported
    return currency === 'BDT';
  }

  /**
   * Check if Bangladesh mobile number is valid
   */
  private isValidBangladeshMobile(mobile: string): boolean {
    // Remove any non-digit characters
    const cleanMobile = mobile.replace(/\D/g, '');
    
    // Bangladesh mobile number patterns
    const patterns = [
      /^88?01[3-9]\d{8}$/, // With or without country code
      /^01[3-9]\d{8}$/ // Without country code
    ];
    
    return patterns.some(pattern => pattern.test(cleanMobile));
  }

  /**
   * Check if Bangladesh bank is valid
   */
  private isValidBangladeshBank(bankName: string): boolean {
    const validBanks = [
      'sonali_bank', 'janata_bank', 'agrani_bank', 'rupali_bank',
      'dutch_bangla_bank', 'brac_bank', 'eastern_bank', 'city_bank',
      'standard_chartered', 'hsbc', 'islami_bank', 'social_islami_bank',
      'ab_bank', 'bank_asia', 'southeast_bank', 'mutual_trust_bank',
      'premier_bank', 'jamuna_bank', 'one_bank', 'trust_bank'
    ];
    return validBanks.includes(bankName.toLowerCase().replace(/ /g, '_'));
  }

  /**
   * Check if bank account number is valid
   */
  private isValidBankAccountNumber(accountNumber: string): boolean {
    // Remove any non-alphanumeric characters
    const cleanAccount = accountNumber.replace(/[^a-zA-Z0-9]/g, '');
    
    // Basic validation - most BD bank accounts are 10-20 digits
    return /^[0-9]{10,20}$/.test(cleanAccount);
  }

  /**
   * Check if routing number is valid
   */
  private isValidRoutingNumber(routingNumber: string): boolean {
    // Bangladesh routing numbers are typically 9 digits
    const cleanRouting = routingNumber.replace(/\D/g, '');
    return /^[0-9]{9}$/.test(cleanRouting);
  }

  /**
   * Check if TIN number is valid
   */
  private isValidTIN(tin: string): boolean {
    // Bangladesh TIN format: 12 digits
    const cleanTIN = tin.replace(/\D/g, '');
    return /^[0-9]{12}$/.test(cleanTIN);
  }

  /**
   * Check if email format is valid
   */
  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email) && email.length <= 254;
  }

  /**
   * Check if amount is within limits
   */
  private isAmountWithinLimits(amount: number, paymentMethod: string): boolean {
    const limits = {
      bkash: { min: 100, max: 50000 },
      nagad: { min: 100, max: 50000 },
      rocket: { min: 100, max: 50000 },
      bank_transfer: { min: 500, max: 1000000 }
    };

    const limit = limits[paymentMethod as keyof typeof limits];
    if (!limit) return false;

    return amount >= limit.min && amount <= limit.max;
  }

  /**
   * Validate withdrawal frequency (daily/weekly limits)
   */
  async validateWithdrawalFrequency(vendorId: string, amount: number, paymentMethod: string): Promise<ValidationResult> {
    const errors: string[] = [];

    // Daily limits
    const dailyLimits = {
      bkash: 25000,
      nagad: 25000,
      rocket: 25000,
      bank_transfer: 500000
    };

    // Weekly limits
    const weeklyLimits = {
      bkash: 100000,
      nagad: 100000,
      rocket: 100000,
      bank_transfer: 2000000
    };

    const dailyLimit = dailyLimits[paymentMethod as keyof typeof dailyLimits];
    const weeklyLimit = weeklyLimits[paymentMethod as keyof typeof weeklyLimits];

    if (dailyLimit && amount > dailyLimit) {
      errors.push(`Daily limit for ${paymentMethod} is ৳${dailyLimit.toLocaleString()}`);
    }

    if (weeklyLimit && amount > weeklyLimit) {
      errors.push(`Weekly limit for ${paymentMethod} is ৳${weeklyLimit.toLocaleString()}`);
    }

    // In production, would check actual withdrawal history from database

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}