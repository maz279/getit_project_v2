// Security hardening system for Phase 5 Security & Testing
export class SecurityHardening {
  private static instance: SecurityHardening;
  private securityHeaders: Map<string, string> = new Map();
  private cspNonce: string = '';
  private trustedDomains: Set<string> = new Set();
  private securityMetrics: {
    xssAttempts: number;
    csrfAttempts: number;
    rateLimitHits: number;
    suspiciousRequests: number;
  } = {
    xssAttempts: 0,
    csrfAttempts: 0,
    rateLimitHits: 0,
    suspiciousRequests: 0
  };

  private constructor() {
    this.initializeSecurityHeaders();
    this.initializeTrustedDomains();
    this.generateCSPNonce();
    this.setupSecurityEventListeners();
  }

  static getInstance(): SecurityHardening {
    if (!SecurityHardening.instance) {
      SecurityHardening.instance = new SecurityHardening();
    }
    return SecurityHardening.instance;
  }

  // Initialize security headers
  private initializeSecurityHeaders(): void {
    this.securityHeaders.set('X-Content-Type-Options', 'nosniff');
    this.securityHeaders.set('X-Frame-Options', 'DENY');
    this.securityHeaders.set('X-XSS-Protection', '1; mode=block');
    this.securityHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    this.securityHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }

  // Initialize trusted domains
  private initializeTrustedDomains(): void {
    this.trustedDomains.add(window.location.origin);
    this.trustedDomains.add('https://api.getit.com');
    this.trustedDomains.add('https://cdn.getit.com');
    // Add development domains if in development
    if (process.env.NODE_ENV === 'development') {
      this.trustedDomains.add('http://localhost:5000');
      this.trustedDomains.add('https://localhost:5000');
    }
  }

  // Generate CSP nonce
  private generateCSPNonce(): void {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    this.cspNonce = btoa(String.fromCharCode.apply(null, Array.from(array)));
  }

  // Setup security event listeners
  private setupSecurityEventListeners(): void {
    // Monitor for potential XSS attempts
    document.addEventListener('securitypolicyviolation', (event) => {
      this.handleSecurityViolation(event);
    });

    // Monitor for suspicious DOM modifications
    if (window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          this.validateDOMChanges(mutation);
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['onclick', 'onload', 'onerror']
      });
    }
  }

  // Sanitize user input
  sanitizeInput(input: string, type: 'text' | 'html' | 'url' | 'email' = 'text'): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    switch (type) {
      case 'html':
        return this.sanitizeHTML(input);
      case 'url':
        return this.sanitizeURL(input);
      case 'email':
        return this.sanitizeEmail(input);
      default:
        return this.sanitizeText(input);
    }
  }

  // Sanitize HTML content
  private sanitizeHTML(html: string): string {
    const allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'];
    const allowedAttributes = ['class', 'id'];
    
    // Remove script tags and event handlers
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Parse and rebuild with allowed tags only
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    
    this.removeDisallowedElements(tempDiv, allowedTags);
    this.removeDisallowedAttributes(tempDiv, allowedAttributes);
    
    return tempDiv.innerHTML;
  }

  // Sanitize URL
  private sanitizeURL(url: string): string {
    try {
      const parsedUrl = new URL(url);
      
      // Only allow HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return '';
      }
      
      // Check against trusted domains
      if (!this.trustedDomains.has(parsedUrl.origin)) {
        console.warn('Untrusted domain detected:', parsedUrl.origin);
        this.securityMetrics.suspiciousRequests++;
      }
      
      return parsedUrl.toString();
    } catch {
      return '';
    }
  }

  // Sanitize email
  private sanitizeEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.toLowerCase().trim();
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  // Sanitize text
  private sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate API requests
  validateAPIRequest(url: string, method: string, data?: any): boolean {
    try {
      const parsedUrl = new URL(url, window.location.origin);
      
      // Check if URL is from trusted domain
      if (!this.trustedDomains.has(parsedUrl.origin)) {
        console.warn('API request to untrusted domain blocked:', parsedUrl.origin);
        this.securityMetrics.suspiciousRequests++;
        return false;
      }
      
      // Validate request method
      const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      if (!allowedMethods.includes(method.toUpperCase())) {
        console.warn('Invalid HTTP method:', method);
        return false;
      }
      
      // Validate request data
      if (data && typeof data === 'object') {
        this.validateRequestData(data);
      }
      
      return true;
    } catch (error) {
      console.error('Invalid API request URL:', url);
      return false;
    }
  }

  // Generate secure token
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate CSRF token
  validateCSRFToken(token: string): boolean {
    const storedToken = sessionStorage.getItem('csrf_token');
    if (!storedToken || storedToken !== token) {
      this.securityMetrics.csrfAttempts++;
      return false;
    }
    return true;
  }

  // Create secure cookie
  createSecureCookie(name: string, value: string, options: {
    maxAge?: number;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    httpOnly?: boolean;
  } = {}): void {
    const {
      maxAge = 3600, // 1 hour
      secure = window.location.protocol === 'https:',
      sameSite = 'strict',
      httpOnly = false
    } = options;

    let cookieString = `${name}=${encodeURIComponent(value)}`;
    cookieString += `; max-age=${maxAge}`;
    cookieString += `; path=/`;
    cookieString += `; samesite=${sameSite}`;
    
    if (secure) {
      cookieString += `; secure`;
    }
    
    if (httpOnly) {
      cookieString += `; httponly`;
    }
    
    document.cookie = cookieString;
  }

  // Handle security violations
  private handleSecurityViolation(event: SecurityPolicyViolationEvent): void {
    console.warn('Security policy violation:', event);
    
    if (event.violatedDirective.includes('script-src')) {
      this.securityMetrics.xssAttempts++;
    }
    
    // Report to security monitoring endpoint
    this.reportSecurityEvent({
      type: 'csp_violation',
      directive: event.violatedDirective,
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      timestamp: Date.now()
    });
  }

  // Validate DOM changes
  private validateDOMChanges(mutation: MutationRecord): void {
    if (mutation.type === 'attributes') {
      const element = mutation.target as Element;
      const attributeName = mutation.attributeName;
      
      // Check for suspicious attributes
      if (attributeName && attributeName.startsWith('on')) {
        console.warn('Suspicious attribute added:', attributeName, element);
        this.securityMetrics.xssAttempts++;
        element.removeAttribute(attributeName);
      }
    }
  }

  // Remove disallowed elements
  private removeDisallowedElements(element: Element, allowedTags: string[]): void {
    const children = Array.from(element.children);
    children.forEach(child => {
      if (!allowedTags.includes(child.tagName.toLowerCase())) {
        child.remove();
      } else {
        this.removeDisallowedElements(child, allowedTags);
      }
    });
  }

  // Remove disallowed attributes
  private removeDisallowedAttributes(element: Element, allowedAttributes: string[]): void {
    Array.from(element.attributes).forEach(attr => {
      if (!allowedAttributes.includes(attr.name)) {
        element.removeAttribute(attr.name);
      }
    });
    
    // Process children
    Array.from(element.children).forEach(child => {
      this.removeDisallowedAttributes(child, allowedAttributes);
    });
  }

  // Validate request data
  private validateRequestData(data: any): void {
    const jsonString = JSON.stringify(data);
    
    // Check for potential injection patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /function\(/i,
      /alert\(/i
    ];
    
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(jsonString)) {
        console.warn('Suspicious pattern detected in request data');
        this.securityMetrics.suspiciousRequests++;
      }
    });
  }

  // Report security event
  private async reportSecurityEvent(event: any): Promise<void> {
    try {
      await fetch('/api/security/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to report security event:', error);
    }
  }

  // Get security metrics
  getSecurityMetrics() {
    return { ...this.securityMetrics };
  }

  // Get CSP nonce
  getCSPNonce(): string {
    return this.cspNonce;
  }

  // Get security headers
  getSecurityHeaders(): Map<string, string> {
    return new Map(this.securityHeaders);
  }

  // Reset security metrics
  resetMetrics(): void {
    this.securityMetrics = {
      xssAttempts: 0,
      csrfAttempts: 0,
      rateLimitHits: 0,
      suspiciousRequests: 0
    };
  }
}

// Singleton instance
export const securityHardening = SecurityHardening.getInstance();

export default SecurityHardening;