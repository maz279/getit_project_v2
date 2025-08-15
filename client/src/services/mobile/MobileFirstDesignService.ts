/**
 * Mobile First Design Service
 * Phase 2 Week 5-6: Mobile Optimization
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 */

interface BreakpointConfig {
  name: string;
  minWidth: number;
  maxWidth?: number;
  columns: number;
  gutter: number;
  margin: number;
}

interface DeviceCapabilities {
  touchSupport: boolean;
  screenSize: 'small' | 'medium' | 'large';
  orientation: 'portrait' | 'landscape';
  devicePixelRatio: number;
  connectionType: '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown';
  memoryLevel: 'low' | 'medium' | 'high';
}

interface TouchTarget {
  element: HTMLElement;
  width: number;
  height: number;
  isCompliant: boolean;
  recommendations: string[];
}

class MobileFirstDesignService {
  private static instance: MobileFirstDesignService;
  private breakpoints: BreakpointConfig[];
  private currentBreakpoint: BreakpointConfig;
  private deviceCapabilities: DeviceCapabilities;
  private touchTargets: TouchTarget[] = [];

  private constructor() {
    this.initializeBreakpoints();
    this.detectDeviceCapabilities();
    this.initializeResizeObserver();
  }

  static getInstance(): MobileFirstDesignService {
    if (!MobileFirstDesignService.instance) {
      MobileFirstDesignService.instance = new MobileFirstDesignService();
    }
    return MobileFirstDesignService.instance;
  }

  private initializeBreakpoints(): void {
    // Amazon.com/Shopee.sg Mobile-First Breakpoints
    this.breakpoints = [
      {
        name: 'mobile',
        minWidth: 0,
        maxWidth: 767,
        columns: 4,
        gutter: 16,
        margin: 16
      },
      {
        name: 'tablet',
        minWidth: 768,
        maxWidth: 1023,
        columns: 8,
        gutter: 20,
        margin: 24
      },
      {
        name: 'desktop',
        minWidth: 1024,
        maxWidth: 1279,
        columns: 12,
        gutter: 24,
        margin: 32
      },
      {
        name: 'large-desktop',
        minWidth: 1280,
        columns: 12,
        gutter: 32,
        margin: 48
      }
    ];

    this.currentBreakpoint = this.getCurrentBreakpoint();
  }

  private detectDeviceCapabilities(): void {
    this.deviceCapabilities = {
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenSize: this.getScreenSize(),
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      devicePixelRatio: window.devicePixelRatio || 1,
      connectionType: this.getConnectionType(),
      memoryLevel: this.getMemoryLevel()
    };
  }

  private getScreenSize(): 'small' | 'medium' | 'large' {
    const width = window.innerWidth;
    if (width < 768) return 'small';
    if (width < 1024) return 'medium';
    return 'large';
  }

  private getConnectionType(): '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown' {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') return '2g';
      if (effectiveType === '3g') return '3g';
      if (effectiveType === '4g') return '4g';
      if (effectiveType === '5g') return '5g';
    }
    return 'unknown';
  }

  private getMemoryLevel(): 'low' | 'medium' | 'high' {
    const memory = (navigator as any).deviceMemory;
    if (memory) {
      if (memory < 4) return 'low';
      if (memory < 8) return 'medium';
      return 'high';
    }
    return 'medium';
  }

  private getCurrentBreakpoint(): BreakpointConfig {
    const width = window.innerWidth;
    return this.breakpoints.find(bp => 
      width >= bp.minWidth && (!bp.maxWidth || width <= bp.maxWidth)
    ) || this.breakpoints[0];
  }

  private initializeResizeObserver(): void {
    const resizeObserver = new ResizeObserver(() => {
      this.currentBreakpoint = this.getCurrentBreakpoint();
      this.deviceCapabilities.screenSize = this.getScreenSize();
      this.deviceCapabilities.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      this.validateTouchTargets();
    });

    resizeObserver.observe(document.body);
  }

  public validateTouchTargets(): TouchTarget[] {
    const interactiveElements = document.querySelectorAll(
      'button, a, input, textarea, select, [role="button"], [tabindex="0"]'
    );

    this.touchTargets = [];

    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const touchTarget: TouchTarget = {
        element: element as HTMLElement,
        width: rect.width,
        height: rect.height,
        isCompliant: rect.width >= 44 && rect.height >= 44,
        recommendations: []
      };

      // Generate recommendations
      if (rect.width < 44) {
        touchTarget.recommendations.push(`Increase width to 44px (current: ${rect.width.toFixed(1)}px)`);
      }
      if (rect.height < 44) {
        touchTarget.recommendations.push(`Increase height to 44px (current: ${rect.height.toFixed(1)}px)`);
      }

      this.touchTargets.push(touchTarget);
    });

    return this.touchTargets;
  }

  public getBreakpoints(): BreakpointConfig[] {
    return [...this.breakpoints];
  }

  public getCurrentBreakpoint(): BreakpointConfig {
    return { ...this.currentBreakpoint };
  }

  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  public getTouchTargets(): TouchTarget[] {
    return [...this.touchTargets];
  }

  public getTouchTargetCompliance(): {
    total: number;
    compliant: number;
    nonCompliant: number;
    complianceRate: number;
  } {
    const total = this.touchTargets.length;
    const compliant = this.touchTargets.filter(target => target.isCompliant).length;
    const nonCompliant = total - compliant;
    const complianceRate = total > 0 ? (compliant / total) * 100 : 0;

    return {
      total,
      compliant,
      nonCompliant,
      complianceRate
    };
  }

  public generateResponsiveCSS(): string {
    return `
      /* Mobile First Design System */
      .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 ${this.breakpoints[0].margin}px;
      }

      /* Grid System */
      .grid {
        display: grid;
        gap: ${this.breakpoints[0].gutter}px;
        grid-template-columns: repeat(${this.breakpoints[0].columns}, 1fr);
      }

      /* Breakpoint Styles */
      @media (min-width: ${this.breakpoints[1].minWidth}px) {
        .container {
          padding: 0 ${this.breakpoints[1].margin}px;
        }
        .grid {
          gap: ${this.breakpoints[1].gutter}px;
          grid-template-columns: repeat(${this.breakpoints[1].columns}, 1fr);
        }
      }

      @media (min-width: ${this.breakpoints[2].minWidth}px) {
        .container {
          padding: 0 ${this.breakpoints[2].margin}px;
        }
        .grid {
          gap: ${this.breakpoints[2].gutter}px;
          grid-template-columns: repeat(${this.breakpoints[2].columns}, 1fr);
        }
      }

      @media (min-width: ${this.breakpoints[3].minWidth}px) {
        .container {
          padding: 0 ${this.breakpoints[3].margin}px;
        }
        .grid {
          gap: ${this.breakpoints[3].gutter}px;
          grid-template-columns: repeat(${this.breakpoints[3].columns}, 1fr);
        }
      }

      /* Touch Optimization */
      .touch-target {
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      /* Bangladesh Cultural Colors */
      .cultural-primary {
        background-color: #006A4E; /* Bangladesh Green */
      }

      .cultural-secondary {
        background-color: #DC143C; /* Bangladesh Red */
      }

      .cultural-accent {
        background-color: #F42A41; /* Cultural Red */
      }
    `;
  }

  public applyMobileOptimizations(): void {
    // Add viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }

    // Add touch optimization styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = this.generateResponsiveCSS();
    document.head.appendChild(styleSheet);

    // Apply touch target improvements
    this.touchTargets.forEach(target => {
      if (!target.isCompliant) {
        target.element.style.minWidth = '44px';
        target.element.style.minHeight = '44px';
        target.element.style.display = 'flex';
        target.element.style.alignItems = 'center';
        target.element.style.justifyContent = 'center';
      }
    });
  }

  public generateMobileReport(): {
    breakpoint: BreakpointConfig;
    deviceCapabilities: DeviceCapabilities;
    touchCompliance: ReturnType<typeof this.getTouchTargetCompliance>;
    recommendations: string[];
  } {
    const recommendations = [
      'Implement mobile-first responsive design',
      'Ensure all touch targets are at least 44px',
      'Optimize images for different screen densities',
      'Use system fonts for better performance',
      'Implement gesture recognition for better UX',
      'Add haptic feedback for touch interactions',
      'Optimize for slow network connections'
    ];

    return {
      breakpoint: this.getCurrentBreakpoint(),
      deviceCapabilities: this.getDeviceCapabilities(),
      touchCompliance: this.getTouchTargetCompliance(),
      recommendations
    };
  }
}

export default MobileFirstDesignService;