/**
 * Advanced Services Index
 * Phase 3 Week 9-12: Advanced Customer Experience Features
 * Amazon.com/Shopee.sg Enterprise Standards
 */

export { default as ARVRService } from './ARVRService';
export { default as Amazon5AsFrameworkService } from './Amazon5AsFrameworkService';
export { default as AdvancedSearchService } from './AdvancedSearchService';

// Advanced service exports
export const advancedServices = {
  ARVRService,
  Amazon5AsFrameworkService,
  AdvancedSearchService
};

// Advanced utilities
export const advancedUtils = {
  // AR/VR capabilities
  isARSupported: () => {
    const service = (ARVRService as any).getInstance();
    return service.isARSupported();
  },

  isVRSupported: () => {
    const service = (ARVRService as any).getInstance();
    return service.isVRSupported();
  },

  // Customer journey tracking
  trackCustomerJourney: (customerId: string, stage: string, touchpoint: string, channel: string, content: string) => {
    const service = (Amazon5AsFrameworkService as any).getInstance();
    return service.trackCustomerJourney(customerId, stage, touchpoint, channel, content);
  },

  // Advanced search capabilities
  performTextSearch: async (query: string, filters: any, context: any) => {
    const service = (AdvancedSearchService as any).getInstance();
    return service.performTextSearch(query, filters, context);
  },

  startVoiceSearch: async (context: any) => {
    const service = (AdvancedSearchService as any).getInstance();
    return service.startVoiceSearch(context);
  },

  startVisualSearch: async (imageSource: string, context: any) => {
    const service = (AdvancedSearchService as any).getInstance();
    return service.startVisualSearch(imageSource, context);
  }
};

// Advanced configuration
export const advancedConfig = {
  ar: {
    supportedDevices: ['iOS', 'Android'],
    minPerformanceLevel: 'medium',
    enabledFeatures: ['product-view', 'room-placement', 'try-on']
  },
  
  vr: {
    supportedDevices: ['WebXR', 'Mobile VR'],
    minPerformanceLevel: 'high',
    enabledFeatures: ['virtual-store', 'product-showcase', 'brand-experience']
  },
  
  customerJourney: {
    stages: ['aware', 'appeal', 'ask', 'act', 'advocate'],
    trackingEnabled: true,
    analyticsEnabled: true
  },
  
  search: {
    supportedTypes: ['text', 'voice', 'visual', 'barcode'],
    languages: ['en', 'bn'],
    aiEnabled: true,
    personalizationEnabled: true
  }
};

// Phase 3 initialization
export const initializeAdvancedFeatures = () => {
  const arvrService = (ARVRService as any).getInstance();
  const frameworkService = (Amazon5AsFrameworkService as any).getInstance();
  const searchService = (AdvancedSearchService as any).getInstance();
  
  console.log('Advanced customer experience features initialized');
  
  return {
    arvrService,
    frameworkService,
    searchService,
    
    // AR/VR capabilities
    isARSupported: () => arvrService.isARSupported(),
    isVRSupported: () => arvrService.isVRSupported(),
    getARAnalytics: () => arvrService.getARAnalytics(),
    getVRAnalytics: () => arvrService.getVRAnalytics(),
    
    // Customer journey
    trackJourney: (customerId: string, stage: string, touchpoint: string, channel: string, content: string) => 
      frameworkService.trackCustomerJourney(customerId, stage, touchpoint, channel, content),
    getJourneyAnalytics: () => frameworkService.getJourneyAnalytics(),
    getPersonas: () => frameworkService.getCustomerPersonas(),
    
    // Advanced search
    performSearch: (query: string, filters: any, context: any) => 
      searchService.performTextSearch(query, filters, context),
    startVoiceSearch: (context: any) => searchService.startVoiceSearch(context),
    startVisualSearch: (imageSource: string, context: any) => 
      searchService.startVisualSearch(imageSource, context),
    getSearchAnalytics: () => searchService.getSearchAnalytics()
  };
};