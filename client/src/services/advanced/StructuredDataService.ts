/**
 * Phase 3.2: Structured Data Service
 * Schema.org structured data implementation for SEO excellence
 * Target: Rich snippets and enhanced search visibility
 */

// TypeScript interfaces for Structured Data
interface StructuredDataConfig {
  enabled: boolean;
  schemaTypes: string[];
  validationEnabled: boolean;
  autoGeneration: boolean;
  organizationSchema: boolean;
  breadcrumbSchema: boolean;
  productSchema: boolean;
  reviewSchema: boolean;
  faqSchema: boolean;
  eventSchema: boolean;
}

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    '@type': string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint: {
    '@type': string;
    telephone: string;
    contactType: string;
    email: string;
  };
  sameAs: string[];
}

interface ProductSchema {
  '@context': string;
  '@type': string;
  name: string;
  image: string[];
  description: string;
  sku: string;
  brand: {
    '@type': string;
    name: string;
  };
  offers: {
    '@type': string;
    url: string;
    priceCurrency: string;
    price: number;
    availability: string;
    seller: {
      '@type': string;
      name: string;
    };
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  review?: ReviewSchema[];
}

interface ReviewSchema {
  '@context': string;
  '@type': string;
  author: {
    '@type': string;
    name: string;
  };
  datePublished: string;
  description: string;
  name: string;
  reviewRating: {
    '@type': string;
    bestRating: number;
    ratingValue: number;
    worstRating: number;
  };
}

interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: BreadcrumbItem[];
}

interface BreadcrumbItem {
  '@type': string;
  position: number;
  name: string;
  item: string;
}

interface FAQSchema {
  '@context': string;
  '@type': string;
  mainEntity: FAQItem[];
}

interface FAQItem {
  '@type': string;
  name: string;
  acceptedAnswer: {
    '@type': string;
    text: string;
  };
}

interface EventSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  eventAttendanceMode: string;
  eventStatus: string;
  location: {
    '@type': string;
    name: string;
    address: {
      '@type': string;
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  };
  organizer: {
    '@type': string;
    name: string;
    url: string;
  };
}

interface WebsiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

interface LocalBusinessSchema {
  '@context': string;
  '@type': string;
  name: string;
  image: string;
  '@id': string;
  url: string;
  telephone: string;
  address: {
    '@type': string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    '@type': string;
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification: {
    '@type': string;
    dayOfWeek: string[];
    opens: string;
    closes: string;
  };
  sameAs: string[];
}

// Structured Data Service
export class StructuredDataService {
  private config: StructuredDataConfig;
  private schemas: Map<string, any> = new Map();
  private organizationData: OrganizationSchema;

  constructor() {
    this.config = {
      enabled: true,
      schemaTypes: ['Organization', 'Product', 'Review', 'Breadcrumb', 'FAQ', 'Event', 'Website', 'LocalBusiness'],
      validationEnabled: true,
      autoGeneration: true,
      organizationSchema: true,
      breadcrumbSchema: true,
      productSchema: true,
      reviewSchema: true,
      faqSchema: true,
      eventSchema: true
    };

    this.organizationData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'GetIt - Multi-Vendor E-commerce Platform',
      url: 'https://getit.com',
      logo: 'https://getit.com/images/logo.png',
      description: 'Leading multi-vendor e-commerce platform in Bangladesh offering thousands of products with fast delivery and secure payments.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Commerce Street',
        addressLocality: 'Dhaka',
        addressRegion: 'Dhaka Division',
        postalCode: '1000',
        addressCountry: 'BD'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+880-1234-567890',
        contactType: 'customer service',
        email: 'support@getit.com'
      },
      sameAs: [
        'https://facebook.com/getit',
        'https://twitter.com/getit',
        'https://instagram.com/getit',
        'https://linkedin.com/company/getit'
      ]
    };

    this.initializeSchemas();
  }

  private initializeSchemas(): void {
    // Register organization schema
    this.schemas.set('Organization', this.organizationData);

    // Register website schema
    this.schemas.set('Website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'GetIt',
      url: 'https://getit.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://getit.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    });

    // Register local business schema
    this.schemas.set('LocalBusiness', {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'GetIt',
      image: 'https://getit.com/images/store-front.jpg',
      '@id': 'https://getit.com',
      url: 'https://getit.com',
      telephone: '+880-1234-567890',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Commerce Street',
        addressLocality: 'Dhaka',
        addressRegion: 'Dhaka Division',
        postalCode: '1000',
        addressCountry: 'BD'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 23.8103,
        longitude: 90.4125
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '22:00'
      },
      sameAs: [
        'https://facebook.com/getit',
        'https://twitter.com/getit',
        'https://instagram.com/getit'
      ]
    });
  }

  // Product schema generation
  generateProductSchema(product: any): ProductSchema {
    const schema: ProductSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name || 'Product',
      image: Array.isArray(product.images) ? product.images : [product.image || '/images/default-product.jpg'],
      description: product.description || 'Product description',
      sku: product.sku || product.id || 'SKU-' + Date.now(),
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Generic Brand'
      },
      offers: {
        '@type': 'Offer',
        url: `https://getit.com/products/${product.id}`,
        priceCurrency: 'BDT',
        price: product.price || 0,
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: product.vendor?.name || 'GetIt'
        }
      }
    };

    // Add aggregate rating if available
    if (product.rating && product.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1
      };
    }

    // Add reviews if available
    if (product.reviews && Array.isArray(product.reviews)) {
      schema.review = product.reviews.map((review: any) => ({
        '@context': 'https://schema.org',
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author || 'Anonymous'
        },
        datePublished: review.date || new Date().toISOString(),
        description: review.comment || 'No comment provided',
        name: review.title || 'Review',
        reviewRating: {
          '@type': 'Rating',
          bestRating: 5,
          ratingValue: review.rating || 5,
          worstRating: 1
        }
      }));
    }

    return schema;
  }

  // Breadcrumb schema generation
  generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>): BreadcrumbSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `https://getit.com${crumb.url}`
      }))
    };
  }

  // FAQ schema generation
  generateFAQSchema(faqs: Array<{question: string, answer: string}>): FAQSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  }

  // Event schema generation
  generateEventSchema(event: any): EventSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.name || 'Event',
      description: event.description || 'Event description',
      startDate: event.startDate || new Date().toISOString(),
      endDate: event.endDate || new Date(Date.now() + 86400000).toISOString(),
      eventAttendanceMode: event.attendanceMode || 'https://schema.org/MixedEventAttendanceMode',
      eventStatus: event.status || 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: event.location?.name || 'Online',
        address: {
          '@type': 'PostalAddress',
          streetAddress: event.location?.address?.street || '',
          addressLocality: event.location?.address?.city || 'Dhaka',
          addressRegion: event.location?.address?.region || 'Dhaka Division',
          postalCode: event.location?.address?.postalCode || '1000',
          addressCountry: 'BD'
        }
      },
      organizer: {
        '@type': 'Organization',
        name: event.organizer?.name || 'GetIt',
        url: event.organizer?.url || 'https://getit.com'
      }
    };
  }

  // Review schema generation
  generateReviewSchema(review: any): ReviewSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author || 'Anonymous'
      },
      datePublished: review.date || new Date().toISOString(),
      description: review.comment || 'No comment provided',
      name: review.title || 'Review',
      reviewRating: {
        '@type': 'Rating',
        bestRating: 5,
        ratingValue: review.rating || 5,
        worstRating: 1
      }
    };
  }

  // Get all schemas for a page
  getPageSchemas(pageType: string, data?: any): any[] {
    const schemas: any[] = [];

    // Always include organization schema
    if (this.config.organizationSchema) {
      schemas.push(this.schemas.get('Organization'));
    }

    // Always include website schema
    schemas.push(this.schemas.get('Website'));

    // Page-specific schemas
    switch (pageType) {
      case 'homepage':
        schemas.push(this.schemas.get('LocalBusiness'));
        break;

      case 'product':
        if (data && this.config.productSchema) {
          schemas.push(this.generateProductSchema(data));
        }
        break;

      case 'category':
        // Add category-specific schemas
        break;

      case 'vendor':
        // Add vendor-specific schemas
        break;

      case 'faq':
        if (data && this.config.faqSchema) {
          schemas.push(this.generateFAQSchema(data));
        }
        break;

      case 'event':
        if (data && this.config.eventSchema) {
          schemas.push(this.generateEventSchema(data));
        }
        break;
    }

    // Add breadcrumb schema if provided
    if (data?.breadcrumbs && this.config.breadcrumbSchema) {
      schemas.push(this.generateBreadcrumbSchema(data.breadcrumbs));
    }

    return schemas.filter(schema => schema !== undefined);
  }

  // Generate JSON-LD script tags
  generateJSONLD(schemas: any[]): string {
    return schemas.map(schema => 
      `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`
    ).join('\n');
  }

  // Validate schema
  validateSchema(schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema['@context']) {
      errors.push('Missing @context property');
    }

    if (!schema['@type']) {
      errors.push('Missing @type property');
    }

    if (schema['@type'] === 'Product') {
      if (!schema.name) errors.push('Product missing name');
      if (!schema.offers) errors.push('Product missing offers');
    }

    if (schema['@type'] === 'Organization') {
      if (!schema.name) errors.push('Organization missing name');
      if (!schema.url) errors.push('Organization missing url');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get schema by type
  getSchema(type: string): any {
    return this.schemas.get(type);
  }

  // Register custom schema
  registerSchema(type: string, schema: any): void {
    if (this.config.validationEnabled) {
      const validation = this.validateSchema(schema);
      if (!validation.valid) {
        throw new Error(`Invalid schema for ${type}: ${validation.errors.join(', ')}`);
      }
    }

    this.schemas.set(type, schema);
  }

  // Remove schema
  removeSchema(type: string): void {
    this.schemas.delete(type);
  }

  // Get all schemas
  getAllSchemas(): Map<string, any> {
    return new Map(this.schemas);
  }

  // Update configuration
  updateConfig(config: Partial<StructuredDataConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get configuration
  getConfig(): StructuredDataConfig {
    return { ...this.config };
  }

  // Clear all schemas
  clearSchemas(): void {
    this.schemas.clear();
    this.initializeSchemas();
  }

  // Get schema statistics
  getSchemaStats(): { total: number; types: string[]; enabled: boolean } {
    return {
      total: this.schemas.size,
      types: Array.from(this.schemas.keys()),
      enabled: this.config.enabled
    };
  }

  // Health check
  healthCheck(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: any } {
    const stats = this.getSchemaStats();
    
    return {
      status: stats.total > 0 && this.config.enabled ? 'healthy' : 'degraded',
      details: {
        schemasRegistered: stats.total,
        schemaTypes: stats.types,
        configEnabled: this.config.enabled,
        validationEnabled: this.config.validationEnabled,
        autoGenerationEnabled: this.config.autoGeneration
      }
    };
  }
}

// Export singleton instance
export const structuredDataService = new StructuredDataService();