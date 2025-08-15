
export interface SEOMetaData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: any;
  noindex?: boolean;
  nofollow?: boolean;
}

export class SEOService {
  private static instance: SEOService;

  private constructor() {}

  public static getInstance(): SEOService {
    if (!SEOService.instance) {
      SEOService.instance = new SEOService();
    }
    return SEOService.instance;
  }

  // Update page meta tags
  public updateMetaTags(metaData: SEOMetaData): void {
    // Update title
    if (metaData.title) {
      document.title = metaData.title;
      this.updateMetaTag('og:title', metaData.ogTitle || metaData.title);
      this.updateMetaTag('twitter:title', metaData.twitterTitle || metaData.title);
    }

    // Update description
    if (metaData.description) {
      this.updateMetaTag('description', metaData.description);
      this.updateMetaTag('og:description', metaData.ogDescription || metaData.description);
      this.updateMetaTag('twitter:description', metaData.twitterDescription || metaData.description);
    }

    // Update keywords
    if (metaData.keywords) {
      this.updateMetaTag('keywords', metaData.keywords);
    }

    // Update canonical URL
    if (metaData.canonical) {
      this.updateLinkTag('canonical', metaData.canonical);
      this.updateMetaTag('og:url', metaData.canonical);
      this.updateMetaTag('twitter:url', metaData.canonical);
    }

    // Update Open Graph image
    if (metaData.ogImage) {
      this.updateMetaTag('og:image', metaData.ogImage);
      this.updateMetaTag('twitter:image', metaData.twitterImage || metaData.ogImage);
    }

    // Update Open Graph type
    if (metaData.ogType) {
      this.updateMetaTag('og:type', metaData.ogType);
    }

    // Update robots
    const robots = [];
    if (metaData.noindex) robots.push('noindex');
    else robots.push('index');
    
    if (metaData.nofollow) robots.push('nofollow');
    else robots.push('follow');
    
    this.updateMetaTag('robots', robots.join(', '));

    // Update structured data
    if (metaData.structuredData) {
      this.updateStructuredData(metaData.structuredData);
    }
  }

  // Generate category page SEO data
  public generateCategorySEO(categoryName: string, description?: string): SEOMetaData {
    const title = `${categoryName} Products | Best ${categoryName} in Bangladesh | GetIt`;
    const desc = description || `Shop ${categoryName} from verified vendors in Bangladesh. Best prices, quality products, fast delivery. Explore our wide range of ${categoryName} products.`;
    
    return {
      title,
      description: desc,
      keywords: `${categoryName.toLowerCase()}, ${categoryName.toLowerCase()} bangladesh, buy ${categoryName.toLowerCase()}, ${categoryName.toLowerCase()} online shopping`,
      canonical: `https://getit-bangladesh.com/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
      ogType: 'website',
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": desc,
        "url": `https://getit-bangladesh.com/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
        "isPartOf": {
          "@type": "WebSite",
          "name": "GetIt Bangladesh",
          "url": "https://getit-bangladesh.com"
        }
      }
    };
  }

  // Generate product page SEO data
  public generateProductSEO(product: {
    name: string;
    description: string;
    price: number;
    brand?: string;
    category: string;
    images?: string[];
    rating?: number;
  }): SEOMetaData {
    const title = `${product.name} | ${product.brand ? product.brand + ' | ' : ''}৳${product.price} | GetIt Bangladesh`;
    const desc = `${product.description.substring(0, 150)}... Shop now with best price ৳${product.price}. Fast delivery across Bangladesh.`;
    
    return {
      title,
      description: desc,
      keywords: `${product.name.toLowerCase()}, ${product.brand?.toLowerCase()}, ${product.category.toLowerCase()}, buy online bangladesh`,
      canonical: `https://getit-bangladesh.com/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`,
      ogType: 'product',
      ogImage: product.images?.[0],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "brand": {
          "@type": "Brand",
          "name": product.brand || "Generic"
        },
        "category": product.category,
        "image": product.images || [],
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "BDT",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "GetIt Bangladesh"
          }
        },
        "aggregateRating": product.rating ? {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "bestRating": 5,
          "worstRating": 1
        } : undefined
      }
    };
  }

  // Generate search results SEO
  public generateSearchSEO(query: string, resultCount: number): SEOMetaData {
    const title = `Search Results for "${query}" | ${resultCount} Products Found | GetIt Bangladesh`;
    const desc = `Found ${resultCount} products for "${query}". Shop from verified vendors with best prices and fast delivery across Bangladesh.`;
    
    return {
      title,
      description: desc,
      canonical: `https://getit-bangladesh.com/search?q=${encodeURIComponent(query)}`,
      noindex: resultCount === 0,
    };
  }

  private updateMetaTag(name: string, content: string): void {
    const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
    const attribute = isProperty ? 'property' : 'name';
    
    let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  }

  private updateLinkTag(rel: string, href: string): void {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    
    link.href = href;
  }

  private updateStructuredData(data: any): void {
    // Remove existing structured data
    const existing = document.querySelector('script[type="application/ld+json"][data-dynamic]');
    if (existing) {
      existing.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic', 'true');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Generate breadcrumb structured data
  public generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): any {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  }

  // Generate FAQ structured data
  public generateFAQSchema(faqs: Array<{ question: string; answer: string }>): any {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }
}

export const seoService = SEOService.getInstance();
