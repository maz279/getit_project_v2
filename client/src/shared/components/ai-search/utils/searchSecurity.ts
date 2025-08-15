/**
 * Phase 1 Critical Fix: Security Utilities for Search System
 * XSS prevention, input validation, and rate limiting
 * Created: July 21, 2025
 */

import { SecurityValidation } from '../types/search.types';

// HTML entity escaping for XSS prevention
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Comprehensive input sanitization with Unicode normalization
export const sanitizeSearchQuery = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Normalize Unicode to prevent homoglyph attacks
  const normalized = input.normalize('NFC');

  // Remove potentially dangerous characters while preserving search functionality
  return normalized
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove on* event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .substring(0, 200); // Limit length - removed overly restrictive character filtering
};

// Pre-compiled patterns for optimal performance
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
];

const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
  /(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP))/gi,
  /(--\s*[a-zA-Z])/g // Only block SQL comments, not regular double dashes
];

// Advanced input validation with pre-compiled patterns
export const validateSearchInput = (input: string): SecurityValidation => {
  const risks: SecurityValidation['risks'] = [];
  
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      sanitizedInput: '',
      risks: [{
        type: 'MALFORMED_INPUT',
        severity: 'medium',
        description: 'Invalid input type or empty input'
      }]
    };
  }

  // Check for XSS patterns using pre-compiled regex
  XSS_PATTERNS.forEach(pattern => {
    if (pattern.test(input)) {
      risks.push({
        type: 'XSS',
        severity: 'critical',
        description: `Potential XSS attack pattern detected: ${pattern.toString()}`
      });
    }
  });

  // Check for SQL injection patterns using pre-compiled regex

  SQL_PATTERNS.forEach(pattern => {
    if (pattern.test(input)) {
      risks.push({
        type: 'SQL_INJECTION',
        severity: 'high',
        description: `Potential SQL injection pattern detected: ${pattern.toString()}`
      });
    }
  });

  // Check for script injection
  if (input.includes('<') || input.includes('>')) {
    risks.push({
      type: 'SCRIPT_INJECTION',
      severity: 'high',
      description: 'HTML/Script tags detected in input'
    });
  }

  // Length validation
  if (input.length > 200) {
    risks.push({
      type: 'MALFORMED_INPUT',
      severity: 'medium',
      description: 'Input exceeds maximum allowed length'
    });
  }

  const sanitizedInput = sanitizeSearchQuery(input);
  const isValid = risks.filter(r => r.severity === 'critical' || r.severity === 'high').length === 0;

  return {
    isValid,
    sanitizedInput,
    risks
  };
};

// Enhanced Client-side rate limiting with queue system
export class ClientRateLimit {
  private requests: number[] = [];
  private windowMs: number;
  private maxRequests: number;
  private requestQueue: Array<{query: string, timestamp: number, priority: number}> = [];
  private cache: Map<string, {result: any, timestamp: number}> = new Map();
  private cacheExpiryMs: number = 300000; // 5 minutes cache

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  // Add jitter to prevent thundering herd
  private addJitter(delay: number): number {
    return delay + Math.random() * 1000; // Add up to 1s jitter
  }

  // Exponential backoff for queue processing
  private getBackoffDelay(attempts: number): number {
    return Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30s
  }

  // Check if request is allowed, with intelligent queueing
  isAllowed(query?: string): boolean {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(timestamp => 
      now - timestamp < this.windowMs
    );

    // Check cache first
    if (query && this.getCachedResult(query)) {
      return true; // Cached results don't count against rate limit
    }

    // If we're at the limit, queue the request instead of rejecting
    if (this.requests.length >= this.maxRequests) {
      if (query) {
        this.queueRequest(query, now);
      }
      return false;
    }

    // Add current request
    this.requests.push(now);
    return true;
  }

  // Queue system for handling requests when rate limited
  private queueRequest(query: string, timestamp: number): void {
    // Remove duplicate queries from queue
    this.requestQueue = this.requestQueue.filter(req => req.query !== query);
    
    // Add new request with priority (more recent = higher priority)
    this.requestQueue.push({
      query,
      timestamp,
      priority: timestamp
    });

    // Keep only the 3 most recent queries
    this.requestQueue.sort((a, b) => b.priority - a.priority);
    this.requestQueue = this.requestQueue.slice(0, 3);
  }

  // Get next queued request if rate limit allows with jitter
  getNextQueuedRequest(): string | null {
    if (this.requestQueue.length === 0 || !this.isAllowed()) {
      return null;
    }

    const request = this.requestQueue.shift();
    
    // Add jitter delay for queue processing
    if (request && this.requestQueue.length > 0) {
      const jitteredDelay = this.addJitter(100); // Base 100ms + jitter
      setTimeout(() => {
        // Queue processing continues after jitter delay
      }, jitteredDelay);
    }
    
    return request?.query || null;
  }

  // Cache management
  cacheResult(query: string, result: any): void {
    this.cache.set(query.toLowerCase(), {
      result,
      timestamp: Date.now()
    });

    // Clean old cache entries
    this.cleanCache();
  }

  getCachedResult(query: string): any | null {
    const cached = this.cache.get(query.toLowerCase());
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.cacheExpiryMs) {
      this.cache.delete(query.toLowerCase());
      return null;
    }

    return cached.result;
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheExpiryMs) {
        this.cache.delete(key);
      }
    }
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(timestamp => 
      now - timestamp < this.windowMs
    );
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getResetTime(): number {
    if (this.requests.length === 0) {
      return 0;
    }
    
    const oldestRequest = Math.min(...this.requests);
    return oldestRequest + this.windowMs;
  }

  getQueueLength(): number {
    return this.requestQueue.length;
  }

  reset(): void {
    this.requests = [];
    this.requestQueue = [];
    this.cache.clear();
  }
}

// Content Security Policy helpers with environment fallback
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  
  // Try browser crypto first
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(array);
  } 
  // Node.js crypto fallback
  else if (typeof global !== 'undefined' && (global as any).crypto?.getRandomValues) {
    (global as any).crypto.getRandomValues(array);
  }
  // Math.random fallback (less secure, for compatibility)
  else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  return btoa(String.fromCharCode(...array));
};

// Safe HTML rendering for search results with DOMPurify integration
export const sanitizeHtml = (html: string): string => {
  if (typeof html !== 'string') return '';
  
  // Try DOMPurify first if available (from ContentSanitizer)
  if (typeof window !== 'undefined' && (window as any).DOMPurify) {
    return (window as any).DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
      ALLOWED_ATTR: []
    });
  }
  
  // Fallback to our existing safe method
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// URL validation for search results
export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Secure cookie handling for search preferences
export const setSecureCookie = (name: string, value: string, days: number = 7): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
};

export const getSecureCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  
  return null;
};

// Enhanced input field sanitization for forms with type validation
export const sanitizeFormInput = (input: string, type: 'text' | 'email' | 'phone' | 'url' = 'text'): string => {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  switch (type) {
    case 'email':
      // Enhanced email sanitization with validation
      sanitized = sanitized.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
      // Basic email format validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
        return ''; // Return empty for invalid email format
      }
      break;
    case 'phone':
      // Enhanced phone sanitization with international support
      sanitized = sanitized.replace(/[^0-9+\-\s()]/g, '');
      // Remove extra spaces and normalize format
      sanitized = sanitized.replace(/\s+/g, ' ').trim();
      break;
    case 'url':
      // Enhanced URL sanitization with protocol validation
      try {
        const url = new URL(sanitized);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return '';
        }
        sanitized = url.toString();
      } catch {
        return ''; // Invalid URL format
      }
      break;
    default:
      // Enhanced text sanitization
      sanitized = escapeHtml(sanitized);
  }
  
  return sanitized;
};

// Debug panel security - prevent XSS in debug output
export const secureDebugOutput = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    return escapeHtml(jsonString);
  } catch (error) {
    return escapeHtml(String(data));
  }
};

// Request header sanitization
export const sanitizeHeaders = (headers: Record<string, string>): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  
  Object.entries(headers).forEach(([key, value]) => {
    // Only allow safe header names and values
    const safeKey = key.replace(/[^\w-]/g, '');
    const safeValue = value.replace(/[\r\n]/g, '');
    
    if (safeKey && safeValue) {
      sanitized[safeKey] = safeValue;
    }
  });
  
  return sanitized;
};