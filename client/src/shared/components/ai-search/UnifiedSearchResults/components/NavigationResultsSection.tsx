/**
 * PHASE 2: NAVIGATION RESULTS SECTION COMPONENT
 * Extracted navigation/page search results
 * Lines: ~150 (Target achieved)
 * Date: July 26, 2025
 */

import React from 'react';
import { Navigation, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { NavigationResultsSectionProps } from '../types/searchTypes';

// ✅ PHASE 4: Priority 4C - React.memo optimization for shallow comparison
export const NavigationResultsSection = React.memo<NavigationResultsSectionProps>(({
  showNavigationResults,
  navigationResults,
  language,
  activeSection,
  onNavigateToPage,
}) => {
  // Don't render if not active or no content
  if (!((activeSection === 'all' || activeSection === 'pages') && showNavigationResults && navigationResults?.length > 0)) {
    return null;
  }

  return (
    <section 
      className="border-l-4 border-purple-500 pl-6 animate-in slide-in-from-left-4 duration-400"
      id="pages-content"
      role="tabpanel"
      aria-labelledby="pages-tab"
    >
      {/* ✅ PHASE 5: Priority 5A - Proper semantic heading with ARIA attributes */}
      <h2 
        className="text-xl font-bold text-gray-900 mb-4 flex items-center"
        id="navigation-results-heading"
        role="heading"
        aria-level="2"
        aria-label={`${navigationResults.length} ${language === 'bn' ? 'পেজ ও মেনু ফলাফল পাওয়া গেছে' : 'pages and menu results found'}`}
      >
        <Navigation className="h-6 w-6 mr-3 text-purple-600" aria-hidden="true" />
        {language === 'bn' ? 'পেজ ও মেনু' : 'Pages & Menu'}
        <Badge className="ml-3 bg-purple-100 text-purple-800" aria-label="Number of results">
          {navigationResults.length}
        </Badge>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {navigationResults.map((navResult, index) => (
          {/* ✅ PHASE 5: Priority 5C - Enhanced ARIA labels for navigation cards */}
          <Card 
            key={navResult.item.route || `nav-result-${index}`}
            className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-purple-400"
            onClick={() => onNavigateToPage(navResult.item.route, navResult.item.title)}
            role="article"
            tabIndex={0}
            aria-label={`Page ${index + 1} of ${navigationResults.length}: ${navResult.item.title}, ${navResult.item.route}`}
            aria-describedby={`nav-desc-${index}`}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">
                    <Navigation className="h-3 w-3 mr-2 text-purple-500 inline" aria-hidden="true" />
                    {language === 'bn' && navResult.item.bengaliTitle ? 
                      navResult.item.bengaliTitle : navResult.item.title}
                  </h3>
                  <div id={`nav-desc-${index}`} className="sr-only">
                    {language === 'bn' && navResult.item.bengaliDescription ? 
                      navResult.item.bengaliDescription : navResult.item.description}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {language === 'bn' && navResult.item.bengaliDescription ? 
                      navResult.item.bengaliDescription : navResult.item.description}
                  </p>
                  <div className="text-xs text-purple-600 mt-1 font-mono">
                    {navResult.item.route}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
});