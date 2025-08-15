/**
 * Bangladesh Location Data
 * Extracted from Header component for better separation of concerns
 * Production-ready with proper types and structure
 */

export interface LocationZone {
  name: string;
  deliveryTime: string;
}

export interface Location {
  id: number;
  city: string;
  region: string;
  country: string;
  deliveryTime: string;
  zones: string[];
  popular: boolean;
  metro: boolean;
}

export interface MultiLanguageLocation {
  id: number;
  city: { en: string; bn: string };
  region: { en: string; bn: string };
  country: { en: string; bn: string };
  deliveryTime: { en: string; bn: string };
  zones: string[];
  popular: boolean;
  metro: boolean;
}

// All 64 districts under 8 divisions - Production data
export const bangladeshLocations: Location[] = [
  // Dhaka Division (13 districts)
  { id: 1, city: 'Dhaka', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Dhanmondi', 'Gulshan', 'Uttara', 'Mirpur', 'Old Dhaka', 'Wari', 'Ramna'], popular: true, metro: true, deliveryTime: 'Within 2 hours' },
  { id: 2, city: 'Faridpur', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Kotwali', 'Medical'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 3, city: 'Gazipur', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Kaliakair', 'Kapasia'], popular: true, metro: false, deliveryTime: 'Same day' },
  { id: 4, city: 'Gopalganj', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Tungipara', 'Kotalipara'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 5, city: 'Kishoreganj', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Bajitpur', 'Bhairab'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 6, city: 'Madaripur', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Shibchar', 'Kalkini'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 7, city: 'Manikganj', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Singair', 'Shibalaya'], popular: false, metro: false, deliveryTime: 'Same day' },
  { id: 8, city: 'Munshiganj', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Sreenagar', 'Sirajdikhan'], popular: false, metro: false, deliveryTime: 'Same day' },
  { id: 9, city: 'Narayanganj', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Rupganj', 'Sonargaon'], popular: true, metro: false, deliveryTime: 'Within 2 hours' },
  { id: 10, city: 'Narsingdi', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Belabo', 'Monohardi'], popular: false, metro: false, deliveryTime: 'Same day' },
  { id: 11, city: 'Rajbari', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Goalandaghat', 'Pangsha'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 12, city: 'Shariatpur', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Naria', 'Zajira'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 13, city: 'Tangail', region: 'Dhaka Division', country: 'Bangladesh', zones: ['Sadar', 'Mirzapur', 'Kalihati'], popular: false, metro: false, deliveryTime: 'Same day' },

  // Chittagong Division (11 districts)
  { id: 14, city: 'Chittagong', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Agrabad', 'Nasirabad', 'Khulshi', 'Panchlaish'], popular: true, metro: true, deliveryTime: 'Same day' },
  { id: 15, city: 'Bandarban', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Sadar', 'Thanchi', 'Lama'], popular: false, metro: false, deliveryTime: '2-3 days' },
  { id: 16, city: 'Brahmanbaria', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Sadar', 'Kasba', 'Nasirnagar'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 17, city: 'Chandpur', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Sadar', 'Haimchar', 'Kachua'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 18, city: 'Comilla', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Sadar', 'Daudkandi', 'Homna'], popular: true, metro: false, deliveryTime: 'Next day' },
  { id: 19, city: 'Cox\'s Bazar', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Sadar', 'Teknaf', 'Ukhiya'], popular: true, metro: false, deliveryTime: 'Next day' },
  { id: 20, city: 'Feni', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Sadar', 'Sonagazi', 'Fulgazi'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 21, city: 'Khagrachhari', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Sadar', 'Dighinala', 'Panchari'], popular: false, metro: false, deliveryTime: '2-3 days' },
  { id: 22, city: 'Lakshmipur', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Sadar', 'Raipur', 'Ramganj'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 23, city: 'Noakhali', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Sadar', 'Begumganj', 'Chatkhil'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 24, city: 'Rangamati', region: 'Chittagong Division', country: 'Bangladesh', zones: ['Sadar', 'Kaptai', 'Nannerchar'], popular: false, metro: false, deliveryTime: '2-3 days' },

  // Rajshahi Division (8 districts)
  { id: 25, city: 'Rajshahi', region: 'Rajshahi Division', country: 'Bangladesh', zones: ['New Market', 'Shaheb Bazar', 'Uposhohor'], popular: true, metro: false, deliveryTime: 'Next day' },
  { id: 26, city: 'Bogra', region: 'Rajshahi Division', country: 'Bangladesh', zones: ['Sadar', 'Shibganj', 'Sonatola'], popular: true, metro: false, deliveryTime: 'Next day' },
  { id: 27, city: 'Joypurhat', region: 'Rajshahi Division', country: 'Bangladesh', zones: ['Sadar', 'Akkelpur', 'Kalai'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 28, city: 'Naogaon', region: 'Rajshahi Division', country: 'Bangladesh', zones: ['Sadar', 'Patnitala', 'Dhamoirhat'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 29, city: 'Natore', region: 'Rajshahi Division', country: 'Bangladesh', zones: ['Sadar', 'Singra', 'Baraigram'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 30, city: 'Chapainawabganj', region: 'Rajshahi Division', country: 'Bangladesh', zones: ['Sadar', 'Shibganj', 'Gomostapur'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 31, city: 'Pabna', region: 'Rajshahi Division', country: 'Bangladesh', zones: ['Sadar', 'Ishurdi', 'Atgharia'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 32, city: 'Sirajganj', region: 'Rajshahi Division', country: 'Bangladesh', zones: ['Sadar', 'Shahjadpur', 'Ullapara'], popular: false, metro: false, deliveryTime: 'Next day' },

  // Khulna Division (10 districts)
  { id: 33, city: 'Khulna', region: 'Khulna Division', country: 'Bangladesh', zones: ['Khalishpur', 'Sonadanga', 'Khan Jahan Ali'], popular: true, metro: false, deliveryTime: 'Next day' },
  { id: 34, city: 'Bagerhat', region: 'Khulna Division', country: 'Bangladesh', zones: ['Sadar', 'Sharankhola', 'Morrelganj'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 35, city: 'Chuadanga', region: 'Khulna Division', country: 'Bangladesh', zones: ['Sadar', 'Alamdanga', 'Damurhuda'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 36, city: 'Jessore', region: 'Khulna Division', country: 'Bangladesh', zones: ['Sadar', 'Benapole', 'Jhikargachha'], popular: true, metro: false, deliveryTime: 'Next day' },
  { id: 37, city: 'Jhenaidah', region: 'Khulna Division', country: 'Bangladesh', zones: ['Sadar', 'Maheshpur', 'Kaliganj'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 38, city: 'Kushtia', region: 'Khulna Division', country: 'Bangladesh', zones: ['Sadar', 'Kumarkhali', 'Khoksa'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 39, city: 'Magura', region: 'Khulna Division', country: 'Bangladesh', zones: ['Sadar', 'Mohammadpur', 'Shalikha'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 40, city: 'Meherpur', region: 'Khulna Division', country: 'Bangladesh', zones: ['Sadar', 'Gangni', 'Mujibnagar'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 41, city: 'Narail', region: 'Khulna Division', country: 'Bangladesh', zones: ['Sadar', 'Lohagara', 'Kalia'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 42, city: 'Satkhira', region: 'Khulna Division', country: 'Bangladesh', zones: ['Sadar', 'Kaliganj', 'Shyamnagar'], popular: false, metro: false, deliveryTime: 'Next day' },

  // Sylhet Division (4 districts)
  { id: 43, city: 'Sylhet', region: 'Sylhet Division', country: 'Bangladesh', zones: ['Zindabazar', 'Ambarkhana', 'Tilagarh'], popular: true, metro: false, deliveryTime: 'Next day' },
  { id: 44, city: 'Habiganj', region: 'Sylhet Division', country: 'Bangladesh', zones: ['Sadar', 'Lakhai', 'Chunarughat'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 45, city: 'Moulvibazar', region: 'Sylhet Division', country: 'Bangladesh', zones: ['Sadar', 'Sreemangal', 'Kamalganj'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 46, city: 'Sunamganj', region: 'Sylhet Division', country: 'Bangladesh', zones: ['Sadar', 'Jagannathpur', 'Chhatak'], popular: false, metro: false, deliveryTime: 'Next day' },

  // Barisal Division (6 districts)
  { id: 47, city: 'Barisal', region: 'Barisal Division', country: 'Bangladesh', zones: ['Sadar', 'Kotwali', 'Band Road'], popular: true, metro: false, deliveryTime: '1-2 days' },
  { id: 48, city: 'Barguna', region: 'Barisal Division', country: 'Bangladesh', zones: ['Sadar', 'Amtali', 'Betagi'], popular: false, metro: false, deliveryTime: '1-2 days' },
  { id: 49, city: 'Bhola', region: 'Barisal Division', country: 'Bangladesh', zones: ['Sadar', 'Borhanuddin', 'Charfashion'], popular: false, metro: false, deliveryTime: '1-2 days' },
  { id: 50, city: 'Jhalokati', region: 'Barisal Division', country: 'Bangladesh', zones: ['Sadar', 'Kathalia', 'Nalchity'], popular: false, metro: false, deliveryTime: '1-2 days' },
  { id: 51, city: 'Patuakhali', region: 'Barisal Division', country: 'Bangladesh', zones: ['Sadar', 'Kalapara', 'Galachipa'], popular: false, metro: false, deliveryTime: '1-2 days' },
  { id: 52, city: 'Pirojpur', region: 'Barisal Division', country: 'Bangladesh', zones: ['Sadar', 'Mathbaria', 'Nesarabad'], popular: false, metro: false, deliveryTime: '1-2 days' },

  // Rangpur Division (8 districts)
  { id: 53, city: 'Rangpur', region: 'Rangpur Division', country: 'Bangladesh', zones: ['Sadar', 'Mithapukur', 'Badarganj'], popular: true, metro: false, deliveryTime: 'Next day' },
  { id: 54, city: 'Dinajpur', region: 'Rangpur Division', country: 'Bangladesh', zones: ['Sadar', 'Birampur', 'Chirirbandar'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 55, city: 'Gaibandha', region: 'Rangpur Division', country: 'Bangladesh', zones: ['Sadar', 'Sundarganj', 'Phulchhari'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 56, city: 'Kurigram', region: 'Rangpur Division', country: 'Bangladesh', zones: ['Sadar', 'Ulipur', 'Nageshwari'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 57, city: 'Lalmonirhat', region: 'Rangpur Division', country: 'Bangladesh', zones: ['Sadar', 'Aditmari', 'Kaliganj'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 58, city: 'Nilphamari', region: 'Rangpur Division', country: 'Bangladesh', zones: ['Sadar', 'Syedpur', 'Domar'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 59, city: 'Panchagarh', region: 'Rangpur Division', country: 'Bangladesh', zones: ['Sadar', 'Tetulia', 'Debiganj'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 60, city: 'Thakurgaon', region: 'Rangpur Division', country: 'Bangladesh', zones: ['Sadar', 'Pirganj', 'Baliadangi'], popular: false, metro: false, deliveryTime: 'Next day' },

  // Mymensingh Division (4 districts)
  { id: 61, city: 'Mymensingh', region: 'Mymensingh Division', country: 'Bangladesh', zones: ['Sadar', 'Trishal', 'Muktagachha'], popular: true, metro: false, deliveryTime: 'Next day' },
  { id: 62, city: 'Jamalpur', region: 'Mymensingh Division', country: 'Bangladesh', zones: ['Sadar', 'Melandaha', 'Islampur'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 63, city: 'Netrakona', region: 'Mymensingh Division', country: 'Bangladesh', zones: ['Sadar', 'Barhatta', 'Kendua'], popular: false, metro: false, deliveryTime: 'Next day' },
  { id: 64, city: 'Sherpur', region: 'Mymensingh Division', country: 'Bangladesh', zones: ['Sadar', 'Jhenaigati', 'Nakla'], popular: false, metro: false, deliveryTime: 'Next day' }
];

// Major cities with multilingual support
export const multiLanguageLocations: MultiLanguageLocation[] = [
  { id: 1, city: { en: 'Dhaka', bn: 'ঢাকা' }, region: { en: 'Dhaka Division', bn: 'ঢাকা বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Within 2 hours', bn: '২ ঘন্টার মধ্যে' }, zones: ['Dhanmondi', 'Gulshan', 'Uttara', 'Mirpur'], popular: true, metro: true },
  { id: 9, city: { en: 'Narayanganj', bn: 'নারায়ণগঞ্জ' }, region: { en: 'Dhaka Division', bn: 'ঢাকা বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Within 2 hours', bn: '২ ঘন্টার মধ্যে' }, zones: ['Sadar', 'Rupganj', 'Sonargaon'], popular: true, metro: false },
  { id: 14, city: { en: 'Chittagong', bn: 'চট্টগ্রাম' }, region: { en: 'Chittagong Division', bn: 'চট্টগ্রাম বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Same day', bn: 'একই দিনে' }, zones: ['Agrabad', 'Nasirabad', 'Khulshi'], popular: true, metro: true },
  { id: 18, city: { en: 'Comilla', bn: 'কুমিল্লা' }, region: { en: 'Chittagong Division', bn: 'চট্টগ্রাম বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Next day', bn: 'পরদিন' }, zones: ['Sadar', 'Daudkandi', 'Homna'], popular: true, metro: false },
  { id: 19, city: { en: 'Cox\'s Bazar', bn: 'কক্সবাজার' }, region: { en: 'Chittagong Division', bn: 'চট্টগ্রাম বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Next day', bn: 'পরদিন' }, zones: ['Sadar', 'Teknaf', 'Ukhiya'], popular: true, metro: false },
  { id: 25, city: { en: 'Rajshahi', bn: 'রাজশাহী' }, region: { en: 'Rajshahi Division', bn: 'রাজশাহী বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Next day', bn: 'পরদিন' }, zones: ['New Market', 'Shaheb Bazar', 'Uposhohor'], popular: true, metro: false },
  { id: 26, city: { en: 'Bogra', bn: 'বগুড়া' }, region: { en: 'Rajshahi Division', bn: 'রাজশাহী বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Next day', bn: 'পরদিন' }, zones: ['Sadar', 'Shibganj', 'Sonatola'], popular: true, metro: false },
  { id: 33, city: { en: 'Khulna', bn: 'খুলনা' }, region: { en: 'Khulna Division', bn: 'খুলনা বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Next day', bn: 'পরদিন' }, zones: ['Khalishpur', 'Sonadanga', 'Khan Jahan Ali'], popular: true, metro: false },
  { id: 36, city: { en: 'Jessore', bn: 'যশোর' }, region: { en: 'Khulna Division', bn: 'খুলনা বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Next day', bn: 'পরদিন' }, zones: ['Sadar', 'Benapole', 'Jhikargachha'], popular: true, metro: false },
  { id: 43, city: { en: 'Sylhet', bn: 'সিলেট' }, region: { en: 'Sylhet Division', bn: 'সিলেট বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Next day', bn: 'পরদিন' }, zones: ['Zindabazar', 'Ambarkhana', 'Tilagarh'], popular: true, metro: false },
  { id: 47, city: { en: 'Barisal', bn: 'বরিশাল' }, region: { en: 'Barisal Division', bn: 'বরিশাল বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: '1-2 days', bn: '১-২ দিন' }, zones: ['Sadar', 'Kotwali', 'Band Road'], popular: true, metro: false },
  { id: 53, city: { en: 'Rangpur', bn: 'রংপুর' }, region: { en: 'Rangpur Division', bn: 'রংপুর বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Next day', bn: 'পরদিন' }, zones: ['Sadar', 'Mithapukur', 'Badarganj'], popular: true, metro: false },
  { id: 61, city: { en: 'Mymensingh', bn: 'ময়মনসিংহ' }, region: { en: 'Mymensingh Division', bn: 'ময়মনসিংহ বিভাগ' }, country: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, deliveryTime: { en: 'Next day', bn: 'পরদিন' }, zones: ['Sadar', 'Trishal', 'Muktagachha'], popular: true, metro: false }
];

// Utility functions
export const getPopularLocations = (): Location[] => {
  return bangladeshLocations.filter(location => location.popular);
};

export const getLocationsByRegion = (region: string): Location[] => {
  return bangladeshLocations.filter(location => location.region === region);
};

export const searchLocations = (query: string): Location[] => {
  const searchTerm = query.toLowerCase();
  return bangladeshLocations.filter(location =>
    location.city.toLowerCase().includes(searchTerm) ||
    location.region.toLowerCase().includes(searchTerm) ||
    location.zones.some(zone => zone.toLowerCase().includes(searchTerm))
  );
};

export const getLocationById = (id: number): Location | undefined => {
  return bangladeshLocations.find(location => location.id === id);
};

export const getMultiLanguageLocationById = (id: number): MultiLanguageLocation | undefined => {
  return multiLanguageLocations.find(location => location.id === id);
};