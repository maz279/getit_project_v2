/**
 * PHASE 2: TYPE DEFINITIONS FOR UNIFIED SEARCH RESULTS
 * Centralized type definitions for improved maintainability
 * Date: July 26, 2025
 */

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'page' | 'menu' | 'faq' | 'external';
  relevanceScore: number;
  thumbnail?: string;
  price?: string;
  rating?: number;
  badge?: string;
  category?: string;
  url?: string;
  bengaliTitle?: string;
  bengaliDescription?: string;
}

export interface NavigationResultItem {
  id: string;
  title: string;
  description: string;
  route: string;
  category: string;
  bengaliTitle?: string;
  bengaliDescription?: string;
}

export interface NavigationResult {
  item: NavigationResultItem;
}

// ✅ PHASE 3: Enhanced typing to replace 'any' - addresses C3
export interface InfoVisualDataPoint {
  label: string;
  value: number;
  color?: string;
  category?: string;
}

export interface MarketInsight {
  id: string;
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  category: string;
}

export interface EnhancedSearchResults {
  status: 'loading' | 'success' | 'error';
  data?: {
    results?: SearchResult[];
    recommendations?: Recommendation[];
    infobytes?: InfoByte[];
    marketInsights?: MarketInsight[];
  };
  error?: string;
}

// ✅ Legacy array support for backward compatibility
export type SearchResultsType = 
  | EnhancedSearchResults 
  | SearchResult[] 
  | null 
  | undefined;

export interface InfoByte {
  id: string;
  title: string;
  content: string;
  icon: string;
  type: 'tip' | 'fact' | 'guide' | 'trend';
  color: string;
}

// ✅ PHASE 3: Fixed InfoVisual type definition - addresses Priority 3A
export interface InfoVisual {
  id: string;
  title: string;
  type: 'bar' | 'pie' | 'trend' | 'stat';
  data: InfoVisualDataPoint[]; // ✅ FIXED: Properly typed instead of 'any[]' 
  description: string;
  color?: string;
  interactive?: boolean;
  metadata?: {
    unit?: string;
    currency?: string;
    timeRange?: string;
  };
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  price?: string;
  rating?: number;
  image?: string;
  category: string;
  badge?: string;
}

// ✅ PHASE 3: Enhanced SearchMetrics interface - addresses Priority 3B
export interface SearchMetrics {
  responseTime: number;
  accuracy: number;
  totalResults: number;
  aiConfidence: number;
  cacheHitRate?: number;
  processingTime?: number;
  errorRate?: number;
}

// ✅ PHASE 3: Enhanced SearchState interface - addresses Priority 3B  
export interface SearchState {
  activeSection: 'all' | 'ai' | 'products' | 'pages' | 'insights' | 'recommendations';
  isLoading: boolean;
  hasError: boolean;
  groqRecommendations: Recommendation[];
  loadingRecommendations: boolean;
  metrics?: SearchMetrics;
  errorMessage?: string;
  lastUpdated?: Date;
}

export interface SearchMetrics {
  responseTime: number;
  accuracy: number;
  totalResults: number;
  aiConfidence: number;
}

// ✅ PHASE 3: Enhanced type safety with branded types and validation
export type SearchQuery = string & { readonly __brand: unique symbol };
export type LanguageCode = 'en' | 'bn';
export type SectionType = 'all' | 'ai' | 'products' | 'pages' | 'insights' | 'recommendations';

// ✅ PHASE 3: Validation utilities for type safety
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings?: readonly string[];
}

// ✅ PHASE 3: Performance tracking types
export interface PerformanceMetrics {
  readonly renderTime: number;
  readonly memoryUsage: number;  
  readonly componentCount: number;
  readonly reRenderCount: number;
}

// Component Props Interfaces
export interface BaseSearchProps {
  language: LanguageCode;
  query: string;
}

export interface AIAssistantSectionProps extends BaseSearchProps {
  showConversationalResponse: boolean;
  conversationalResponse: string;
  activeSection: string;
}

export interface ProductResultsSectionProps extends BaseSearchProps {
  showResults: boolean;
  searchResults: SearchResultsType;
  activeSection: string;
  onProductClick: (result: SearchResult) => void;
}

export interface NavigationResultsSectionProps extends BaseSearchProps {
  showNavigationResults: boolean;
  navigationResults: NavigationResult[];
  activeSection: string;
  onNavigateToPage: (route: string, title: string) => void;
}

export interface InfoBytesSectionProps extends BaseSearchProps {
  activeSection: string;
  infobytes: InfoByte[];
}

export interface RecommendationsSectionProps extends BaseSearchProps {
  activeSection: string;
  recommendations: Recommendation[];
  groqRecommendations: Recommendation[];
  loadingRecommendations: boolean;
}

export interface SearchHeaderProps extends BaseSearchProps {
  onClose: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export interface UnifiedSearchResultsProps extends BaseSearchProps {
  // AI Assistant Section
  showConversationalResponse: boolean;
  conversationalResponse: string;
  
  // Navigation/Pages Section  
  showNavigationResults: boolean;
  navigationResults: NavigationResult[];
  
  // Products Section
  showResults: boolean;
  searchResults: SearchResultsType;
  
  // Handlers
  onClose: () => void;
  onNavigateToPage: (route: string, title: string) => void;
  
  // Configuration
  className?: string;
  apiEndpoint?: string;
  
  // ✅ PHASE 3: Enhanced props with type safety
  performanceTracking?: boolean;
  debugMode?: boolean;
  onMetricsUpdate?: (metrics: SearchMetrics) => void;
  onError?: (error: string) => void;
  maxResults?: number;
  enabledSections?: readonly SectionType[];
}

// ✅ PHASE 3: Hook return types for enhanced type safety
export interface UseSearchStateReturn {
  searchState: SearchState;
  setActiveSection: (section: string) => void;
  setIsLoading: (loading: boolean) => void;
  setGroqRecommendations: (recommendations: Recommendation[]) => void;
  setLoadingRecommendations: (loading: boolean) => void;
  updateMetrics: (metrics: Partial<SearchMetrics>) => void;
  handleError: (error: string) => void;
  clearError: () => void;
  resetState: () => void;
}