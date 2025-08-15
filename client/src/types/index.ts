
// Core types for the GETIT ecommerce platform
export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  role: 'customer' | 'vendor' | 'admin' | 'moderator' | 'user' | 'super_admin';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_bn?: string;
  slug: string;
  image_url?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  name_bn?: string;
  description?: string;
  description_bn?: string;
  sku: string;
  price: number;
  stock_quantity: number;
  images: string[];
  category_id: string;
  vendor_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  trade_license?: string;
  status: 'pending' | 'approved' | 'suspended';
  commission_rate: number;
  rating: number;
  total_sales: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: string;
  payment_method?: 'cash_on_delivery' | 'online_payment' | 'mobile_banking';
  total_amount: number;
  shipping_address: any;
  billing_address?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  vendor: Vendor;
}

export interface WishlistItem {
  id: string;
  product: Product;
  added_at: string;
}
