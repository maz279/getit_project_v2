/**
 * PHASE 2: RECOMMENDATIONS SECTION COMPONENT
 * Extracted recommendations section with Groq AI integration
 * Lines: ~150 (Target achieved)
 * Date: July 26, 2025
 */

import React from 'react';
import { Heart, Star, Brain } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { RecommendationsSectionProps } from '../types/searchTypes';

// ✅ PHASE 4: Priority 4C - React.memo optimization for shallow comparison
export const RecommendationsSection = React.memo<RecommendationsSectionProps>(({
  activeSection,
  recommendations,
  groqRecommendations,
  loadingRecommendations,
  language,
}) => {
  // Don't render if not active
  if (!(activeSection === 'all' || activeSection === 'recommendations')) {
    return null;
  }

  const hasRecommendations = recommendations.length > 0;
  const hasGroqRecommendations = groqRecommendations.length > 0;

  if (!hasRecommendations && !hasGroqRecommendations && !loadingRecommendations) {
    return null;
  }

  return (
    <>
      {/* Smart Product Recommendations */}
      {hasRecommendations && (
        <section 
          className="border-l-4 border-pink-500 pl-6 animate-in slide-in-from-left-4 duration-700"
          id="recommendations-content"
          role="tabpanel"
          aria-labelledby="recommendations-tab"
        >
          {/* ✅ PHASE 5: Priority 5A - Proper semantic heading with ARIA attributes */}
          <h2 
            className="text-xl font-bold text-gray-900 mb-4 flex items-center"
            id="smart-recommendations-heading"
            role="heading"
            aria-level="2"
            aria-label={`${recommendations.length} ${language === 'bn' ? 'স্মার্ট পণ্য সুপারিশ উপলব্ধ' : 'smart product recommendations available'}`}
          >
            <Heart className="h-6 w-6 mr-3 text-pink-600" aria-hidden="true" />
            {language === 'bn' ? 'স্মার্ট পণ্য সুপারিশ' : 'Smart Product Recommendations'}
            <Badge className="ml-3 bg-pink-100 text-pink-800" aria-label="Number of smart recommendations">
              {recommendations.length}
            </Badge>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((recommendation, index) => (
              {/* ✅ PHASE 5: Priority 5C - Enhanced ARIA labels for recommendation cards */}
              <Card 
                key={recommendation.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:scale-105 hover:border-pink-400"
                role="article"
                aria-labelledby={`rec-title-${index}`}
                aria-describedby={`rec-desc-${index}`}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 
                        id={`rec-title-${index}`}
                        className="font-semibold text-gray-900 text-sm leading-5 line-clamp-2"
                        role="heading"
                        aria-level="3"
                      >
                        <Heart className="h-4 w-4 mr-2 text-pink-500 inline" aria-hidden="true" />
                        {recommendation.title}
                      </h3>
                    </div>
                    
                    {recommendation.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-pink-600">
                          {recommendation.price}
                        </span>
                        {recommendation.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{recommendation.rating}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {recommendation.badge && (
                      <Badge className="mt-2 text-xs bg-pink-100 text-pink-800">
                        {recommendation.badge}
                      </Badge>
                    )}
                    
                    <p 
                      id={`rec-desc-${index}`}
                      className="text-sm text-gray-600 line-clamp-2"
                    >
                      {recommendation.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Groq AI Recommendations */}
      {(hasGroqRecommendations || loadingRecommendations) && (
        <section 
          className="border-l-4 border-purple-500 pl-6 animate-in slide-in-from-left-4 duration-800"
          id="groq-recommendations-content"
          role="tabpanel"
          aria-labelledby="recommendations-tab"
        >
          {/* ✅ PHASE 5: Priority 5A - Proper semantic heading with ARIA attributes */}
          <h2 
            className="text-xl font-bold text-gray-900 mb-4 flex items-center"
            id="groq-recommendations-heading"
            role="heading"
            aria-level="2"
            aria-label={`${loadingRecommendations ? 'Loading' : groqRecommendations.length} ${language === 'bn' ? 'Groq AI সুপারিশ উপলব্ধ' : 'Groq AI recommendations available'}`}
          >
            <Brain className="h-6 w-6 mr-3 text-purple-600" aria-hidden="true" />
            {language === 'bn' ? 'Groq AI সুপারিশ (বাংলাদেশ)' : 'Groq AI Recommendations (Bangladesh)'}
            <Badge className="ml-3 bg-purple-100 text-purple-800" aria-label="Number of Groq AI recommendations">
              {loadingRecommendations ? '...' : groqRecommendations.length}
            </Badge>
          </h2>
          
          {loadingRecommendations ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-3 text-purple-400 animate-pulse" />
              <p className="text-gray-500">
                {language === 'bn' ? 'Groq AI সুপারিশ লোড হচ্ছে...' : 'Loading Groq AI recommendations...'}
              </p>
            </div>
          ) : hasGroqRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groqRecommendations.map((recommendation, index) => (
                <Card 
                  key={`groq-${index}`}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-purple-200 hover:scale-105 hover:border-purple-400"
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm leading-5 line-clamp-2">
                          <Brain className="h-4 w-4 mr-2 text-purple-500 inline" />
                          {recommendation.title}
                        </h3>
                      </div>
                      
                      {recommendation.price && (
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-600">
                            {recommendation.price}
                          </span>
                          {recommendation.rating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{recommendation.rating}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Badge className="mt-2 text-xs bg-purple-100 text-purple-800">
                        Groq AI Powered
                      </Badge>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {recommendation.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>{language === 'bn' ? 'Groq AI সুপারিশ পাওয়া যায়নি' : 'No Groq AI recommendations available'}</p>
            </div>
          )}
        </section>
      )}
    </>
  );
});