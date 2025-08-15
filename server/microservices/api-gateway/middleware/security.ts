/**
 * Security Middleware
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Web Application Firewall (WAF) and security headers
 * Production-ready security with Bangladesh-specific optimizations
 */

import { Request, Response, NextFunction } from 'express';
import { GatewayConfig } from '../config/gateway.config';
import { AuthenticatedRequest } from './authentication';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-middleware' }
});

export const securityMiddleware = (config: GatewayConfig) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Apply security headers
      applySecurityHeaders(res, config);
      
      // WAF protection
      if (config.security.waf.enabled) {
        const wafResult = checkWAFRules(req, config);
        if (!wafResult.allowed) {
          return respondWithSecurityBlock(res, wafResult.reason, wafResult.code);
        }
      }
      
      // IP-based security checks
      const ipCheck = performIPSecurityChecks(req, config);
      if (!ipCheck.allowed) {
        return respondWithSecurityBlock(res, ipCheck.reason, 'IP_BLOCKED');
      }
      
      // Request validation
      const validationResult = validateRequest(req);
      if (!validationResult.valid) {
        return respondWithSecurityBlock(res, validationResult.reason, 'INVALID_REQUEST');
      }
      
      // Bangladesh-specific security checks
      if (config.bangladesh.compliance.dataLocalization) {
        const complianceCheck = checkBangladeshCompliance(req);
        if (!complianceCheck.compliant) {
          logger.warn('Bangladesh compliance check failed', {
            ip: req.ip,
            reason: complianceCheck.reason,
            path: req.path
          });
        }
      }
      
      next();
      
    } catch (error) {
      logger.error('Security middleware error', {
        error: error.message,
        path: req.path,
        ip: req.ip
      });
      
      // Continue with request but log the error
      next();
    }
  };
};

function applySecurityHeaders(res: Response, config: GatewayConfig): void {
  // XSS Protection
  if (config.security.headers.xssProtection) {
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
  
  // MIME Type Sniffing Protection
  if (config.security.headers.noSniff) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
  
  // Frame Protection
  res.setHeader('X-Frame-Options', config.security.headers.frameguard);
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  
  // Content Security Policy (if not handled by helmet)
  if (config.server.environment === 'production') {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://replit.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:;"
    );
  }
  
  // Custom security headers
  res.setHeader('X-Powered-By', 'GetIt-Gateway');
  res.setHeader('X-Security-Version', '2.0.0');
  res.setHeader('X-Bangladesh-Optimized', 'true');
}

interface WAFResult {
  allowed: boolean;
  reason?: string;
  code?: string;
  riskScore?: number;
}

function checkWAFRules(req: AuthenticatedRequest, config: GatewayConfig): WAFResult {
  const wafRules = config.security.waf.rules;
  let riskScore = 0;
  
  // SQL Injection Detection
  if (wafRules.includes('sql-injection')) {
    const sqlInjectionResult = detectSQLInjection(req);
    if (sqlInjectionResult.detected) {
      return {
        allowed: false,
        reason: 'SQL injection attempt detected',
        code: 'SQL_INJECTION',
        riskScore: 10
      };
    }
    riskScore += sqlInjectionResult.riskScore;
  }
  
  // XSS Detection
  if (wafRules.includes('xss')) {
    const xssResult = detectXSS(req);
    if (xssResult.detected) {
      return {
        allowed: false,
        reason: 'Cross-site scripting attempt detected',
        code: 'XSS_ATTEMPT',
        riskScore: 8
      };
    }
    riskScore += xssResult.riskScore;
  }
  
  // Local File Inclusion Detection
  if (wafRules.includes('lfi')) {
    const lfiResult = detectLFI(req);
    if (lfiResult.detected) {
      return {
        allowed: false,
        reason: 'Local file inclusion attempt detected',
        code: 'LFI_ATTEMPT',
        riskScore: 7
      };
    }
    riskScore += lfiResult.riskScore;
  }
  
  // Remote File Inclusion Detection
  if (wafRules.includes('rfi')) {
    const rfiResult = detectRFI(req);
    if (rfiResult.detected) {
      return {
        allowed: false,
        reason: 'Remote file inclusion attempt detected',
        code: 'RFI_ATTEMPT',
        riskScore: 7
      };
    }
    riskScore += rfiResult.riskScore;
  }
  
  // Command Injection Detection
  const commandInjectionResult = detectCommandInjection(req);
  if (commandInjectionResult.detected) {
    return {
      allowed: false,
      reason: 'Command injection attempt detected',
      code: 'COMMAND_INJECTION',
      riskScore: 9
    };
  }
  riskScore += commandInjectionResult.riskScore;
  
  // Request Rate Anomaly Detection
  const rateAnomalyResult = detectRateAnomalies(req);
  if (rateAnomalyResult.detected) {
    return {
      allowed: false,
      reason: 'Suspicious request rate detected',
      code: 'RATE_ANOMALY',
      riskScore: 6
    };
  }
  riskScore += rateAnomalyResult.riskScore;
  
  return { allowed: true, riskScore };
}

interface SecurityDetectionResult {
  detected: boolean;
  riskScore: number;
  patterns?: string[];
}

function detectSQLInjection(req: AuthenticatedRequest): SecurityDetectionResult {
  const sqlPatterns = [
    /('|(\\')|(;)|(\\;))|(\b(select|union|insert|delete|update|create|drop|exec|execute)\b)/i,
    /(\b(or|and)\b.{1,6}?(=|<|>|!=))/i,
    /(\b(or|and)\b.{1,6}?(\b(true|false)\b))/i,
    /(\/\*.*?\*\/)/i,
    /(\b(information_schema|sysobjects|syscolumns)\b)/i
  ];
  
  const targets = [
    JSON.stringify(req.query),
    JSON.stringify(req.body),
    req.url
  ];
  
  let riskScore = 0;
  const detectedPatterns: string[] = [];
  
  for (const target of targets) {
    if (!target) continue;
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(target)) {
        riskScore += 3;
        detectedPatterns.push(pattern.toString());
        
        if (riskScore >= 6) {
          return { detected: true, riskScore, patterns: detectedPatterns };
        }
      }
    }
  }
  
  return { detected: false, riskScore };
}

function detectXSS(req: AuthenticatedRequest): SecurityDetectionResult {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe[^>]*>.*?<\/iframe>/i,
    /<object[^>]*>.*?<\/object>/i,
    /<embed[^>]*>/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ];
  
  const targets = [
    JSON.stringify(req.query),
    JSON.stringify(req.body),
    req.headers['user-agent'] || '',
    req.headers.referer || ''
  ];
  
  let riskScore = 0;
  const detectedPatterns: string[] = [];
  
  for (const target of targets) {
    if (!target) continue;
    
    for (const pattern of xssPatterns) {
      if (pattern.test(target)) {
        riskScore += 4;
        detectedPatterns.push(pattern.toString());
        
        if (riskScore >= 8) {
          return { detected: true, riskScore, patterns: detectedPatterns };
        }
      }
    }
  }
  
  return { detected: false, riskScore };
}

function detectLFI(req: AuthenticatedRequest): SecurityDetectionResult {
  const lfiPatterns = [
    /\.\.(\/|\\)/i,
    /(\/|\\)(etc|boot|usr|var|tmp|home)(\/|\\)/i,
    /\b(passwd|shadow|hosts|fstab)\b/i,
    /\b(\.\.\/){2,}/i
  ];
  
  const targets = [
    JSON.stringify(req.query),
    JSON.stringify(req.body),
    req.url
  ];
  
  let riskScore = 0;
  
  for (const target of targets) {
    if (!target) continue;
    
    for (const pattern of lfiPatterns) {
      if (pattern.test(target)) {
        riskScore += 5;
        if (riskScore >= 7) {
          return { detected: true, riskScore };
        }
      }
    }
  }
  
  return { detected: false, riskScore };
}

function detectRFI(req: AuthenticatedRequest): SecurityDetectionResult {
  const rfiPatterns = [
    /https?:\/\/[^\/\s]+/i,
    /ftp:\/\/[^\/\s]+/i,
    /file:\/\/[^\/\s]+/i,
    /\b(include|require|include_once|require_once)\b.*?https?:/i
  ];
  
  const targets = [
    JSON.stringify(req.query),
    JSON.stringify(req.body)
  ];
  
  let riskScore = 0;
  
  for (const target of targets) {
    if (!target) continue;
    
    for (const pattern of rfiPatterns) {
      if (pattern.test(target)) {
        riskScore += 5;
        if (riskScore >= 7) {
          return { detected: true, riskScore };
        }
      }
    }
  }
  
  return { detected: false, riskScore };
}

function detectCommandInjection(req: AuthenticatedRequest): SecurityDetectionResult {
  const commandPatterns = [
    /(\||&|;|`|\$\(|\$\{)/,
    /\b(cat|ls|pwd|id|whoami|uname|ps|netstat|ifconfig|wget|curl)\b/i,
    /\b(rm|mv|cp|mkdir|rmdir|chmod|chown)\b/i,
    /\b(python|perl|php|ruby|bash|sh|cmd|powershell)\b/i
  ];
  
  const targets = [
    JSON.stringify(req.query),
    JSON.stringify(req.body)
  ];
  
  let riskScore = 0;
  
  for (const target of targets) {
    if (!target) continue;
    
    for (const pattern of commandPatterns) {
      if (pattern.test(target)) {
        riskScore += 6;
        if (riskScore >= 9) {
          return { detected: true, riskScore };
        }
      }
    }
  }
  
  return { detected: false, riskScore };
}

function detectRateAnomalies(req: AuthenticatedRequest): SecurityDetectionResult {
  // This would integrate with rate limiting data
  // For now, basic checks
  
  const userAgent = req.headers['user-agent'] || '';
  
  // Detect bot patterns
  const botPatterns = [
    /bot|crawler|spider|scraper/i,
    /curl|wget|postman/i
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return { detected: false, riskScore: 2 }; // Not blocked, but suspicious
  }
  
  return { detected: false, riskScore: 0 };
}

interface IPSecurityResult {
  allowed: boolean;
  reason?: string;
}

function performIPSecurityChecks(req: AuthenticatedRequest, config: GatewayConfig): IPSecurityResult {
  const clientIP = getClientIP(req);
  
  // Check IP whitelist
  if (config.security.waf.ipWhitelist.length > 0) {
    if (!config.security.waf.ipWhitelist.includes(clientIP)) {
      return {
        allowed: false,
        reason: 'IP not in whitelist'
      };
    }
  }
  
  // Check IP blacklist
  if (config.security.waf.ipBlacklist.includes(clientIP)) {
    return {
      allowed: false,
      reason: 'IP in blacklist'
    };
  }
  
  // Geographic blocking
  if (config.security.waf.geoBlocking.enabled) {
    const country = req.headers['cf-ipcountry'] as string || 
                   req.headers['x-country'] as string || 
                   'unknown';
    
    if (config.security.waf.geoBlocking.blockedCountries.includes(country)) {
      return {
        allowed: false,
        reason: `Geographic restriction: ${country}`
      };
    }
    
    if (config.security.waf.geoBlocking.allowedCountries.length > 0 &&
        !config.security.waf.geoBlocking.allowedCountries.includes(country)) {
      return {
        allowed: false,
        reason: `Country not in allowed list: ${country}`
      };
    }
  }
  
  return { allowed: true };
}

interface RequestValidationResult {
  valid: boolean;
  reason?: string;
}

function validateRequest(req: AuthenticatedRequest): RequestValidationResult {
  // Check request size
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 50 * 1024 * 1024) { // 50MB limit
    return {
      valid: false,
      reason: 'Request size exceeds limit'
    };
  }
  
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain'
    ];
    
    if (!allowedTypes.some(type => contentType.startsWith(type))) {
      return {
        valid: false,
        reason: 'Invalid content type'
      };
    }
  }
  
  // Validate HTTP method
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
  if (!allowedMethods.includes(req.method)) {
    return {
      valid: false,
      reason: 'Invalid HTTP method'
    };
  }
  
  return { valid: true };
}

interface ComplianceResult {
  compliant: boolean;
  reason?: string;
}

function checkBangladeshCompliance(req: AuthenticatedRequest): ComplianceResult {
  // Data localization check
  const origin = req.headers.origin || req.headers.referer || '';
  
  // Check if request is from approved domains
  const approvedDomains = [
    'getit.com.bd',
    'localhost',
    '127.0.0.1',
    'replit.dev'
  ];
  
  if (origin && !approvedDomains.some(domain => origin.includes(domain))) {
    return {
      compliant: false,
      reason: 'Request from non-approved domain'
    };
  }
  
  // Check for sensitive data handling
  if (req.path.includes('/payment') || req.path.includes('/personal')) {
    // Ensure secure connection for sensitive data
    if (req.headers['x-forwarded-proto'] !== 'https' && !req.secure) {
      return {
        compliant: false,
        reason: 'Sensitive data must use HTTPS'
      };
    }
  }
  
  return { compliant: true };
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return req.headers['x-real-ip'] as string || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.ip || 
         'unknown';
}

function respondWithSecurityBlock(res: Response, reason: string, code: string): void {
  logger.warn('Security block triggered', {
    reason,
    code,
    timestamp: new Date().toISOString()
  });
  
  res.status(403).json({
    error: 'Access denied',
    code,
    message: 'Request blocked by security policy',
    timestamp: new Date().toISOString(),
    support: 'If you believe this is an error, please contact support'
  });
}

// Bangladesh-specific security enhancements
export const bangladeshSecurityEnhancements = {
  // Mobile network security for Bangladesh carriers
  mobileNetworkSecurity: (req: AuthenticatedRequest): boolean => {
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    
    if (isMobile) {
      // Additional security checks for mobile users
      // Check for common mobile attack patterns
      const suspiciousPatterns = [
        /jailbreak|rooted|superuser/i,
        /frida|xposed|cydia/i
      ];
      
      return !suspiciousPatterns.some(pattern => pattern.test(userAgent));
    }
    
    return true;
  },
  
  // Festival period security (increased vigilance during high traffic)
  festivalPeriodSecurity: (req: AuthenticatedRequest): { secure: boolean; alertLevel: string } => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // Major Bangladesh festivals
    const festivals = [
      { month: 4, startDay: 10, endDay: 15 }, // Pohela Boishakh
      { month: 8, startDay: 15, endDay: 20 }, // Eid
      { month: 10, startDay: 10, endDay: 15 }, // Durga Puja
      { month: 12, startDay: 15, endDay: 31 }  // Winter shopping
    ];
    
    const isFestivalPeriod = festivals.some(festival => 
      month === festival.month && day >= festival.startDay && day <= festival.endDay
    );
    
    if (isFestivalPeriod) {
      // Enhanced security during festivals
      return { secure: true, alertLevel: 'high' };
    }
    
    return { secure: true, alertLevel: 'normal' };
  }
};

export default securityMiddleware;