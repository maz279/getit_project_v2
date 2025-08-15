/**
 * Mobile First Design System
 * Phase 2 Week 7-8: Mobile-First Transformation
 * Responsive breakpoints, design tokens, and mobile-first components
 */

interface BreakpointSystem {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

interface DesignTokens {
  breakpoints: BreakpointSystem;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  typography: {
    mobile: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      caption: string;
    };
    tablet: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      caption: string;
    };
    desktop: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      caption: string;
    };
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
    warning: string;
    error: string;
  };
}

interface ResponsiveConfig {
  enableResponsiveImages: boolean;
  enableResponsiveText: boolean;
  enableResponsiveSpacing: boolean;
  enableFluidDesign: boolean;
  optimizeForBangladesh: boolean;
}

interface DeviceCapabilities {
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  touchCapable: boolean;
  orientation: 'portrait' | 'landscape';
  connectionType: '2g' | '3g' | '4g' | '5g' | 'wifi';
  memoryLevel: 'low' | 'medium' | 'high';
}

class MobileFirstDesignSystem {
  private static instance: MobileFirstDesignSystem;
  private config: ResponsiveConfig;
  private designTokens: DesignTokens;
  private deviceCapabilities: DeviceCapabilities;

  constructor(config: Partial<ResponsiveConfig> = {}) {
    this.config = {
      enableResponsiveImages: true,
      enableResponsiveText: true,
      enableResponsiveSpacing: true,
      enableFluidDesign: true,
      optimizeForBangladesh: true,
      ...config,
    };

    this.designTokens = this.initializeDesignTokens();
    this.deviceCapabilities = this.detectDeviceCapabilities();
    
    if (typeof window !== 'undefined') {
      this.initializeResponsiveSystem();
    }
  }

  static getInstance(config?: Partial<ResponsiveConfig>): MobileFirstDesignSystem {
    if (!MobileFirstDesignSystem.instance) {
      MobileFirstDesignSystem.instance = new MobileFirstDesignSystem(config);
    }
    return MobileFirstDesignSystem.instance;
  }

  /**
   * Initialize design tokens system
   */
  private initializeDesignTokens(): DesignTokens {
    return {
      breakpoints: {
        mobile: 320,    // Bangladesh mobile average
        tablet: 768,    // Tablet landscape
        desktop: 1024,  // Desktop minimum
        wide: 1200,     // Wide desktop
      },
      spacing: {
        xs: '0.25rem',  // 4px
        sm: '0.5rem',   // 8px
        md: '1rem',     // 16px
        lg: '1.5rem',   // 24px
        xl: '2rem',     // 32px
        xxl: '3rem',    // 48px
      },
      typography: {
        mobile: {
          h1: '1.5rem',   // 24px
          h2: '1.25rem',  // 20px
          h3: '1.125rem', // 18px
          body: '0.875rem', // 14px
          caption: '0.75rem', // 12px
        },
        tablet: {
          h1: '2rem',     // 32px
          h2: '1.5rem',   // 24px
          h3: '1.25rem',  // 20px
          body: '1rem',   // 16px
          caption: '0.875rem', // 14px
        },
        desktop: {
          h1: '2.5rem',   // 40px
          h2: '2rem',     // 32px
          h3: '1.5rem',   // 24px
          body: '1.125rem', // 18px
          caption: '1rem', // 16px
        },
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        neutral: '#6B7280',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
      },
    };
  }

  /**
   * Detect device capabilities
   */
  private detectDeviceCapabilities(): DeviceCapabilities {
    if (typeof window === 'undefined') {
      return {
        screenWidth: 1024,
        screenHeight: 768,
        pixelRatio: 1,
        touchCapable: false,
        orientation: 'landscape',
        connectionType: '4g',
        memoryLevel: 'medium',
      };
    }

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const memory = (navigator as any).deviceMemory || 4;

    return {
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      touchCapable: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      connectionType: connection ? this.getConnectionType(connection.effectiveType) : '4g',
      memoryLevel: memory <= 2 ? 'low' : memory <= 4 ? 'medium' : 'high',
    };
  }

  /**
   * Get connection type from navigator
   */
  private getConnectionType(effectiveType: string): '2g' | '3g' | '4g' | '5g' | 'wifi' {
    const typeMap: { [key: string]: '2g' | '3g' | '4g' | '5g' | 'wifi' } = {
      'slow-2g': '2g',
      '2g': '2g',
      '3g': '3g',
      '4g': '4g',
      '5g': '5g',
    };
    return typeMap[effectiveType] || '4g';
  }

  /**
   * Initialize responsive system
   */
  private initializeResponsiveSystem(): void {
    // Set CSS custom properties
    this.setCSSVariables();
    
    // Listen for viewport changes
    window.addEventListener('resize', () => {
      this.deviceCapabilities = this.detectDeviceCapabilities();
      this.setCSSVariables();
    });

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.deviceCapabilities = this.detectDeviceCapabilities();
        this.setCSSVariables();
      }, 100);
    });
  }

  /**
   * Set CSS custom properties
   */
  private setCSSVariables(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const { breakpoints, spacing, typography, colors } = this.designTokens;
    const currentBreakpoint = this.getCurrentBreakpoint();

    // Breakpoints
    root.style.setProperty('--breakpoint-mobile', `${breakpoints.mobile}px`);
    root.style.setProperty('--breakpoint-tablet', `${breakpoints.tablet}px`);
    root.style.setProperty('--breakpoint-desktop', `${breakpoints.desktop}px`);
    root.style.setProperty('--breakpoint-wide', `${breakpoints.wide}px`);

    // Spacing
    Object.entries(spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Typography (responsive)
    const typographySet = typography[currentBreakpoint];
    Object.entries(typographySet).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    // Colors
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Device-specific variables
    root.style.setProperty('--device-width', `${this.deviceCapabilities.screenWidth}px`);
    root.style.setProperty('--device-height', `${this.deviceCapabilities.screenHeight}px`);
    root.style.setProperty('--device-pixel-ratio', `${this.deviceCapabilities.pixelRatio}`);
    root.style.setProperty('--touch-capable', this.deviceCapabilities.touchCapable ? '1' : '0');
  }

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    const { screenWidth } = this.deviceCapabilities;
    const { breakpoints } = this.designTokens;

    if (screenWidth < breakpoints.tablet) {
      return 'mobile';
    } else if (screenWidth < breakpoints.desktop) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * Generate responsive CSS for component
   */
  generateResponsiveCSS(baseStyles: any): string {
    const { breakpoints } = this.designTokens;
    let css = '';

    // Mobile-first base styles
    css += this.generateCSSFromObject(baseStyles.mobile || baseStyles);

    // Tablet styles
    if (baseStyles.tablet) {
      css += `
        @media (min-width: ${breakpoints.tablet}px) {
          ${this.generateCSSFromObject(baseStyles.tablet)}
        }
      `;
    }

    // Desktop styles
    if (baseStyles.desktop) {
      css += `
        @media (min-width: ${breakpoints.desktop}px) {
          ${this.generateCSSFromObject(baseStyles.desktop)}
        }
      `;
    }

    // Wide desktop styles
    if (baseStyles.wide) {
      css += `
        @media (min-width: ${breakpoints.wide}px) {
          ${this.generateCSSFromObject(baseStyles.wide)}
        }
      `;
    }

    return css;
  }

  /**
   * Generate CSS from object
   */
  private generateCSSFromObject(styles: any): string {
    return Object.entries(styles)
      .map(([property, value]) => {
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssProperty}: ${value};`;
      })
      .join('\n');
  }

  /**
   * Get responsive image configuration
   */
  getResponsiveImageConfig(imageSrc: string): {
    src: string;
    srcSet: string;
    sizes: string;
  } {
    const { breakpoints } = this.designTokens;
    const { connectionType, pixelRatio } = this.deviceCapabilities;

    // Optimize for Bangladesh network conditions
    const qualityMap = {
      '2g': 'q_30',
      '3g': 'q_50',
      '4g': 'q_70',
      '5g': 'q_80',
      'wifi': 'q_80',
    };

    const quality = qualityMap[connectionType];
    const baseUrl = imageSrc.replace(/\.(jpg|jpeg|png|webp)$/, '');
    const extension = imageSrc.match(/\.(jpg|jpeg|png|webp)$/)?.[1] || 'jpg';

    return {
      src: `${baseUrl}_${breakpoints.mobile}w_${quality}.${extension}`,
      srcSet: [
        `${baseUrl}_${breakpoints.mobile}w_${quality}.${extension} ${breakpoints.mobile}w`,
        `${baseUrl}_${breakpoints.tablet}w_${quality}.${extension} ${breakpoints.tablet}w`,
        `${baseUrl}_${breakpoints.desktop}w_${quality}.${extension} ${breakpoints.desktop}w`,
      ].join(', '),
      sizes: `(max-width: ${breakpoints.tablet}px) 100vw, (max-width: ${breakpoints.desktop}px) 50vw, 33vw`,
    };
  }

  /**
   * Get responsive text configuration
   */
  getResponsiveTextConfig(element: 'h1' | 'h2' | 'h3' | 'body' | 'caption'): {
    fontSize: string;
    lineHeight: string;
    fontWeight: string;
  } {
    const currentBreakpoint = this.getCurrentBreakpoint();
    const fontSize = this.designTokens.typography[currentBreakpoint][element];

    const lineHeightMap = {
      h1: '1.2',
      h2: '1.3',
      h3: '1.4',
      body: '1.5',
      caption: '1.4',
    };

    const fontWeightMap = {
      h1: '700',
      h2: '600',
      h3: '500',
      body: '400',
      caption: '400',
    };

    return {
      fontSize,
      lineHeight: lineHeightMap[element],
      fontWeight: fontWeightMap[element],
    };
  }

  /**
   * Get device-optimized styles
   */
  getDeviceOptimizedStyles(): any {
    const { touchCapable, memoryLevel, connectionType } = this.deviceCapabilities;

    return {
      touchOptimized: touchCapable ? {
        minHeight: '44px',
        minWidth: '44px',
        touchAction: 'manipulation',
      } : {},
      memoryOptimized: memoryLevel === 'low' ? {
        willChange: 'auto',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      } : {},
      connectionOptimized: connectionType === '2g' || connectionType === '3g' ? {
        transition: 'none',
        animation: 'none',
      } : {},
    };
  }

  /**
   * Generate container queries
   */
  generateContainerQueries(containerName: string): string {
    return `
      @container ${containerName} (max-width: ${this.designTokens.breakpoints.tablet}px) {
        /* Mobile container styles */
      }
      
      @container ${containerName} (min-width: ${this.designTokens.breakpoints.tablet}px) {
        /* Tablet container styles */
      }
      
      @container ${containerName} (min-width: ${this.designTokens.breakpoints.desktop}px) {
        /* Desktop container styles */
      }
    `;
  }

  /**
   * Get Bangladesh-specific optimizations
   */
  getBangladeshOptimizations(): any {
    if (!this.config.optimizeForBangladesh) return {};

    const { connectionType } = this.deviceCapabilities;

    return {
      // Network-aware optimizations
      networkOptimized: {
        // Disable animations on slow connections
        animation: connectionType === '2g' || connectionType === '3g' ? 'none' : 'inherit',
        // Reduce image quality
        imageRendering: connectionType === '2g' ? 'optimizeSpeed' : 'auto',
      },
      // Cultural adaptations
      culturalAdaptations: {
        // Bengali text rendering
        fontFamily: 'Kalpurush, Bengali, Arial, sans-serif',
        // Right-to-left support for Arabic text
        direction: 'ltr',
        // Islamic green color preferences
        accentColor: '#00A86B',
      },
      // Mobile banking UI optimizations
      mobileBankingUI: {
        // Larger touch targets for mobile payments
        minTouchTarget: '48px',
        // High contrast for outdoor usage
        contrastRatio: '4.5:1',
        // Familiar color schemes
        bkashColor: '#E2136E',
        nagadColor: '#EB5A3C',
        rocketColor: '#8B0000',
      },
    };
  }

  /**
   * Get design tokens
   */
  getDesignTokens(): DesignTokens {
    return { ...this.designTokens };
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ResponsiveConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setCSSVariables();
  }

  /**
   * Export design system CSS
   */
  exportDesignSystemCSS(): string {
    const { breakpoints, spacing, typography, colors } = this.designTokens;
    
    let css = `:root {\n`;
    
    // Breakpoints
    Object.entries(breakpoints).forEach(([key, value]) => {
      css += `  --breakpoint-${key}: ${value}px;\n`;
    });
    
    // Spacing
    Object.entries(spacing).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value};\n`;
    });
    
    // Colors
    Object.entries(colors).forEach(([key, value]) => {
      css += `  --color-${key}: ${value};\n`;
    });
    
    css += `}\n\n`;
    
    // Typography responsive styles
    Object.entries(typography).forEach(([breakpoint, sizes]) => {
      const mediaQuery = breakpoint === 'mobile' ? '' : `@media (min-width: ${breakpoints[breakpoint as keyof BreakpointSystem]}px)`;
      
      if (mediaQuery) css += `${mediaQuery} {\n`;
      
      Object.entries(sizes).forEach(([element, size]) => {
        css += `  ${mediaQuery ? '  ' : ''}--font-size-${element}: ${size};\n`;
      });
      
      if (mediaQuery) css += `}\n\n`;
    });
    
    return css;
  }
}

export default MobileFirstDesignSystem;
export type { BreakpointSystem, DesignTokens, ResponsiveConfig, DeviceCapabilities };