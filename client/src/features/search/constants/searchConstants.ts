/**
 * Search Constants and Configuration
 * Centralized configuration for the search system
 */

// === API CONFIGURATION ===
export const API_BASE = '';

export const API_ENDPOINTS = {
  suggestions: '/api/search/suggestions',
  amazonStyleSuggestions: '/api/search/suggestions-enhanced',
  search: '/api/search/enhanced',
  products: '/api/search/products',
  navigation: '/api/search/navigation-search',
  recommendations: '/api/groq-ai/recommendations',
  imageUpload: '/api/upload/image',
  voiceSearch: '/api/search/voice',
  qrSearch: '/api/search/qr',
} as const;

// === SEARCH CONFIGURATION ===
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 200, // Optimized for Bangladesh 2G users
  DEBOUNCE_DELAY: 300,
  SUGGESTION_LIMIT: 12,
  RESULTS_LIMIT: 20,
  CACHE_TTL: 300000, // 5 minutes
  REQUEST_TIMEOUT: 10000, // 10 seconds
} as const;

// === VALIDATION PATTERNS ===
export const VALIDATION_PATTERNS = {
  VALID_CHARS: /^[\p{L}\p{N}\s\-_.,!?()[\]{}@#$%&*+=:;।]+$/u,
  DANGEROUS_XSS: [
    /<script[^>]*>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /VBScript:/g,
    /<iframe[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    /style\s*=\s*[^>]*expression/gi,
  ],
  SQL_INJECTION: [
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+set/gi,
    /exec\s*\(/gi,
    /sp_executesql/gi,
  ],
} as const;

// === SPEECH RECOGNITION CONFIGURATION ===
export const SPEECH_CONFIG = {
  RECOGNITION_LANG: {
    en: 'en-US',
    bn: 'bn-BD',
  },
  CONTINUOUS: false,
  INTERIM_RESULTS: true,
  MAX_ALTERNATIVES: 3,
  CONFIDENCE_THRESHOLD: 0.7,
} as const;

// === CACHE CONFIGURATION ===
export const CACHE_CONFIG = {
  MAX_SIZE: 1000,
  DEFAULT_TTL: 300000, // 5 minutes
  CLEANUP_INTERVAL: 60000, // 1 minute
  HIT_BOOST: 0.1,
  MEMORY_THRESHOLD: 0.8, // 80% memory usage
} as const;

// === REQUEST MANAGEMENT ===
export const REQUEST_CONFIG = {
  MAX_CONCURRENT: 10,
  MAX_REQUESTS_PER_MINUTE: 60,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 10000,
} as const;

// === UI CONFIGURATION ===
export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  DROPDOWN_Z_INDEX: 200,
  SUGGESTION_HEIGHT: 48,
  MAX_VISIBLE_SUGGESTIONS: 8,
  SCROLL_THRESHOLD: 0.8,
} as const;

// === ANALYTICS CONFIGURATION ===
export const ANALYTICS_CONFIG = {
  TRACK_SEARCHES: true,
  TRACK_SUGGESTIONS: true,
  TRACK_ERRORS: true,
  BATCH_SIZE: 10,
  FLUSH_INTERVAL: 30000, // 30 seconds
} as const;

// === SUPPORTED LANGUAGES ===
export const SUPPORTED_LANGUAGES = ['en', 'bn'] as const;

// === HTML ENTITIES MAP ===
export const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
} as const;

// === SUGGESTION TYPES ===
export const SUGGESTION_TYPES = {
  PRODUCT: 'product',
  CATEGORY: 'category',
  BRAND: 'brand',
  INTENT: 'intent',
  HISTORY: 'history',
  TRENDING: 'trending',
  PHONETIC: 'phonetic',
  PAGE: 'page',
  COMPLETION: 'completion',
  POPULAR: 'popular',
} as const;

// === SEARCH TYPES ===
export const SEARCH_TYPES = {
  TEXT: 'text',
  VOICE: 'voice',
  IMAGE: 'image',
  AI: 'ai',
  QR: 'qr',
  VISUAL: 'visual',
} as const;

// === ERROR MESSAGES ===
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  VALIDATION_ERROR: 'Invalid input detected.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment.',
  GENERIC_ERROR: 'An unexpected error occurred.',
  XSS_DETECTED: 'Potentially dangerous content detected.',
  SQL_INJECTION: 'SQL injection attempt detected.',
  INPUT_TOO_LONG: 'Search query is too long.',
  INPUT_TOO_SHORT: 'Search query is too short.',
  NO_MICROPHONE: 'Microphone access is required for voice search.',
  NO_CAMERA: 'Camera access is required for QR code scanning.',
} as const;

// === BANGLADESH SPECIFIC ===
export const BANGLADESH_CONFIG = {
  CURRENCY: '৳',
  DEFAULT_CITY: 'Dhaka',
  POPULAR_CITIES: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal'],
  PAYMENT_METHODS: ['Cash on Delivery', 'bKash', 'Nagad', 'Rocket', 'Bank Transfer'],
  POPULAR_BRANDS: ['Walton', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme'],
} as const;

// === PERFORMANCE THRESHOLDS ===
export const PERFORMANCE_THRESHOLDS = {
  FAST_RESPONSE: 100, // ms
  NORMAL_RESPONSE: 500, // ms
  SLOW_RESPONSE: 1000, // ms
  CRITICAL_RESPONSE: 3000, // ms
} as const;