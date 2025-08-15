
export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapService {
  static generateSitemap(): string {
    const baseUrl = 'https://getit-bangladesh.com';
    const currentDate = new Date().toISOString().split('T')[0];

    const urls: SitemapUrl[] = [
      // Main pages
      { url: `${baseUrl}/`, lastmod: currentDate, changefreq: 'daily', priority: 1.0 },
      { url: `${baseUrl}/categories`, lastmod: currentDate, changefreq: 'daily', priority: 0.9 },
      { url: `${baseUrl}/best-sellers`, lastmod: currentDate, changefreq: 'daily', priority: 0.8 },
      { url: `${baseUrl}/mega-sale`, lastmod: currentDate, changefreq: 'daily', priority: 0.8 },
      { url: `${baseUrl}/premium`, lastmod: currentDate, changefreq: 'weekly', priority: 0.7 },
      { url: `${baseUrl}/bulk-orders`, lastmod: currentDate, changefreq: 'weekly', priority: 0.7 },
      { url: `${baseUrl}/products`, lastmod: currentDate, changefreq: 'daily', priority: 0.8 },

      // Category pages
      { url: `${baseUrl}/categories/electronics`, lastmod: currentDate, changefreq: 'daily', priority: 0.8 },
      { url: `${baseUrl}/categories/fashion`, lastmod: currentDate, changefreq: 'daily', priority: 0.8 },
      { url: `${baseUrl}/categories/home-garden`, lastmod: currentDate, changefreq: 'daily', priority: 0.8 },
      { url: `${baseUrl}/categories/books`, lastmod: currentDate, changefreq: 'weekly', priority: 0.7 },
      { url: `${baseUrl}/categories/sports`, lastmod: currentDate, changefreq: 'weekly', priority: 0.7 },
      { url: `${baseUrl}/categories/toys`, lastmod: currentDate, changefreq: 'weekly', priority: 0.7 },

      // Important static pages
      { url: `${baseUrl}/about`, lastmod: currentDate, changefreq: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/contact`, lastmod: currentDate, changefreq: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/help`, lastmod: currentDate, changefreq: 'weekly', priority: 0.6 },
      { url: `${baseUrl}/privacy`, lastmod: currentDate, changefreq: 'yearly', priority: 0.5 },
      { url: `${baseUrl}/terms`, lastmod: currentDate, changefreq: 'yearly', priority: 0.5 },
    ];

    return this.generateXMLSitemap(urls);
  }

  private static generateXMLSitemap(urls: SitemapUrl[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetClose = '</urlset>';

    const urlElements = urls.map(url => {
      let urlElement = `  <url>\n    <loc>${url.url}</loc>`;
      
      if (url.lastmod) {
        urlElement += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }
      
      if (url.changefreq) {
        urlElement += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }
      
      if (url.priority) {
        urlElement += `\n    <priority>${url.priority}</priority>`;
      }
      
      urlElement += '\n  </url>';
      return urlElement;
    }).join('\n');

    return `${xmlHeader}\n${urlsetOpen}\n${urlElements}\n${urlsetClose}`;
  }

  static generateRobotsTxt(): string {
    const baseUrl = 'https://getit-bangladesh.com';
    
    return `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/

# Allow specific search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for other bots
Crawl-delay: 1`;
  }
}
