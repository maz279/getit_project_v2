/**
 * Emergency CLS Activator - Immediately activate static fallback mode
 * Used for testing and emergency CLS crisis intervention
 */

import staticFallbackMode from './staticFallbackMode';

class EmergencyClsActivator {
  private activated = false;

  /**
   * Immediately activate static fallback mode for CLS crisis
   */
  activateEmergencyMode(): void {
    if (this.activated) {
      console.log('🛑 Emergency mode already activated');
      return;
    }

    console.log('🚨 EMERGENCY CLS CRISIS - Activating static fallback mode immediately');
    
    // Activate static fallback mode
    staticFallbackMode.activate();
    
    // Add emergency global styles
    this.addEmergencyStyles();
    
    // Stop all intervals and timeouts
    this.stopAllTimers();
    
    this.activated = true;
    
    console.log('✅ Emergency static fallback mode activated - all dynamic content frozen');
  }

  /**
   * Add emergency CSS to freeze everything
   */
  private addEmergencyStyles(): void {
    const emergencyStyle = document.createElement('style');
    emergencyStyle.id = 'emergency-cls-freeze';
    emergencyStyle.textContent = `
      /* EMERGENCY CLS FREEZE - Stop all layout changes */
      * {
        animation: none !important;
        transition: none !important;
        transform: none !important;
        contain: layout style paint !important;
      }
      
      /* Freeze all containers */
      .performance-dashboard,
      .performance-test-page {
        position: fixed !important;
        overflow: hidden !important;
        contain: strict !important;
      }
      
      /* Stop all hover effects */
      *:hover {
        transform: none !important;
        transition: none !important;
      }
      
      /* Prevent any text changes */
      [class*="text-"],
      span, p, div {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
    `;
    document.head.appendChild(emergencyStyle);
  }

  /**
   * Stop all timers that could cause layout shifts
   */
  private stopAllTimers(): void {
    // Clear all existing intervals and timeouts
    const maxId = setTimeout(() => {}, 0);
    for (let i = 1; i <= maxId; i++) {
      clearInterval(i);
      clearTimeout(i);
    }

    // Override global timer functions
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;

    window.setTimeout = function() {
      console.log('🛑 setTimeout blocked - Emergency mode active');
      return 0;
    };

    window.setInterval = function() {
      console.log('🛑 setInterval blocked - Emergency mode active');
      return 0;
    };
  }

  /**
   * Check if emergency mode is active
   */
  isActive(): boolean {
    return this.activated;
  }

  /**
   * Get status
   */
  getStatus(): string {
    return this.activated ? 'EMERGENCY MODE ACTIVE' : 'STANDBY';
  }
}

export default new EmergencyClsActivator();