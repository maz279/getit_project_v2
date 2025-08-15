/**
 * PHASE 3: SEARCH VALIDATION HOOK
 * Type-safe validation utilities for search operations
 * Date: July 26, 2025
 */

import { useMemo } from 'react';
import { ValidationResult, SearchQuery, LanguageCode } from '../types/searchTypes';

export const useSearchValidation = (query: string, language: LanguageCode) => {
  // ✅ PHASE 3: Comprehensive validation with type safety
  const validation = useMemo((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Query validation
    if (!query || query.trim().length === 0) {
      errors.push('Search query cannot be empty');
    } else if (query.trim().length < 2) {
      warnings.push('Query might be too short for optimal results');
    } else if (query.length > 500) {
      errors.push('Search query is too long (max 500 characters)');
    }

    // Language validation
    if (!['en', 'bn'].includes(language)) {
      errors.push('Invalid language code');
    }

    // XSS prevention check
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi
    ];

    if (xssPatterns.some(pattern => pattern.test(query))) {
      errors.push('Query contains potentially unsafe content');
    }

    return {
      isValid: errors.length === 0,
      errors: Object.freeze(errors),
      warnings: warnings.length > 0 ? Object.freeze(warnings) : undefined
    };
  }, [query, language]);

  // ✅ PHASE 3: Type-safe query sanitization
  const sanitizedQuery = useMemo(() => {
    if (!validation.isValid) return '';
    
    return query
      .trim()
      .replace(/[<>]/g, '') // Remove potentially dangerous characters
      .substring(0, 500); // Enforce length limit
  }, [query, validation.isValid]);

  return {
    validation,
    sanitizedQuery,
    isValidQuery: validation.isValid,
    hasWarnings: validation.warnings && validation.warnings.length > 0
  };
};