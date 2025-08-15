
export interface ProductVendor {
  name: string;
  rating: number;
  location: string;
  verified: boolean;
}

export interface ProductStock {
  status: 'in_stock' | 'limited' | 'out_of_stock' | 'preorder';
  quantity?: number;
}

export interface ProductDelivery {
  estimatedDays: number;
  cod: boolean;
  freeShipping: boolean;
  express: boolean;
}

export interface ProductFeatures {
  emi: boolean;
  priceHistory: boolean;
  trending: boolean;
  festival: boolean;
}

export interface ProductCardProps {
  id: number;
  name: string;
  nameBn?: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendor: ProductVendor;
  stock: ProductStock;
  delivery: ProductDelivery;
  features: ProductFeatures;
  viewMode: 'grid' | 'list' | 'compact';
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  onRemove: (id: number) => void;
  onAddToCart: (id: number) => void;
  onShare: (id: number) => void;
  onQuickView: (id: number) => void;
  onCompare?: (id: number) => void;
}

export interface StockBadgeInfo {
  text: string;
  textBn: string;
  color: string;
}
