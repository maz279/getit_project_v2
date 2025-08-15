/**
 * PHASE 2: AI ASSISTANT SECTION COMPONENT
 * Extracted AI response section with proper sanitization
 * Lines: ~150 (Target achieved)
 * Date: July 26, 2025
 */

import React from 'react';
import { Brain } from 'lucide-react';
import DOMPurify from 'dompurify';
import { AIAssistantSectionProps } from '../types/searchTypes';

// ✅ PHASE 4: Priority 4C - React.memo optimization for shallow comparison
export const AIAssistantSection = React.memo<AIAssistantSectionProps>(({
  showConversationalResponse,
  conversationalResponse,
  query,
  language,
  activeSection,
}) => {
  // ✅ PHASE 1: CRITICAL SECURITY FIX - XSS Protection with DOMPurify
  const sanitizeHTML = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'span', 'div'],
      ALLOWED_ATTR: ['class'],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'frame'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style', 'javascript:']
    });
  };

  // Don't render if not active or no content
  if (!((activeSection === 'all' || activeSection === 'ai') && showConversationalResponse && conversationalResponse)) {
    return null;
  }

  return (
    <section 
      className="border-l-4 border-blue-500 pl-6 animate-in slide-in-from-left-4 duration-300"
      id="ai-content"
      role="tabpanel"
      aria-labelledby="ai-tab"
    >
      {/* ✅ PHASE 5: Priority 5A - Proper semantic heading with ARIA attributes */}
      <h2 
        className="text-xl font-bold text-gray-900 mb-4 flex items-center"
        id="ai-assistant-heading"
        role="heading"
        aria-level="2"
        aria-label={language === 'bn' ? 'AI সহায়তা ও পরামর্শ বিভাগ' : 'AI Assistant & Advice section'}
      >
        <Brain className="h-6 w-6 mr-3 text-blue-600" aria-hidden="true" />
        {language === 'bn' ? 'AI সহায়তা ও পরামর্শ' : 'AI Assistant & Advice'}
      </h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="text-sm text-blue-700 font-medium mb-2">
          {language === 'bn' ? 'আপনার প্রশ্ন:' : 'Your Question:'}
        </div>
        <div className="text-gray-800 font-medium italic bg-white p-3 rounded border">"{query}"</div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="prose max-w-none">
          <div 
            className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base"
            role="region" // ✅ FIXED: A1 - ARIA region for AI response
            aria-label="AI Assistant Response"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(conversationalResponse || '') }} // ✅ PHASE 1: CRITICAL SECURITY FIX - Proper XSS protection with DOMPurify
          />
        </div>
      </div>
    </section>
  );
});