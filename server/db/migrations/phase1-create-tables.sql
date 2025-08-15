-- Phase 1 Database Architecture Migration
-- Creates service-specific tables for database-per-service pattern
-- Target: Amazon.com/Shopee.sg enterprise standards

-- User Service Database Tables
CREATE SCHEMA IF NOT EXISTS user_service;

-- Core users table with enterprise features
CREATE TABLE IF NOT EXISTS user_service.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  phone_country_code VARCHAR(5) DEFAULT '+880',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Bangladesh-specific fields
  nid_number VARCHAR(20),
  nid_verified BOOLEAN DEFAULT false,
  preferred_language VARCHAR(10) DEFAULT 'bn',
  preferred_currency VARCHAR(10) DEFAULT 'BDT',
  
  -- Enterprise metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  
  -- Indexes for performance
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_phone (phone),
  INDEX idx_created_at (created_at)
);

-- User profiles with extended information
CREATE TABLE IF NOT EXISTS user_service.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES user_service.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  
  -- Bangladesh cultural fields
  religion VARCHAR(50),
  marital_status VARCHAR(50),
  occupation VARCHAR(100),
  monthly_income_range VARCHAR(50),
  
  -- Preferences
  notification_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User addresses for multi-address support
CREATE TABLE IF NOT EXISTS user_service.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_service.users(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'shipping', -- shipping, billing, pickup
  is_default BOOLEAN DEFAULT false,
  
  -- Address fields
  label VARCHAR(100),
  recipient_name VARCHAR(200),
  phone VARCHAR(20),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  
  -- Bangladesh-specific addressing
  division VARCHAR(100),
  district VARCHAR(100),
  upazila VARCHAR(100),
  union_name VARCHAR(100),
  village VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- Geolocation for delivery optimization
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_addresses_user_id (user_id)
);

-- Product Service Database Tables
CREATE SCHEMA IF NOT EXISTS product_service;

-- Categories with hierarchical support
CREATE TABLE IF NOT EXISTS product_service.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES product_service.categories(id) ON DELETE SET NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_bn VARCHAR(255),
  description_en TEXT,
  description_bn TEXT,
  icon_url TEXT,
  banner_url TEXT,
  
  -- SEO fields
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Hierarchy management
  level INTEGER DEFAULT 0,
  path TEXT[], -- Array of ancestor IDs for fast queries
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_parent_id (parent_id),
  INDEX idx_slug (slug),
  INDEX idx_level (level)
);

-- Products with enterprise features
CREATE TABLE IF NOT EXISTS product_service.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  vendor_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES product_service.categories(id),
  
  -- Multilingual content
  name_en VARCHAR(500) NOT NULL,
  name_bn VARCHAR(500),
  description_en TEXT,
  description_bn TEXT,
  
  -- Pricing with currency support
  base_price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BDT',
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  discount_valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Inventory tracking
  stock_quantity INTEGER DEFAULT 0,
  stock_status VARCHAR(50) DEFAULT 'in_stock',
  low_stock_threshold INTEGER DEFAULT 10,
  
  -- Product attributes
  brand VARCHAR(255),
  weight DECIMAL(10, 3), -- in kg
  dimensions JSONB, -- {length, width, height, unit}
  color VARCHAR(100),
  size VARCHAR(50),
  material VARCHAR(255),
  
  -- Bangladesh-specific
  is_halal_certified BOOLEAN DEFAULT false,
  country_of_origin VARCHAR(100),
  import_license_number VARCHAR(100),
  
  -- Media
  primary_image_url TEXT,
  image_urls TEXT[],
  video_urls TEXT[],
  
  -- SEO
  slug VARCHAR(500) UNIQUE NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Ratings and reviews
  rating_average DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Flags and status
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  
  INDEX idx_vendor_id (vendor_id),
  INDEX idx_category_id (category_id),
  INDEX idx_sku (sku),
  INDEX idx_slug (slug),
  INDEX idx_price (base_price),
  INDEX idx_rating (rating_average),
  INDEX idx_created_at (created_at)
);

-- Product variants for size/color combinations
CREATE TABLE IF NOT EXISTS product_service.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES product_service.products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  
  -- Variant attributes
  attributes JSONB NOT NULL, -- {color: "Red", size: "XL", etc}
  
  -- Pricing override
  price_adjustment DECIMAL(12, 2) DEFAULT 0,
  
  -- Stock management
  stock_quantity INTEGER DEFAULT 0,
  
  -- Media
  image_url TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_product_id (product_id)
);

-- Order Service Database Tables
CREATE SCHEMA IF NOT EXISTS order_service;

-- Orders with comprehensive tracking
CREATE TABLE IF NOT EXISTS order_service.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  
  -- Order totals
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  shipping_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BDT',
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled',
  
  -- Payment information
  payment_method VARCHAR(50),
  payment_provider VARCHAR(50), -- bKash, Nagad, Rocket, Card, COD
  payment_transaction_id VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Shipping information
  shipping_method VARCHAR(100),
  shipping_provider VARCHAR(100),
  tracking_number VARCHAR(255),
  estimated_delivery_date DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Address snapshot
  billing_address JSONB,
  shipping_address JSONB,
  
  -- Additional data
  notes TEXT,
  internal_notes TEXT,
  customer_notes TEXT,
  
  -- Metadata
  source VARCHAR(50) DEFAULT 'web', -- web, mobile, api, pos
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_order_number (order_number),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Order items
CREATE TABLE IF NOT EXISTS order_service.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES order_service.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID,
  
  -- Product snapshot at time of order
  product_name VARCHAR(500) NOT NULL,
  product_sku VARCHAR(100),
  product_image_url TEXT,
  
  -- Pricing
  unit_price DECIMAL(12, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  
  -- Fulfillment
  fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled',
  shipped_quantity INTEGER DEFAULT 0,
  returned_quantity INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
);

-- Order status history
CREATE TABLE IF NOT EXISTS order_service.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES order_service.orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  previous_status VARCHAR(50),
  changed_by UUID,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_order_id (order_id),
  INDEX idx_created_at (created_at)
);

-- Create update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON user_service.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_service.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_service.user_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON product_service.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON product_service.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON order_service.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Performance optimization indexes
CREATE INDEX idx_users_email_password ON user_service.users(email, password_hash);
CREATE INDEX idx_products_search ON product_service.products USING gin(to_tsvector('english', name_en || ' ' || COALESCE(description_en, '')));
CREATE INDEX idx_orders_date_range ON order_service.orders(created_at, user_id);

-- Grant permissions (adjust based on your database users)
GRANT ALL ON SCHEMA user_service TO getit_app;
GRANT ALL ON SCHEMA product_service TO getit_app;
GRANT ALL ON SCHEMA order_service TO getit_app;
GRANT ALL ON ALL TABLES IN SCHEMA user_service TO getit_app;
GRANT ALL ON ALL TABLES IN SCHEMA product_service TO getit_app;
GRANT ALL ON ALL TABLES IN SCHEMA order_service TO getit_app;