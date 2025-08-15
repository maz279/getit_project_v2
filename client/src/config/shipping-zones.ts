// Bangladesh Shipping Zones & Courier Services Configuration
export const SHIPPING_ZONES = {
  DHAKA_METRO: {
    id: 'dhaka_metro',
    name: 'Dhaka Metropolitan',
    code: 'DM',
    areas: [
      'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur',
      'Wari', 'Old Dhaka', 'Ramna', 'Tejgaon', 'Savar', 'Keraniganj',
      'Pallabi', 'Shah Ali', 'Turag', 'Dakshinkhan', 'Rupganj'
    ],
    baseShippingCost: 60,
    freeShippingThreshold: 1000,
    deliveryTime: {
      standard: '1-2 days',
      express: '4-6 hours',
      sameDay: '2-4 hours'
    },
    supportedServices: ['pathao', 'paperfly', 'sundarban', 'redx', 'ecourier', 'cod']
  },
  CHITTAGONG: {
    id: 'chittagong',
    name: 'Chittagong Division',
    code: 'CT',
    areas: [
      'Chittagong City', 'Coxs Bazar', 'Comilla', 'Feni', 'Brahmanbaria',
      'Rangamati', 'Bandarban', 'Khagrachhari', 'Noakhali', 'Lakshmipur', 'Chandpur'
    ],
    baseShippingCost: 120,
    freeShippingThreshold: 1500,
    deliveryTime: {
      standard: '2-3 days',
      express: '1-2 days'
    },
    supportedServices: ['pathao', 'sundarban', 'redx', 'cod']
  },
  SYLHET: {
    id: 'sylhet',
    name: 'Sylhet Division',
    code: 'SY',
    areas: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
    baseShippingCost: 150,
    freeShippingThreshold: 2000,
    deliveryTime: {
      standard: '3-4 days',
      express: '2-3 days'
    },
    supportedServices: ['sundarban', 'redx', 'cod']
  },
  RAJSHAHI: {
    id: 'rajshahi',
    name: 'Rajshahi Division',
    code: 'RJ',
    areas: [
      'Rajshahi', 'Bogra', 'Pabna', 'Sirajganj', 'Natore', 'Naogaon',
      'Nawabganj', 'Joypurhat'
    ],
    baseShippingCost: 130,
    freeShippingThreshold: 1800,
    deliveryTime: {
      standard: '3-4 days',
      express: '2-3 days'
    },
    supportedServices: ['sundarban', 'redx', 'cod']
  },
  KHULNA: {
    id: 'khulna',
    name: 'Khulna Division',
    code: 'KH',
    areas: [
      'Khulna', 'Jessore', 'Satkhira', 'Narail', 'Bagerhat', 'Chuadanga',
      'Kushtia', 'Meherpur', 'Magura', 'Jhenaidah'
    ],
    baseShippingCost: 140,
    freeShippingThreshold: 1800,
    deliveryTime: {
      standard: '3-4 days',
      express: '2-3 days'
    },
    supportedServices: ['sundarban', 'redx', 'cod']
  },
  BARISHAL: {
    id: 'barishal',
    name: 'Barishal Division',
    code: 'BR',
    areas: ['Barishal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna'],
    baseShippingCost: 160,
    freeShippingThreshold: 2000,
    deliveryTime: {
      standard: '4-5 days',
      express: '3-4 days'
    },
    supportedServices: ['sundarban', 'redx', 'cod']
  },
  RANGPUR: {
    id: 'rangpur',
    name: 'Rangpur Division',
    code: 'RP',
    areas: [
      'Rangpur', 'Dinajpur', 'Kurigram', 'Gaibandha', 'Lalmonirhat',
      'Nilphamari', 'Thakurgaon', 'Panchagarh'
    ],
    baseShippingCost: 180,
    freeShippingThreshold: 2200,
    deliveryTime: {
      standard: '4-5 days',
      express: '3-4 days'
    },
    supportedServices: ['sundarban', 'redx', 'cod']
  },
  MYMENSINGH: {
    id: 'mymensingh',
    name: 'Mymensingh Division',
    code: 'MY',
    areas: ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrokona'],
    baseShippingCost: 120,
    freeShippingThreshold: 1600,
    deliveryTime: {
      standard: '2-3 days',
      express: '1-2 days'
    },
    supportedServices: ['sundarban', 'redx', 'cod']
  }
};

export const COURIER_SERVICES = {
  PATHAO: {
    id: 'pathao',
    name: 'Pathao Courier',
    displayName: 'Pathao',
    logo: '/assets/images/shipping/pathao-logo.png',
    enabled: true,
    coverage: ['dhaka_metro', 'chittagong'],
    services: {
      standard: {
        name: 'Standard Delivery',
        costMultiplier: 1.0,
        deliveryTime: 'standard'
      },
      express: {
        name: 'Express Delivery',
        costMultiplier: 1.5,
        deliveryTime: 'express'
      },
      sameDay: {
        name: 'Same Day Delivery',
        costMultiplier: 2.5,
        deliveryTime: 'sameDay',
        cutoffTime: '14:00',
        availableZones: ['dhaka_metro']
      }
    },
    trackingUrl: 'https://merchant.pathao.com/tracking',
    apiEndpoint: 'https://api-hermes.pathao.com/api/v1',
    description: 'Fast and reliable delivery service by Pathao'
  },
  PAPERFLY: {
    id: 'paperfly',
    name: 'Paperfly',
    displayName: 'Paperfly',
    logo: '/assets/images/shipping/paperfly-logo.png',
    enabled: true,
    coverage: ['dhaka_metro'],
    services: {
      standard: {
        name: 'Regular Delivery',
        costMultiplier: 1.0,
        deliveryTime: 'standard'
      },
      express: {
        name: 'Express Delivery',
        costMultiplier: 1.8,
        deliveryTime: 'express'
      }
    },
    trackingUrl: 'https://paperfly.com.bd/tracking',
    apiEndpoint: 'https://api.paperfly.com.bd/v1',
    description: 'Professional courier service with excellent tracking'
  },
  SUNDARBAN: {
    id: 'sundarban',
    name: 'Sundarban Courier',
    displayName: 'Sundarban',
    logo: '/assets/images/shipping/sundarban-logo.png',
    enabled: true,
    coverage: ['dhaka_metro', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barishal', 'rangpur', 'mymensingh'],
    services: {
      standard: {
        name: 'Regular Service',
        costMultiplier: 1.0,
        deliveryTime: 'standard'
      },
      express: {
        name: 'Express Service',
        costMultiplier: 1.6,
        deliveryTime: 'express'
      }
    },
    trackingUrl: 'https://sundarbanlogistics.com/tracking',
    apiEndpoint: 'https://api.sundarbanlogistics.com/v2',
    description: 'Nationwide coverage with reliable delivery service'
  },
  REDX: {
    id: 'redx',
    name: 'RedX',
    displayName: 'RedX',
    logo: '/assets/images/shipping/redx-logo.png',
    enabled: true,
    coverage: ['dhaka_metro', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barishal', 'rangpur', 'mymensingh'],
    services: {
      standard: {
        name: 'Standard Delivery',
        costMultiplier: 1.0,
        deliveryTime: 'standard'
      },
      express: {
        name: 'Express Delivery',
        costMultiplier: 1.7,
        deliveryTime: 'express'
      }
    },
    trackingUrl: 'https://redx.com.bd/tracking',
    apiEndpoint: 'https://openapi.redx.com.bd/v1.0.0-beta',
    description: 'Modern logistics solution with nationwide network'
  },
  ECOURIER: {
    id: 'ecourier',
    name: 'eCourier',
    displayName: 'eCourier',
    logo: '/assets/images/shipping/ecourier-logo.png',
    enabled: true,
    coverage: ['dhaka_metro'],
    services: {
      standard: {
        name: 'Regular Delivery',
        costMultiplier: 1.0,
        deliveryTime: 'standard'
      },
      express: {
        name: 'Express Delivery',
        costMultiplier: 1.9,
        deliveryTime: 'express'
      }
    },
    trackingUrl: 'https://www.ecourier.com.bd/tracking',
    apiEndpoint: 'https://backoffice.ecourier.com.bd/api',
    description: 'Technology-driven delivery service'
  }
};

export const PICKUP_POINTS = {
  dhaka_metro: [
    {
      id: 'dhanmondi_27',
      name: 'GetIt Pickup - Dhanmondi 27',
      address: 'House 45, Road 27, Dhanmondi, Dhaka 1209',
      coordinates: { lat: 23.7461, lng: 90.3712 },
      hours: '9:00 AM - 9:00 PM',
      phone: '+880 1711-123456',
      facilities: ['parking', 'ac', 'security']
    },
    {
      id: 'gulshan_2',
      name: 'GetIt Pickup - Gulshan Circle 2',
      address: 'Plot 123, Gulshan Avenue, Gulshan 2, Dhaka 1212',
      coordinates: { lat: 23.7925, lng: 90.4078 },
      hours: '10:00 AM - 10:00 PM',
      phone: '+880 1722-234567',
      facilities: ['parking', 'ac', 'security', 'wifi']
    },
    {
      id: 'uttara_sector_7',
      name: 'GetIt Pickup - Uttara Sector 7',
      address: 'House 25, Road 12, Sector 7, Uttara, Dhaka 1230',
      coordinates: { lat: 23.8759, lng: 90.3795 },
      hours: '9:00 AM - 9:00 PM',
      phone: '+880 1733-345678',
      facilities: ['parking', 'security']
    }
  ],
  chittagong: [
    {
      id: 'agrabad',
      name: 'GetIt Pickup - Agrabad',
      address: 'Shop 15, Agrabad Commercial Area, Chittagong',
      coordinates: { lat: 22.3569, lng: 91.7832 },
      hours: '9:00 AM - 8:00 PM',
      phone: '+880 1744-456789',
      facilities: ['ac', 'security']
    }
  ]
};

export const getShippingZone = (zoneId: string) => {
  return SHIPPING_ZONES[zoneId.toUpperCase() as keyof typeof SHIPPING_ZONES];
};

export const getCourierService = (serviceId: string) => {
  return COURIER_SERVICES[serviceId.toUpperCase() as keyof typeof COURIER_SERVICES];
};

export const getAvailableCouriers = (zoneId: string) => {
  const zone = getShippingZone(zoneId);
  if (!zone) return [];
  
  return Object.values(COURIER_SERVICES).filter(courier => 
    courier.enabled && courier.coverage.includes(zoneId)
  );
};

export const calculateShippingCost = (
  zoneId: string, 
  serviceId: string, 
  serviceType: string = 'standard',
  orderValue: number = 0
) => {
  const zone = getShippingZone(zoneId);
  const courier = getCourierService(serviceId);
  
  if (!zone || !courier) return 0;
  
  // Check if order qualifies for free shipping
  if (orderValue >= zone.freeShippingThreshold) return 0;
  
  const service = courier.services[serviceType as keyof typeof courier.services];
  if (!service) return zone.baseShippingCost;
  
  return Math.round(zone.baseShippingCost * service.costMultiplier);
};

export const getDeliveryTime = (zoneId: string, serviceType: string = 'standard') => {
  const zone = getShippingZone(zoneId);
  if (!zone) return 'Unknown';
  
  return zone.deliveryTime[serviceType as keyof typeof zone.deliveryTime] || zone.deliveryTime.standard;
};

export const isSameDayAvailable = (zoneId: string, currentTime: Date = new Date()) => {
  const dhakaCouriers = getAvailableCouriers('dhaka_metro');
  const pathaoCourier = dhakaCouriers.find(c => c.id === 'pathao');
  
  if (zoneId !== 'dhaka_metro' || !pathaoCourier) return false;
  
  const cutoffTime = new Date();
  cutoffTime.setHours(14, 0, 0, 0); // 2:00 PM cutoff
  
  return currentTime < cutoffTime;
};

export const getPickupPoints = (zoneId: string) => {
  return PICKUP_POINTS[zoneId] || [];
};

export const POSTAL_CODES = {
  dhaka: ['1000', '1100', '1200', '1205', '1206', '1207', '1208', '1209', '1210', '1211', '1212', '1213', '1214', '1215', '1216', '1217', '1218', '1219', '1220', '1221', '1222', '1223', '1224', '1225', '1226', '1227', '1228', '1229', '1230'],
  chittagong: ['4000', '4100', '4200', '4201', '4202', '4203', '4204', '4205', '4206', '4207', '4208', '4209', '4210', '4211', '4212', '4213', '4214', '4215', '4216', '4217', '4218', '4219', '4220'],
  sylhet: ['3100', '3101', '3102', '3103', '3104', '3105', '3106', '3107', '3108', '3109', '3110', '3111', '3112', '3113', '3114', '3115'],
  rajshahi: ['6000', '6100', '6200', '6201', '6202', '6203', '6204', '6205', '6206', '6207', '6208', '6209', '6210', '6211', '6212'],
  khulna: ['9000', '9100', '9200', '9201', '9202', '9203', '9204', '9205', '9206', '9207', '9208', '9209', '9210', '9211'],
  barishal: ['8200', '8201', '8202', '8203', '8204', '8205', '8206', '8207', '8208', '8209', '8210', '8211', '8212'],
  rangpur: ['5400', '5401', '5402', '5403', '5404', '5405', '5406', '5407', '5408', '5409', '5410', '5411', '5412'],
  mymensingh: ['2200', '2201', '2202', '2203', '2204', '2205', '2206', '2207', '2208', '2209', '2210', '2211']
};