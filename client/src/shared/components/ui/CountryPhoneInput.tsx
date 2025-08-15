/**
 * International Country Phone Input Component
 * Professional phone number input with country selection
 */

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/shared/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/shared/ui/command';
import { Check, ChevronDown, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CountryCode, 
  COUNTRY_CODES, 
  validateInternationalPhone, 
  searchCountries 
} from '@/shared/utils/internationalPhoneUtils';

export interface CountryPhoneInputProps {
  value: string;
  onChange: (value: string, country?: CountryCode) => void;
  onValidationChange?: (isValid: boolean, errorMessage?: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  defaultCountry?: string; // Country code like 'BD', 'US', etc.
}

export function CountryPhoneInput({
  value,
  onChange,
  onValidationChange,
  placeholder = "Enter mobile number",
  required = false,
  disabled = false,
  className = "",
  label = "Mobile Number",
  defaultCountry = 'BD'
}: CountryPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    COUNTRY_CODES.find(c => c.code === defaultCountry) || COUNTRY_CODES[4] // Default to Bangladesh
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [validation, setValidation] = useState({
    isValid: false,
    errorMessage: undefined as string | undefined
  });

  // Filter countries based on search
  const filteredCountries = searchQuery 
    ? searchCountries(searchQuery)
    : COUNTRY_CODES;

  // Validate phone number whenever value or country changes
  useEffect(() => {
    if (value) {
      const result = validateInternationalPhone(value, selectedCountry);
      setValidation({
        isValid: result.isValid,
        errorMessage: result.errorMessage
      });
      
      if (onValidationChange) {
        onValidationChange(result.isValid, result.errorMessage);
      }
    } else {
      setValidation({ isValid: false, errorMessage: undefined });
      if (onValidationChange) {
        onValidationChange(false, undefined);
      }
    }
  }, [value, selectedCountry, onValidationChange]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    
    // If there's already a value, reformat it with the new country
    if (value) {
      const cleaned = value.replace(/[\s\-\(\)\.]/g, '').replace(/^\+?\d+/, '');
      const newValue = cleaned ? `${country.dialCode} ${cleaned}` : country.dialCode + ' ';
      onChange(newValue, country);
    } else {
      onChange(country.dialCode + ' ', country);
    }
  };

  const handlePhoneChange = (newValue: string) => {
    // Ensure the country code is always present
    if (!newValue.startsWith(selectedCountry.dialCode)) {
      // Extract just the number part
      const numberPart = newValue.replace(/^\+?\d+\s?/, '');
      newValue = `${selectedCountry.dialCode} ${numberPart}`;
    }
    
    onChange(newValue, selectedCountry);
  };

  const getStatusIcon = () => {
    if (!value) return null;
    
    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (validation.errorMessage) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="phone-input" className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="flex gap-2">
        {/* Country Selector */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-32 justify-between"
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.dialCode}</span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <Command>
              <CommandInput 
                placeholder="Search countries..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dialCode} ${country.code}`}
                    onSelect={() => handleCountrySelect(country)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{country.flag}</span>
                      <div>
                        <div className="font-medium">{country.name}</div>
                        <div className="text-sm text-gray-500">{country.dialCode}</div>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedCountry.code === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone-input"
              type="tel"
              placeholder={placeholder}
              value={value}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={cn(
                "pl-10 pr-10",
                validation.errorMessage ? "border-red-500 focus:border-red-500" : "",
                validation.isValid ? "border-green-500 focus:border-green-500" : ""
              )}
              required={required}
              disabled={disabled}
            />
            <div className="absolute right-3 top-3">
              {getStatusIcon()}
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs space-y-1">
        {selectedCountry.format && (
          <p className="text-gray-500">
            Format: {selectedCountry.format}
          </p>
        )}
        
        {validation.errorMessage ? (
          <p className="text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {validation.errorMessage}
          </p>
        ) : validation.isValid ? (
          <p className="text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Valid {validation.isValid ? 'mobile' : 'phone'} number
          </p>
        ) : (
          <p className="text-blue-600">
            📱 SMS OTP will be sent to this number
          </p>
        )}
      </div>
    </div>
  );
}

export default CountryPhoneInput;