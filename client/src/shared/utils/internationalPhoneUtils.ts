/**
 * International Phone Number Utilities
 * Comprehensive worldwide phone number validation and formatting
 */

export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  format?: string;
  minLength?: number;
  maxLength?: number;
}

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  country?: CountryCode;
  type: 'mobile' | 'landline' | 'unknown';
  errorMessage?: string;
}

// Comprehensive country codes with phone number patterns
export const COUNTRY_CODES: CountryCode[] = [
  // Major countries first
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '+1 XXX XXX XXXX', minLength: 10, maxLength: 10 },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: '+44 XXXX XXXXXX', minLength: 10, maxLength: 11 },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', format: '+91 XXXXX XXXXX', minLength: 10, maxLength: 10 },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', format: '+86 XXX XXXX XXXX', minLength: 11, maxLength: 11 },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', format: '+880 1XXX XXXXXX', minLength: 10, maxLength: 10 },
  
  // Asia Pacific
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', format: '+61 XXX XXX XXX', minLength: 9, maxLength: 9 },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', format: '+81 XX XXXX XXXX', minLength: 10, maxLength: 11 },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', format: '+82 XX XXXX XXXX', minLength: 9, maxLength: 11 },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', format: '+65 XXXX XXXX', minLength: 8, maxLength: 8 },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', format: '+60 XX XXX XXXX', minLength: 9, maxLength: 10 },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', format: '+66 XX XXX XXXX', minLength: 9, maxLength: 9 },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', format: '+84 XXX XXX XXX', minLength: 9, maxLength: 10 },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', format: '+63 XXX XXX XXXX', minLength: 10, maxLength: 10 },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', format: '+62 XXX XXX XXXX', minLength: 9, maxLength: 12 },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', format: '+92 XXX XXX XXXX', minLength: 10, maxLength: 10 },
  
  // Europe
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: '+49 XXX XXXXXXX', minLength: 10, maxLength: 12 },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: '+33 X XX XX XX XX', minLength: 9, maxLength: 9 },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', format: '+39 XXX XXX XXXX', minLength: 9, maxLength: 10 },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', format: '+34 XXX XXX XXX', minLength: 9, maxLength: 9 },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', format: '+31 XX XXX XXXX', minLength: 9, maxLength: 9 },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', format: '+7 XXX XXX XX XX', minLength: 10, maxLength: 10 },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', format: '+90 XXX XXX XX XX', minLength: 10, maxLength: 10 },
  
  // Middle East & Africa
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', format: '+966 XX XXX XXXX', minLength: 9, maxLength: 9 },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', format: '+971 XX XXX XXXX', minLength: 9, maxLength: 9 },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', format: '+20 XXX XXX XXXX', minLength: 10, maxLength: 10 },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', format: '+27 XX XXX XXXX', minLength: 9, maxLength: 9 },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', format: '+234 XXX XXX XXXX', minLength: 10, maxLength: 10 },
  
  // Americas
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', format: '+1 XXX XXX XXXX', minLength: 10, maxLength: 10 },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', format: '+52 XXX XXX XXXX', minLength: 10, maxLength: 10 },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', format: '+55 XX XXXXX XXXX', minLength: 10, maxLength: 11 },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', format: '+54 XX XXXX XXXX', minLength: 10, maxLength: 10 },
];

// Country-specific mobile number patterns
const MOBILE_PATTERNS: Record<string, RegExp[]> = {
  'US': [/^[2-9]\d{9}$/], // US mobile numbers
  'GB': [/^7[0-9]{9}$/], // UK mobile numbers start with 7
  'IN': [/^[6-9]\d{9}$/], // India mobile numbers start with 6-9
  'CN': [/^1[3-9]\d{9}$/], // China mobile numbers start with 1
  'BD': [/^1[3-9]\d{8}$/], // Bangladesh mobile numbers
  'AU': [/^4\d{8}$/], // Australia mobile numbers start with 4
  'JP': [/^[78]0\d{8}$/, /^90\d{8}$/], // Japan mobile numbers
  'KR': [/^1[0-9]\d{7,8}$/], // South Korea mobile numbers
  'SG': [/^[89]\d{7}$/], // Singapore mobile numbers
  'MY': [/^1[0-9]\d{7,8}$/], // Malaysia mobile numbers
  'DE': [/^1[5-7]\d{8,10}$/], // Germany mobile numbers
  'FR': [/^[67]\d{8}$/], // France mobile numbers
  'SA': [/^5\d{8}$/], // Saudi Arabia mobile numbers
  'AE': [/^5[0-9]\d{7}$/], // UAE mobile numbers
};

/**
 * Validate international phone number
 */
export function validateInternationalPhone(phoneNumber: string, selectedCountry?: CountryCode): PhoneValidationResult {
  // Clean the phone number
  const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  
  if (!cleaned) {
    return {
      isValid: false,
      formatted: phoneNumber,
      type: 'unknown',
      errorMessage: 'Phone number is required'
    };
  }

  // Try to detect country from phone number or use selected country
  let country = selectedCountry;
  let nationalNumber = '';

  if (cleaned.startsWith('+')) {
    // Phone number includes country code
    for (const countryCode of COUNTRY_CODES) {
      if (cleaned.startsWith(countryCode.dialCode)) {
        country = countryCode;
        nationalNumber = cleaned.substring(countryCode.dialCode.length);
        break;
      }
    }
  } else if (selectedCountry) {
    // Use selected country
    country = selectedCountry;
    nationalNumber = cleaned;
  }

  if (!country) {
    return {
      isValid: false,
      formatted: phoneNumber,
      type: 'unknown',
      errorMessage: 'Please select a country or include country code'
    };
  }

  // Validate number length
  if (country.minLength && nationalNumber.length < country.minLength) {
    return {
      isValid: false,
      formatted: phoneNumber,
      country,
      type: 'unknown',
      errorMessage: `Phone number too short for ${country.name}`
    };
  }

  if (country.maxLength && nationalNumber.length > country.maxLength) {
    return {
      isValid: false,
      formatted: phoneNumber,
      country,
      type: 'unknown',
      errorMessage: `Phone number too long for ${country.name}`
    };
  }

  // Check if it's a mobile number
  const mobilePatterns = MOBILE_PATTERNS[country.code] || [];
  const isMobile = mobilePatterns.some(pattern => pattern.test(nationalNumber));

  // Format the phone number
  const formatted = `${country.dialCode} ${nationalNumber}`;

  return {
    isValid: true,
    formatted,
    country,
    type: isMobile ? 'mobile' : 'landline',
    errorMessage: undefined
  };
}

/**
 * Format phone number for display
 */
export function formatInternationalPhone(phoneNumber: string, selectedCountry?: CountryCode): string {
  const validation = validateInternationalPhone(phoneNumber, selectedCountry);
  return validation.formatted;
}

/**
 * Check if phone number is valid for OTP
 */
export function isValidForOTP(phoneNumber: string, selectedCountry?: CountryCode): boolean {
  const validation = validateInternationalPhone(phoneNumber, selectedCountry);
  return validation.isValid && validation.type === 'mobile';
}

/**
 * Get country by dial code
 */
export function getCountryByDialCode(dialCode: string): CountryCode | undefined {
  return COUNTRY_CODES.find(country => country.dialCode === dialCode);
}

/**
 * Search countries by name or code
 */
export function searchCountries(query: string): CountryCode[] {
  const lowerQuery = query.toLowerCase();
  return COUNTRY_CODES.filter(country => 
    country.name.toLowerCase().includes(lowerQuery) ||
    country.code.toLowerCase().includes(lowerQuery) ||
    country.dialCode.includes(query)
  );
}

/**
 * Extract country code from phone number
 */
export function extractCountryCode(phoneNumber: string): CountryCode | undefined {
  const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  
  if (!cleaned.startsWith('+')) {
    return undefined;
  }

  // Sort by dialCode length (longest first) to match more specific codes first
  const sortedCountries = [...COUNTRY_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  
  for (const country of sortedCountries) {
    if (cleaned.startsWith(country.dialCode)) {
      return country;
    }
  }

  return undefined;
}