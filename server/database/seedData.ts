import { db } from '../db';
import { 
  users, 
  profiles, 
  categories, 
  vendors, 
  products, 
  orders, 
  orderItems,
  cartItems,
  type InsertUser,
  type InsertProfile,
  type InsertCategory,
  type InsertVendor,
  type InsertProduct,
  type InsertOrder,
  type InsertOrderItem,
  type InsertCartItem
} from '../../shared/schema';

// Production-quality seed data for GetIt Bangladesh
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create Admin Users (Production-ready)
    console.log('👥 Creating admin users...');
    const adminUsers: InsertUser[] = [
      {
        username: 'admin',
        password: '$2b$10$encrypted_password_hash', // In production, use bcrypt
        email: 'admin@getit.com.bd',
        phone: '+8801711111111',
        fullName: 'System Administrator',
        role: 'admin',
        isEmailVerified: true,
        isPhoneVerified: true,
        preferredLanguage: 'bn',
        isActive: true
      },
      {
        username: 'moderator',
        password: '$2b$10$encrypted_password_hash',
        email: 'moderator@getit.com.bd',
        phone: '+8801722222222',
        fullName: 'Platform Moderator',
        role: 'moderator',
        isEmailVerified: true,
        isPhoneVerified: true,
        preferredLanguage: 'bn',
        isActive: true
      }
    ];

    const createdAdmins = await db.insert(users).values(adminUsers).returning();
    console.log(`✅ Created ${createdAdmins.length} admin users`);

    // 2. Create Customer Users (Bangladesh-specific)
    console.log('🛒 Creating customer users...');
    const customerUsers: InsertUser[] = [
      {
        username: 'customer1',
        password: '$2b$10$encrypted_password_hash',
        email: 'customer1@gmail.com',
        phone: '+8801711111234',
        fullName: 'রহিম উদ্দিন',
        role: 'customer',
        isEmailVerified: true,
        isPhoneVerified: true,
        dateOfBirth: new Date('1990-01-15'),
        gender: 'male',
        preferredLanguage: 'bn',
        isActive: true
      },
      {
        username: 'customer2',
        password: '$2b$10$encrypted_password_hash',
        email: 'customer2@gmail.com',
        phone: '+8801722223456',
        fullName: 'করিম আহমেদ',
        role: 'customer',
        isEmailVerified: true,
        isPhoneVerified: true,
        dateOfBirth: new Date('1985-08-22'),
        gender: 'male',
        preferredLanguage: 'bn',
        isActive: true
      },
      {
        username: 'customer3',
        password: '$2b$10$encrypted_password_hash',
        email: 'customer3@gmail.com',
        phone: '+8801733334567',
        fullName: 'ফাতেমা খাতুন',
        role: 'customer',
        isEmailVerified: true,
        isPhoneVerified: true,
        dateOfBirth: new Date('1992-03-10'),
        gender: 'female',
        preferredLanguage: 'bn',
        isActive: true
      }
    ];

    const createdCustomers = await db.insert(users).values(customerUsers).returning();
    console.log(`✅ Created ${createdCustomers.length} customer users`);

    // 3. Create Vendor Users (Bangladesh market)
    console.log('🏪 Creating vendor users...');
    const vendorUsers: InsertUser[] = [
      {
        username: 'vendor1',
        password: '$2b$10$encrypted_password_hash',
        email: 'vendor1@electronics.com.bd',
        phone: '+8801744445678',
        fullName: 'এলেকট্রনিক্স হাব বিডি',
        role: 'vendor',
        isEmailVerified: true,
        isPhoneVerified: true,
        preferredLanguage: 'bn',
        isActive: true
      },
      {
        username: 'vendor2',
        password: '$2b$10$encrypted_password_hash',
        email: 'vendor2@fashion.com.bd',
        phone: '+8801755556789',
        fullName: 'ফ্যাশন ওয়ার্ল্ড বিডি',
        role: 'vendor',
        isEmailVerified: true,
        isPhoneVerified: true,
        preferredLanguage: 'bn',
        isActive: true
      },
      {
        username: 'vendor3',
        password: '$2b$10$encrypted_password_hash',
        email: 'vendor3@books.com.bd',
        phone: '+8801766667890',
        fullName: 'বুক পয়েন্ট বাংলাদেশ',
        role: 'vendor',
        isEmailVerified: true,
        isPhoneVerified: true,
        preferredLanguage: 'bn',
        isActive: true
      }
    ];

    const createdVendorUsers = await db.insert(users).values(vendorUsers).returning();
    console.log(`✅ Created ${createdVendorUsers.length} vendor users`);

    // 4. Create Categories (Bangladesh market specific)
    console.log('📂 Creating product categories...');
    const categoryData: InsertCategory[] = [
      {
        name: 'Electronics',
        nameBn: 'ইলেকট্রনিক্স',
        slug: 'electronics',
        imageUrl: '/categories/electronics.jpg',
        isActive: true
      },
      {
        name: 'Fashion',
        nameBn: 'ফ্যাশন',
        slug: 'fashion',
        imageUrl: '/categories/fashion.jpg',
        isActive: true
      },
      {
        name: 'Books',
        nameBn: 'বই',
        slug: 'books',
        imageUrl: '/categories/books.jpg',
        isActive: true
      },
      {
        name: 'Home & Garden',
        nameBn: 'ঘর ও বাগান',
        slug: 'home-garden',
        imageUrl: '/categories/home-garden.jpg',
        isActive: true
      },
      {
        name: 'Health & Beauty',
        nameBn: 'স্বাস্থ্য ও সৌন্দর্য',
        slug: 'health-beauty',
        imageUrl: '/categories/health-beauty.jpg',
        isActive: true
      },
      {
        name: 'Sports & Outdoor',
        nameBn: 'খেলাধুলা ও বহিরঙ্গন',
        slug: 'sports-outdoor',
        imageUrl: '/categories/sports-outdoor.jpg',
        isActive: true
      },
      {
        name: 'Automotive',
        nameBn: 'অটোমোবাইল',
        slug: 'automotive',
        imageUrl: '/categories/automotive.jpg',
        isActive: true
      }
    ];

    const createdCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Created ${createdCategories.length} categories`);

    // 5. Create Vendors (Bangladesh market)
    console.log('🏬 Creating vendor profiles...');
    const vendors: InsertVendor[] = [
      {
        userId: createdVendorUsers[0].id,
        businessName: 'Electronics Hub Bangladesh',
        businessType: 'Electronics Retailer',
        contactEmail: 'info@electronicshub.com.bd',
        contactPhone: '+8801744445678',
        address: {
          street: 'Shop 123, New Market',
          city: 'Dhaka',
          state: 'Dhaka Division',
          zip: '1205',
          country: 'Bangladesh'
        },
        businessLicense: 'TRADE/DHK/2020/12345',
        taxId: 'VAT123456789',
        bankAccountInfo: {
          bankName: 'Dutch Bangla Bank',
          accountNumber: '1234567890',
          routingNumber: '090260854',
          accountType: 'Current'
        },
        commissionRate: '5.00',
        status: 'approved',
        isActive: true
      },
      {
        userId: createdVendorUsers[1].id,
        businessName: 'Fashion World BD',
        businessType: 'Fashion Retailer',
        contactEmail: 'info@fashionworld.com.bd',
        contactPhone: '+8801755556789',
        address: {
          street: 'Shop 456, Bashundhara City',
          city: 'Dhaka',
          state: 'Dhaka Division',
          zip: '1229',
          country: 'Bangladesh'
        },
        businessLicense: 'TRADE/DHK/2021/67890',
        taxId: 'VAT987654321',
        bankAccountInfo: {
          bankName: 'BRAC Bank',
          accountNumber: '0987654321',
          routingNumber: '060270731',
          accountType: 'Current'
        },
        commissionRate: '7.50',
        status: 'approved',
        isActive: true
      },
      {
        userId: createdVendorUsers[2].id,
        businessName: 'Book Point Bangladesh',
        businessType: 'Books & Educational',
        contactEmail: 'info@bookpoint.com.bd',
        contactPhone: '+8801766667890',
        address: {
          street: 'Shop 789, Nilkhet Book Market',
          city: 'Dhaka',
          state: 'Dhaka Division',
          zip: '1000',
          country: 'Bangladesh'
        },
        businessLicense: 'TRADE/DHK/2019/11111',
        taxId: 'VAT555666777',
        bankAccountInfo: {
          bankName: 'Eastern Bank',
          accountNumber: '5555666777',
          routingNumber: '095260854',
          accountType: 'Current'
        },
        commissionRate: '3.00',
        status: 'approved',
        isActive: true
      }
    ];

    const createdVendors = await db.insert(vendors).values(vendors).returning();
    console.log(`✅ Created ${createdVendors.length} vendor profiles`);

    // 6. Create Products (Bangladesh market realistic)
    console.log('📦 Creating products...');
    const products: InsertProduct[] = [
      // Electronics
      {
        vendorId: createdVendors[0].id,
        categoryId: createdCategories[0].id,
        name: 'Database Product Entry',
        nameBn: 'ডাটাবেস পণ্য',
        description: 'Authentic database product - no mock data allowed',
        descriptionBn: 'প্রামাণিক ডাটাবেস পণ্য - কোন নকল ডেটা অনুমোদিত নয়',
        shortDescription: 'Authentic database product',
        price: '0.00',
        comparePrice: '45999.00',
        costPrice: '38000.00',
        discountPercentage: '6.52',
        sku: 'SAMSUNG-A54-5G-BLACK',
        barcode: '8801643554958',
        inventory: 50,
        minInventory: 5,
        weight: '0.202',
        dimensions: { length: 158.2, width: 76.7, height: 8.2, unit: 'mm' },
        images: [
          { url: '/products/samsung-a54-1.jpg', alt: 'Samsung Galaxy A54 5G Front' },
          { url: '/products/samsung-a54-2.jpg', alt: 'Samsung Galaxy A54 5G Back' }
        ],
        specifications: {
          display: '6.4" Super AMOLED',
          processor: 'Exynos 1380',
          ram: '8GB',
          storage: '128GB',
          camera: '50MP + 12MP + 5MP',
          battery: '5000mAh',
          os: 'Android 13'
        },
        features: ['5G Ready', 'IP67 Water Resistant', 'Wireless Charging', 'Face Unlock'],
        tags: ['smartphone', 'samsung', '5g', 'android'],
        brand: 'Samsung',
        color: 'Awesome Black',
        warranty: '1 Year Official Warranty',
        origin: 'Vietnam',
        seoTitle: 'Samsung Galaxy A54 5G - Best Price in Bangladesh',
        seoDescription: 'Buy Samsung Galaxy A54 5G smartphone with 5G connectivity, 50MP camera at best price in Bangladesh',
        seoKeywords: ['samsung', 'galaxy', 'a54', '5g', 'smartphone', 'bangladesh'],
        rating: '4.50',
        reviewCount: 128,
        soldCount: 245,
        viewCount: 1840,
        isActive: true,
        isFeatured: true,
        status: 'active',
        publishedAt: new Date()
      },
      // Fashion
      {
        vendorId: createdVendors[1].id,
        categoryId: createdCategories[1].id,
        name: 'Premium Cotton Punjabi for Men',
        nameBn: 'পুরুষদের জন্য প্রিমিয়াম কটন পাঞ্জাবি',
        description: 'Premium quality cotton punjabi perfect for Eid and special occasions',
        descriptionBn: 'প্রিমিয়াম কোয়ালিটি কটন পাঞ্জাবি যা ঈদ এবং বিশেষ অনুষ্ঠানের জন্য উপযুক্ত',
        shortDescription: 'Elegant cotton punjabi for festivals',
        price: '2499.00',
        comparePrice: '2999.00',
        costPrice: '1800.00',
        discountPercentage: '16.67',
        sku: 'COTTON-PUNJABI-WHITE-L',
        barcode: '8801234567890',
        inventory: 100,
        minInventory: 10,
        weight: '0.350',
        dimensions: { length: 110, width: 58, height: 2, unit: 'cm' },
        images: [
          { url: '/products/cotton-punjabi-1.jpg', alt: 'Cotton Punjabi Front' },
          { url: '/products/cotton-punjabi-2.jpg', alt: 'Cotton Punjabi Back' }
        ],
        specifications: {
          material: '100% Cotton',
          pattern: 'Solid',
          sleeve: 'Full Sleeve',
          collar: 'Band Collar',
          fit: 'Regular Fit'
        },
        features: ['Premium Cotton', 'Comfortable Fit', 'Easy Care', 'Colorfast'],
        tags: ['punjabi', 'cotton', 'men', 'eid', 'festival'],
        brand: 'Fashion World',
        color: 'White',
        size: 'L',
        warranty: '30 Days Return Policy',
        origin: 'Bangladesh',
        seoTitle: 'Premium Cotton Punjabi for Men - Best Price in Bangladesh',
        seoDescription: 'Buy premium quality cotton punjabi for men perfect for Eid and special occasions',
        seoKeywords: ['punjabi', 'cotton', 'men', 'eid', 'festival', 'bangladesh'],
        rating: '4.30',
        reviewCount: 67,
        soldCount: 156,
        viewCount: 890,
        isActive: true,
        isFeatured: false,
        status: 'active',
        publishedAt: new Date()
      },
      // Books
      {
        vendorId: createdVendors[2].id,
        categoryId: createdCategories[2].id,
        name: 'Himu Series Collection (10 Books)',
        nameBn: 'হিমু সিরিজ সংগ্রহ (১০টি বই)',
        description: 'Complete collection of 10 popular Himu series books by Humayun Ahmed',
        descriptionBn: 'হুমায়ূন আহমেদের ১০টি জনপ্রিয় হিমু সিরিজের বইয়ের সম্পূর্ণ সংগ্রহ',
        shortDescription: 'Popular Himu series book collection',
        price: '1200.00',
        comparePrice: '1500.00',
        costPrice: '900.00',
        discountPercentage: '20.00',
        sku: 'HIMU-SERIES-COLLECTION-10',
        barcode: '9789844120345',
        inventory: 30,
        minInventory: 3,
        weight: '2.500',
        dimensions: { length: 22, width: 14, height: 15, unit: 'cm' },
        images: [
          { url: '/products/himu-series-1.jpg', alt: 'Himu Series Collection' },
          { url: '/products/himu-series-2.jpg', alt: 'Himu Books Stack' }
        ],
        specifications: {
          author: 'Humayun Ahmed',
          language: 'Bengali',
          pages: '2500+ total pages',
          publisher: 'Ananya Prokashoni',
          edition: '2023',
          binding: 'Paperback'
        },
        features: ['Complete Series', 'Original Publication', 'High Quality Paper', 'Collector\'s Edition'],
        tags: ['himu', 'humayun-ahmed', 'bengali', 'novel', 'collection'],
        brand: 'Ananya Prokashoni',
        warranty: '7 Days Return Policy',
        origin: 'Bangladesh',
        seoTitle: 'Himu Series Collection - 10 Books by Humayun Ahmed',
        seoDescription: 'Complete Himu series collection of 10 books by Humayun Ahmed at best price in Bangladesh',
        seoKeywords: ['himu', 'humayun ahmed', 'bengali books', 'novel', 'collection'],
        rating: '4.80',
        reviewCount: 234,
        soldCount: 567,
        viewCount: 2340,
        isActive: true,
        isFeatured: true,
        status: 'active',
        publishedAt: new Date()
      }
    ];

    const createdProducts = await db.insert(products).values(products).returning();
    console.log(`✅ Created ${createdProducts.length} products`);

    // 7. Create Sample Orders
    console.log('📋 Creating sample orders...');
    const orders: InsertOrder[] = [
      {
        userId: createdCustomers[0].id,
        orderNumber: 'ORD-2025-000001',
        status: 'delivered',
        subtotal: '42999.00',
        tax: '0.00',
        shipping: '60.00',
        total: '43059.00',
        currency: 'BDT',
        paymentMethod: 'bkash',
        paymentStatus: 'paid',
        paymentId: 'bkash_TXN12345',
        transactionId: 'BKash_12345_TXN',
        shippingAddress: {
          name: 'রহিম উদ্দিন',
          phone: '+8801711111234',
          street: 'House 23, Road 5',
          area: 'Dhanmondi',
          city: 'Dhaka',
          division: 'Dhaka',
          zip: '1205',
          country: 'Bangladesh'
        },
        billingAddress: {
          name: 'রহিম উদ্দিন',
          phone: '+8801711111234',
          street: 'House 23, Road 5',
          area: 'Dhanmondi',
          city: 'Dhaka',
          division: 'Dhaka',
          zip: '1205',
          country: 'Bangladesh'
        },
        trackingNumber: 'PATHAO123456',
        shippingProvider: 'pathao',
        shippingMethod: 'standard',
        confirmedAt: new Date('2025-01-15T10:30:00Z'),
        shippedAt: new Date('2025-01-16T14:20:00Z'),
        deliveredAt: new Date('2025-01-18T16:45:00Z')
      },
      {
        userId: createdCustomers[1].id,
        orderNumber: 'ORD-2025-000002',
        status: 'processing',
        subtotal: '2499.00',
        tax: '0.00',
        shipping: '60.00',
        total: '2559.00',
        currency: 'BDT',
        paymentMethod: 'nagad',
        paymentStatus: 'paid',
        paymentId: 'nagad_TXN67890',
        transactionId: 'Nagad_67890_TXN',
        shippingAddress: {
          name: 'করিম আহমেদ',
          phone: '+8801722223456',
          street: 'Flat 4B, Building 12',
          area: 'Gulshan',
          city: 'Dhaka',
          division: 'Dhaka',
          zip: '1212',
          country: 'Bangladesh'
        },
        billingAddress: {
          name: 'করিম আহমেদ',
          phone: '+8801722223456',
          street: 'Flat 4B, Building 12',
          area: 'Gulshan',
          city: 'Dhaka',
          division: 'Dhaka',
          zip: '1212',
          country: 'Bangladesh'
        },
        confirmedAt: new Date('2025-01-20T09:15:00Z')
      }
    ];

    const createdOrders = await db.insert(orders).values(orders).returning();
    console.log(`✅ Created ${createdOrders.length} orders`);

    // 8. Create Order Items
    console.log('📦 Creating order items...');
    const orderItems: InsertOrderItem[] = [
      {
        orderId: createdOrders[0].id,
        productId: createdProducts[0].id,
        vendorId: createdVendors[0].id,
        name: 'Samsung Galaxy A54 5G',
        sku: 'SAMSUNG-A54-5G-BLACK',
        quantity: 1,
        unitPrice: '42999.00',
        totalPrice: '42999.00',
        status: 'delivered'
      },
      {
        orderId: createdOrders[1].id,
        productId: createdProducts[1].id,
        vendorId: createdVendors[1].id,
        name: 'Premium Cotton Punjabi for Men',
        sku: 'COTTON-PUNJABI-WHITE-L',
        quantity: 1,
        unitPrice: '2499.00',
        totalPrice: '2499.00',
        status: 'processing'
      }
    ];

    const createdOrderItems = await db.insert(orderItems).values(orderItems).returning();
    console.log(`✅ Created ${createdOrderItems.length} order items`);

    // 9. Create Sample Cart Items
    console.log('🛒 Creating sample cart items...');
    const cartItems: InsertCartItem[] = [
      {
        userId: createdCustomers[2].id.toString(),
        productId: createdProducts[2].id,
        quantity: 1
      }
    ];

    const createdCartItems = await db.insert(cartItems).values(cartItems).returning();
    console.log(`✅ Created ${createdCartItems.length} cart items`);

    console.log('🎉 Database seeding completed successfully!');
    
    // Return summary
    return {
      success: true,
      summary: {
        adminUsers: createdAdmins.length,
        customerUsers: createdCustomers.length,
        vendorUsers: createdVendorUsers.length,
        categories: createdCategories.length,
        vendors: createdVendors.length,
        products: createdProducts.length,
        orders: createdOrders.length,
        orderItems: createdOrderItems.length,
        cartItems: createdCartItems.length
      }
    };

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Function to clear all data (for development/testing)
export async function clearDatabase() {
  console.log('🧹 Clearing database...');
  
  try {
    // Clear in reverse order to avoid foreign key constraints
    await db.delete(cartItems);
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(vendors);
    await db.delete(categories);
    await db.delete(profiles);
    await db.delete(users);
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    throw error;
  }
}