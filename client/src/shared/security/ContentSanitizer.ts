/**
 * Phase 2: Security Hardening
 * Content Sanitization for Search Pipeline
 * Investment: $5,000 | Week 3-4
 */

import DOMPurify from 'dompurify';

// Sanitization configuration
interface SanitizationConfig {
  allowedTags: string[];
  allowedAttributes: Record<string, string[]>;
  maxLength?: number;
  stripScripts: boolean;
  stripLinks: boolean;
  stripImages: boolean;
}

// Sanitization context types
export enum SanitizationContext {
  SEARCH_QUERY = 'search_query',
  USER_INPUT = 'user_input',
  HTML_CONTENT = 'html_content',
  URL_PARAMETER = 'url_parameter',
  FILE_NAME = 'file_name',
  DATABASE_QUERY = 'database_query'
}

/**
 * Comprehensive content sanitization system
 */
export class ContentSanitizer {
  private static instance: ContentSanitizer;
  private configs: Map<SanitizationContext, SanitizationConfig>;

  constructor() {
    this.configs = new Map();
    this.initializeConfigurations();
  }

  static getInstance(): ContentSanitizer {
    if (!ContentSanitizer.instance) {
      ContentSanitizer.instance = new ContentSanitizer();
    }
    return ContentSanitizer.instance;
  }

  /**
   * Initialize sanitization configurations for different contexts
   */
  private initializeConfigurations(): void {
    // Search query sanitization
    this.configs.set(SanitizationContext.SEARCH_QUERY, {
      allowedTags: [],
      allowedAttributes: {},
      maxLength: 200,
      stripScripts: true,
      stripLinks: true,
      stripImages: true
    });

    // User input sanitization
    this.configs.set(SanitizationContext.USER_INPUT, {
      allowedTags: ['b', 'i', 'em', 'strong'],
      allowedAttributes: {},
      maxLength: 1000,
      stripScripts: true,
      stripLinks: true,
      stripImages: true
    });

    // HTML content sanitization
    this.configs.set(SanitizationContext.HTML_CONTENT, {
      allowedTags: ['p', 'br', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li'],
      allowedAttributes: {
        '*': ['class'],
        'a': ['href', 'title']
      },
      maxLength: 5000,
      stripScripts: true,
      stripLinks: false,
      stripImages: true
    });

    // URL parameter sanitization
    this.configs.set(SanitizationContext.URL_PARAMETER, {
      allowedTags: [],
      allowedAttributes: {},
      maxLength: 100,
      stripScripts: true,
      stripLinks: true,
      stripImages: true
    });

    // File name sanitization
    this.configs.set(SanitizationContext.FILE_NAME, {
      allowedTags: [],
      allowedAttributes: {},
      maxLength: 255,
      stripScripts: true,
      stripLinks: true,
      stripImages: true
    });

    // Database query sanitization
    this.configs.set(SanitizationContext.DATABASE_QUERY, {
      allowedTags: [],
      allowedAttributes: {},
      maxLength: 500,
      stripScripts: true,
      stripLinks: true,
      stripImages: true
    });
  }

  /**
   * Sanitize content based on context
   */
  sanitize(content: string, context: SanitizationContext): string {
    const config = this.configs.get(context);
    if (!config) {
      throw new Error(`Unknown sanitization context: ${context}`);
    }

    let sanitized = content;

    // Apply context-specific sanitization
    switch (context) {
      case SanitizationContext.SEARCH_QUERY:
        sanitized = this.sanitizeSearchQuery(sanitized);
        break;
      case SanitizationContext.USER_INPUT:
        sanitized = this.sanitizeUserInput(sanitized);
        break;
      case SanitizationContext.HTML_CONTENT:
        sanitized = this.sanitizeHtmlContent(sanitized, config);
        break;
      case SanitizationContext.URL_PARAMETER:
        sanitized = this.sanitizeUrlParameter(sanitized);
        break;
      case SanitizationContext.FILE_NAME:
        sanitized = this.sanitizeFileName(sanitized);
        break;
      case SanitizationContext.DATABASE_QUERY:
        sanitized = this.sanitizeDatabaseQuery(sanitized);
        break;
    }

    // Apply common sanitization rules
    sanitized = this.applyCommonSanitization(sanitized, config);

    return sanitized;
  }

  /**
   * Sanitize search queries
   */
  private sanitizeSearchQuery(query: string): string {
    // Remove SQL injection attempts
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\/\*|\*\/)/g,
      /(\bOR\b|\bAND\b)\s*\d+\s*=\s*\d+/gi,
      /['"`;\\]/g
    ];

    let sanitized = query;
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove XSS attempts
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
  }

  /**
   * Sanitize user input
   */
  private sanitizeUserInput(input: string): string {
    // Remove script tags and event handlers
    let sanitized = input.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Encode special characters
    const specialChars: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    Object.entries(specialChars).forEach(([char, encoded]) => {
      sanitized = sanitized.replace(new RegExp(char, 'g'), encoded);
    });

    return sanitized;
  }

  /**
   * Sanitize HTML content using DOMPurify
   */
  private sanitizeHtmlContent(content: string, config: SanitizationConfig): string {
    const purifyConfig = {
      ALLOWED_TAGS: config.allowedTags,
      ALLOWED_ATTR: Object.keys(config.allowedAttributes),
      KEEP_CONTENT: true,
      SAFE_FOR_TEMPLATES: true
    };

    return DOMPurify.sanitize(content, purifyConfig);
  }

  /**
   * Sanitize URL parameters
   */
  private sanitizeUrlParameter(param: string): string {
    // URL decode first
    let sanitized = decodeURIComponent(param);
    
    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>"'&]/g, '');
    
    // Remove potential script injections
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');
    
    // Encode for safe URL usage
    return encodeURIComponent(sanitized);
  }

  /**
   * Sanitize file names
   */
  private sanitizeFileName(fileName: string): string {
    // Remove path traversal attempts
    let sanitized = fileName.replace(/\.\./g, '');
    
    // Remove dangerous characters for file systems
    sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1f]/g, '');
    
    // Remove leading/trailing dots and spaces
    sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '');
    
    // Ensure not empty after sanitization
    if (sanitized === '') {
      sanitized = 'sanitized_file';
    }
    
    return sanitized;
  }

  /**
   * Sanitize database query parameters
   */
  private sanitizeDatabaseQuery(query: string): string {
    // Remove SQL injection patterns
    const injectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(--|\/\*|\*\/|;)/g,
      /(\bOR\b|\bAND\b)\s*['"]*\d+['"]*\s*=\s*['"]*\d+['"]/gi,
      /['"\\]/g
    ];

    let sanitized = query;
    injectionPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized.trim();
  }

  /**
   * Apply common sanitization rules
   */
  private applyCommonSanitization(content: string, config: SanitizationConfig): string {
    let sanitized = content;

    // Apply length limits
    if (config.maxLength && sanitized.length > config.maxLength) {
      sanitized = sanitized.substring(0, config.maxLength);
    }

    // Strip scripts if configured
    if (config.stripScripts) {
      sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
      sanitized = sanitized.replace(/javascript:/gi, '');
    }

    // Strip links if configured
    if (config.stripLinks) {
      sanitized = sanitized.replace(/<a[^>]*>.*?<\/a>/gi, '');
      sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '');
    }

    // Strip images if configured
    if (config.stripImages) {
      sanitized = sanitized.replace(/<img[^>]*>/gi, '');
    }

    return sanitized;
  }

  /**
   * Validate content against common attack patterns
   */
  validateContent(content: string): {
    isValid: boolean;
    threats: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const threats: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check for XSS attempts
    if (/<script[^>]*>.*?<\/script>/gi.test(content)) {
      threats.push('Script injection detected');
      riskLevel = 'high';
    }

    if (/on\w+\s*=/gi.test(content)) {
      threats.push('Event handler injection detected');
      riskLevel = 'high';
    }

    if (/javascript:/gi.test(content)) {
      threats.push('JavaScript protocol detected');
      riskLevel = 'high';
    }

    // Check for SQL injection attempts
    if (/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi.test(content)) {
      threats.push('SQL injection attempt detected');
      riskLevel = 'high';
    }

    if (/(--|\/\*|\*\/)/g.test(content)) {
      threats.push('SQL comment injection detected');
      riskLevel = 'medium';
    }

    // Check for path traversal
    if (/\.\.[\/\\]/g.test(content)) {
      threats.push('Path traversal attempt detected');
      riskLevel = 'medium';
    }

    // Check for suspicious patterns
    if (/eval\s*\(/gi.test(content)) {
      threats.push('Code evaluation attempt detected');
      riskLevel = 'high';
    }

    if (threats.length > 3) {
      riskLevel = 'high';
    } else if (threats.length > 1) {
      riskLevel = 'medium';
    }

    return {
      isValid: threats.length === 0,
      threats,
      riskLevel
    };
  }

  /**
   * Batch sanitize multiple inputs
   */
  sanitizeBatch(inputs: Array<{ content: string; context: SanitizationContext }>): string[] {
    return inputs.map(input => this.sanitize(input.content, input.context));
  }

  /**
   * Get sanitization statistics
   */
  getStatistics(): {
    totalSanitizations: number;
    threatsPrevented: number;
    averageProcessingTime: number;
  } {
    // This would be implemented with actual metrics tracking
    return {
      totalSanitizations: 0,
      threatsPrevented: 0,
      averageProcessingTime: 0
    };
  }
}

// Convenience functions for common use cases
export const sanitizeSearchQuery = (query: string): string => {
  return ContentSanitizer.getInstance().sanitize(query, SanitizationContext.SEARCH_QUERY);
};

export const sanitizeUserInput = (input: string): string => {
  return ContentSanitizer.getInstance().sanitize(input, SanitizationContext.USER_INPUT);
};

export const sanitizeHtmlContent = (content: string): string => {
  return ContentSanitizer.getInstance().sanitize(content, SanitizationContext.HTML_CONTENT);
};

export const validateInput = (content: string) => {
  return ContentSanitizer.getInstance().validateContent(content);
};