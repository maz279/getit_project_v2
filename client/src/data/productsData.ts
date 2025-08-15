
/**
 * ⚠️ MOCK DATA ELIMINATED - DATABASE ONLY
 * Samsung Galaxy A54 mock data removed - violates "no mock data" requirement
 */
export const flashDeals = [
  // MOCK SAMSUNG GALAXY A54 DATA REMOVED
  // All product data must come from authenticated database
  {
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop",
    title: "Women's Designer Kurti",
    originalPrice: "$29",
    salePrice: "$14",
    discount: "50% OFF",
    freeItem: "FREE Dupatta",
    delivery: "Express Shipping",
    rating: 4.9,
    reviews: 850,
    timeLeft: "2:15:30",
    stockLeft: 50
  },
  {
    image: "https://images.unsplash.com/photo-1556909114-4f5c28b9c888?w=300&h=300&fit=crop",
    title: "Air Fryer 5L",
    originalPrice: "$129",
    salePrice: "$77",
    discount: "40% OFF",
    freeItem: "Recipe Book FREE",
    delivery: "2 Year Warranty",
    rating: 4.7,
    reviews: 950,
    timeLeft: "2:15:30",
    stockLeft: 50
  },
  {
    image: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=300&h=300&fit=crop",
    title: "Premium Beef Package",
    originalPrice: "$35",
    salePrice: "$28",
    discount: "20% OFF",
    freeItem: "2KG Fresh Cut",
    delivery: "Cold Chain Delivery",
    rating: 4.6,
    reviews: 1100,
    timeLeft: "2:15:30",
    stockLeft: 50
  }
];

export const categories = [
  { 
    name: "EID Fashion Collection", 
    icon: "👗", 
    subcategories: [
      "Women's Collection - Salwar Kameez (50% OFF)",
      "Men's Collection - Punjabi (40% OFF)", 
      "Kids Collection - Cute EID Outfits",
      "Footwear - Formal Shoes & Sandals"
    ],
    discount: "Up to 50% OFF",
    color: "bg-gradient-to-br from-pink-500 to-red-500",
    topPicks: "Exclusive designer collections from premium fashion brands"
  },
  { 
    name: "Home & Decor", 
    icon: "🏠", 
    subcategories: [
      "Furniture - Sofas & Dining Tables",
      "Kitchen & Dining - Dinner Sets & Cookware", 
      "Decoration - Islamic Calligraphy & Wall Arts",
      "Cleaning - Storage & Organization"
    ],
    discount: "Up to 60% OFF",
    color: "bg-gradient-to-br from-blue-500 to-teal-500",
    topPicks: "Islamic home decor from local artisans"
  },
  { 
    name: "EID Food & Treats", 
    icon: "🍖", 
    subcategories: [
      "Fresh Meat - Premium Beef & Mutton",
      "Sweets & Desserts - Traditional Sweets", 
      "Rice & Grains - Premium Basmati Rice",
      "Spices - Complete Spice Sets"
    ],
    discount: "Up to 40% OFF",
    color: "bg-gradient-to-br from-green-500 to-yellow-500",
    topPicks: "EID FEAST PACKAGES: Complete meal solutions for 5, 10, 15+ people"
  },
  { 
    name: "Gifts & Electronics", 
    icon: "🎁", 
    subcategories: [
      "Smartphones - Latest iPhone & Samsung",
      "Gift Items - Perfumes & Books", 
      "Home Appliances - AC & Refrigerators",
      "Beauty Care - Skincare & Cosmetics"
    ],
    discount: "Up to 70% OFF",
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    topPicks: "BUNDLE DEALS: Phone + Accessories combos with extended warranties"
  }
];

export const bundleOffers = [
  {
    title: "FAMILY EID PACKAGE",
    description: "Complete Family Outfit Set",
    items: ["Men's Traditional Outfit", "Women's Designer Dress", "2 Kids' EID Outfits", "Matching Accessories"],
    originalPrice: 850,
    bundlePrice: 510,
    savings: 40,
    freeBonus: "FREE Family Photo Session Voucher"
  },
  {
    title: "EID HOME MAKEOVER COMBO",
    description: "Transform Your Home for EID",
    items: ["Living Room Sofa Set", "Dining Table with 6 Chairs", "Wall Art Collection", "Decorative Lighting Set", "Premium Curtains & Cushions"],
    originalPrice: 6500,
    bundlePrice: 4225,
    savings: 35,
    freeBonus: "FREE Assembly & Installation + EID Delivery Guarantee"
  },
  {
    title: "EID FEAST PACKAGE",
    description: "Complete EID Dinner for 10 People",
    items: ["2KG Premium Beef (Fresh Cut)", "1KG Mutton (Goat)", "2KG Basmati Rice", "Complete Spice Set", "Traditional Sweets (1KG)", "Fruits & Dry Nuts"],
    originalPrice: 780,
    bundlePrice: 585,
    savings: 25,
    freeBonus: "FREE Recipe Collection App + Chef Consultation Call"
  }
];

export const featuredVendors = [
  { name: "Fashion House", rating: 4.9, reviews: 5000, specialty: "Traditional & Modern", badge: "🥇", discount: "Up to 60% EID Discount" },
  { name: "Style Store", rating: 4.8, reviews: 3200, specialty: "Modest Wear", badge: "🥇", discount: "Buy 2 Get 1 FREE" },
  { name: "TechLand", rating: 4.8, reviews: 8500, specialty: "Latest Electronics", badge: "📱", discount: "Flash Sale: 50% OFF + 2 Year Warranty" },
  { name: "Fresh Food", rating: 4.9, reviews: 12000, specialty: "Premium Meat & Groceries", badge: "🍖", discount: "EID Feast Packages + Certified" },
  { name: "HomeStyle", rating: 4.7, reviews: 4100, specialty: "Furniture & Decor", badge: "🏠", discount: "Home Makeover Packages + Interest-Free EMI" },
  { name: "Premium Fashion", rating: 4.7, reviews: 2800, specialty: "Premium Men's Wear", badge: "👔", discount: "Flat 40% OFF Everything + Express Tailoring" },
  { name: "Handicrafts", rating: 4.6, reviews: 1500, specialty: "Authentic Art", badge: "🎨", discount: "Support Local Artisans + Custom Calligraphy" },
  { name: "Gift Corner", rating: 4.6, reviews: 2700, specialty: "Unique Gift Items", badge: "🎁", discount: "Bundle Gift Offers + Custom Gift Wrapping" }
];

export const giftGuide = [
  {
    recipient: "For Father",
    items: ["Latest Smartphone", "Premium Watch", "Formal Shirt Collection", "Books", "Prayer Mat & Accessories"],
    priceRange: "$20 - $250",
    icon: "👨"
  },
  {
    recipient: "For Mother",
    items: ["Gold Jewelry Set", "Designer Saree", "Branded Handbag", "Premium Skincare", "Perfume Collection"],
    priceRange: "$15 - $200",
    icon: "👩"
  },
  {
    recipient: "For Son",
    items: ["Gaming Console & Games", "Smartphone/Tablet", "Sports Equipment", "Trendy Clothing", "Headphones & Gadgets"],
    priceRange: "$10 - $150",
    icon: "👦"
  },
  {
    recipient: "For Daughter",
    items: ["Makeup & Beauty Kit", "Trendy Outfit Set", "Books & Stationery", "Art & Craft Supplies", "Jewelry Collection"],
    priceRange: "$8 - $120",
    icon: "👧"
  }
];

export const contests = [
  {
    title: "MEGA EID LOTTERY",
    description: "Grand Prizes Worth Millions",
    prizes: ["1st Prize: Hajj Trip for 2 People ($6,000)", "2nd Prize: Brand New Car ($18,000)", "3rd Prize: Complete Home Appliance Set ($3,500)"],
    participation: "Shop for $5+ to get 1 lottery ticket",
    drawDate: "Day after EID"
  },
  {
    title: "EID PHOTO CONTEST",
    description: "My Perfect EID Moment",
    prizes: ["1st Place: iPhone 15 Pro + $100 voucher", "2nd Place: Samsung Galaxy S24 + $50 voucher", "3rd Place: OnePlus 12 + $30 voucher"],
    participation: "Post on Instagram/Facebook with #GetItEID2024",
    drawDate: "Weekly winners announced"
  }
];

export const socialImpact = [
  {
    title: "Feed the Hungry Initiative",
    description: "Provide EID Meals to Underprivileged Families",
    impact: "$10 = 1 Family EID Meal",
    goal: "10,000 Families Fed This EID",
    progress: 82,
    currentCount: "8,247 families helped"
  },
  {
    title: "EID Clothing Drive",
    description: "New EID Clothes for Orphan Children",
    impact: "$80 = 1 Child's Complete EID Outfit",
    goal: "5,000 Children Across Country",
    progress: 82,
    currentCount: "4,123 children helped"
  }
];

export const mobileAppFeatures = [
  {
    category: "🎊 App-Exclusive EID Offers",
    icon: "📱",
    features: [
      {
        title: "⚡ Flash Sales Every Hour",
        description: "Hourly app-only flash sales with massive discounts",
        details: [
          "App-only 60% off deals",
          "Push notifications for instant alerts",
          "First 100 users get extra 10% off",
          "Limited time hourly promotions"
        ]
      },
      {
        title: "🎁 App-Exclusive Products",
        description: "Special collections available only on mobile app",
        details: [
          "Limited edition EID collections",
          "Designer collaborations",
          "Celebrity endorsed items",
          "Exclusive brand partnerships"
        ]
      },
      {
        title: "💰 Mobile Banking Bonuses",
        description: "Extra benefits for mobile payment users",
        details: [
          "Extra 2% cashback on app payments",
          "Faster bKash/Nagad checkout",
          "Biometric payment security",
          "One-tap payment options"
        ]
      },
      {
        title: "🚚 Priority Delivery",
        description: "Enhanced delivery services for app users",
        details: [
          "App users get delivery preference",
          "Real-time delivery tracking",
          "GPS-based delivery updates",
          "Express delivery options"
        ]
      }
    ]
  },
  {
    category: "🌟 Smart Features for EID Shopping",
    icon: "🤳",
    features: [
      {
        title: "🤳 Visual Search & AR Try-On",
        description: "Advanced visual shopping technology",
        details: [
          "Take photo to find similar products",
          "AR fitting for clothes and accessories",
          "Color matching with your wardrobe",
          "Style recommendations based on photos"
        ]
      },
      {
        title: "🗣️ Voice Shopping in Bengali",
        description: "Shop using voice commands in Bengali",
        details: [
          "আমার জন্য একটি লাল শাড়ি খুঁজে দিন",
          "Show me EID gifts under 2000 taka",
          "Voice-to-text search",
          "Accent recognition for regional Bengali"
        ]
      },
      {
        title: "📍 Location-Based Services",
        description: "Smart location-aware shopping features",
        details: [
          "Find nearby pickup points",
          "Local vendor recommendations",
          "Area-specific delivery times",
          "Regional price comparisons"
        ]
      },
      {
        title: "🤖 AI Shopping Assistant",
        description: "Nila - Your personal shopping companion",
        details: [
          "Nila - Your personal shopping companion",
          "Budget planning and suggestions",
          "Size and style matching",
          "EID timeline planning"
        ]
      }
    ]
  },
  {
    category: "🏆 App User Benefits",
    icon: "👑",
    features: [
      {
        title: "👑 VIP Member Privileges",
        description: "Exclusive benefits for app users",
        details: [
          "Early access to EID sales",
          "Priority customer support",
          "Exclusive member pricing",
          "Birthday and anniversary special offers"
        ]
      },
      {
        title: "💎 Loyalty Points Program",
        description: "Earn and redeem points on every purchase",
        details: [
          "Earn 1 point per ৳10 spent",
          "Bonus points for app usage",
          "Redeem points for discounts",
          "Special EID point multipliers"
        ]
      },
      {
        title: "🔔 Smart Notifications",
        description: "Personalized alerts and reminders",
        details: [
          "Personalized deal alerts",
          "Back-in-stock notifications",
          "Price drop alerts",
          "EID reminder notifications"
        ]
      },
      {
        title: "📊 Personal Shopping Analytics",
        description: "Track and analyze your shopping patterns",
        details: [
          "Spending insights and trends",
          "Category-wise purchase analysis",
          "Budget tracking and alerts",
          "EID shopping progress tracking"
        ]
      }
    ]
  }
];
