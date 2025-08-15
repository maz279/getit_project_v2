/**
 * Hybrid AI Validation Test Suite
 * Comprehensive testing for the hybrid AI architecture
 */

import { HybridAIOrchestrator } from '../services/ai/HybridAIOrchestrator';
import { TensorFlowLocalService } from '../services/ai/TensorFlowLocalService';
import { BrainJSService } from '../services/ai/BrainJSService';
import { ONNXRuntimeService } from '../services/ai/ONNXRuntimeService';

export interface TestResult {
  testName: string;
  success: boolean;
  responseTime: number;
  details: any;
  error?: string;
}

export class HybridAIValidator {
  private orchestrator: HybridAIOrchestrator;
  private results: TestResult[] = [];

  constructor() {
    this.orchestrator = HybridAIOrchestrator.getInstance();
  }

  /**
   * Run comprehensive validation suite
   */
  public async runFullValidation(): Promise<{
    overallSuccess: boolean;
    successRate: number;
    results: TestResult[];
    summary: any;
  }> {
    console.log('🚀 Starting Hybrid AI Validation Suite...');
    
    this.results = [];
    
    // Test individual services
    await this.testTensorFlowService();
    await this.testBrainJSService();
    await this.testONNXRuntimeService();
    
    // Test orchestrator functionality
    await this.testHybridOrchestrator();
    
    // Test specific use cases
    await this.testBangladeshContext();
    await this.testPerformanceTargets();
    await this.testOfflineCapabilities();
    
    // Calculate results
    const successfulTests = this.results.filter(r => r.success).length;
    const successRate = (successfulTests / this.results.length) * 100;
    
    const summary = {
      totalTests: this.results.length,
      successful: successfulTests,
      failed: this.results.length - successfulTests,
      averageResponseTime: this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length,
      fastestTest: Math.min(...this.results.map(r => r.responseTime)),
      slowestTest: Math.max(...this.results.map(r => r.responseTime))
    };

    console.log('✅ Hybrid AI Validation Complete');
    console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
    
    return {
      overallSuccess: successRate >= 80,
      successRate,
      results: this.results,
      summary
    };
  }

  /**
   * Test TensorFlow.js Local Service
   */
  private async testTensorFlowService(): Promise<void> {
    await this.runTest('TensorFlow.js Initialization', async () => {
      const service = new TensorFlowLocalService();
      await service.initialize();
      return {
        initialized: service.isReady(),
        models: service.getLoadedModels(),
        memory: service.getMemoryUsage()
      };
    });

    await this.runTest('TensorFlow.js Image Processing', async () => {
      const service = new TensorFlowLocalService();
      await service.initialize();
      
      const mockImageData = Buffer.from('mock-image-data');
      const result = await service.processImage(mockImageData);
      
      return {
        hasClassifications: result.classifications.length > 0,
        hasObjects: result.objects.length > 0,
        hasFeatures: result.features.length > 0,
        processingTime: result.processingTime
      };
    });

    await this.runTest('TensorFlow.js Text Processing', async () => {
      const service = new TensorFlowLocalService();
      await service.initialize();
      
      const result = await service.processText('স্মার্টফোন কিনতে চাই'); // Bengali text
      
      return {
        hasEmbeddings: result.embeddings.length > 0,
        sentiment: result.sentiment,
        keywords: result.keywords,
        confidence: result.confidence
      };
    });
  }

  /**
   * Test Brain.js Service
   */
  private async testBrainJSService(): Promise<void> {
    await this.runTest('Brain.js Initialization', async () => {
      const service = new BrainJSService();
      await service.initialize();
      return {
        initialized: service.isReady(),
        networks: service.getNetworkStatus(),
        metrics: service.getPerformanceMetrics()
      };
    });

    await this.runTest('Brain.js Pattern Recognition', async () => {
      const service = new BrainJSService();
      await service.initialize();
      
      const behaviorData = {
        clicks: 5,
        timeSpent: 120,
        cartItems: 1,
        pageViews: 3
      };
      
      const result = await service.recognizePattern(behaviorData);
      
      return {
        pattern: result.pattern,
        confidence: result.confidence,
        predictions: result.predictions.length,
        processingTime: result.processingTime
      };
    });

    await this.runTest('Brain.js Recommendations', async () => {
      const service = new BrainJSService();
      await service.initialize();
      
      const userProfile = {
        age: 25,
        location: 'dhaka',
        interests: ['electronics', 'fashion']
      };
      
      const result = await service.generateRecommendations(userProfile);
      
      return {
        recommendationCount: result.recommendations.length,
        confidence: result.confidence,
        processingTime: result.processingTime
      };
    });
  }

  /**
   * Test ONNX Runtime Service
   */
  private async testONNXRuntimeService(): Promise<void> {
    await this.runTest('ONNX Runtime Initialization', async () => {
      const service = new ONNXRuntimeService();
      await service.initialize();
      return {
        initialized: service.isModelLoaded(),
        availableModels: service.getAvailableModels(),
        metrics: service.getPerformanceMetrics()
      };
    });

    await this.runTest('ONNX Category Prediction', async () => {
      const service = new ONNXRuntimeService();
      await service.initialize();
      
      const productData = {
        name: 'Samsung Galaxy S23',
        description: 'Latest smartphone with advanced features',
        brand: 'Samsung',
        price: 65000
      };
      
      const result = await service.predictCategory(productData);
      
      return {
        primaryCategory: result.primaryCategory,
        categoryCount: result.categories.length,
        processingTime: result.processingTime
      };
    });

    await this.runTest('ONNX Price Prediction', async () => {
      const service = new ONNXRuntimeService();
      await service.initialize();
      
      const productData = {
        name: 'iPhone 14 Pro',
        category: 'electronics',
        brand: 'Apple',
        condition: 'new'
      };
      
      const result = await service.predictPrice(productData);
      
      return {
        predictedPrice: result.predictedPrice,
        priceRange: result.priceRange,
        confidence: result.confidence,
        processingTime: result.processingTime
      };
    });
  }

  /**
   * Test Hybrid Orchestrator
   */
  private async testHybridOrchestrator(): Promise<void> {
    await this.runTest('Hybrid Orchestrator Health', async () => {
      const health = this.orchestrator.getServiceHealth();
      const metrics = this.orchestrator.getMetrics();
      
      return {
        servicesHealthy: Object.values(health).filter(h => h.healthy).length,
        totalServices: Object.keys(health).length,
        metricsAvailable: metrics.size > 0
      };
    });

    await this.runTest('Hybrid Search Processing', async () => {
      const result = await this.orchestrator.processSearchQuery('স্মার্টফোন', {
        language: 'bn',
        requiresCulturalIntelligence: true,
        maxResponseTime: 3000
      });
      
      return {
        success: result.success,
        serviceUsed: result.metadata.serviceUsed,
        processingTime: result.metadata.processingTime,
        offlineCapable: result.metadata.offlineCapable
      };
    });

    await this.runTest('Hybrid Image Analysis', async () => {
      const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
      
      const result = await this.orchestrator.processImageAnalysis(mockImageData, {
        urgency: 'immediate',
        requiresRealTimeProcessing: true
      });
      
      return {
        success: result.success,
        serviceUsed: result.metadata.serviceUsed,
        processingTime: result.metadata.processingTime,
        realTimeCapable: result.metadata.processingTime < 500
      };
    });
  }

  /**
   * Test Bangladesh-specific context
   */
  private async testBangladeshContext(): Promise<void> {
    await this.runTest('Bengali Language Processing', async () => {
      const result = await this.orchestrator.processSearchQuery('ঢাকায় ইলিশ মাছ', {
        language: 'bn',
        requiresCulturalIntelligence: true
      });
      
      return {
        success: result.success,
        culturallyAware: result.metadata.serviceUsed === 'DeepSeek AI',
        processingTime: result.metadata.processingTime
      };
    });

    await this.runTest('Cultural Intelligence', async () => {
      const result = await this.orchestrator.processSearchQuery('ঈদের পোশাক', {
        language: 'bn',
        context: { festival: 'eid' },
        requiresCulturalIntelligence: true
      });
      
      return {
        success: result.success,
        contextAware: result.data !== null,
        serviceUsed: result.metadata.serviceUsed
      };
    });
  }

  /**
   * Test performance targets
   */
  private async testPerformanceTargets(): Promise<void> {
    await this.runTest('Sub-100ms Real-time Processing', async () => {
      const result = await this.orchestrator.processRequest({
        query: 'quick pattern check',
        type: 'pattern',
        urgency: 'immediate',
        maxResponseTime: 100
      });
      
      return {
        success: result.success,
        metTarget: result.metadata.processingTime < 100,
        actualTime: result.metadata.processingTime,
        serviceUsed: result.metadata.serviceUsed
      };
    });

    await this.runTest('Sub-3s Complex Processing', async () => {
      const result = await this.orchestrator.processSearchQuery('complex search with cultural context', {
        language: 'bn',
        requiresCulturalIntelligence: true,
        maxResponseTime: 3000
      });
      
      return {
        success: result.success,
        metTarget: result.metadata.processingTime < 3000,
        actualTime: result.metadata.processingTime,
        serviceUsed: result.metadata.serviceUsed
      };
    });
  }

  /**
   * Test offline capabilities
   */
  private async testOfflineCapabilities(): Promise<void> {
    await this.runTest('Offline Pattern Recognition', async () => {
      const result = await this.orchestrator.processRequest({
        query: 'pattern analysis',
        type: 'pattern',
        requiresOfflineCapability: true,
        context: { clicks: 5, timeSpent: 120 }
      });
      
      return {
        success: result.success,
        offlineCapable: result.metadata.offlineCapable,
        localService: result.metadata.serviceUsed !== 'DeepSeek AI',
        processingTime: result.metadata.processingTime
      };
    });

    await this.runTest('Offline Recommendations', async () => {
      const result = await this.orchestrator.processRequest({
        query: 'recommendations',
        type: 'recommendation',
        requiresOfflineCapability: true,
        userProfile: { age: 25, location: 'dhaka' }
      });
      
      return {
        success: result.success,
        offlineCapable: result.metadata.offlineCapable,
        localService: result.metadata.serviceUsed !== 'DeepSeek AI',
        processingTime: result.metadata.processingTime
      };
    });
  }

  /**
   * Helper method to run individual tests
   */
  private async runTest(testName: string, testFunction: () => Promise<any>): Promise<void> {
    const startTime = performance.now();
    
    try {
      const details = await testFunction();
      const responseTime = performance.now() - startTime;
      
      this.results.push({
        testName,
        success: true,
        responseTime,
        details
      });
      
      console.log(`✅ ${testName}: PASSED (${responseTime.toFixed(1)}ms)`);
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      this.results.push({
        testName,
        success: false,
        responseTime,
        details: null,
        error: error.message
      });
      
      console.log(`❌ ${testName}: FAILED (${responseTime.toFixed(1)}ms) - ${error.message}`);
    }
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(): string {
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    let report = '\n🔍 HYBRID AI PERFORMANCE REPORT\n';
    report += '================================\n\n';
    
    report += `📊 Overall Results:\n`;
    report += `   Total Tests: ${this.results.length}\n`;
    report += `   Successful: ${successful.length}\n`;
    report += `   Failed: ${failed.length}\n`;
    report += `   Success Rate: ${((successful.length / this.results.length) * 100).toFixed(1)}%\n\n`;
    
    report += `⚡ Performance Metrics:\n`;
    report += `   Average Response Time: ${(this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length).toFixed(1)}ms\n`;
    report += `   Fastest Test: ${Math.min(...this.results.map(r => r.responseTime)).toFixed(1)}ms\n`;
    report += `   Slowest Test: ${Math.max(...this.results.map(r => r.responseTime)).toFixed(1)}ms\n\n`;
    
    report += `✅ Successful Tests:\n`;
    successful.forEach(test => {
      report += `   - ${test.testName} (${test.responseTime.toFixed(1)}ms)\n`;
    });
    
    if (failed.length > 0) {
      report += `\n❌ Failed Tests:\n`;
      failed.forEach(test => {
        report += `   - ${test.testName}: ${test.error}\n`;
      });
    }
    
    return report;
  }
}

export default HybridAIValidator;