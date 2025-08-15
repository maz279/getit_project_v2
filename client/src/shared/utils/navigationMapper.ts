
import { useNavigate } from 'react-router-dom';

export interface NavigationResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class NavigationMapper {
  private navigate: (path: string) => void;

  constructor(navigate: (path: string) => void) {
    this.navigate = navigate;
  }

  // Map search results to navigation
  public navigateToResult(result: any): NavigationResult {
    try {
      if (result.url) {
        console.log('Navigating to:', result.url);
        this.navigate(result.url);
        return { success: true, url: result.url };
      }

      // Handle specific result types
      switch (result.type) {
        case 'product':
          return this.navigateToProduct(result);
        case 'category':
          return this.navigateToCategory(result);
        case 'page':
          return this.navigateToPage(result);
        case 'vendor':
          return this.navigateToVendor(result);
        default:
          return this.handleGenericNavigation(result);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      return { 
        success: false, 
        error: 'Navigation failed' 
      };
    }
  }

  private navigateToProduct(result: any): NavigationResult {
    const productUrl = result.url || `/product/${result.id}`;
    this.navigate(productUrl);
    return { success: true, url: productUrl };
  }

  private navigateToCategory(result: any): NavigationResult {
    let categoryUrl = result.url;
    
    if (!categoryUrl) {
      // Construct category URL from result data
      if (result.category === 'Fashion' && result.id.includes('fashion-womens')) {
        categoryUrl = '/categories/fashion/womens-fashion';
        
        // Add query parameters for subcategories
        const urlParams = new URLSearchParams();
        if (result.id.includes('-')) {
          const parts = result.id.split('-');
          if (parts.length > 3) {
            urlParams.set('category', parts[2]);
          }
          if (parts.length > 4) {
            urlParams.set('subcategory', parts[3]);
          }
          if (parts.length > 5) {
            urlParams.set('subsubcategory', parts[4]);
          }
        }
        
        if (urlParams.toString()) {
          categoryUrl += '?' + urlParams.toString();
        }
      } else {
        categoryUrl = `/categories/${result.category?.toLowerCase() || 'all'}`;
      }
    }
    
    this.navigate(categoryUrl);
    return { success: true, url: categoryUrl };
  }

  private navigateToPage(result: any): NavigationResult {
    const pageUrl = result.url || '/';
    this.navigate(pageUrl);
    return { success: true, url: pageUrl };
  }

  private navigateToVendor(result: any): NavigationResult {
    const vendorUrl = result.url || `/vendor/${result.id}`;
    this.navigate(vendorUrl);
    return { success: true, url: vendorUrl };
  }

  private handleGenericNavigation(result: any): NavigationResult {
    // Fallback navigation based on title or search query
    const searchUrl = `/search?q=${encodeURIComponent(result.title || result.id)}`;
    this.navigate(searchUrl);
    return { success: true, url: searchUrl };
  }
}

// Hook for using navigation mapper
export const useNavigationMapper = () => {
  const navigate = useNavigate();
  const mapper = new NavigationMapper(navigate);
  
  return {
    navigateToResult: (result: any) => mapper.navigateToResult(result),
    navigateToUrl: (url: string) => {
      navigate(url);
      return { success: true, url };
    }
  };
};
