/**
 * Bundle Optimizer Service
 * Phase 2 Week 5-6: Performance & Mobile Optimization
 * Tree shaking, vendor chunking, and performance budgets
 */

import React from 'react';

interface BundleConfig {
  enableTreeShaking: boolean;
  enableVendorChunking: boolean;
  enableCompression: boolean;
  performanceBudgets: PerformanceBudgets;
  chunkSizeLimit: number;
  assetSizeLimit: number;
}

interface PerformanceBudgets {
  maxBundleSize: number;
  maxChunkSize: number;
  maxAssetSize: number;
  maxInitialJS: number;
  maxInitialCSS: number;
}

interface BundleAnalysis {
  totalSize: number;
  chunkSizes: Map<string, number>;
  duplicateModules: string[];
  unusedExports: string[];
  compressionRatio: number;
  performanceScore: number;
}

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
  warnings: string[];
  recommendations: string[];
}

class BundleOptimizer {
  private static instance: BundleOptimizer;
  private config: BundleConfig;
  private bundleAnalysis: BundleAnalysis | null = null;
  private optimizationHistory: OptimizationResult[] = [];

  constructor(config: Partial<BundleConfig> = {}) {
    this.config = {
      enableTreeShaking: true,
      enableVendorChunking: true,
      enableCompression: true,
      performanceBudgets: {
        maxBundleSize: 500 * 1024, // 500KB
        maxChunkSize: 200 * 1024, // 200KB
        maxAssetSize: 100 * 1024, // 100KB
        maxInitialJS: 300 * 1024, // 300KB
        maxInitialCSS: 50 * 1024, // 50KB
      },
      chunkSizeLimit: 200 * 1024, // 200KB
      assetSizeLimit: 100 * 1024, // 100KB
      ...config,
    };
  }

  static getInstance(config?: Partial<BundleConfig>): BundleOptimizer {
    if (!BundleOptimizer.instance) {
      BundleOptimizer.instance = new BundleOptimizer(config);
    }
    return BundleOptimizer.instance;
  }

  /**
   * Analyze current bundle composition
   */
  async analyzeBundleComposition(): Promise<BundleAnalysis> {
    const analysis: BundleAnalysis = {
      totalSize: 0,
      chunkSizes: new Map(),
      duplicateModules: [],
      unusedExports: [],
      compressionRatio: 0,
      performanceScore: 0,
    };

    try {
      // Simulate bundle analysis (in real implementation, this would parse webpack stats)
      const chunks = this.getChunkInformation();
      
      analysis.totalSize = chunks.reduce((total, chunk) => total + chunk.size, 0);
      
      chunks.forEach(chunk => {
        analysis.chunkSizes.set(chunk.name, chunk.size);
      });

      // Detect duplicate modules
      analysis.duplicateModules = this.detectDuplicateModules(chunks);
      
      // Detect unused exports
      analysis.unusedExports = this.detectUnusedExports();
      
      // Calculate compression ratio
      analysis.compressionRatio = this.calculateCompressionRatio(analysis.totalSize);
      
      // Calculate performance score
      analysis.performanceScore = this.calculatePerformanceScore(analysis);
      
      this.bundleAnalysis = analysis;
      
      return analysis;
    } catch (error) {
      console.error('Bundle analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get chunk information from webpack stats
   */
  private getChunkInformation() {
    // Simulate chunk information (in real implementation, read from webpack stats)
    return [
      { name: 'main', size: 250 * 1024, modules: ['react', 'react-dom', 'app'] },
      { name: 'vendor', size: 180 * 1024, modules: ['lodash', 'moment', 'axios'] },
      { name: 'customer', size: 120 * 1024, modules: ['customer-components'] },
      { name: 'admin', size: 90 * 1024, modules: ['admin-components'] },
      { name: 'vendor-dashboard', size: 85 * 1024, modules: ['vendor-components'] },
      { name: 'ai-features', size: 75 * 1024, modules: ['ai-components'] },
      { name: 'payment', size: 65 * 1024, modules: ['payment-components'] },
      { name: 'analytics', size: 55 * 1024, modules: ['analytics-components'] },
    ];
  }

  /**
   * Detect duplicate modules across chunks
   */
  private detectDuplicateModules(chunks: any[]): string[] {
    const moduleCount = new Map<string, number>();
    const duplicates: string[] = [];

    chunks.forEach(chunk => {
      chunk.modules.forEach((module: string) => {
        moduleCount.set(module, (moduleCount.get(module) || 0) + 1);
      });
    });

    moduleCount.forEach((count, module) => {
      if (count > 1) {
        duplicates.push(module);
      }
    });

    return duplicates;
  }

  /**
   * Detect unused exports (simplified implementation)
   */
  private detectUnusedExports(): string[] {
    // Simulate unused export detection
    return [
      'utils/deprecatedHelper',
      'components/LegacyComponent',
      'services/OldApiService',
    ];
  }

  /**
   * Calculate compression ratio
   */
  private calculateCompressionRatio(totalSize: number): number {
    // Simulate compression analysis
    const uncompressedSize = totalSize * 1.4; // Assume 40% compression
    return (uncompressedSize - totalSize) / uncompressedSize;
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculatePerformanceScore(analysis: BundleAnalysis): number {
    let score = 100;

    // Deduct points for large bundle size
    if (analysis.totalSize > this.config.performanceBudgets.maxBundleSize) {
      score -= 20;
    }

    // Deduct points for large chunks
    analysis.chunkSizes.forEach(size => {
      if (size > this.config.chunkSizeLimit) {
        score -= 10;
      }
    });

    // Deduct points for duplicate modules
    score -= analysis.duplicateModules.length * 5;

    // Deduct points for unused exports
    score -= analysis.unusedExports.length * 3;

    // Bonus for good compression
    if (analysis.compressionRatio > 0.3) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Optimize bundle with tree shaking
   */
  async optimizeWithTreeShaking(): Promise<OptimizationResult> {
    const originalSize = this.bundleAnalysis?.totalSize || 0;
    
    // Simulate tree shaking optimization
    const unusedCodeSize = originalSize * 0.15; // Assume 15% unused code
    const optimizedSize = originalSize - unusedCodeSize;
    
    const result: OptimizationResult = {
      originalSize,
      optimizedSize,
      savings: unusedCodeSize,
      savingsPercent: (unusedCodeSize / originalSize) * 100,
      warnings: [],
      recommendations: [],
    };

    // Add warnings for large remaining chunks
    if (optimizedSize > this.config.performanceBudgets.maxBundleSize) {
      result.warnings.push('Bundle size still exceeds performance budget');
    }

    // Add recommendations
    if (this.bundleAnalysis?.duplicateModules.length) {
      result.recommendations.push('Consider implementing vendor chunking to reduce duplicates');
    }

    if (this.bundleAnalysis?.unusedExports.length) {
      result.recommendations.push('Remove unused exports to further reduce bundle size');
    }

    this.optimizationHistory.push(result);
    
    return result;
  }

  /**
   * Implement vendor chunking
   */
  getVendorChunkingConfig() {
    return {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          minChunks: 1,
          maxSize: this.config.chunkSizeLimit,
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          maxSize: this.config.chunkSizeLimit,
          priority: 5,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        ui: {
          test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
          name: 'ui',
          chunks: 'all',
          priority: 15,
        },
        analytics: {
          test: /[\\/]node_modules[\\/](@tanstack|react-query)[\\/]/,
          name: 'analytics',
          chunks: 'all',
          priority: 12,
        },
      },
    };
  }

  /**
   * Validate performance budgets
   */
  validatePerformanceBudgets(): { 
    passed: boolean; 
    violations: string[]; 
    warnings: string[]; 
  } {
    const violations: string[] = [];
    const warnings: string[] = [];

    if (!this.bundleAnalysis) {
      return { passed: false, violations: ['No bundle analysis available'], warnings: [] };
    }

    const { totalSize, chunkSizes } = this.bundleAnalysis;
    const { performanceBudgets } = this.config;

    // Check total bundle size
    if (totalSize > performanceBudgets.maxBundleSize) {
      violations.push(
        `Total bundle size (${this.formatSize(totalSize)}) exceeds limit (${this.formatSize(performanceBudgets.maxBundleSize)})`
      );
    }

    // Check individual chunk sizes
    chunkSizes.forEach((size, chunkName) => {
      if (size > performanceBudgets.maxChunkSize) {
        violations.push(
          `Chunk '${chunkName}' (${this.formatSize(size)}) exceeds limit (${this.formatSize(performanceBudgets.maxChunkSize)})`
        );
      }
    });

    // Check for warnings
    if (totalSize > performanceBudgets.maxBundleSize * 0.8) {
      warnings.push('Bundle size approaching performance budget limit');
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.bundleAnalysis) {
      return ['Run bundle analysis first'];
    }

    const { totalSize, duplicateModules, unusedExports, performanceScore } = this.bundleAnalysis;

    // Size-based recommendations
    if (totalSize > this.config.performanceBudgets.maxBundleSize) {
      recommendations.push('Bundle size exceeds performance budget. Consider code splitting.');
    }

    if (totalSize > this.config.performanceBudgets.maxBundleSize * 0.8) {
      recommendations.push('Bundle size approaching limit. Monitor and optimize regularly.');
    }

    // Duplicate module recommendations
    if (duplicateModules.length > 0) {
      recommendations.push(`Found ${duplicateModules.length} duplicate modules. Implement vendor chunking.`);
    }

    // Unused code recommendations
    if (unusedExports.length > 0) {
      recommendations.push(`Found ${unusedExports.length} unused exports. Enable tree shaking.`);
    }

    // Performance score recommendations
    if (performanceScore < 70) {
      recommendations.push('Performance score is low. Consider comprehensive optimization.');
    }

    // Compression recommendations
    if (this.bundleAnalysis.compressionRatio < 0.3) {
      recommendations.push('Enable gzip/brotli compression for better performance.');
    }

    return recommendations;
  }

  /**
   * Format file size for display
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get optimization dashboard data
   */
  getOptimizationDashboard() {
    return {
      currentAnalysis: this.bundleAnalysis,
      performanceBudgets: this.config.performanceBudgets,
      optimizationHistory: this.optimizationHistory,
      recommendations: this.generateOptimizationRecommendations(),
      budgetValidation: this.validatePerformanceBudgets(),
      vendorChunkingConfig: this.getVendorChunkingConfig(),
    };
  }

  /**
   * Export optimization report
   */
  exportOptimizationReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      bundleAnalysis: this.bundleAnalysis,
      optimizationHistory: this.optimizationHistory,
      recommendations: this.generateOptimizationRecommendations(),
      budgetValidation: this.validatePerformanceBudgets(),
      config: this.config,
    };

    return JSON.stringify(report, null, 2);
  }
}

export default BundleOptimizer;
export type { BundleConfig, PerformanceBudgets, BundleAnalysis, OptimizationResult };