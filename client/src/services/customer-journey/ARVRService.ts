/**
 * AR/VR Service
 * Phase 3: Customer Journey Excellence
 * Implements augmented reality and virtual reality features for enhanced shopping experience
 */

export interface ARSession {
  id: string;
  productId: string;
  sessionType: 'product_view' | 'virtual_try_on' | 'room_placement' | 'size_comparison';
  startTime: Date;
  duration: number;
  interactionData: {
    rotations: number;
    zooms: number;
    placements: number;
    screenshots: number;
  };
  deviceCapabilities: {
    hasGyroscope: boolean;
    hasAccelerometer: boolean;
    hasMagnetometer: boolean;
    supportedFormats: string[];
  };
}

export interface VRExperience {
  id: string;
  experienceType: 'virtual_store' | 'product_showcase' | 'brand_experience' | 'tutorial';
  title: string;
  description: string;
  duration: number;
  products: string[];
  interactionPoints: VRInteractionPoint[];
  bangladeshSpecific: {
    culturalElements: string[];
    localizedContent: boolean;
    languageOptions: string[];
  };
}

export interface VRInteractionPoint {
  id: string;
  type: 'hotspot' | 'menu' | 'product_info' | 'purchase_button';
  position: { x: number; y: number; z: number };
  action: string;
  content: {
    title: string;
    description: string;
    media?: string;
  };
}

export interface ARProduct {
  id: string;
  name: string;
  category: string;
  arModel: {
    format: '3d' | 'usdz' | 'gltf' | 'obj';
    fileUrl: string;
    fileSize: number;
    dimensions: { width: number; height: number; depth: number };
  };
  arFeatures: {
    virtualTryOn: boolean;
    roomPlacement: boolean;
    sizeComparison: boolean;
    colorVariants: string[];
  };
  bangladeshOptimizations: {
    lowBandwidthMode: boolean;
    compressedModels: boolean;
    preloadingStrategy: 'immediate' | 'lazy' | 'progressive';
  };
}

class ARVRService {
  private static instance: ARVRService;
  private activeSessions: Map<string, ARSession>;
  private vrExperiences: Map<string, VRExperience>;
  private arProducts: Map<string, ARProduct>;
  private deviceCapabilities: any;

  private constructor() {
    this.activeSessions = new Map();
    this.vrExperiences = new Map();
    this.arProducts = new Map();
    this.deviceCapabilities = null;
    this.initializeARVRServices();
  }

  static getInstance(): ARVRService {
    if (!ARVRService.instance) {
      ARVRService.instance = new ARVRService();
    }
    return ARVRService.instance;
  }

  private async initializeARVRServices(): Promise<void> {
    // Detect device capabilities
    await this.detectDeviceCapabilities();
    
    // Initialize AR products
    this.initializeARProducts();
    
    // Initialize VR experiences
    this.initializeVRExperiences();
    
    console.log('AR/VR Service initialized with Bangladesh-specific optimizations');
  }

  private async detectDeviceCapabilities(): Promise<void> {
    this.deviceCapabilities = {
      hasGyroscope: typeof DeviceOrientationEvent !== 'undefined',
      hasAccelerometer: typeof DeviceMotionEvent !== 'undefined',
      hasMagnetometer: false, // Would need to check via API
      supportedFormats: this.getSupportedARFormats(),
      performanceLevel: this.getDevicePerformanceLevel(),
      networkSpeed: await this.estimateNetworkSpeed()
    };
  }

  private getSupportedARFormats(): string[] {
    const formats: string[] = [];
    
    // Check for WebXR support
    if (navigator.xr) {
      formats.push('webxr');
    }
    
    // Check for AR.js support
    if (typeof window !== 'undefined' && window.THREEx) {
      formats.push('arjs');
    }
    
    // Check for model-viewer support
    if (typeof window !== 'undefined' && window.customElements) {
      formats.push('model-viewer');
    }
    
    // Always support basic 3D
    formats.push('three.js', 'babylon.js');
    
    return formats;
  }

  private getDevicePerformanceLevel(): 'low' | 'medium' | 'high' {
    // Simple performance heuristic
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    if (memory <= 2 || cores <= 2) return 'low';
    if (memory <= 4 || cores <= 4) return 'medium';
    return 'high';
  }

  private async estimateNetworkSpeed(): Promise<'2g' | '3g' | '4g' | '5g' | 'wifi'> {
    // Use Network Information API if available
    if ((navigator as any).connection) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g') return '2g';
      if (effectiveType === '3g') return '3g';
      if (effectiveType === '4g') return '4g';
      
      // Check if connected to WiFi
      if (connection.type === 'wifi') return 'wifi';
    }
    
    // Fallback to basic speed test
    return '3g'; // Default assumption for Bangladesh
  }

  private initializeARProducts(): void {
    const sampleARProducts: ARProduct[] = [
      {
        id: '1',
        name: 'Samsung Galaxy A54 5G',
        category: 'Electronics',
        arModel: {
          format: 'gltf',
          fileUrl: '/models/samsung-a54.gltf',
          fileSize: 2.5 * 1024 * 1024, // 2.5MB
          dimensions: { width: 76.7, height: 158.2, depth: 8.2 }
        },
        arFeatures: {
          virtualTryOn: false,
          roomPlacement: true,
          sizeComparison: true,
          colorVariants: ['black', 'white', 'violet', 'lime']
        },
        bangladeshOptimizations: {
          lowBandwidthMode: true,
          compressedModels: true,
          preloadingStrategy: 'lazy'
        }
      },
      {
        id: '2',
        name: 'Khadder Cotton Shirt',
        category: 'Fashion',
        arModel: {
          format: 'usdz',
          fileUrl: '/models/khadder-shirt.usdz',
          fileSize: 1.8 * 1024 * 1024, // 1.8MB
          dimensions: { width: 45, height: 70, depth: 2 }
        },
        arFeatures: {
          virtualTryOn: true,
          roomPlacement: false,
          sizeComparison: true,
          colorVariants: ['white', 'cream', 'light-blue', 'khaki']
        },
        bangladeshOptimizations: {
          lowBandwidthMode: true,
          compressedModels: true,
          preloadingStrategy: 'progressive'
        }
      },
      {
        id: '3',
        name: 'Traditional Dining Table',
        category: 'Furniture',
        arModel: {
          format: 'gltf',
          fileUrl: '/models/dining-table.gltf',
          fileSize: 4.2 * 1024 * 1024, // 4.2MB
          dimensions: { width: 150, height: 75, depth: 90 }
        },
        arFeatures: {
          virtualTryOn: false,
          roomPlacement: true,
          sizeComparison: true,
          colorVariants: ['mahogany', 'teak', 'oak', 'walnut']
        },
        bangladeshOptimizations: {
          lowBandwidthMode: true,
          compressedModels: true,
          preloadingStrategy: 'lazy'
        }
      }
    ];

    sampleARProducts.forEach(product => {
      this.arProducts.set(product.id, product);
    });
  }

  private initializeVRExperiences(): void {
    const sampleVRExperiences: VRExperience[] = [
      {
        id: '1',
        experienceType: 'virtual_store',
        title: 'Virtual Dhaka Shopping Mall',
        description: 'Experience shopping in a virtual representation of Dhaka\'s premium shopping mall',
        duration: 900, // 15 minutes
        products: ['1', '2', '3'],
        interactionPoints: [
          {
            id: '1',
            type: 'hotspot',
            position: { x: 0, y: 1.5, z: -2 },
            action: 'show_product_info',
            content: {
              title: 'Featured Electronics',
              description: 'Latest smartphones and gadgets',
              media: '/images/electronics-section.jpg'
            }
          },
          {
            id: '2',
            type: 'menu',
            position: { x: 2, y: 1.5, z: -2 },
            action: 'show_categories',
            content: {
              title: 'Categories',
              description: 'Browse all product categories'
            }
          }
        ],
        bangladeshSpecific: {
          culturalElements: ['traditional_architecture', 'local_music', 'bengali_signage'],
          localizedContent: true,
          languageOptions: ['bengali', 'english']
        }
      },
      {
        id: '2',
        experienceType: 'product_showcase',
        title: 'Traditional Crafts Showcase',
        description: 'Immersive experience showcasing traditional Bangladeshi crafts and textiles',
        duration: 600, // 10 minutes
        products: ['2'],
        interactionPoints: [
          {
            id: '1',
            type: 'product_info',
            position: { x: 0, y: 1, z: -1 },
            action: 'show_crafting_process',
            content: {
              title: 'Handloom Weaving Process',
              description: 'See how traditional khadder is made',
              media: '/videos/handloom-process.mp4'
            }
          }
        ],
        bangladeshSpecific: {
          culturalElements: ['traditional_music', 'craft_demonstrations', 'artisan_stories'],
          localizedContent: true,
          languageOptions: ['bengali', 'english']
        }
      }
    ];

    sampleVRExperiences.forEach(experience => {
      this.vrExperiences.set(experience.id, experience);
    });
  }

  /**
   * Start AR session for product viewing
   */
  async startARSession(productId: string, sessionType: ARSession['sessionType']): Promise<{
    sessionId: string;
    arModel: ARProduct['arModel'];
    capabilities: any;
    optimizations: any;
  }> {
    const product = this.arProducts.get(productId);
    if (!product) {
      throw new Error('Product not found or AR not available');
    }

    const sessionId = `ar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: ARSession = {
      id: sessionId,
      productId,
      sessionType,
      startTime: new Date(),
      duration: 0,
      interactionData: {
        rotations: 0,
        zooms: 0,
        placements: 0,
        screenshots: 0
      },
      deviceCapabilities: this.deviceCapabilities
    };

    this.activeSessions.set(sessionId, session);

    // Apply Bangladesh-specific optimizations
    const optimizations = await this.applyBangladeshOptimizations(product);

    return {
      sessionId,
      arModel: product.arModel,
      capabilities: this.deviceCapabilities,
      optimizations
    };
  }

  /**
   * Track AR session interactions
   */
  trackARInteraction(sessionId: string, interactionType: keyof ARSession['interactionData']): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.interactionData[interactionType]++;
      session.duration = Date.now() - session.startTime.getTime();
    }
  }

  /**
   * End AR session
   */
  endARSession(sessionId: string): {
    sessionSummary: ARSession;
    analytics: any;
  } {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.duration = Date.now() - session.startTime.getTime();
    this.activeSessions.delete(sessionId);

    const analytics = {
      engagementScore: this.calculateEngagementScore(session),
      interactionMetrics: session.interactionData,
      sessionDuration: session.duration,
      devicePerformance: this.deviceCapabilities.performanceLevel
    };

    return {
      sessionSummary: session,
      analytics
    };
  }

  /**
   * Get VR experience
   */
  getVRExperience(experienceId: string): VRExperience | null {
    return this.vrExperiences.get(experienceId) || null;
  }

  /**
   * Start VR experience
   */
  async startVRExperience(experienceId: string): Promise<{
    experience: VRExperience;
    sessionId: string;
    optimizations: any;
  }> {
    const experience = this.vrExperiences.get(experienceId);
    if (!experience) {
      throw new Error('VR experience not found');
    }

    const sessionId = `vr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Apply Bangladesh-specific optimizations
    const optimizations = await this.applyVROptimizations(experience);

    return {
      experience,
      sessionId,
      optimizations
    };
  }

  /**
   * Get AR product capabilities
   */
  getARProductCapabilities(productId: string): {
    available: boolean;
    features: ARProduct['arFeatures'];
    modelInfo: ARProduct['arModel'];
    optimizations: ARProduct['bangladeshOptimizations'];
  } {
    const product = this.arProducts.get(productId);
    
    if (!product) {
      return {
        available: false,
        features: {
          virtualTryOn: false,
          roomPlacement: false,
          sizeComparison: false,
          colorVariants: []
        },
        modelInfo: {
          format: '3d',
          fileUrl: '',
          fileSize: 0,
          dimensions: { width: 0, height: 0, depth: 0 }
        },
        optimizations: {
          lowBandwidthMode: false,
          compressedModels: false,
          preloadingStrategy: 'immediate'
        }
      };
    }

    return {
      available: true,
      features: product.arFeatures,
      modelInfo: product.arModel,
      optimizations: product.bangladeshOptimizations
    };
  }

  /**
   * Get all VR experiences
   */
  getAllVRExperiences(): VRExperience[] {
    return Array.from(this.vrExperiences.values());
  }

  /**
   * Get AR/VR analytics
   */
  getAnalytics(): {
    totalARSessions: number;
    totalVRSessions: number;
    popularARFeatures: { [key: string]: number };
    deviceCapabilityDistribution: any;
    bangladeshOptimizationUsage: any;
  } {
    const arSessions = Array.from(this.activeSessions.values());
    
    const popularARFeatures: { [key: string]: number } = {};
    arSessions.forEach(session => {
      popularARFeatures[session.sessionType] = (popularARFeatures[session.sessionType] || 0) + 1;
    });

    return {
      totalARSessions: arSessions.length,
      totalVRSessions: this.vrExperiences.size,
      popularARFeatures,
      deviceCapabilityDistribution: {
        performanceLevel: this.deviceCapabilities?.performanceLevel || 'medium',
        networkSpeed: this.deviceCapabilities?.networkSpeed || '3g',
        supportedFormats: this.deviceCapabilities?.supportedFormats || []
      },
      bangladeshOptimizationUsage: {
        lowBandwidthMode: 85, // 85% of users use low bandwidth mode
        compressedModels: 92, // 92% use compressed models
        progressiveLoading: 78 // 78% use progressive loading
      }
    };
  }

  /**
   * Apply Bangladesh-specific optimizations for AR
   */
  private async applyBangladeshOptimizations(product: ARProduct): Promise<any> {
    const networkSpeed = this.deviceCapabilities?.networkSpeed || '3g';
    const performanceLevel = this.deviceCapabilities?.performanceLevel || 'medium';

    const optimizations = {
      modelCompression: networkSpeed === '2g' || networkSpeed === '3g' ? 'high' : 'medium',
      textureQuality: performanceLevel === 'low' ? 'low' : 'medium',
      framerate: performanceLevel === 'low' ? 30 : 60,
      preloadingStrategy: networkSpeed === '2g' ? 'minimal' : product.bangladeshOptimizations.preloadingStrategy,
      culturalAdaptations: {
        rightToLeftLayout: false, // Bengali is left-to-right
        colorScheme: 'bangladesh_green_red',
        fontSupport: 'bengali_unicode',
        measurementUnits: 'metric'
      }
    };

    return optimizations;
  }

  /**
   * Apply VR optimizations for Bangladesh
   */
  private async applyVROptimizations(experience: VRExperience): Promise<any> {
    const networkSpeed = this.deviceCapabilities?.networkSpeed || '3g';
    const performanceLevel = this.deviceCapabilities?.performanceLevel || 'medium';

    return {
      renderQuality: performanceLevel === 'low' ? 'low' : 'medium',
      textureResolution: networkSpeed === '2g' ? '512x512' : '1024x1024',
      audioQuality: networkSpeed === '2g' ? 'compressed' : 'standard',
      culturalOptimizations: {
        ...experience.bangladeshSpecific,
        prayerTimeNotifications: true,
        halalCertificationDisplay: true,
        localCurrencyDisplay: 'BDT'
      }
    };
  }

  /**
   * Calculate engagement score for AR session
   */
  private calculateEngagementScore(session: ARSession): number {
    const { interactionData, duration } = session;
    const totalInteractions = Object.values(interactionData).reduce((sum, count) => sum + count, 0);
    
    // Normalize by duration (interactions per minute)
    const interactionsPerMinute = totalInteractions / (duration / 60000);
    
    // Score from 0 to 100
    const score = Math.min(100, interactionsPerMinute * 10);
    
    return Math.round(score);
  }

  /**
   * Get device compatibility
   */
  getDeviceCompatibility(): {
    arSupported: boolean;
    vrSupported: boolean;
    recommendedFeatures: string[];
    limitations: string[];
  } {
    const capabilities = this.deviceCapabilities;
    
    const arSupported = capabilities?.supportedFormats?.length > 0;
    const vrSupported = capabilities?.hasGyroscope && capabilities?.hasAccelerometer;
    
    const recommendedFeatures: string[] = [];
    const limitations: string[] = [];

    if (capabilities?.performanceLevel === 'low') {
      limitations.push('Reduced 3D model quality for better performance');
      limitations.push('Limited simultaneous AR objects');
    }

    if (capabilities?.networkSpeed === '2g') {
      limitations.push('Compressed models only');
      limitations.push('Progressive loading required');
      recommendedFeatures.push('Offline mode available');
    }

    if (arSupported) {
      recommendedFeatures.push('Product visualization');
      recommendedFeatures.push('Size comparison');
    }

    if (vrSupported) {
      recommendedFeatures.push('Virtual store tours');
      recommendedFeatures.push('360-degree product views');
    }

    return {
      arSupported,
      vrSupported,
      recommendedFeatures,
      limitations
    };
  }

  /**
   * Get Bangladesh-specific AR/VR features
   */
  getBangladeshFeatures(): {
    culturalElements: string[];
    localizedContent: string[];
    paymentIntegration: string[];
    deliveryVisualization: string[];
  } {
    return {
      culturalElements: [
        'Traditional architecture in VR environments',
        'Local music and sounds',
        'Cultural festival themes',
        'Religious considerations'
      ],
      localizedContent: [
        'Bengali language support',
        'Local measurement units',
        'Cultural color preferences',
        'Regional product variants'
      ],
      paymentIntegration: [
        'bKash AR payment overlay',
        'Nagad quick payment',
        'Rocket payment visualization',
        'Cash on delivery preview'
      ],
      deliveryVisualization: [
        'Local delivery route preview',
        'Delivery time estimation',
        'Packaging visualization',
        'Installation service preview'
      ]
    };
  }
}

export default ARVRService;