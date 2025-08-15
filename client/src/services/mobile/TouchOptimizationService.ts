/**
 * Touch Optimization Service
 * Phase 2 Week 5-6: Touch & Mobile Optimization
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 */

interface TouchEvent {
  type: 'tap' | 'swipe' | 'pinch' | 'longpress' | 'doubletap';
  element: HTMLElement;
  startTime: number;
  endTime: number;
  duration: number;
  x: number;
  y: number;
  force?: number;
}

interface GestureConfig {
  tapThreshold: number;
  swipeThreshold: number;
  longPressDelay: number;
  doubleTapDelay: number;
  hapticFeedback: boolean;
}

interface TouchMetrics {
  totalTouches: number;
  tapAccuracy: number;
  averageResponseTime: number;
  gestureRecognition: number;
  touchTargetCompliance: number;
}

class TouchOptimizationService {
  private static instance: TouchOptimizationService;
  private config: GestureConfig;
  private touchEvents: TouchEvent[] = [];
  private metrics: TouchMetrics;
  private isListening: boolean = false;

  private constructor() {
    this.config = {
      tapThreshold: 300, // ms
      swipeThreshold: 50, // pixels
      longPressDelay: 500, // ms
      doubleTapDelay: 300, // ms
      hapticFeedback: true
    };

    this.metrics = {
      totalTouches: 0,
      tapAccuracy: 0,
      averageResponseTime: 0,
      gestureRecognition: 0,
      touchTargetCompliance: 0
    };

    this.initializeTouchHandlers();
  }

  static getInstance(): TouchOptimizationService {
    if (!TouchOptimizationService.instance) {
      TouchOptimizationService.instance = new TouchOptimizationService();
    }
    return TouchOptimizationService.instance;
  }

  private initializeTouchHandlers(): void {
    if ('ontouchstart' in window) {
      this.startListening();
    }
  }

  public startListening(): void {
    if (this.isListening) return;

    this.isListening = true;
    
    // Touch event listeners
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    
    // Mouse event listeners for desktop testing
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  public stopListening(): void {
    if (!this.isListening) return;

    this.isListening = false;
    
    // Remove touch event listeners
    document.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Remove mouse event listeners
    document.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = (event as any).touches[0];
    const element = event.target as HTMLElement;
    
    this.startTouchEvent(element, touch.clientX, touch.clientY);
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    // Handle swipe gestures
    const touch = (event as any).touches[0];
    // Implementation for swipe detection
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    const touch = (event as any).changedTouches[0];
    const element = event.target as HTMLElement;
    
    this.endTouchEvent(element, touch.clientX, touch.clientY);
  }

  private handleMouseDown(event: MouseEvent): void {
    const element = event.target as HTMLElement;
    this.startTouchEvent(element, event.clientX, event.clientY);
  }

  private handleMouseMove(event: MouseEvent): void {
    // Handle mouse move for desktop testing
  }

  private handleMouseUp(event: MouseEvent): void {
    const element = event.target as HTMLElement;
    this.endTouchEvent(element, event.clientX, event.clientY);
  }

  private startTouchEvent(element: HTMLElement, x: number, y: number): void {
    const touchEvent: TouchEvent = {
      type: 'tap',
      element,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      x,
      y
    };

    this.touchEvents.push(touchEvent);
    this.metrics.totalTouches++;
  }

  private endTouchEvent(element: HTMLElement, x: number, y: number): void {
    const currentEvent = this.touchEvents[this.touchEvents.length - 1];
    if (!currentEvent) return;

    currentEvent.endTime = Date.now();
    currentEvent.duration = currentEvent.endTime - currentEvent.startTime;

    // Determine gesture type
    if (currentEvent.duration > this.config.longPressDelay) {
      currentEvent.type = 'longpress';
    } else if (currentEvent.duration < this.config.tapThreshold) {
      currentEvent.type = 'tap';
    }

    // Haptic feedback
    if (this.config.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Update metrics
    this.updateMetrics();

    // Trigger custom event
    this.dispatchTouchEvent(currentEvent);
  }

  private updateMetrics(): void {
    const recentEvents = this.touchEvents.slice(-100); // Last 100 events
    
    // Calculate tap accuracy
    const tapEvents = recentEvents.filter(e => e.type === 'tap');
    this.metrics.tapAccuracy = (tapEvents.length / recentEvents.length) * 100;

    // Calculate average response time
    const responseTimes = recentEvents.map(e => e.duration);
    this.metrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    // Calculate gesture recognition
    const gestureEvents = recentEvents.filter(e => e.type !== 'tap');
    this.metrics.gestureRecognition = (gestureEvents.length / recentEvents.length) * 100;

    // Calculate touch target compliance
    this.metrics.touchTargetCompliance = this.calculateTouchTargetCompliance();
  }

  private calculateTouchTargetCompliance(): number {
    const touchTargets = document.querySelectorAll('button, a, input, [role="button"]');
    let compliantTargets = 0;

    touchTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      if (rect.width >= 44 && rect.height >= 44) {
        compliantTargets++;
      }
    });

    return touchTargets.length > 0 ? (compliantTargets / touchTargets.length) * 100 : 0;
  }

  private dispatchTouchEvent(touchEvent: TouchEvent): void {
    const customEvent = new CustomEvent('optimizedTouch', {
      detail: touchEvent
    });
    
    touchEvent.element.dispatchEvent(customEvent);
  }

  public enableHapticFeedback(): void {
    this.config.hapticFeedback = true;
  }

  public disableHapticFeedback(): void {
    this.config.hapticFeedback = false;
  }

  public optimizeTouchTargets(): void {
    const touchTargets = document.querySelectorAll('button, a, input, [role="button"]');
    
    touchTargets.forEach(target => {
      const element = target as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      // Ensure minimum touch target size
      if (rect.width < 44 || rect.height < 44) {
        element.style.minWidth = '44px';
        element.style.minHeight = '44px';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.padding = '8px';
      }

      // Add touch optimization classes
      element.classList.add('touch-optimized');
      
      // Add touch feedback
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
        if (this.config.hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(25);
        }
      });

      element.addEventListener('touchend', () => {
        element.classList.remove('touch-active');
      });
    });
  }

  public getMetrics(): TouchMetrics {
    return { ...this.metrics };
  }

  public getTouchEvents(): TouchEvent[] {
    return [...this.touchEvents];
  }

  public getConfig(): GestureConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<GestureConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public generateTouchCSS(): string {
    return `
      /* Touch Optimization Styles */
      .touch-optimized {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        touch-action: manipulation;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .touch-optimized:hover {
        transform: scale(1.02);
      }

      .touch-active {
        transform: scale(0.98);
        opacity: 0.8;
      }

      /* 44px Touch Target Compliance */
      .touch-target {
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border-radius: 4px;
        background: transparent;
        border: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .touch-target:focus {
        outline: none;
        border-color: #0066cc;
        box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
      }

      /* Bangladesh Cultural Touch Styles */
      .touch-cultural {
        background: linear-gradient(135deg, #006A4E 0%, #DC143C 100%);
        color: white;
        font-weight: 500;
      }

      .touch-cultural:hover {
        background: linear-gradient(135deg, #005A3E 0%, #CC0A2C 100%);
      }

      /* Gesture Recognition Indicators */
      .gesture-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: gestureRipple 0.3s ease-out;
      }

      @keyframes gestureRipple {
        0% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(0);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(1);
        }
      }

      /* Mobile Optimization */
      @media (max-width: 768px) {
        .touch-optimized {
          min-width: 48px;
          min-height: 48px;
        }
      }
    `;
  }

  public generateTouchReport(): {
    metrics: TouchMetrics;
    config: GestureConfig;
    compliance: number;
    recommendations: string[];
  } {
    const recommendations = [
      'Ensure all interactive elements are at least 44px in size',
      'Implement haptic feedback for better user experience',
      'Add visual feedback for touch interactions',
      'Optimize gesture recognition for common actions',
      'Test on various devices and screen sizes',
      'Consider cultural preferences for touch interactions'
    ];

    return {
      metrics: this.getMetrics(),
      config: this.getConfig(),
      compliance: this.metrics.touchTargetCompliance,
      recommendations
    };
  }
}

export default TouchOptimizationService;