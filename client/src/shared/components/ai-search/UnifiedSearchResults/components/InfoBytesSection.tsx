/**
 * PHASE 2: INFO BYTES SECTION COMPONENT
 * Extracted info bytes/tips section
 * Lines: ~120 (Target achieved)
 * Date: July 26, 2025
 */

import React from 'react';
import { Lightbulb, TrendingUp, Zap, Info } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { InfoBytesSectionProps } from '../types/searchTypes';

// ✅ PHASE 4: Priority 4C - React.memo optimization for shallow comparison
export const InfoBytesSection = React.memo<InfoBytesSectionProps>(({
  activeSection,
  infobytes,
  language,
}) => {
  // Don't render if not active or no content
  if (!((activeSection === 'all' || activeSection === 'insights') && infobytes?.length > 0)) {
    return null;
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'lightbulb': return <Lightbulb className="h-5 w-5" />;
      case 'trending-up': return <TrendingUp className="h-5 w-5" />;
      case 'zap': return <Zap className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'yellow': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'blue': return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'green': return 'border-green-500 bg-green-50 text-green-700';
      case 'purple': return 'border-purple-500 bg-purple-50 text-purple-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  return (
    <section 
      className="border-l-4 border-yellow-500 pl-6 animate-in slide-in-from-left-4 duration-600"
      id="insights-content"
      role="tabpanel"
      aria-labelledby="insights-tab"
    >
      {/* ✅ PHASE 5: Priority 5A - Proper semantic heading with ARIA attributes */}
      <h2 
        className="text-xl font-bold text-gray-900 mb-4 flex items-center"
        id="info-bytes-heading"
        role="heading"
        aria-level="2"
        aria-label={`${infobytes.length} ${language === 'bn' ? 'দরকারী তথ্য ও টিপস উপলব্ধ' : 'cool infobytes available'}`}
      >
        <Lightbulb className="h-6 w-6 mr-3 text-yellow-600" aria-hidden="true" />
        {language === 'bn' ? 'দরকারী তথ্য ও টিপস' : 'Cool Infobytes'}
        <Badge className="ml-3 bg-yellow-100 text-yellow-800" aria-label="Number of info items">
          {infobytes.length}
        </Badge>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infobytes.map((infobyte, index) => (
          {/* ✅ PHASE 5: Priority 5C - Enhanced ARIA labels for info cards */}
          <Card 
            key={infobyte.id}
            className={`border-l-4 hover:shadow-md transition-all duration-200 ${getColorClasses(infobyte.color)}`}
            role="article"
            aria-labelledby={`infobyte-title-${index}`}
            aria-describedby={`infobyte-content-${index}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-full ${
                  infobyte.color === 'yellow' ? 'bg-yellow-100' :
                  infobyte.color === 'blue' ? 'bg-blue-100' :
                  infobyte.color === 'green' ? 'bg-green-100' :
                  infobyte.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {getIcon(infobyte.icon)}
                </div>
                <div className="flex-1">
                  <h3 
                    id={`infobyte-title-${index}`}
                    className="font-semibold text-sm mb-2"
                    role="heading"
                    aria-level="3"
                  >
                    {infobyte.title}
                  </h3>
                  <p 
                    id={`infobyte-content-${index}`}
                    className="text-sm leading-relaxed"
                  >
                    {infobyte.content}
                  </p>
                  <Badge 
                    variant="outline" 
                    className="mt-2 text-xs"
                  >
                    {infobyte.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
});