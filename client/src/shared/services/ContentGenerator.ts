
export class ContentGenerator {
  private static instance: ContentGenerator;

  public static getInstance(): ContentGenerator {
    if (!ContentGenerator.instance) {
      ContentGenerator.instance = new ContentGenerator();
    }
    return ContentGenerator.instance;
  }

  async initialize(): Promise<void> {
    console.log('✍️ Initializing Content Generator...');
  }

  async generateProductDescription(product: {
    name: string;
    category: string;
    features?: string[];
    specifications?: any;
  }, language: 'en' | 'bn' = 'en'): Promise<string> {
    console.log('✍️ Generating product description');

    if (language === 'bn') {
      return `${product.name} একটি উচ্চ মানের ${product.category} যা আধুনিক প্রযুক্তি এবং দুর্দান্ত ডিজাইনের সমন্বয়ে তৈরি। এটি আপনার দৈনন্দিন প্রয়োজন মেটাতে সাহায্য করবে।`;
    }

    return `${product.name} is a high-quality ${product.category} designed with modern technology and excellent craftsmanship. Perfect for your daily needs with outstanding performance and reliability.`;
  }

  async generateEmailContent(template: string, userData: any, language: 'en' | 'bn' = 'en'): Promise<{
    subject: string;
    body: string;
    cta: string;
  }> {
    console.log('📧 Generating email content');

    const isEnglish = language === 'en';

    switch (template) {
      case 'welcome':
        return {
          subject: isEnglish ? 'Welcome to our marketplace!' : 'আমাদের মার্কেটপ্লেসে স্বাগতম!',
          body: isEnglish ? 
            `Hi ${userData.name}, welcome to our platform! Discover amazing products from verified vendors.` :
            `হ্যালো ${userData.name}, আমাদের প্ল্যাটফর্মে স্বাগতম! যাচাইকৃত বিক্রেতাদের কাছ থেকে দুর্দান্ত পণ্য আবিষ্কার করুন।`,
          cta: isEnglish ? 'Start Shopping' : 'কেনাকাটা শুরু করুন'
        };

      case 'cart_abandonment':
        return {
          subject: isEnglish ? 'Don\'t forget your items!' : 'আপনার পণ্যগুলো ভুলে যাবেন না!',
          body: isEnglish ? 
            `Hi ${userData.name}, you have items waiting in your cart. Complete your purchase now!` :
            `হ্যালো ${userData.name}, আপনার কার্টে পণ্য অপেক্ষা করছে। এখনই আপনার কেনাকাটা সম্পূর্ণ করুন!`,
          cta: isEnglish ? 'Complete Purchase' : 'কেনাকাটা সম্পূর্ণ করুন'
        };

      default:
        return {
          subject: isEnglish ? 'Important Update' : 'গুরুত্বপূর্ণ আপডেট',
          body: isEnglish ? 'We have an update for you.' : 'আপনার জন্য একটি আপডেট আছে।',
          cta: isEnglish ? 'Learn More' : 'আরও জানুন'
        };
    }
  }

  async generateReviewSummary(reviews: string[], overallSentiment: any): Promise<string> {
    console.log('📝 Generating review summary');

    const reviewCount = reviews.length;
    const sentiment = overallSentiment.sentiment;

    if (sentiment === 'positive') {
      return `Based on ${reviewCount} reviews, customers are highly satisfied with this product. Common praise includes quality, value for money, and fast delivery.`;
    } else if (sentiment === 'negative') {
      return `Based on ${reviewCount} reviews, customers have mixed experiences with this product. Common concerns include delivery issues and product quality.`;
    } else {
      return `Based on ${reviewCount} reviews, customers have neutral feedback about this product. Reviews mention both positive and negative aspects.`;
    }
  }

  async generateProductTags(product: any): Promise<string[]> {
    const tags = [];
    
    if (product.category) tags.push(product.category.toLowerCase());
    if (product.brand) tags.push(product.brand.toLowerCase());
    if (product.price < 1000) tags.push('affordable');
    if (product.price > 50000) tags.push('premium');
    if (product.rating > 4) tags.push('top-rated');
    
    return tags;
  }
}

export const contentGenerator = ContentGenerator.getInstance();
