import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Truck, 
  Clock, 
  Shield, 
  Package, 
  Star, 
  Navigation,
  ChevronRight,
  Store,
  Heart,
  Search,
  Filter,
  Grid,
  List,
  ArrowLeft,
  Info,
  Phone,
  MessageCircle,
  Globe,
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  Award,
  Gift,
  Crown,
  CheckCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  ShoppingBag,
  Headphones
} from 'lucide-react';

interface DeliveryAreaProps {
  locationId: string;
}

const DeliveryArea: React.FC<DeliveryAreaProps> = ({ locationId }) => {
  const [language, setLanguage] = useState('en');
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('overview');
  const [showServiceMap, setShowServiceMap] = useState(false);

  // Bangladesh locations data (same as in Header component)
  const bangladeshLocations = [
    {
      id: 'dhaka-dhaka',
      city: language === 'bn' ? 'ঢাকা' : 'Dhaka',
      region: language === 'bn' ? 'ঢাকা বিভাগ' : 'Dhaka Division',
      country: language === 'bn' ? 'বাংলাদেশ' : 'Bangladesh',
      deliveryTime: language === 'bn' ? 'একই দিন' : 'Same Day',
      zones: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Wari', 'Old Dhaka'],
      popular: true,
      metro: true,
      description: language === 'bn' ? 'বাংলাদেশের রাজধানী এবং বৃহত্তম শহর। দ্রুততম ডেলিভারি সেবা উপলব্ধ।' : 'Capital and largest city of Bangladesh. Fastest delivery service available.',
      services: ['Same Day Delivery', 'Express Delivery', 'Cash on Delivery', 'Digital Payment', 'Easy Return'],
      features: ['24/7 Support', 'Real-time Tracking', 'Multiple Payment Options', 'Free Shipping', 'Quality Guarantee'],
      businessHours: '6:00 AM - 12:00 AM',
      supportPhone: '+880-1700-000000',
      averageDeliveryTime: '2-4 hours',
      totalOrders: '1.2M+',
      customerRating: 4.8,
      activeVendors: 15000,
      deliveryFee: 60,
      freeShippingMinimum: 500
    },
    {
      id: 'chittagong-chittagong',
      city: language === 'bn' ? 'চট্টগ্রাম' : 'Chittagong',
      region: language === 'bn' ? 'চট্টগ্রাম বিভাগ' : 'Chittagong Division',
      country: language === 'bn' ? 'বাংলাদেশ' : 'Bangladesh',
      deliveryTime: language === 'bn' ? '১-২ দিন' : '1-2 Days',
      zones: ['Chittagong City', 'Hathazari', 'Mirsharai', 'Sitakunda'],
      popular: true,
      metro: false,
      description: language === 'bn' ? 'বাংলাদেশের বাণিজ্যিক রাজধানী এবং প্রধান বন্দর শহর।' : 'Commercial capital and major port city of Bangladesh.',
      services: ['Next Day Delivery', 'Standard Delivery', 'Cash on Delivery', 'Digital Payment', 'Easy Return'],
      features: ['Port City Network', 'Business Hub', 'Industrial Zone Coverage', 'Hill Tracts Delivery'],
      businessHours: '7:00 AM - 11:00 PM',
      supportPhone: '+880-1800-000000',
      averageDeliveryTime: '24-48 hours',
      totalOrders: '450K+',
      customerRating: 4.6,
      activeVendors: 8500,
      deliveryFee: 80,
      freeShippingMinimum: 600
    },
    {
      id: 'sylhet-sylhet',
      city: language === 'bn' ? 'সিলেট' : 'Sylhet',
      region: language === 'bn' ? 'সিলেট বিভাগ' : 'Sylhet Division',
      country: language === 'bn' ? 'বাংলাদেশ' : 'Bangladesh',
      deliveryTime: language === 'bn' ? '১-২ দিন' : '1-2 Days',
      zones: ['Sylhet Sadar', 'Companigonj', 'Dakshin Surma', 'Osmani Nagar'],
      popular: true,
      metro: false,
      description: language === 'bn' ? 'চা শিল্পের শহর এবং প্রবাসী বাংলাদেশীদের প্রধান কেন্দ্র।' : 'Tea capital and major center for expatriate Bangladeshis.',
      services: ['Express Delivery', 'Standard Delivery', 'Cash on Delivery', 'Remittance Payment', 'Tea Garden Delivery'],
      features: ['Expatriate Network', 'Tea Garden Access', 'Cultural Hub', 'Tourist Destination'],
      businessHours: '8:00 AM - 10:00 PM',
      supportPhone: '+880-1900-000000',
      averageDeliveryTime: '24-48 hours',
      totalOrders: '180K+',
      customerRating: 4.4,
      activeVendors: 3200,
      deliveryFee: 100,
      freeShippingMinimum: 700
    }
  ];

  useEffect(() => {
    const location = bangladeshLocations.find(loc => loc.id === locationId);
    setCurrentLocation(location);
  }, [locationId]);

  const handleServiceRequest = (service: string) => {
    console.log(`Service requested: ${service} for ${currentLocation?.city}`);
    // Navigate to service-specific page
    window.location.href = `/services/${service.toLowerCase().replace(/\s+/g, '-')}?location=${locationId}`;
  };

  const handleZoneNavigation = (zone: string) => {
    console.log(`Navigate to zone: ${zone}`);
    // Navigate to zone-specific page
    window.location.href = `/zones/${zone.toLowerCase().replace(/\s+/g, '-')}?location=${locationId}`;
  };

  const handleVendorExploration = () => {
    // Navigate to vendor listing for this location
    window.location.href = `/vendors?location=${locationId}`;
  };

  const handleProductSearch = () => {
    // Navigate to product search for this location
    window.location.href = `/products?location=${locationId}`;
  };

  if (!currentLocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{currentLocation.city}</h1>
                  <p className="text-sm text-gray-600">{currentLocation.region}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{currentLocation.businessHours}</span>
              </div>
              <button 
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="flex items-center space-x-1 text-gray-600 hover:text-orange-600"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'bn' ? 'বাংলা' : 'English'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {language === 'bn' ? `${currentLocation.city} এ স্বাগতম` : `Welcome to ${currentLocation.city}`}
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              {currentLocation.description}
            </p>
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{currentLocation.deliveryTime}</div>
                <div className="text-sm opacity-90">
                  {language === 'bn' ? 'ডেলিভারি সময়' : 'Delivery Time'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentLocation.totalOrders}</div>
                <div className="text-sm opacity-90">
                  {language === 'bn' ? 'সফল অর্ডার' : 'Orders Delivered'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-400 mr-1" />
                  {currentLocation.customerRating}
                </div>
                <div className="text-sm opacity-90">
                  {language === 'bn' ? 'গ্রাহক রেটিং' : 'Customer Rating'}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleProductSearch}
                className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors flex items-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>{language === 'bn' ? 'পণ্য খুঁজুন' : 'Search Products'}</span>
              </button>
              <button
                onClick={handleVendorExploration}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors flex items-center space-x-2"
              >
                <Store className="h-5 w-5" />
                <span>{language === 'bn' ? 'দোকান দেখুন' : 'Explore Vendors'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', name: language === 'bn' ? 'পরিসেবা' : 'Services', icon: Package },
              { id: 'zones', name: language === 'bn' ? 'এলাকা' : 'Zones', icon: MapPin },
              { id: 'vendors', name: language === 'bn' ? 'দোকান' : 'Vendors', icon: Store },
              { id: 'support', name: language === 'bn' ? 'সহায়তা' : 'Support', icon: Headphones }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'bn' ? 'ডেলিভারি ফি' : 'Delivery Fee'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">৳{currentLocation.deliveryFee}</p>
                  </div>
                  <Truck className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'bn' ? 'ফ্রি শিপিং' : 'Free Shipping'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">৳{currentLocation.freeShippingMinimum}+</p>
                  </div>
                  <Gift className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'bn' ? 'সক্রিয় দোকান' : 'Active Vendors'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{currentLocation.activeVendors.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'bn' ? 'গড় ডেলিভারি' : 'Avg Delivery'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{currentLocation.averageDeliveryTime}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'bn' ? 'উপলব্ধ সেবা' : 'Available Services'}
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentLocation.services.map((service: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleServiceRequest(service)}
                      className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 hover:border-orange-200 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-gray-900">{service}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'bn' ? 'বিশেষ বৈশিষ্ট্য' : 'Special Features'}
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentLocation.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-orange-500" />
                      <span className="text-gray-900">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'bn' ? 'ডেলিভারি এলাকা' : 'Delivery Zones'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'bn' ? 'আপনার এলাকা নির্বাচন করুন' : 'Select your specific area'}
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentLocation.zones.map((zone: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleZoneNavigation(zone)}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:border-orange-200 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{zone}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'bn' ? 'স্থানীয় দোকান' : 'Local Vendors'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'bn' ? 'এই এলাকার জনপ্রিয় দোকানগুলি' : 'Popular vendors in this area'}
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {language === 'bn' ? 'দোকানের তালিকা লোড হচ্ছে' : 'Loading vendor directory'}
                  </h3>
                  <button
                    onClick={handleVendorExploration}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {language === 'bn' ? 'সব দোকান দেখুন' : 'View All Vendors'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'bn' ? 'গ্রাহক সহায়তা' : 'Customer Support'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'bn' ? '২৪/৭ সহায়তা উপলব্ধ' : '24/7 support available'}
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === 'bn' ? 'ফোন সাপোর্ট' : 'Phone Support'}
                        </p>
                        <p className="text-sm text-gray-600">{currentLocation.supportPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'bn' ? 'তাৎক্ষণিক সহায়তা' : 'Instant assistance'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === 'bn' ? 'সেবার সময়' : 'Service Hours'}
                        </p>
                        <p className="text-sm text-gray-600">{currentLocation.businessHours}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Info className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === 'bn' ? 'সাহায্য কেন্দ্র' : 'Help Center'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'bn' ? 'FAQ ও গাইড' : 'FAQ & guides'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryArea;