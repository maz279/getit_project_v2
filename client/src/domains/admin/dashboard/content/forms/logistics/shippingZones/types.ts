
export interface ShippingZone {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  type: 'domestic' | 'international' | 'express' | 'standard';
  coverageArea: number; // in sq km
  cities: string[];
  districts: string[];
  postalCodes: string[];
  deliveryTimeMin: number; // in days
  deliveryTimeMax: number; // in days
  baseCost: number;
  costPerKg: number;
  costPerKm: number;
  freeShippingThreshold: number;
  maxWeight: number; // in kg
  restrictions: string[];
  courierPartners: string[];
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  coordinates: {
    lat: number;
    lng: number;
  }[];
}

export interface ZoneStats {
  totalZones: number;
  activeZones: number;
  inactiveZones: number;
  pendingZones: number;
  totalCoverage: number;
}

export interface ShippingRate {
  id: string;
  zoneId: string;
  weightMin: number;
  weightMax: number;
  rate: number;
  expressRate: number;
  expeditedRate: number;
  insuranceRate: number;
  codFee: number;
  fuelSurcharge: number;
  effectiveFrom: string;
  effectiveTo: string;
}
