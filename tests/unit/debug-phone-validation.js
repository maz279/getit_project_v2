// Debug script to test phone validation logic
const phoneNumber = "+6596660588";

// Simulate frontend validation logic
const COUNTRY_CODES = [
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', format: '+65 XXXX XXXX', minLength: 8, maxLength: 8 }
];

const MOBILE_PATTERNS = {
  'SG': [/^[89]\d{7}$/], // Singapore mobile numbers
};

function validateInternationalPhone(phoneNumber, selectedCountry) {
  console.log(`🔧 Testing phone: "${phoneNumber}"`);
  
  // Clean the phone number
  const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  console.log(`🔧 Cleaned: "${cleaned}"`);
  
  // Try to detect country from phone number or use selected country
  let country = selectedCountry;
  let nationalNumber = '';

  if (cleaned.startsWith('+')) {
    // Phone number includes country code
    for (const countryCode of COUNTRY_CODES) {
      if (cleaned.startsWith(countryCode.dialCode)) {
        country = countryCode;
        nationalNumber = cleaned.substring(countryCode.dialCode.length);
        console.log(`🔧 Found country: ${country.name}, national: "${nationalNumber}"`);
        break;
      }
    }
  }

  if (!country) {
    console.log(`🔧 No country found`);
    return { isValid: false, type: 'unknown', errorMessage: 'No country found' };
  }

  // Validate number length
  console.log(`🔧 Length check: ${nationalNumber.length}, min: ${country.minLength}, max: ${country.maxLength}`);
  if (country.minLength && nationalNumber.length < country.minLength) {
    console.log(`🔧 Too short`);
    return { isValid: false, type: 'unknown', errorMessage: 'Too short' };
  }

  if (country.maxLength && nationalNumber.length > country.maxLength) {
    console.log(`🔧 Too long`);
    return { isValid: false, type: 'unknown', errorMessage: 'Too long' };
  }

  // Check if it's a mobile number
  const mobilePatterns = MOBILE_PATTERNS[country.code] || [];
  console.log(`🔧 Mobile patterns for ${country.code}:`, mobilePatterns);
  console.log(`🔧 Testing national number "${nationalNumber}" against patterns`);
  
  const isMobile = mobilePatterns.some(pattern => {
    const matches = pattern.test(nationalNumber);
    console.log(`🔧 Pattern ${pattern} matches "${nationalNumber}": ${matches}`);
    return matches;
  });

  console.log(`🔧 Is mobile: ${isMobile}`);

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

function isValidForOTP(phoneNumber, selectedCountry) {
  const validation = validateInternationalPhone(phoneNumber, selectedCountry);
  console.log(`🔧 Validation result:`, validation);
  const result = validation.isValid && validation.type === 'mobile';
  console.log(`🔧 isValidForOTP result: ${result}`);
  return result;
}

// Test the phone number
console.log("=== Testing Singapore number validation ===");
const result = isValidForOTP(phoneNumber);
console.log(`🔧 Final result: ${result}`);