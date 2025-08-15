import { useEffect } from 'react';

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  structuredData?: any;
  noIndex?: boolean;
  noFollow?: boolean;
}

export const useSEO = (options: SEOOptions = {}) => {
  useEffect(() => {
    const {
      title,
      description,
      keywords,
      canonical,
      ogTitle,
      ogDescription,
      ogImage,
      ogType = 'website',
      ogUrl,
      twitterTitle,
      twitterDescription,
      twitterImage,
      twitterCard = 'summary_large_image',
      structuredData,
      noIndex = false,
      noFollow = false
    } = options;

    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update basic meta tags
    if (description) {
      updateMetaTag('description', description);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Update Open Graph tags
    if (ogTitle) {
      updateMetaTag('og:title', ogTitle, true);
    }

    if (ogDescription) {
      updateMetaTag('og:description', ogDescription, true);
    }

    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
    }

    if (ogType) {
      updateMetaTag('og:type', ogType, true);
    }

    if (ogUrl) {
      updateMetaTag('og:url', ogUrl, true);
    }

    // Update Twitter Card tags
    if (twitterCard) {
      updateMetaTag('twitter:card', twitterCard);
    }

    if (twitterTitle) {
      updateMetaTag('twitter:title', twitterTitle);
    }

    if (twitterDescription) {
      updateMetaTag('twitter:description', twitterDescription);
    }

    if (twitterImage) {
      updateMetaTag('twitter:image', twitterImage);
    }

    // Update robots meta tag
    if (noIndex || noFollow) {
      const robotsContent = [];
      if (noIndex) robotsContent.push('noindex');
      if (noFollow) robotsContent.push('nofollow');
      updateMetaTag('robots', robotsContent.join(', '));
    }

    // Update canonical link
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', canonical);
    }

    // Update structured data
    if (structuredData) {
      let scriptElement = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // Note: We don't remove meta tags on cleanup to avoid flickering
      // They will be updated when the component re-renders
    };
  }, [options]);
};

// Additional SEO hooks for specific use cases
export const useCategorySEO = (category: string) => {
  return useSEO({
    title: `${category} - GetIt Multi-Vendor Store`,
    description: `Browse ${category} products from multiple vendors at GetIt`,
    keywords: `${category}, products, shop, buy, online store`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': category,
      'description': `Collection of ${category} products`
    }
  });
};

export default useSEO;