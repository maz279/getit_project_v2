import { db } from "./db";
import { users, products, categories, vendors, cartItems, orders } from "@shared/schema";

async function initializeDatabase() {
  console.log('🔄 Initializing database tables...');
  
  try {
    // Check if tables exist by trying to select from them
    await db.select().from(users).limit(1);
    console.log('✅ Users table exists');
  } catch (error) {
    console.log('⚠️ Users table does not exist, creating...');
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" SERIAL PRIMARY KEY,
          "username" TEXT NOT NULL UNIQUE,
          "password" TEXT,
          "email" TEXT UNIQUE,
          "phone" TEXT,
          "full_name" TEXT,
          "avatar" TEXT,
          "role" TEXT DEFAULT 'customer' NOT NULL,
          "is_email_verified" BOOLEAN DEFAULT false,
          "is_phone_verified" BOOLEAN DEFAULT false,
          "date_of_birth" DATE,
          "gender" TEXT,
          "preferred_language" TEXT DEFAULT 'en',
          "is_active" BOOLEAN DEFAULT true,
          "last_login_at" TIMESTAMP,
          "nid_number" TEXT UNIQUE,
          "nid_verified" BOOLEAN DEFAULT false,
          "nid_verified_at" TIMESTAMP,
          "mfa_enabled" BOOLEAN DEFAULT false,
          "mfa_secret" TEXT,
          "mfa_enabled_at" TIMESTAMP,
          "failed_login_attempts" INTEGER DEFAULT 0,
          "locked_until" TIMESTAMP,
          "created_at" TIMESTAMP DEFAULT now(),
          "updated_at" TIMESTAMP DEFAULT now()
        );
      `);
      console.log('✅ Users table created');
    } catch (createError: any) {
      console.log('⚠️ Users table creation failed:', createError?.message || 'Unknown error');
    }
  }

  try {
    await db.select().from(categories).limit(1);
    console.log('✅ Categories table exists');
  } catch (error) {
    console.log('⚠️ Categories table does not exist, creating...');
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS "categories" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          "name" TEXT NOT NULL,
          "description" TEXT,
          "slug" TEXT UNIQUE,
          "parent_id" TEXT,
          "image_url" TEXT,
          "icon" TEXT,
          "is_active" BOOLEAN DEFAULT true,
          "sort_order" INTEGER DEFAULT 0,
          "created_at" TIMESTAMP DEFAULT now(),
          "updated_at" TIMESTAMP DEFAULT now()
        );
      `);
      console.log('✅ Categories table created');
    } catch (createError: any) {
      console.log('⚠️ Categories table creation failed:', createError?.message || 'Unknown error');
    }
  }

  try {
    await db.select().from(vendors).limit(1);
    console.log('✅ Vendors table exists');
  } catch (error) {
    console.log('⚠️ Vendors table does not exist, creating...');
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS "vendors" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          "business_name" TEXT NOT NULL,
          "business_description" TEXT,
          "business_address" TEXT,
          "business_phone" TEXT,
          "business_email" TEXT,
          "business_registration_number" TEXT,
          "tax_id" TEXT,
          "is_verified" BOOLEAN DEFAULT false,
          "is_active" BOOLEAN DEFAULT true,
          "commission_rate" DECIMAL(5,2) DEFAULT 10.00,
          "created_at" TIMESTAMP DEFAULT now(),
          "updated_at" TIMESTAMP DEFAULT now()
        );
      `);
      console.log('✅ Vendors table created');
    } catch (createError: any) {
      console.log('⚠️ Vendors table creation failed:', createError?.message || 'Unknown error');
    }
  }

  try {
    await db.select().from(products).limit(1);
    console.log('✅ Products table exists');
  } catch (error) {
    console.log('⚠️ Products table does not exist, creating...');
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS "products" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          "name" TEXT NOT NULL,
          "description" TEXT,
          "price" DECIMAL(10,2) NOT NULL,
          "original_price" DECIMAL(10,2),
          "sku" TEXT UNIQUE,
          "stock_quantity" INTEGER DEFAULT 0,
          "category_id" TEXT,
          "vendor_id" TEXT,
          "images" TEXT[],
          "is_active" BOOLEAN DEFAULT true,
          "is_featured" BOOLEAN DEFAULT false,
          "weight" DECIMAL(8,2),
          "dimensions" TEXT,
          "created_at" TIMESTAMP DEFAULT now(),
          "updated_at" TIMESTAMP DEFAULT now()
        );
      `);
      console.log('✅ Products table created');
    } catch (createError: any) {
      console.log('⚠️ Products table creation failed:', createError?.message || 'Unknown error');
    }
  }

  try {
    await db.select().from(cartItems).limit(1);
    console.log('✅ Cart items table exists');
  } catch (error) {
    console.log('⚠️ Cart items table does not exist, creating...');
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS "cart_items" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          "user_id" TEXT NOT NULL,
          "product_id" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL DEFAULT 1,
          "price_at_time" DECIMAL(10,2),
          "created_at" TIMESTAMP DEFAULT now(),
          "updated_at" TIMESTAMP DEFAULT now()
        );
      `);
      console.log('✅ Cart items table created');
    } catch (createError: any) {
      console.log('⚠️ Cart items table creation failed:', createError?.message || 'Unknown error');
    }
  }

  try {
    await db.select().from(orders).limit(1);
    console.log('✅ Orders table exists');
  } catch (error) {
    console.log('⚠️ Orders table does not exist, creating...');
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS "orders" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          "user_id" INTEGER NOT NULL,
          "order_number" TEXT UNIQUE,
          "status" TEXT DEFAULT 'pending',
          "total_amount" DECIMAL(10,2) NOT NULL,
          "subtotal" DECIMAL(10,2) NOT NULL,
          "tax_amount" DECIMAL(10,2) DEFAULT 0,
          "shipping_amount" DECIMAL(10,2) DEFAULT 0,
          "discount_amount" DECIMAL(10,2) DEFAULT 0,
          "created_at" TIMESTAMP DEFAULT now(),
          "updated_at" TIMESTAMP DEFAULT now()
        );
      `);
      console.log('✅ Orders table created');
    } catch (createError: any) {
      console.log('⚠️ Orders table creation failed:', createError?.message || 'Unknown error');
    }
  }

  console.log('✅ Database initialization complete');
}

export { initializeDatabase };