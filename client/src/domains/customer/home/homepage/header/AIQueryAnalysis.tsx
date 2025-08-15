
import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { Brain, Target, Heart, DollarSign, Tag, Sparkles } from 'lucide-react';
import { AISearchQuery } from '@/shared/services/aiSearchService';

interface AIQueryAnalysisProps {
  analysis: AISearchQuery;
  language: string;
}

export const AIQueryAnalysis: React.FC<AIQueryAnalysisProps> = ({
  analysis,
  language
}) => {
  const content = {
    EN: {
      analysis: "AI Analysis",
      intent: "Intent",
      sentiment: "Sentiment", 
      entities: "Detected",
      priceRange: "Price Range",
      features: "Features",
      intents: {
        product: "Product Search",
        navigation: "Navigation",
        comparison: "Comparison",
        recommendation: "Recommendation",
        help: "Help & Support"
      },
      sentiments: {
        positive: "Positive",
        neutral: "Neutral", 
        negative: "Negative"
      }
    },
    BD: {
      analysis: "এআই বিশ্লেষণ",
      intent: "উদ্দেশ্য",
      sentiment: "মনোভাব",
      entities: "শনাক্তকৃত",
      priceRange: "দামের পরিসর",
      features: "বৈশিষ্ট্য",
      intents: {
        product: "পণ্য সার্চ",
        navigation: "নেভিগেশন",
        comparison: "তুলনা",
        recommendation: "সাজেশন",
        help: "সাহায্য ও সহায়তা"
      },
      sentiments: {
        positive: "ইতিবাচক",
        neutral: "নিরপেক্ষ",
        negative: "নেতিবাচক"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'product': return <Target className="w-4 h-4" />;
      case 'navigation': return <Target className="w-4 h-4" />;
      case 'comparison': return <Brain className="w-4 h-4" />;
      case 'recommendation': return <Heart className="w-4 h-4" />;
      case 'help': return <Brain className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'navigation': return 'bg-green-100 text-green-800';
      case 'comparison': return 'bg-purple-100 text-purple-800';
      case 'recommendation': return 'bg-pink-100 text-pink-800';
      case 'help': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="absolute top-full right-0 mt-2 p-3 shadow-lg border border-purple-200 z-50 w-72">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-purple-500" />
        <h3 className="font-semibold text-sm text-gray-900">{currentContent.analysis}</h3>
      </div>

      <div className="space-y-3">
        {/* Intent */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{currentContent.intent}:</span>
          <Badge className={getIntentColor(analysis.intent)}>
            {getIntentIcon(analysis.intent)}
            <span className="ml-1">{currentContent.intents[analysis.intent]}</span>
          </Badge>
        </div>

        {/* Sentiment */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{currentContent.sentiment}:</span>
          <Badge className={getSentimentColor(analysis.sentiment)}>
            {currentContent.sentiments[analysis.sentiment]}
          </Badge>
        </div>

        {/* Entities */}
        {analysis.entities.length > 0 && (
          <div>
            <span className="text-xs text-gray-600">{currentContent.entities}:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {analysis.entities.map((entity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {entity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        {analysis.price_range && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{currentContent.priceRange}:</span>
            <Badge variant="outline" className="bg-green-50">
              <DollarSign className="w-3 h-3 mr-1" />
              {analysis.price_range.min && `৳${analysis.price_range.min}`}
              {analysis.price_range.min && analysis.price_range.max && ' - '}
              {analysis.price_range.max && `৳${analysis.price_range.max}`}
              {!analysis.price_range.min && analysis.price_range.max && `< ৳${analysis.price_range.max}`}
            </Badge>
          </div>
        )}

        {/* Category & Brand */}
        {(analysis.category || analysis.brand) && (
          <div className="space-y-1">
            {analysis.category && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Category:</span>
                <Badge variant="outline">{analysis.category}</Badge>
              </div>
            )}
            {analysis.brand && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Brand:</span>
                <Badge variant="outline">{analysis.brand}</Badge>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {analysis.features && analysis.features.length > 0 && (
          <div>
            <span className="text-xs text-gray-600">{currentContent.features}:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {analysis.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
