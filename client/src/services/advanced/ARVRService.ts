/**
 * AR/VR Service
 * Phase 3 Week 9-12: Advanced Customer Experience Features
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 */

interface ARSession {
  id: string;
  productId: string;
  sessionType: 'product-view' | 'room-placement' | 'try-on' | 'size-comparison';
  startTime: number;
  endTime?: number;
  duration?: number;
  deviceInfo: ARDeviceInfo;
  interactionCount: number;
  conversionAction?: 'add-to-cart' | 'purchase' | 'save-for-later';
}

interface VRSession {
  id: string;
  experienceType: 'virtual-store' | 'product-showcase' | 'brand-experience';
  startTime: number;
  endTime?: number;
  duration?: number;
  deviceInfo: VRDeviceInfo;
  productsViewed: string[];
  interactionCount: number;
  conversionAction?: 'add-to-cart' | 'purchase' | 'save-for-later';
}

interface ARDeviceInfo {
  device: string;
  os: string;
  browser: string;
  supportedFeatures: string[];
  cameraResolution: string;
  performanceLevel: 'low' | 'medium' | 'high';
}

interface VRDeviceInfo {
  device: string;
  headset?: string;
  controllers: string[];
  trackingSpace: '3dof' | '6dof';
  renderResolution: string;
  refreshRate: number;
}

interface ARProductPlacement {
  productId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  surface: 'floor' | 'wall' | 'table' | 'detected-plane';
  lighting: 'automatic' | 'manual';
  shadows: boolean;
}

interface VRStoreExperience {
  storeId: string;
  layout: 'traditional' | 'modern' | 'cultural-bangladesh';
  atmosphere: 'bright' | 'warm' | 'professional' | 'festive';
  backgroundMusic: string;
  productDisplays: VRProductDisplay[];
  interactionHotspots: VRInteractionPoint[];
}

interface VRProductDisplay {
  productId: string;
  position: { x: number; y: number; z: number };
  displayType: 'pedestal' | 'shelf' | 'floating' | 'interactive';
  highlightColor: string;
  animations: string[];
}

interface VRInteractionPoint {
  id: string;
  position: { x: number; y: number; z: number };
  type: 'product-info' | 'cart-action' | 'navigation' | 'assistance';
  icon: string;
  action: string;
}

class ARVRService {
  private static instance: ARVRService;
  private arSessions: ARSession[] = [];
  private vrSessions: VRSession[] = [];
  private arSupported: boolean = false;
  private vrSupported: boolean = false;
  private webXRSupported: boolean = false;

  private constructor() {
    this.initializeARVRSupport();
  }

  static getInstance(): ARVRService {
    if (!ARVRService.instance) {
      ARVRService.instance = new ARVRService();
    }
    return ARVRService.instance;
  }

  private async initializeARVRSupport(): Promise<void> {
    // Check WebXR support
    if ('xr' in navigator) {
      this.webXRSupported = true;
      
      try {
        // Check AR support
        const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
        this.arSupported = arSupported;
        
        // Check VR support
        const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
        this.vrSupported = vrSupported;
      } catch (error) {
        console.error('WebXR support check failed:', error);
      }
    }

    // Fallback AR support check (WebRTC + MediaDevices)
    if (!this.arSupported && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        this.arSupported = true;
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.log('Camera access not available for AR');
      }
    }
  }

  // AR Session Management
  public async startARSession(productId: string, sessionType: ARSession['sessionType']): Promise<string> {
    if (!this.arSupported) {
      throw new Error('AR not supported on this device');
    }

    const session: ARSession = {
      id: this.generateSessionId(),
      productId,
      sessionType,
      startTime: Date.now(),
      deviceInfo: await this.getARDeviceInfo(),
      interactionCount: 0
    };

    this.arSessions.push(session);
    return session.id;
  }

  public endARSession(sessionId: string, conversionAction?: ARSession['conversionAction']): void {
    const session = this.arSessions.find(s => s.id === sessionId);
    if (session) {
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
      session.conversionAction = conversionAction;
    }
  }

  public updateARInteraction(sessionId: string): void {
    const session = this.arSessions.find(s => s.id === sessionId);
    if (session) {
      session.interactionCount++;
    }
  }

  // VR Session Management
  public async startVRSession(experienceType: VRSession['experienceType']): Promise<string> {
    if (!this.vrSupported) {
      throw new Error('VR not supported on this device');
    }

    const session: VRSession = {
      id: this.generateSessionId(),
      experienceType,
      startTime: Date.now(),
      deviceInfo: await this.getVRDeviceInfo(),
      productsViewed: [],
      interactionCount: 0
    };

    this.vrSessions.push(session);
    return session.id;
  }

  public endVRSession(sessionId: string, conversionAction?: VRSession['conversionAction']): void {
    const session = this.vrSessions.find(s => s.id === sessionId);
    if (session) {
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
      session.conversionAction = conversionAction;
    }
  }

  public addVRProductView(sessionId: string, productId: string): void {
    const session = this.vrSessions.find(s => s.id === sessionId);
    if (session && !session.productsViewed.includes(productId)) {
      session.productsViewed.push(productId);
    }
  }

  // AR Product Placement
  public placeProductInAR(productId: string, placement: ARProductPlacement): void {
    // Implement AR product placement logic
    console.log(`Placing product ${productId} in AR environment:`, placement);
    
    // Bangladesh-specific optimizations
    if (placement.lighting === 'automatic') {
      placement.lighting = 'manual'; // Better for indoor environments common in Bangladesh
    }
    
    // Optimize for common surfaces in Bangladesh homes
    if (placement.surface === 'detected-plane') {
      placement.surface = 'floor'; // More reliable detection
    }
  }

  // VR Store Experience
  public createVRStoreExperience(storeConfig: VRStoreExperience): void {
    // Implement VR store creation logic
    console.log('Creating VR store experience:', storeConfig);
    
    // Bangladesh cultural adaptations
    if (storeConfig.layout === 'cultural-bangladesh') {
      storeConfig.atmosphere = 'warm';
      storeConfig.backgroundMusic = 'traditional-instrumental';
    }
  }

  // Device Information
  private async getARDeviceInfo(): Promise<ARDeviceInfo> {
    return {
      device: this.getDeviceType(),
      os: this.getOperatingSystem(),
      browser: this.getBrowser(),
      supportedFeatures: await this.getARFeatures(),
      cameraResolution: await this.getCameraResolution(),
      performanceLevel: this.getPerformanceLevel()
    };
  }

  private async getVRDeviceInfo(): Promise<VRDeviceInfo> {
    return {
      device: this.getDeviceType(),
      headset: await this.getVRHeadset(),
      controllers: await this.getVRControllers(),
      trackingSpace: await this.getTrackingSpace(),
      renderResolution: await this.getRenderResolution(),
      refreshRate: await this.getRefreshRate()
    };
  }

  // Device Detection Helpers
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/Windows/i.test(userAgent)) return 'Windows';
    return 'Unknown';
  }

  private getOperatingSystem(): string {
    const userAgent = navigator.userAgent;
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Mac/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iOS/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (/Chrome/i.test(userAgent)) return 'Chrome';
    if (/Firefox/i.test(userAgent)) return 'Firefox';
    if (/Safari/i.test(userAgent)) return 'Safari';
    if (/Edge/i.test(userAgent)) return 'Edge';
    return 'Unknown';
  }

  private async getARFeatures(): Promise<string[]> {
    const features: string[] = [];
    
    if (this.webXRSupported) {
      features.push('WebXR');
    }
    
    if ('mediaDevices' in navigator) {
      features.push('Camera');
    }
    
    if ('DeviceOrientationEvent' in window) {
      features.push('Orientation');
    }
    
    if ('DeviceMotionEvent' in window) {
      features.push('Motion');
    }
    
    return features;
  }

  private async getCameraResolution(): Promise<string> {
    try {
      const constraints = { video: { facingMode: 'environment' } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      stream.getTracks().forEach(track => track.stop());
      return `${settings.width}x${settings.height}`;
    } catch (error) {
      return 'Unknown';
    }
  }

  private getPerformanceLevel(): 'low' | 'medium' | 'high' {
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    if (memory >= 8 && cores >= 8) return 'high';
    if (memory >= 4 && cores >= 4) return 'medium';
    return 'low';
  }

  private async getVRHeadset(): Promise<string | undefined> {
    if ('xr' in navigator && navigator.xr) {
      // Try to detect VR headset
      return 'WebXR Compatible';
    }
    return undefined;
  }

  private async getVRControllers(): Promise<string[]> {
    const controllers: string[] = [];
    
    if ('xr' in navigator && navigator.xr) {
      controllers.push('WebXR Controllers');
    }
    
    if ('getGamepads' in navigator) {
      const gamepads = navigator.getGamepads();
      gamepads.forEach(gamepad => {
        if (gamepad) {
          controllers.push(gamepad.id);
        }
      });
    }
    
    return controllers;
  }

  private async getTrackingSpace(): Promise<'3dof' | '6dof'> {
    // Assume 6DOF for WebXR, 3DOF for mobile
    return this.webXRSupported ? '6dof' : '3dof';
  }

  private async getRenderResolution(): Promise<string> {
    return `${window.screen.width}x${window.screen.height}`;
  }

  private async getRefreshRate(): Promise<number> {
    return 60; // Default to 60Hz
  }

  // Analytics and Reporting
  public getARAnalytics(): {
    totalSessions: number;
    averageSessionDuration: number;
    conversionRate: number;
    popularSessionTypes: { type: string; count: number }[];
    deviceDistribution: { device: string; count: number }[];
  } {
    const totalSessions = this.arSessions.length;
    const completedSessions = this.arSessions.filter(s => s.endTime);
    
    const averageSessionDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
      : 0;
    
    const conversions = this.arSessions.filter(s => s.conversionAction).length;
    const conversionRate = totalSessions > 0 ? (conversions / totalSessions) * 100 : 0;
    
    // Session types distribution
    const sessionTypes = this.arSessions.reduce((acc, session) => {
      acc[session.sessionType] = (acc[session.sessionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const popularSessionTypes = Object.entries(sessionTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    
    // Device distribution
    const devices = this.arSessions.reduce((acc, session) => {
      acc[session.deviceInfo.device] = (acc[session.deviceInfo.device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const deviceDistribution = Object.entries(devices)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      totalSessions,
      averageSessionDuration,
      conversionRate,
      popularSessionTypes,
      deviceDistribution
    };
  }

  public getVRAnalytics(): {
    totalSessions: number;
    averageSessionDuration: number;
    conversionRate: number;
    popularExperiences: { type: string; count: number }[];
    averageProductsViewed: number;
  } {
    const totalSessions = this.vrSessions.length;
    const completedSessions = this.vrSessions.filter(s => s.endTime);
    
    const averageSessionDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
      : 0;
    
    const conversions = this.vrSessions.filter(s => s.conversionAction).length;
    const conversionRate = totalSessions > 0 ? (conversions / totalSessions) * 100 : 0;
    
    // Experience types distribution
    const experienceTypes = this.vrSessions.reduce((acc, session) => {
      acc[session.experienceType] = (acc[session.experienceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const popularExperiences = Object.entries(experienceTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    
    const averageProductsViewed = totalSessions > 0
      ? this.vrSessions.reduce((sum, s) => sum + s.productsViewed.length, 0) / totalSessions
      : 0;
    
    return {
      totalSessions,
      averageSessionDuration,
      conversionRate,
      popularExperiences,
      averageProductsViewed
    };
  }

  // Utility Methods
  private generateSessionId(): string {
    return 'arvr_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Public Getters
  public isARSupported(): boolean {
    return this.arSupported;
  }

  public isVRSupported(): boolean {
    return this.vrSupported;
  }

  public isWebXRSupported(): boolean {
    return this.webXRSupported;
  }

  public getARSessions(): ARSession[] {
    return [...this.arSessions];
  }

  public getVRSessions(): VRSession[] {
    return [...this.vrSessions];
  }

  // Bangladesh-specific optimizations
  public getBangladeshOptimizations(): {
    arOptimizations: string[];
    vrOptimizations: string[];
    recommendations: string[];
  } {
    return {
      arOptimizations: [
        'Optimize for indoor lighting conditions',
        'Support for common furniture and surfaces',
        'Reduce network bandwidth usage',
        'Optimize for mid-range Android devices',
        'Support for Bengali language instructions'
      ],
      vrOptimizations: [
        'Lightweight VR experiences for mobile VR',
        'Cultural store layouts and themes',
        'Optimize for limited internet connectivity',
        'Support for traditional music and atmosphere',
        'Reduce motion sickness with comfort settings'
      ],
      recommendations: [
        'Use progressive loading for AR assets',
        'Implement offline caching for VR experiences',
        'Add cultural elements to increase engagement',
        'Optimize for 3G/4G network conditions',
        'Provide Bengali language support'
      ]
    };
  }
}

export default ARVRService;