import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

interface CountryCode {
  code: string;
  country: string;
  flag: string;
  dialCode: string;
}

interface CountryCodeSelectorProps {
  selectedCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  className?: string;
}

const countryCodes: CountryCode[] = [
  // Popular countries first
  { code: 'BD', country: 'Bangladesh', flag: '🇧🇩', dialCode: '+880' },
  { code: 'IN', country: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'US', country: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', country: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'PK', country: 'Pakistan', flag: '🇵🇰', dialCode: '+92' },
  { code: 'CN', country: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'JP', country: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'KR', country: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
  { code: 'SG', country: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  { code: 'MY', country: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
  
  // All world countries alphabetically
  { code: 'AF', country: 'Afghanistan', flag: '🇦🇫', dialCode: '+93' },
  { code: 'AL', country: 'Albania', flag: '🇦🇱', dialCode: '+355' },
  { code: 'DZ', country: 'Algeria', flag: '🇩🇿', dialCode: '+213' },
  { code: 'AD', country: 'Andorra', flag: '🇦🇩', dialCode: '+376' },
  { code: 'AO', country: 'Angola', flag: '🇦🇴', dialCode: '+244' },
  { code: 'AR', country: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
  { code: 'AM', country: 'Armenia', flag: '🇦🇲', dialCode: '+374' },
  { code: 'AU', country: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'AT', country: 'Austria', flag: '🇦🇹', dialCode: '+43' },
  { code: 'AZ', country: 'Azerbaijan', flag: '🇦🇿', dialCode: '+994' },
  { code: 'BH', country: 'Bahrain', flag: '🇧🇭', dialCode: '+973' },
  { code: 'BE', country: 'Belgium', flag: '🇧🇪', dialCode: '+32' },
  { code: 'BZ', country: 'Belize', flag: '🇧🇿', dialCode: '+501' },
  { code: 'BJ', country: 'Benin', flag: '🇧🇯', dialCode: '+229' },
  { code: 'BT', country: 'Bhutan', flag: '🇧🇹', dialCode: '+975' },
  { code: 'BO', country: 'Bolivia', flag: '🇧🇴', dialCode: '+591' },
  { code: 'BA', country: 'Bosnia and Herzegovina', flag: '🇧🇦', dialCode: '+387' },
  { code: 'BW', country: 'Botswana', flag: '🇧🇼', dialCode: '+267' },
  { code: 'BR', country: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'BN', country: 'Brunei', flag: '🇧🇳', dialCode: '+673' },
  { code: 'BG', country: 'Bulgaria', flag: '🇧🇬', dialCode: '+359' },
  { code: 'BF', country: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226' },
  { code: 'BI', country: 'Burundi', flag: '🇧🇮', dialCode: '+257' },
  { code: 'KH', country: 'Cambodia', flag: '🇰🇭', dialCode: '+855' },
  { code: 'CM', country: 'Cameroon', flag: '🇨🇲', dialCode: '+237' },
  { code: 'CA', country: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'CV', country: 'Cape Verde', flag: '🇨🇻', dialCode: '+238' },
  { code: 'CF', country: 'Central African Republic', flag: '🇨🇫', dialCode: '+236' },
  { code: 'TD', country: 'Chad', flag: '🇹🇩', dialCode: '+235' },
  { code: 'CL', country: 'Chile', flag: '🇨🇱', dialCode: '+56' },
  { code: 'CO', country: 'Colombia', flag: '🇨🇴', dialCode: '+57' },
  { code: 'KM', country: 'Comoros', flag: '🇰🇲', dialCode: '+269' },
  { code: 'CG', country: 'Congo', flag: '🇨🇬', dialCode: '+242' },
  { code: 'CR', country: 'Costa Rica', flag: '🇨🇷', dialCode: '+506' },
  { code: 'CI', country: 'Côte d\'Ivoire', flag: '🇨🇮', dialCode: '+225' },
  { code: 'HR', country: 'Croatia', flag: '🇭🇷', dialCode: '+385' },
  { code: 'CU', country: 'Cuba', flag: '🇨🇺', dialCode: '+53' },
  { code: 'CY', country: 'Cyprus', flag: '🇨🇾', dialCode: '+357' },
  { code: 'CZ', country: 'Czech Republic', flag: '🇨🇿', dialCode: '+420' },
  { code: 'DK', country: 'Denmark', flag: '🇩🇰', dialCode: '+45' },
  { code: 'DJ', country: 'Djibouti', flag: '🇩🇯', dialCode: '+253' },
  { code: 'DM', country: 'Dominica', flag: '🇩🇲', dialCode: '+1767' },
  { code: 'DO', country: 'Dominican Republic', flag: '🇩🇴', dialCode: '+1849' },
  { code: 'EC', country: 'Ecuador', flag: '🇪🇨', dialCode: '+593' },
  { code: 'EG', country: 'Egypt', flag: '🇪🇬', dialCode: '+20' },
  { code: 'SV', country: 'El Salvador', flag: '🇸🇻', dialCode: '+503' },
  { code: 'GQ', country: 'Equatorial Guinea', flag: '🇬🇶', dialCode: '+240' },
  { code: 'ER', country: 'Eritrea', flag: '🇪🇷', dialCode: '+291' },
  { code: 'EE', country: 'Estonia', flag: '🇪🇪', dialCode: '+372' },
  { code: 'SZ', country: 'Eswatini', flag: '🇸🇿', dialCode: '+268' },
  { code: 'ET', country: 'Ethiopia', flag: '🇪🇹', dialCode: '+251' },
  { code: 'FJ', country: 'Fiji', flag: '🇫🇯', dialCode: '+679' },
  { code: 'FI', country: 'Finland', flag: '🇫🇮', dialCode: '+358' },
  { code: 'FR', country: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'GA', country: 'Gabon', flag: '🇬🇦', dialCode: '+241' },
  { code: 'GM', country: 'Gambia', flag: '🇬🇲', dialCode: '+220' },
  { code: 'GE', country: 'Georgia', flag: '🇬🇪', dialCode: '+995' },
  { code: 'DE', country: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'GH', country: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { code: 'GR', country: 'Greece', flag: '🇬🇷', dialCode: '+30' },
  { code: 'GD', country: 'Grenada', flag: '🇬🇩', dialCode: '+1473' },
  { code: 'GT', country: 'Guatemala', flag: '🇬🇹', dialCode: '+502' },
  { code: 'GN', country: 'Guinea', flag: '🇬🇳', dialCode: '+224' },
  { code: 'GW', country: 'Guinea-Bissau', flag: '🇬🇼', dialCode: '+245' },
  { code: 'GY', country: 'Guyana', flag: '🇬🇾', dialCode: '+592' },
  { code: 'HT', country: 'Haiti', flag: '🇭🇹', dialCode: '+509' },
  { code: 'HN', country: 'Honduras', flag: '🇭🇳', dialCode: '+504' },
  { code: 'HU', country: 'Hungary', flag: '🇭🇺', dialCode: '+36' },
  { code: 'IS', country: 'Iceland', flag: '🇮🇸', dialCode: '+354' },
  { code: 'ID', country: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
  { code: 'IR', country: 'Iran', flag: '🇮🇷', dialCode: '+98' },
  { code: 'IQ', country: 'Iraq', flag: '🇮🇶', dialCode: '+964' },
  { code: 'IE', country: 'Ireland', flag: '🇮🇪', dialCode: '+353' },
  { code: 'IL', country: 'Israel', flag: '🇮🇱', dialCode: '+972' },
  { code: 'IT', country: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'JM', country: 'Jamaica', flag: '🇯🇲', dialCode: '+1876' },
  { code: 'JO', country: 'Jordan', flag: '🇯🇴', dialCode: '+962' },
  { code: 'KZ', country: 'Kazakhstan', flag: '🇰🇿', dialCode: '+7' },
  { code: 'KE', country: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'KI', country: 'Kiribati', flag: '🇰🇮', dialCode: '+686' },
  { code: 'KP', country: 'North Korea', flag: '🇰🇵', dialCode: '+850' },
  { code: 'KW', country: 'Kuwait', flag: '🇰🇼', dialCode: '+965' },
  { code: 'KG', country: 'Kyrgyzstan', flag: '🇰🇬', dialCode: '+996' },
  { code: 'LA', country: 'Laos', flag: '🇱🇦', dialCode: '+856' },
  { code: 'LV', country: 'Latvia', flag: '🇱🇻', dialCode: '+371' },
  { code: 'LB', country: 'Lebanon', flag: '🇱🇧', dialCode: '+961' },
  { code: 'LS', country: 'Lesotho', flag: '🇱🇸', dialCode: '+266' },
  { code: 'LR', country: 'Liberia', flag: '🇱🇷', dialCode: '+231' },
  { code: 'LY', country: 'Libya', flag: '🇱🇾', dialCode: '+218' },
  { code: 'LI', country: 'Liechtenstein', flag: '🇱🇮', dialCode: '+423' },
  { code: 'LT', country: 'Lithuania', flag: '🇱🇹', dialCode: '+370' },
  { code: 'LU', country: 'Luxembourg', flag: '🇱🇺', dialCode: '+352' },
  { code: 'MK', country: 'North Macedonia', flag: '🇲🇰', dialCode: '+389' },
  { code: 'MG', country: 'Madagascar', flag: '🇲🇬', dialCode: '+261' },
  { code: 'MW', country: 'Malawi', flag: '🇲🇼', dialCode: '+265' },
  { code: 'MV', country: 'Maldives', flag: '🇲🇻', dialCode: '+960' },
  { code: 'ML', country: 'Mali', flag: '🇲🇱', dialCode: '+223' },
  { code: 'MT', country: 'Malta', flag: '🇲🇹', dialCode: '+356' },
  { code: 'MH', country: 'Marshall Islands', flag: '🇲🇭', dialCode: '+692' },
  { code: 'MR', country: 'Mauritania', flag: '🇲🇷', dialCode: '+222' },
  { code: 'MU', country: 'Mauritius', flag: '🇲🇺', dialCode: '+230' },
  { code: 'MX', country: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'FM', country: 'Micronesia', flag: '🇫🇲', dialCode: '+691' },
  { code: 'MD', country: 'Moldova', flag: '🇲🇩', dialCode: '+373' },
  { code: 'MC', country: 'Monaco', flag: '🇲🇨', dialCode: '+377' },
  { code: 'MN', country: 'Mongolia', flag: '🇲🇳', dialCode: '+976' },
  { code: 'ME', country: 'Montenegro', flag: '🇲🇪', dialCode: '+382' },
  { code: 'MA', country: 'Morocco', flag: '🇲🇦', dialCode: '+212' },
  { code: 'MZ', country: 'Mozambique', flag: '🇲🇿', dialCode: '+258' },
  { code: 'MM', country: 'Myanmar', flag: '🇲🇲', dialCode: '+95' },
  { code: 'NA', country: 'Namibia', flag: '🇳🇦', dialCode: '+264' },
  { code: 'NR', country: 'Nauru', flag: '🇳🇷', dialCode: '+674' },
  { code: 'NP', country: 'Nepal', flag: '🇳🇵', dialCode: '+977' },
  { code: 'NL', country: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
  { code: 'NZ', country: 'New Zealand', flag: '🇳🇿', dialCode: '+64' },
  { code: 'NI', country: 'Nicaragua', flag: '🇳🇮', dialCode: '+505' },
  { code: 'NE', country: 'Niger', flag: '🇳🇪', dialCode: '+227' },
  { code: 'NG', country: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'NO', country: 'Norway', flag: '🇳🇴', dialCode: '+47' },
  { code: 'OM', country: 'Oman', flag: '🇴🇲', dialCode: '+968' },
  { code: 'PW', country: 'Palau', flag: '🇵🇼', dialCode: '+680' },
  { code: 'PA', country: 'Panama', flag: '🇵🇦', dialCode: '+507' },
  { code: 'PG', country: 'Papua New Guinea', flag: '🇵🇬', dialCode: '+675' },
  { code: 'PY', country: 'Paraguay', flag: '🇵🇾', dialCode: '+595' },
  { code: 'PE', country: 'Peru', flag: '🇵🇪', dialCode: '+51' },
  { code: 'PH', country: 'Philippines', flag: '🇵🇭', dialCode: '+63' },
  { code: 'PL', country: 'Poland', flag: '🇵🇱', dialCode: '+48' },
  { code: 'PT', country: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
  { code: 'QA', country: 'Qatar', flag: '🇶🇦', dialCode: '+974' },
  { code: 'RO', country: 'Romania', flag: '🇷🇴', dialCode: '+40' },
  { code: 'RU', country: 'Russia', flag: '🇷🇺', dialCode: '+7' },
  { code: 'RW', country: 'Rwanda', flag: '🇷🇼', dialCode: '+250' },
  { code: 'KN', country: 'Saint Kitts and Nevis', flag: '🇰🇳', dialCode: '+1869' },
  { code: 'LC', country: 'Saint Lucia', flag: '🇱🇨', dialCode: '+1758' },
  { code: 'VC', country: 'Saint Vincent and the Grenadines', flag: '🇻🇨', dialCode: '+1784' },
  { code: 'WS', country: 'Samoa', flag: '🇼🇸', dialCode: '+685' },
  { code: 'SM', country: 'San Marino', flag: '🇸🇲', dialCode: '+378' },
  { code: 'ST', country: 'São Tomé and Príncipe', flag: '🇸🇹', dialCode: '+239' },
  { code: 'SA', country: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: 'SN', country: 'Senegal', flag: '🇸🇳', dialCode: '+221' },
  { code: 'RS', country: 'Serbia', flag: '🇷🇸', dialCode: '+381' },
  { code: 'SC', country: 'Seychelles', flag: '🇸🇨', dialCode: '+248' },
  { code: 'SL', country: 'Sierra Leone', flag: '🇸🇱', dialCode: '+232' },
  { code: 'SK', country: 'Slovakia', flag: '🇸🇰', dialCode: '+421' },
  { code: 'SI', country: 'Slovenia', flag: '🇸🇮', dialCode: '+386' },
  { code: 'SB', country: 'Solomon Islands', flag: '🇸🇧', dialCode: '+677' },
  { code: 'SO', country: 'Somalia', flag: '🇸🇴', dialCode: '+252' },
  { code: 'ZA', country: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'SS', country: 'South Sudan', flag: '🇸🇸', dialCode: '+211' },
  { code: 'ES', country: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'LK', country: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94' },
  { code: 'SD', country: 'Sudan', flag: '🇸🇩', dialCode: '+249' },
  { code: 'SR', country: 'Suriname', flag: '🇸🇷', dialCode: '+597' },
  { code: 'SE', country: 'Sweden', flag: '🇸🇪', dialCode: '+46' },
  { code: 'CH', country: 'Switzerland', flag: '🇨🇭', dialCode: '+41' },
  { code: 'SY', country: 'Syria', flag: '🇸🇾', dialCode: '+963' },
  { code: 'TJ', country: 'Tajikistan', flag: '🇹🇯', dialCode: '+992' },
  { code: 'TZ', country: 'Tanzania', flag: '🇹🇿', dialCode: '+255' },
  { code: 'TH', country: 'Thailand', flag: '🇹🇭', dialCode: '+66' },
  { code: 'TL', country: 'Timor-Leste', flag: '🇹🇱', dialCode: '+670' },
  { code: 'TG', country: 'Togo', flag: '🇹🇬', dialCode: '+228' },
  { code: 'TO', country: 'Tonga', flag: '🇹🇴', dialCode: '+676' },
  { code: 'TT', country: 'Trinidad and Tobago', flag: '🇹🇹', dialCode: '+1868' },
  { code: 'TN', country: 'Tunisia', flag: '🇹🇳', dialCode: '+216' },
  { code: 'TR', country: 'Turkey', flag: '🇹🇷', dialCode: '+90' },
  { code: 'TM', country: 'Turkmenistan', flag: '🇹🇲', dialCode: '+993' },
  { code: 'TV', country: 'Tuvalu', flag: '🇹🇻', dialCode: '+688' },
  { code: 'UG', country: 'Uganda', flag: '🇺🇬', dialCode: '+256' },
  { code: 'UA', country: 'Ukraine', flag: '🇺🇦', dialCode: '+380' },
  { code: 'AE', country: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { code: 'UY', country: 'Uruguay', flag: '🇺🇾', dialCode: '+598' },
  { code: 'UZ', country: 'Uzbekistan', flag: '🇺🇿', dialCode: '+998' },
  { code: 'VU', country: 'Vanuatu', flag: '🇻🇺', dialCode: '+678' },
  { code: 'VE', country: 'Venezuela', flag: '🇻🇪', dialCode: '+58' },
  { code: 'VN', country: 'Vietnam', flag: '🇻🇳', dialCode: '+84' },
  { code: 'YE', country: 'Yemen', flag: '🇾🇪', dialCode: '+967' },
  { code: 'ZM', country: 'Zambia', flag: '🇿🇲', dialCode: '+260' },
  { code: 'ZW', country: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263' }
];

export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCountry,
  onCountryChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countryCodes.filter(country =>
    country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm)
  );

  const handleCountrySelect = (country: CountryCode) => {
    onCountryChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && event.target instanceof Element) {
        const dropdown = event.target.closest('.country-selector-dropdown');
        if (!dropdown) {
          setIsOpen(false);
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative country-selector-dropdown ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-3 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 justify-start"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{selectedCountry.flag}</span>
          <span className="text-sm font-semibold text-gray-900">{selectedCountry.dialCode}</span>
          <span className="text-xs text-gray-600 truncate font-medium">{selectedCountry.country}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 text-gray-600 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden backdrop-blur-sm">
            <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search country or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-400 bg-white"
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
                      selectedCountry.code === country.code ? 'bg-gradient-to-r from-blue-100 to-green-100 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{country.flag}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{country.dialCode}</span>
                          <span className="text-sm text-gray-600 font-medium">{country.country}</span>
                        </div>
                      </div>
                      {selectedCountry.code === country.code && (
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-gray-500 text-center">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No countries found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};