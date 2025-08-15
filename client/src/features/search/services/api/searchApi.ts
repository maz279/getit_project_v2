/**
 * Search API Services - Centralized API calls
 * Extracted from AISearchBar for better maintainability
 */

import { API_ENDPOINTS, API_BASE, SEARCH_CONFIG } from '../../constants/searchConstants';
import type { SearchSuggestion, SearchResult, APIResponse } from '../../components/AISearchBar/AISearchBar.types';

export class SearchApi {
  static async getSuggestions(
    query: string, 
    language: string = 'en',
    signal?: AbortSignal
  ): Promise<APIResponse<SearchSuggestion[]>> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.suggestions}?q=${encodeURIComponent(query)}&lang=${language}`,
        { signal }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error; // Re-throw abort errors
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async getAmazonStyleSuggestions(
    query: string,
    options: {
      vendorId?: number;
      location?: string;
      userHistory?: string[];
      limit?: number;
    } = {},
    signal?: AbortSignal
  ): Promise<APIResponse<SearchSuggestion[]>> {
    try {
      const { vendorId, location = 'BD', userHistory = [], limit = 10 } = options;
      
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        location
      });
      
      if (vendorId) params.append('vendor_id', vendorId.toString());
      if (userHistory.length) params.append('user_history', userHistory.join(','));
      
      const response = await fetch(`${API_ENDPOINTS.amazonStyleSuggestions}?${params}`, { 
        signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async getNavigationResults(
    query: string, 
    language: string = 'en',
    signal?: AbortSignal
  ): Promise<APIResponse<{ navigationResults: any[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/search/navigation-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language }),
        signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async performSearch(
    query: string,
    searchType: string = 'text',
    language: string = 'en',
    signal?: AbortSignal
  ): Promise<APIResponse<{ searchResults: SearchResult[]; conversationalResponse?: string }>> {
    try {
      const response = await fetch(API_ENDPOINTS.search, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          searchType, 
          language,
          limit: SEARCH_CONFIG.RESULTS_LIMIT 
        }),
        signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async getRecommendations(
    query: string,
    language: string = 'en',
    signal?: AbortSignal
  ): Promise<APIResponse<string[]>> {
    try {
      const response = await fetch(API_ENDPOINTS.recommendations, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language }),
        signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async uploadImage(
    file: File,
    signal?: AbortSignal
  ): Promise<APIResponse<{ imageUrl: string; analysis?: any }>> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(API_ENDPOINTS.imageUpload, {
        method: 'POST',
        body: formData,
        signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async processVoiceSearch(
    audioBlob: Blob,
    language: string = 'en',
    signal?: AbortSignal
  ): Promise<APIResponse<{ transcript: string; confidence: number }>> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', language);
      
      const response = await fetch(API_ENDPOINTS.voiceSearch, {
        method: 'POST',
        body: formData,
        signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async processQRCode(
    imageData: string,
    signal?: AbortSignal
  ): Promise<APIResponse<{ text: string; format: string }>> {
    try {
      const response = await fetch(API_ENDPOINTS.qrSearch, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
        signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}