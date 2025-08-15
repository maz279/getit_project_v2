/**
 * Enhanced Auto-Suggest Contracts
 * TypeScript-first contracts for multi-source suggestion system
 */

export interface SuggestRequest {
  q: string; // user query prefix
  context: {
    geo?: string;
    vendorId?: string;
    userId?: string;
    imagePayload?: string; // base64 or file reference
    qrPayload?: string;    // decoded QR content
    language?: string;
    limit?: number;
  };
}

export interface SuggestHit {
  text: string;
  source: 'catalog' | 'querylog' | 'image' | 'qr' | 'mlgen' | 'navigation';
  score: number;
  type: 'product' | 'category' | 'brand' | 'completion' | 'trending' | 'navigation';
  metadata?: {
    productIds?: number[];
    category?: string;
    brand?: string;
    priceRange?: string;
    confidence?: number;
    imageLabels?: string[];
    qrType?: string;
  };
}

export interface SuggestResponse {
  success: boolean;
  data: SuggestHit[];
  metadata: {
    query: string;
    sources: string[];
    totalTime: number;
    sourceTimings: Record<string, number>;
    count: number;
  };
}

export interface ImageAnalysisResult {
  labels: Array<{
    description: string;
    confidence: number;
    category: string;
  }>;
  processingTime: number;
}

export interface QRAnalysisResult {
  content: string;
  type: 'url' | 'product' | 'text' | 'unknown';
  productCode?: string;
  metadata?: Record<string, any>;
}

export interface MLGeneratedSuggestion {
  text: string;
  confidence: number;
  intent: 'search' | 'navigation' | 'product' | 'category';
  reasoning?: string;
}