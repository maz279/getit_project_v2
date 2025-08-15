/**
 * PHASE 2: PRODUCT RESULTS SECTION COMPONENT
 * Extracted product search results with proper handling
 * Lines: ~200 (Target achieved)
 * Date: July 26, 2025
 */

import React, { useMemo } from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ProductResultsSectionProps, SearchResult, EnhancedSearchResults } from '../types/searchTypes';

// ✅ PHASE 4: Priority 4C - React.memo optimization for shallow comparison
export const ProductResultsSection = React.memo<ProductResultsSectionProps>(({
  showResults,
  searchResults,
  language,
  activeSection,
  onProductClick,
}) => {
  // ✅ PHASE 4: Memoized content calculations - addresses P1
  const memoizedContent = useMemo(() => {
    const enhancedResults = searchResults as EnhancedSearchResults;
    const legacyResults = searchResults as SearchResult[];
    
    return {
      hasEnhancedResults: enhancedResults?.data?.results && enhancedResults.data.results.length > 0,
      hasLegacyResults: Array.isArray(legacyResults) && legacyResults.length > 0,
      products: enhancedResults?.data?.results || (Array.isArray(legacyResults) ? legacyResults : []),
      resultCount: enhancedResults?.data?.results?.length || (Array.isArray(legacyResults) ? legacyResults.length : 0)
    };
  }, [searchResults]);

  // Don't render if not active or no content
  if (!((activeSection === 'all' || activeSection === 'products') && showResults && 
       (memoizedContent.hasEnhancedResults || memoizedContent.hasLegacyResults))) {
    return null;
  }

  return (
    <section className="border-l-4 border-green-500 pl-6 animate-in slide-in-from-left-4 duration-500">
      <h2 
        className="text-xl font-bold text-gray-900 mb-4 flex items-center"
        id="product-search-results" // ✅ FIXED: A4 - Focus management
        role="heading" 
        aria-level={2}
        aria-label={`${memoizedContent.resultCount} product results found`}
      >
        <ShoppingBag className="h-6 w-6 mr-3 text-green-600" aria-hidden="true" />
        {language === 'bn' ? 'পণ্য অনুসন্ধানের ফলাফল' : 'Product Search Results'}
        <Badge className="ml-3 bg-green-100 text-green-800" aria-label="Number of results">
          {memoizedContent.resultCount}
        </Badge>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memoizedContent.products.map((result: SearchResult, index: number) => (
          <Card 
            key={result.id || `product-${index}`}
            className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:scale-105 hover:border-green-400"
            onClick={() => onProductClick(result)}
            role="article" // ✅ PHASE 5: Enhanced ARIA - unique labels
            tabIndex={0} // ✅ FIXED: A2 - Keyboard navigation
            aria-label={`Product ${index + 1} of ${memoizedContent.resultCount}: ${result.title}${result.price ? `, Price: ${result.price}` : ''}`}
            aria-describedby={`product-desc-${result.id}`}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm leading-5 line-clamp-2">
                    <ShoppingBag className="h-4 w-4 mr-2 text-green-500 inline" aria-hidden="true" />
                    {language === 'bn' && result.bengaliTitle ? result.bengaliTitle : result.title}
                  </h3>
                </div>
                
                <div id={`product-desc-${result.id}`} className="sr-only">
                  {result.description}
                </div>
                
                {result.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600" aria-label={`Price: ${result.price}`}>
                      {result.price}
                    </span>
                    {result.rating && (
                      <div className="flex items-center" aria-label={`Rating: ${result.rating} out of 5 stars`}>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" aria-hidden="true" />
                        <span className="text-sm text-gray-600 ml-1">{result.rating}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {result.badge && (
                  <Badge className="mt-2 text-xs" aria-label={`Badge: ${result.badge}`}>
                    {result.badge}
                  </Badge>
                )}
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {language === 'bn' && result.bengaliDescription ? result.bengaliDescription : result.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
});