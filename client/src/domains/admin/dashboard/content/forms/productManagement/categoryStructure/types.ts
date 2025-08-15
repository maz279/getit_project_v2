
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  productsCount: number;
  image?: string;
  icon?: string;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  attributes: CategoryAttribute[];
  rules: CategoryRule[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface CategoryRule {
  id: string;
  name: string;
  type: 'validation' | 'automation' | 'pricing' | 'inventory';
  condition: string;
  action: string;
  isActive: boolean;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  topLevelCategories: number;
  avgProductsPerCategory: number;
  categoriesWithProducts: number;
  emptyCategoriesCount: number;
  mostPopularCategory: string;
  leastPopularCategory: string;
}

export interface CategoryAnalytics {
  categoryPerformance: {
    categoryId: string;
    name: string;
    productsCount: number;
    viewsCount: number;
    conversionRate: number;
    revenue: number;
    growth: number;
  }[];
  categoryTrends: {
    month: string;
    categories: { [key: string]: number };
  }[];
  topCategories: {
    name: string;
    revenue: number;
    orders: number;
    growth: number;
  }[];
}

export interface CategorySEOData {
  categoryId: string;
  title: string;
  description: string;
  keywords: string[];
  metaTags: { [key: string]: string };
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  searchRanking?: number;
  clickThroughRate?: number;
  impressions?: number;
}
