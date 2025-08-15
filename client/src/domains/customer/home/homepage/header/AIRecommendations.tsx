
import React, { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Star, Sparkles, TrendingUp, User } from 'lucide-react';
import { PersonalizedRecommendation } from '@/shared/services/aiSearchService';

interface AIRecommendationsProps {
  recommendations: PersonalizedRecommendation[];
  onRecommendationClick: (recommendation: PersonalizedRecommendation) => void;
  language: string;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  recommendations,
  onRecommendationClick,
  language
}) => {
  const [visibleRecommendations, setVisibleRecommendations] = useState<PersonalizedRecommendation[]>([]);

  const content = {
    EN: {
      title: "AI Recommendations",
      subtitle: "Personalized for you",
      basedOn: "Based on",
      confidence: "AI Confidence",
      viewAll: "View All",
      tryThis: "Try this",
      forYou: "For You"
    },
    BD: {
      title: "এআই সাজেশন",
      subtitle: "আপনার জন্য বিশেষভাবে",
      basedOn: "ভিত্তি",
      confidence: "এআই নিশ্চয়তা",
      viewAll: "সব দেখুন",
      tryThis: "এটি চেষ্টা করুন",
      forYou: "আপনার জন্য"
    }
  };

  const currentContent = content[language as keyof typeof content];

  useEffect(() => {
    // Animate recommendations appearance
    const timer = setTimeout(() => {
      setVisibleRecommendations(recommendations.slice(0, 3));
    }, 100);

    return () => clearTimeout(timer);
  }, [recommendations]);

  if (recommendations.length === 0) return null;

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 p-4 shadow-xl border-2 border-gradient-to-r from-purple-200 to-blue-200 z-50 max-h-80 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <div>
            <h3 className="font-semibold text-gray-900">{currentContent.title}</h3>
            <p className="text-xs text-gray-600">{currentContent.subtitle}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-blue-50">
          <User className="w-3 h-3 mr-1" />
          {currentContent.forYou}
        </Badge>
      </div>

      <div className="space-y-3">
        {visibleRecommendations.map((recommendation, index) => (
          <div
            key={recommendation.id}
            className="group p-3 bg-white border border-gray-100 rounded-lg hover:border-purple-200 hover:shadow-md transition-all cursor-pointer animate-fadeInUp"
            onClick={() => onRecommendationClick(recommendation)}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <div className="flex items-start gap-3">
              {recommendation.image && (
                <img
                  src={recommendation.image}
                  alt={recommendation.title}
                  className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-purple-600 transition-colors">
                  {recommendation.title}
                </h4>
                
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {currentContent.basedOn}: {recommendation.reason}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  {recommendation.price && (
                    <span className="font-semibold text-orange-600 text-sm">
                      ৳{recommendation.price.toLocaleString()}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-500">
                        {Math.round(recommendation.confidence * 100)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(recommendation.confidence * 5)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100"
              >
                {currentContent.tryThis}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length > 3 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            {currentContent.viewAll} ({recommendations.length - 3} more)
          </Button>
        </div>
      )}
    </Card>
  );
};
