/**
 * PHASE 2: SEARCH HEADER COMPONENT
 * Extracted header with section navigation
 * Lines: ~80 (Target achieved)
 * Date: July 26, 2025
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { SearchHeaderProps } from '../types/searchTypes';

// ✅ PHASE 4: Priority 4C - React.memo optimization for shallow comparison
export const SearchHeader = React.memo<SearchHeaderProps>(({
  query,
  language,
  onClose,
  activeSection,
  setActiveSection,
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50">
      <div className="flex-1">
        {/* ✅ PHASE 5: Priority 5A - Proper semantic heading with ARIA attributes */}
        <h1 
          className="text-2xl font-bold text-gray-900 flex items-center mb-3"
          id="search-results-heading"
          role="heading"
          aria-level="1"
          aria-label={language === 'bn' ? `"${query}" এর জন্য অনুসন্ধানের ফলাফল` : `Search Results for "${query}"`}
        >
          <Search className="h-6 w-6 mr-3 text-blue-600" aria-hidden="true" />
          {language === 'bn' ? `"${query}" এর জন্য অনুসন্ধানের ফলাফল` : `Search Results for "${query}"`}
        </h1>
        
        {/* ✅ PHASE 5: Priority 5C - Enhanced ARIA labels for navigation pills */}
        <nav aria-label={language === 'bn' ? 'সার্চ ফিল্টার নেভিগেশন' : 'Search filter navigation'}>
          <div className="flex flex-wrap gap-2" role="tablist">
            {['all', 'ai', 'products', 'pages', 'insights', 'recommendations'].map((section) => (
              <Button
                key={section}
                variant={activeSection === section ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection(section)}
                role="tab"
                aria-selected={activeSection === section}
                aria-controls={`${section}-content`}
                className={`text-xs px-3 py-1 h-7 transition-all duration-200 ${
                  activeSection === section 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'hover:bg-blue-50 text-gray-600'
                }`}
              >
              {section === 'all' && (language === 'bn' ? '🔍 সব' : '🔍 All')}
              {section === 'ai' && (language === 'bn' ? '🤖 AI' : '🤖 AI')}
              {section === 'products' && (language === 'bn' ? '🛍️ পণ্য' : '🛍️ Products')}
              {section === 'pages' && (language === 'bn' ? '📄 পেজ' : '📄 Pages')}
              {section === 'insights' && (language === 'bn' ? '💡 তথ্য' : '💡 Insights')}
              {section === 'recommendations' && (language === 'bn' ? '⭐ সুপারিশ' : '⭐ Recommendations')}
            </Button>
            ))}
          </div>
        </nav>
      </div>
      
      {/* ✅ PHASE 5: Priority 5C - Enhanced ARIA label for close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="p-2 h-10 w-10 rounded-full hover:bg-white/80 transition-all duration-200 hover:scale-110"
        aria-label={language === 'bn' ? 'অনুসন্ধানের ফলাফল বন্ধ করুন' : 'Close search results'}
        title={language === 'bn' ? 'অনুসন্ধানের ফলাফল বন্ধ করুন' : 'Close search results'}
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </Button>
    </div>
  );
});