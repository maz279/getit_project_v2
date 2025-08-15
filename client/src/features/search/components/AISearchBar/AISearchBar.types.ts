/**
 * AISearchBar Type Definitions
 * Extracted from the main component for better maintainability
 */

// === CORE SEARCH INTERFACES ===
export interface SearchSuggestion {
  readonly id: string;
  readonly text: string;
  readonly type: 'product' | 'category' | 'brand' | 'intent' | 'history' | 'trending' | 'phonetic' | 'page' | 'completion' | 'popular';
  readonly frequency?: number;
  readonly relevance?: number;
  readonly count?: number;
  readonly bengaliPhonetic?: string;
  readonly navigationItem?: any;
}

export interface SearchResult {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: 'product' | 'page' | 'menu' | 'faq' | 'external';
  readonly relevanceScore: number;
  readonly thumbnail?: string;
  readonly url?: string;
  readonly price?: string;
  readonly rating?: number;
  readonly badge?: string;
  readonly category?: string;
  readonly isNavigationItem?: boolean;
}

export interface NavigationResult {
  readonly item: {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly route: string;
    readonly category: string;
    readonly bengaliTitle?: string;
    readonly bengaliDescription?: string;
  };
}

// === COMPONENT PROPS ===
export interface AISearchBarProps {
  readonly onSearch?: (query: string, data: {
    searchResults?: SearchResult[];
    conversationalResponse?: string;
    navigationResults?: any[];
  }) => void;
  readonly onSearchWithResults?: (query: string, results: SearchResult[]) => void;
  readonly onSearchLoading?: (loading: boolean) => void;
  readonly placeholder?: string;
  readonly language?: 'en' | 'bn';
  readonly className?: string;
  readonly disabled?: boolean;
}

// === SEARCH TYPES ===
export type SearchType = 'text' | 'voice' | 'image' | 'ai' | 'qr' | 'visual';

export type Language = 'en' | 'bn';

// === API & RESPONSE TYPES ===
export interface APIResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly metadata?: {
    readonly processingTime: number;
    readonly timestamp: string;
    readonly [key: string]: unknown;
  };
}

// === SPEECH RECOGNITION TYPES ===
export interface SpeechRecognitionConfig {
  readonly continuous: boolean;
  readonly interimResults: boolean;
  readonly lang: string;
}

export interface VoiceSearchResult {
  readonly transcript: string;
  readonly confidence: number;
  readonly isFinal: boolean;
}

// === STATE MANAGEMENT TYPES ===
export interface SearchState {
  readonly query: string;
  readonly suggestions: SearchSuggestion[];
  readonly searchResults: SearchResult[];
  readonly conversationalResponse: string;
  readonly showSuggestions: boolean;
  readonly isLoading: boolean;
  readonly isLoadingSuggestions: boolean;
  readonly isListening: boolean;
  readonly isRecording: boolean;
  readonly isProcessingImage: boolean;
  readonly isProcessingQR: boolean;
  readonly uploadedImage: string | File | null;
  readonly imagePreview: string | null;
  readonly lastError: string | null;
  readonly searchType: SearchType;
  readonly language: Language;
  readonly showResults: boolean;
  readonly navigationResults: NavigationResult[];
}

export type SearchAction = 
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SUGGESTIONS'; payload: SearchSuggestion[] }
  | { type: 'SET_SEARCH_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_CONVERSATIONAL_RESPONSE'; payload: string }
  | { type: 'SET_SHOW_SUGGESTIONS'; payload: boolean }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_IS_LOADING_SUGGESTIONS'; payload: boolean }
  | { type: 'SET_IS_LISTENING'; payload: boolean }
  | { type: 'SET_IS_RECORDING'; payload: boolean }
  | { type: 'SET_IS_PROCESSING_IMAGE'; payload: boolean }
  | { type: 'SET_IS_PROCESSING_QR'; payload: boolean }
  | { type: 'SET_UPLOADED_IMAGE'; payload: string | File | null }
  | { type: 'SET_IMAGE_PREVIEW'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_TYPE'; payload: SearchType }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_SHOW_RESULTS'; payload: boolean }
  | { type: 'SET_NAVIGATION_RESULTS'; payload: NavigationResult[] }
  | { type: 'CLEAR_ALL' };

// === VALIDATION TYPES ===
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly sanitizedInput?: string;
}

export interface ValidationRule {
  readonly pattern: RegExp;
  readonly message: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

// === ANALYTICS TYPES ===
export interface SearchAnalytics {
  readonly searchQuery: string;
  readonly searchType: SearchType;
  readonly timestamp: number;
  readonly responseTime: number;
  readonly resultsCount: number;
  readonly suggestionsCount: number;
  readonly language: Language;
  readonly success: boolean;
  readonly errorCode?: string;
}

export interface BusinessIntelligence {
  readonly searchIntent: string;
  readonly complexity: 'simple' | 'complex';
  readonly language: Language;
  readonly culturalContext: string[];
  readonly marketSegment: string;
  readonly conversionProbability: number;
}

// === CACHE TYPES ===
export interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly ttl: number;
  readonly hits: number;
}

export interface CacheStats {
  readonly totalEntries: number;
  readonly hitRate: number;
  readonly missRate: number;
  readonly memoryUsage: number;
}

// === REQUEST MANAGEMENT TYPES ===
export interface RequestInfo {
  readonly id: string;
  readonly url: string;
  readonly method: string;
  readonly timestamp: number;
  readonly controller: AbortController;
}

export interface QueuedRequest {
  readonly id: string;
  readonly execute: () => Promise<void>;
  readonly priority: 'low' | 'medium' | 'high';
  readonly timestamp: number;
}