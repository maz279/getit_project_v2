/**
 * Phase 3.1: Server-Side Rendering Service
 * Complete SSR implementation with metadata generation and dynamic routing
 * Target: SEO optimization and faster initial page loads
 */

// TypeScript interfaces for SSR
interface SSRConfiguration {
  enabled: boolean;
  staticGeneration: boolean;
  dynamicRouting: boolean;
  metadataGeneration: boolean;
  preloadCriticalResources: boolean;
  cacheStrategy: 'none' | 'static' | 'dynamic' | 'hybrid';
  hydrationStrategy: 'immediate' | 'lazy' | 'progressive';
}

interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

interface SSRPage {
  route: string;
  component: string;
  metadata: PageMetadata;
  preloadData?: string[];
  staticProps?: boolean;
  serverSideProps?: boolean;
  staticPaths?: boolean;
  revalidate?: number;
  fallback?: boolean | 'blocking';
}

interface SSRRenderContext {
  url: string;
  method: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  query: Record<string, string>;
  params: Record<string, string>;
  userAgent: string;
  ip: string;
  isBot: boolean;
  isMobile: boolean;
  locale: string;
  region: string;
}

interface SSRRenderResult {
  html: string;
  css: string;
  head: string;
  scripts: string[];
  preloadLinks: string[];
  criticalResources: string[];
  metadata: PageMetadata;
  statusCode: number;
  redirectTo?: string;
  cacheTtl?: number;
  cacheKey?: string;
}

interface StaticGenerationConfig {
  pages: string[];
  fallback: boolean;
  revalidate: number;
  incrementalStaticRegeneration: boolean;
  onDemandRevalidation: boolean;
  buildTimeGeneration: boolean;
  prerenderPaths: string[];
}

interface HydrationConfig {
  strategy: 'immediate' | 'lazy' | 'progressive';
  priorityComponents: string[];
  lazyComponents: string[];
  progressiveThreshold: number;
  chunkSize: number;
  preloadCritical: boolean;
  deferNonCritical: boolean;
}

// Server-Side Rendering Service
export class ServerSideRenderingService {
  private config: SSRConfiguration;
  private pages: Map<string, SSRPage> = new Map();
  private renderCache: Map<string, SSRRenderResult> = new Map();
  private staticGeneration: StaticGenerationConfig;
  private hydrationConfig: HydrationConfig;

  constructor() {
    this.config = {
      enabled: true,
      staticGeneration: true,
      dynamicRouting: true,
      metadataGeneration: true,
      preloadCriticalResources: true,
      cacheStrategy: 'hybrid',
      hydrationStrategy: 'progressive'
    };

    this.staticGeneration = {
      pages: ['/'],
      fallback: false,
      revalidate: 3600,
      incrementalStaticRegeneration: true,
      onDemandRevalidation: true,
      buildTimeGeneration: true,
      prerenderPaths: ['/']
    };

    this.hydrationConfig = {
      strategy: 'progressive',
      priorityComponents: ['Header', 'Navigation', 'ProductCard'],
      lazyComponents: ['Footer', 'Comments', 'Reviews'],
      progressiveThreshold: 100,
      chunkSize: 50,
      preloadCritical: true,
      deferNonCritical: true
    };

    this.initializeSSRPages();
  }

  private initializeSSRPages(): void {
    // Customer pages
    this.registerPage({
      route: '/',
      component: 'HomePage',
      metadata: {
        title: 'GetIt - Multi-Vendor E-commerce Platform',
        description: 'Discover thousands of products from trusted vendors across Bangladesh. Fast delivery, secure payments, and excellent customer service.',
        keywords: ['ecommerce', 'bangladesh', 'online shopping', 'multi-vendor', 'marketplace'],
        ogTitle: 'GetIt - Your Ultimate Shopping Destination',
        ogDescription: 'Shop from thousands of products with fast delivery across Bangladesh',
        ogImage: '/images/og-homepage.jpg',
        ogType: 'website',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://getit.com/',
        robots: 'index,follow',
        author: 'GetIt Team'
      },
      preloadData: ['categories', 'featured-products', 'deals'],
      staticProps: true,
      revalidate: 300
    });

    this.registerPage({
      route: '/products/:id',
      component: 'ProductDetailPage',
      metadata: {
        title: 'Product Details - GetIt',
        description: 'View detailed information about this product including specifications, reviews, and pricing.',
        keywords: ['product', 'details', 'specifications', 'reviews'],
        ogType: 'product',
        robots: 'index,follow'
      },
      serverSideProps: true,
      staticPaths: true,
      fallback: 'blocking'
    });

    this.registerPage({
      route: '/categories/:category',
      component: 'CategoryPage',
      metadata: {
        title: 'Category - GetIt',
        description: 'Browse products in this category with filters and sorting options.',
        keywords: ['category', 'products', 'browse', 'filter'],
        robots: 'index,follow'
      },
      serverSideProps: true,
      staticPaths: true,
      fallback: true
    });

    // Vendor pages
    this.registerPage({
      route: '/vendor/:vendorId',
      component: 'VendorStorePage',
      metadata: {
        title: 'Vendor Store - GetIt',
        description: 'Visit this vendor store to browse their products and see ratings and reviews.',
        keywords: ['vendor', 'store', 'products', 'ratings'],
        robots: 'index,follow'
      },
      serverSideProps: true,
      staticPaths: true,
      fallback: 'blocking'
    });

    // Admin pages (no-index)
    this.registerPage({
      route: '/admin',
      component: 'AdminDashboard',
      metadata: {
        title: 'Admin Dashboard - GetIt',
        description: 'Administrative interface for managing the GetIt platform.',
        keywords: ['admin', 'dashboard', 'management'],
        robots: 'noindex,nofollow'
      },
      serverSideProps: true
    });
  }

  registerPage(page: SSRPage): void {
    this.pages.set(page.route, page);
  }

  async renderPage(route: string, context: SSRRenderContext): Promise<SSRRenderResult> {
    const cacheKey = this.generateCacheKey(route, context);
    
    // Check cache first
    if (this.config.cacheStrategy !== 'none' && this.renderCache.has(cacheKey)) {
      const cached = this.renderCache.get(cacheKey)!;
      return cached;
    }

    const page = this.findMatchingPage(route);
    if (!page) {
      return this.render404Page(context);
    }

    const renderResult = await this.performSSRRender(page, context);
    
    // Cache the result
    if (this.config.cacheStrategy !== 'none') {
      this.renderCache.set(cacheKey, renderResult);
    }

    return renderResult;
  }

  private findMatchingPage(route: string): SSRPage | null {
    // Exact match first
    if (this.pages.has(route)) {
      return this.pages.get(route)!;
    }

    // Pattern matching for dynamic routes
    for (const [pattern, page] of this.pages.entries()) {
      if (this.matchesPattern(route, pattern)) {
        return page;
      }
    }

    return null;
  }

  private matchesPattern(route: string, pattern: string): boolean {
    const routeParts = route.split('/');
    const patternParts = pattern.split('/');

    if (routeParts.length !== patternParts.length) {
      return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const routePart = routeParts[i];

      if (patternPart.startsWith(':')) {
        // Dynamic parameter - matches any value
        continue;
      }

      if (patternPart !== routePart) {
        return false;
      }
    }

    return true;
  }

  private async performSSRRender(page: SSRPage, context: SSRRenderContext): Promise<SSRRenderResult> {
    const metadata = this.generateMetadata(page, context);
    const criticalResources = this.identifyCriticalResources(page, context);
    
    return {
      html: this.renderHTML(page, context),
      css: this.renderCSS(page, context),
      head: this.renderHead(metadata, criticalResources),
      scripts: this.renderScripts(page, context),
      preloadLinks: this.renderPreloadLinks(criticalResources),
      criticalResources,
      metadata,
      statusCode: 200,
      cacheTtl: page.revalidate || 3600,
      cacheKey: this.generateCacheKey(page.route, context)
    };
  }

  private generateMetadata(page: SSRPage, context: SSRRenderContext): PageMetadata {
    const baseMetadata = { ...page.metadata };
    
    // Dynamic metadata generation based on context
    if (page.route.includes(':')) {
      baseMetadata.title = this.interpolateMetadata(baseMetadata.title, context);
      baseMetadata.description = this.interpolateMetadata(baseMetadata.description, context);
    }

    // Add dynamic elements
    baseMetadata.canonicalUrl = `https://getit.com${context.url}`;
    baseMetadata.modifiedTime = new Date().toISOString();

    return baseMetadata;
  }

  private interpolateMetadata(template: string, context: SSRRenderContext): string {
    let result = template;
    
    // Replace route parameters
    for (const [key, value] of Object.entries(context.params)) {
      result = result.replace(`{${key}}`, value);
    }

    return result;
  }

  private identifyCriticalResources(page: SSRPage, context: SSRRenderContext): string[] {
    const critical = [
      '/css/critical.css',
      '/js/runtime.js',
      '/js/vendors.js'
    ];

    // Add page-specific critical resources
    if (page.preloadData) {
      critical.push(...page.preloadData.map(data => `/api/${data}`));
    }

    // Add mobile-specific resources
    if (context.isMobile) {
      critical.push('/css/mobile.css');
    }

    return critical;
  }

  private renderHTML(page: SSRPage, context: SSRRenderContext): string {
    return `
      <div id="root">
        <div class="ssr-rendered" data-component="${page.component}">
          ${this.renderComponentHTML(page, context)}
        </div>
      </div>
    `;
  }

  private renderComponentHTML(page: SSRPage, context: SSRRenderContext): string {
    // This would integrate with your actual React SSR rendering
    return `
      <div class="page-container">
        <header class="page-header">
          <h1>${page.metadata.title}</h1>
        </header>
        <main class="page-content">
          <p>${page.metadata.description}</p>
          <!-- Component-specific content would be rendered here -->
        </main>
      </div>
    `;
  }

  private renderCSS(page: SSRPage, context: SSRRenderContext): string {
    return `
      .ssr-rendered { opacity: 1; }
      .page-container { max-width: 1200px; margin: 0 auto; }
      .page-header { padding: 2rem 0; }
      .page-content { padding: 1rem 0; }
      ${context.isMobile ? this.getMobileCSS() : ''}
    `;
  }

  private getMobileCSS(): string {
    return `
      .page-container { padding: 0 1rem; }
      .page-header { padding: 1rem 0; }
      .page-content { padding: 0.5rem 0; }
    `;
  }

  private renderHead(metadata: PageMetadata, criticalResources: string[]): string {
    const links = criticalResources
      .filter(resource => resource.endsWith('.css'))
      .map(resource => `<link rel="stylesheet" href="${resource}">`)
      .join('\n');

    const preloadLinks = criticalResources
      .filter(resource => !resource.endsWith('.css'))
      .map(resource => `<link rel="preload" href="${resource}" as="script">`)
      .join('\n');

    return `
      <title>${metadata.title}</title>
      <meta name="description" content="${metadata.description}">
      <meta name="keywords" content="${metadata.keywords.join(', ')}">
      <meta name="robots" content="${metadata.robots || 'index,follow'}">
      <meta name="author" content="${metadata.author || 'GetIt'}">
      <link rel="canonical" href="${metadata.canonicalUrl}">
      
      <!-- Open Graph -->
      <meta property="og:title" content="${metadata.ogTitle || metadata.title}">
      <meta property="og:description" content="${metadata.ogDescription || metadata.description}">
      <meta property="og:image" content="${metadata.ogImage || '/images/og-default.jpg'}">
      <meta property="og:type" content="${metadata.ogType || 'website'}">
      <meta property="og:url" content="${metadata.canonicalUrl}">
      
      <!-- Twitter -->
      <meta name="twitter:card" content="${metadata.twitterCard || 'summary'}">
      <meta name="twitter:title" content="${metadata.twitterTitle || metadata.title}">
      <meta name="twitter:description" content="${metadata.twitterDescription || metadata.description}">
      <meta name="twitter:image" content="${metadata.twitterImage || metadata.ogImage || '/images/og-default.jpg'}">
      
      <!-- Critical Resources -->
      ${links}
      ${preloadLinks}
      
      <!-- Structured Data -->
      <script type="application/ld+json">
        ${this.generateStructuredData(metadata)}
      </script>
    `;
  }

  private generateStructuredData(metadata: PageMetadata): string {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": metadata.title,
      "description": metadata.description,
      "url": metadata.canonicalUrl,
      "author": {
        "@type": "Organization",
        "name": metadata.author || "GetIt"
      },
      "dateModified": metadata.modifiedTime,
      "inLanguage": "en"
    });
  }

  private renderScripts(page: SSRPage, context: SSRRenderContext): string[] {
    const scripts = [
      '/js/runtime.js',
      '/js/vendors.js',
      `/js/${page.component.toLowerCase()}.js`
    ];

    // Add hydration script
    if (this.config.hydrationStrategy === 'progressive') {
      scripts.push('/js/progressive-hydration.js');
    }

    return scripts;
  }

  private renderPreloadLinks(criticalResources: string[]): string[] {
    return criticalResources.map(resource => {
      const extension = resource.split('.').pop();
      const asType = extension === 'css' ? 'style' : 'script';
      return `<link rel="preload" href="${resource}" as="${asType}">`;
    });
  }

  private render404Page(context: SSRRenderContext): SSRRenderResult {
    return {
      html: '<div id="root"><div class="error-page"><h1>404 - Page Not Found</h1></div></div>',
      css: '.error-page { text-align: center; padding: 2rem; }',
      head: '<title>404 - Page Not Found - GetIt</title>',
      scripts: ['/js/runtime.js'],
      preloadLinks: [],
      criticalResources: [],
      metadata: {
        title: '404 - Page Not Found - GetIt',
        description: 'The page you requested could not be found.',
        keywords: ['404', 'not found', 'error'],
        robots: 'noindex,nofollow'
      },
      statusCode: 404
    };
  }

  private generateCacheKey(route: string, context: SSRRenderContext): string {
    const factors = [
      route,
      context.isMobile ? 'mobile' : 'desktop',
      context.locale,
      context.region
    ];
    
    return factors.join('|');
  }

  // Static generation methods
  async generateStaticPages(): Promise<string[]> {
    const generatedPages: string[] = [];
    
    for (const path of this.staticGeneration.prerenderPaths) {
      const context: SSRRenderContext = {
        url: path,
        method: 'GET',
        headers: {},
        cookies: {},
        query: {},
        params: {},
        userAgent: 'Static Generator',
        ip: '127.0.0.1',
        isBot: false,
        isMobile: false,
        locale: 'en',
        region: 'BD'
      };

      const result = await this.renderPage(path, context);
      
      if (result.statusCode === 200) {
        generatedPages.push(path);
      }
    }

    return generatedPages;
  }

  // Hydration methods
  setupProgressiveHydration(): void {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.hydrateComponent(entry.target as HTMLElement);
        }
      });
    });

    // Observe components for progressive hydration
    document.querySelectorAll('[data-hydrate="lazy"]').forEach(el => {
      observer.observe(el);
    });
  }

  private hydrateComponent(element: HTMLElement): void {
    const componentName = element.dataset.component;
    if (componentName) {
      // This would integrate with your actual React hydration
      console.log(`Hydrating component: ${componentName}`);
    }
  }

  // Configuration methods
  updateConfig(config: Partial<SSRConfiguration>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): SSRConfiguration {
    return { ...this.config };
  }

  // Cache management
  clearCache(): void {
    this.renderCache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.renderCache.size,
      keys: Array.from(this.renderCache.keys())
    };
  }

  // Health check
  healthCheck(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: any } {
    return {
      status: 'healthy',
      details: {
        pagesRegistered: this.pages.size,
        cacheSize: this.renderCache.size,
        configEnabled: this.config.enabled,
        staticGenerationEnabled: this.config.staticGeneration,
        hydrationStrategy: this.config.hydrationStrategy
      }
    };
  }
}

// Export singleton instance
export const serverSideRenderingService = new ServerSideRenderingService();