import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Star, ShoppingCart, Eye, Heart, ArrowLeft } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  price?: number;
  rating?: number;
  image?: string;
  category?: string;
  isNavigationItem?: boolean;
  path?: string;
}

interface InPageSearchResultsProps {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  onBack: () => void;
  language?: string;
}

const InPageSearchResults: React.FC<InPageSearchResultsProps> = ({
  query,
  results,
  isLoading,
  onBack,
  language = 'en'
}) => {
  const isBengali = language === 'bn';

  const handleProductClick = (result: SearchResult) => {
    if (result.isNavigationItem && result.path) {
      // For navigation items, you could handle routing here
      console.log('Navigate to:', result.path);
    } else {
      // For product items
      console.log('View product:', result.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isBengali ? 'খোঁজা হচ্ছে...' : 'Searching...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Search Results Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {isBengali ? 'ফিরে যান' : 'Back'}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isBengali ? 'অনুসন্ধানের ফলাফল' : 'Search Results'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isBengali 
              ? `"${query}" এর জন্য ${results?.length || 0} টি ফলাফল` 
              : `${results?.length || 0} results for "${query}"`
            }
          </p>
        </div>
      </div>

      {/* Results Grid */}
      {!results || results.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isBengali ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No results found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isBengali 
              ? 'বিভিন্ন কীওয়ার্ড দিয়ে চেষ্টা করুন বা ক্যাটেগরি ব্রাউজ করুন'
              : 'Try different keywords or browse categories'
            }
          </p>
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
            {isBengali ? 'ক্যাটেগরি ব্রাউজ করুন' : 'Browse Categories'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results?.map((result) => (
            <Card 
              key={result.id}
              className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleProductClick(result)}
            >
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {result.image ? (
                    <img 
                      src={result.image} 
                      alt={result.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {result.title}
                  </h3>
                  
                  {result.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {result.description}
                    </p>
                  )}

                  {/* Category Badge */}
                  {result.category && (
                    <Badge variant="secondary" className="text-xs">
                      {result.category}
                    </Badge>
                  )}

                  {/* Price and Rating */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {result.price && (
                        <span className="font-semibold text-lg text-green-600">
                          ৳{result.price.toLocaleString()}
                        </span>
                      )}
                      {result.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {result.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    {!result.isNavigationItem && (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Add to cart:', result.id);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {isBengali ? 'কার্ট' : 'Cart'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Add to wishlist:', result.id);
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {results && results.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            {isBengali ? 'আরো লোড করুন' : 'Load More Results'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default InPageSearchResults;