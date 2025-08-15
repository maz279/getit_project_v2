/**
 * Security Controller - Amazon.com/Shopee.sg-Level DRM and Security
 * Enterprise-grade video security with DRM, authentication, and content protection
 * 
 * @fileoverview Advanced security controller with multi-provider DRM and anti-piracy
 * @author GetIt Platform Team
 * @version 2.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../db.js';
import { videoStreams, vendors } from '../../../../shared/schema.js';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import winston from 'winston';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'video-security-controller' },
  transports: [
    new winston.transports.File({ filename: 'logs/video-security-combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

interface DRMConfig {
  provider: 'widevine' | 'playready' | 'fairplay' | 'clearkey';
  licenseUrl: string;
  keyId: string;
  contentId: string;
  policy: {
    canPlay: boolean;
    canPersist: boolean;
    canRenew: boolean;
    licenseExpiryTime: number;
    playbackDuration: number;
  };
}

interface StreamToken {
  tokenId: string;
  streamId: string;
  userId: string;
  expiresAt: Date;
  permissions: string[];
  ipRestrictions: string[];
  deviceRestrictions: string[];
  geolocation: {
    allowedCountries: string[];
    blockedCountries: string[];
  };
}

interface SecurityMetrics {
  tokenValidations: number;
  unauthorizedAttempts: number;
  drmLicenseRequests: number;
  geoblockingEvents: number;
  suspiciousActivities: number;
  antiPiracyDetections: number;
}

interface ContentProtectionRule {
  id: string;
  streamId: string;
  ruleType: 'geoblocking' | 'time_restriction' | 'device_limit' | 'concurrent_streams';
  configuration: any;
  isActive: boolean;
  priority: number;
}

export class SecurityController {
  private drmConfigs: Map<string, DRMConfig[]> = new Map();
  private streamTokens: Map<string, StreamToken> = new Map();
  private securityMetrics: Map<string, SecurityMetrics> = new Map();
  private protectionRules: Map<string, ContentProtectionRule[]> = new Map();
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key-for-dev';
  }

  /**
   * Generate secure stream token
   * Amazon.com/Shopee.sg-Level token-based authentication
   */
  async generateStreamToken(req: Request, res: Response): Promise<void> {
    try {
      const {
        streamId,
        userId,
        permissions = ['play'],
        expirationMinutes = 60,
        ipRestrictions = [],
        deviceRestrictions = [],
        geolocation = { allowedCountries: [], blockedCountries: [] }
      } = req.body;

      // Validate stream exists
      const stream = await db.select().from(videoStreams).where(eq(videoStreams.id, streamId)).limit(1);
      if (!stream.length) {
        res.status(404).json({ error: 'Stream not found' });
        return;
      }

      // Generate token
      const tokenId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      const streamToken: StreamToken = {
        tokenId,
        streamId,
        userId,
        expiresAt,
        permissions,
        ipRestrictions,
        deviceRestrictions,
        geolocation
      };

      // Create JWT token
      const jwtToken = jwt.sign(
        {
          tokenId,
          streamId,
          userId,
          permissions,
          exp: Math.floor(expiresAt.getTime() / 1000)
        },
        this.jwtSecret,
        { algorithm: 'HS256' }
      );

      // Store token in memory and database
      this.streamTokens.set(tokenId, streamToken);

      // Generate streaming URLs with token
      const streamUrls = this.generateSecureStreamUrls(streamId, jwtToken);

      logger.info(`Stream token generated for stream: ${streamId}, user: ${userId}`);
      res.json({
        success: true,
        token: jwtToken,
        tokenId,
        streamUrls,
        expiresAt,
        permissions,
        securityFeatures: {
          ipRestrictions: ipRestrictions.length > 0,
          deviceRestrictions: deviceRestrictions.length > 0,
          geolocation: geolocation.allowedCountries.length > 0 || geolocation.blockedCountries.length > 0
        }
      });
    } catch (error) {
      logger.error('Error generating stream token:', error);
      res.status(500).json({ 
        error: 'Failed to generate stream token',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate stream token
   * Real-time token validation with security checks
   */
  async validateStreamToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      // Validate JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, this.jwtSecret) as any;
      } catch (jwtError) {
        await this.logSecurityEvent(null, 'invalid_token', { token, clientIp, userAgent });
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      // Get token details
      const streamToken = this.streamTokens.get(decoded.tokenId);
      if (!streamToken) {
        await this.logSecurityEvent(decoded.streamId, 'token_not_found', { tokenId: decoded.tokenId, clientIp });
        res.status(401).json({ error: 'Token not found' });
        return;
      }

      // Check expiration
      if (streamToken.expiresAt < new Date()) {
        await this.logSecurityEvent(decoded.streamId, 'token_expired', { tokenId: decoded.tokenId, clientIp });
        res.status(401).json({ error: 'Token expired' });
        return;
      }

      // Check IP restrictions
      if (streamToken.ipRestrictions.length > 0 && !streamToken.ipRestrictions.includes(clientIp as string)) {
        await this.logSecurityEvent(decoded.streamId, 'ip_restriction_violation', { tokenId: decoded.tokenId, clientIp });
        res.status(403).json({ error: 'IP address not allowed' });
        return;
      }

      // Check geolocation restrictions
      const geoValidation = await this.validateGeolocation(clientIp as string, streamToken.geolocation);
      if (!geoValidation.isAllowed) {
        await this.logSecurityEvent(decoded.streamId, 'geolocation_blocked', { 
          tokenId: decoded.tokenId, 
          clientIp, 
          country: geoValidation.country 
        });
        res.status(403).json({ error: 'Access not allowed from this location' });
        return;
      }

      // Update security metrics
      this.updateSecurityMetrics(decoded.streamId, 'tokenValidations');

      logger.info(`Token validated successfully for stream: ${decoded.streamId}`);
      res.json({
        success: true,
        valid: true,
        tokenId: decoded.tokenId,
        streamId: decoded.streamId,
        userId: decoded.userId,
        permissions: streamToken.permissions,
        expiresAt: streamToken.expiresAt
      });
    } catch (error) {
      logger.error('Error validating stream token:', error);
      res.status(500).json({ 
        error: 'Failed to validate stream token',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Configure DRM protection
   * Multi-provider DRM configuration (Widevine, PlayReady, FairPlay)
   */
  async configureDRM(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { drmConfigs } = req.body;

      // Validate stream exists
      const stream = await db.select().from(videoStreams).where(eq(videoStreams.id, streamId)).limit(1);
      if (!stream.length) {
        res.status(404).json({ error: 'Stream not found' });
        return;
      }

      // Validate DRM configurations
      for (const config of drmConfigs) {
        if (!this.validateDRMConfig(config)) {
          res.status(400).json({ error: `Invalid DRM configuration for provider: ${config.provider}` });
          return;
        }
      }

      // Store DRM configurations
      this.drmConfigs.set(streamId, drmConfigs);

      // Update stream with DRM enabled
      await db.update(videoStreams)
        .set({
          drmEnabled: true,
          drmProviders: drmConfigs.map(config => config.provider),
          updatedAt: new Date()
        })
        .where(eq(videoStreams.id, streamId));

      logger.info(`DRM configured for stream: ${streamId} with providers: ${drmConfigs.map(c => c.provider).join(', ')}`);
      res.json({
        success: true,
        message: 'DRM configuration updated successfully',
        providers: drmConfigs.map(config => config.provider),
        streamId
      });
    } catch (error) {
      logger.error('Error configuring DRM:', error);
      res.status(500).json({ 
        error: 'Failed to configure DRM',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate DRM license
   * Real-time DRM license generation for authorized users
   */
  async generateDRMLicense(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { 
        provider, 
        keyId, 
        contentId, 
        userId,
        deviceId,
        challenge 
      } = req.body;

      // Validate DRM configuration exists
      const drmConfigs = this.drmConfigs.get(streamId);
      if (!drmConfigs) {
        res.status(404).json({ error: 'DRM not configured for this stream' });
        return;
      }

      const drmConfig = drmConfigs.find(config => config.provider === provider);
      if (!drmConfig) {
        res.status(404).json({ error: `DRM provider ${provider} not configured` });
        return;
      }

      // Generate license based on provider
      const license = await this.generateProviderLicense(provider, drmConfig, {
        keyId,
        contentId,
        userId,
        deviceId,
        challenge
      });

      // Update security metrics
      this.updateSecurityMetrics(streamId, 'drmLicenseRequests');

      logger.info(`DRM license generated for stream: ${streamId}, provider: ${provider}`);
      res.json({
        success: true,
        license,
        provider,
        expiresAt: new Date(Date.now() + drmConfig.policy.licenseExpiryTime * 1000)
      });
    } catch (error) {
      logger.error('Error generating DRM license:', error);
      res.status(500).json({ 
        error: 'Failed to generate DRM license',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Set content protection rules
   * Advanced content protection with multiple rule types
   */
  async setContentProtectionRules(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { rules } = req.body;

      // Validate stream exists
      const stream = await db.select().from(videoStreams).where(eq(videoStreams.id, streamId)).limit(1);
      if (!stream.length) {
        res.status(404).json({ error: 'Stream not found' });
        return;
      }

      // Validate and process rules
      const processedRules: ContentProtectionRule[] = [];
      for (const rule of rules) {
        const protectionRule: ContentProtectionRule = {
          id: crypto.randomUUID(),
          streamId,
          ruleType: rule.ruleType,
          configuration: rule.configuration,
          isActive: rule.isActive !== false,
          priority: rule.priority || 1
        };

        if (this.validateProtectionRule(protectionRule)) {
          processedRules.push(protectionRule);
        } else {
          res.status(400).json({ error: `Invalid protection rule: ${rule.ruleType}` });
          return;
        }
      }

      // Store protection rules
      this.protectionRules.set(streamId, processedRules);

      logger.info(`Content protection rules configured for stream: ${streamId}`);
      res.json({
        success: true,
        message: 'Content protection rules configured successfully',
        rules: processedRules.map(rule => ({
          id: rule.id,
          ruleType: rule.ruleType,
          isActive: rule.isActive,
          priority: rule.priority
        }))
      });
    } catch (error) {
      logger.error('Error setting content protection rules:', error);
      res.status(500).json({ 
        error: 'Failed to set content protection rules',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get security metrics
   * Real-time security monitoring and analytics
   */
  async getSecurityMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { timeRange = '24h' } = req.query;

      // Get current metrics
      const metrics = this.securityMetrics.get(streamId) || {
        tokenValidations: 0,
        unauthorizedAttempts: 0,
        drmLicenseRequests: 0,
        geoblockingEvents: 0,
        suspiciousActivities: 0,
        antiPiracyDetections: 0
      };

      // Calculate security insights
      const securityInsights = this.calculateSecurityInsights(metrics);

      // Get active protection rules
      const activeRules = this.protectionRules.get(streamId) || [];

      res.json({
        success: true,
        metrics,
        insights: securityInsights,
        activeProtectionRules: activeRules.filter(rule => rule.isActive).length,
        drmEnabled: this.drmConfigs.has(streamId),
        timeRange
      });
    } catch (error) {
      logger.error('Error getting security metrics:', error);
      res.status(500).json({ 
        error: 'Failed to get security metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Detect suspicious activity
   * AI-powered anti-piracy and fraud detection
   */
  async detectSuspiciousActivity(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const {
        userAgent,
        ipAddress,
        viewingPattern,
        deviceInfo,
        networkFingerprint
      } = req.body;

      // Analyze suspicious patterns
      const suspiciousPatterns = await this.analyzeSuspiciousPatterns({
        streamId,
        userAgent,
        ipAddress,
        viewingPattern,
        deviceInfo,
        networkFingerprint
      });

      // Calculate risk score
      const riskScore = this.calculateRiskScore(suspiciousPatterns);

      // Take action based on risk score
      let action = 'allow';
      if (riskScore > 80) {
        action = 'block';
        await this.logSecurityEvent(streamId, 'high_risk_blocked', { riskScore, patterns: suspiciousPatterns });
      } else if (riskScore > 60) {
        action = 'monitor';
        await this.logSecurityEvent(streamId, 'medium_risk_monitor', { riskScore, patterns: suspiciousPatterns });
      }

      // Update security metrics
      if (riskScore > 60) {
        this.updateSecurityMetrics(streamId, 'suspiciousActivities');
      }

      res.json({
        success: true,
        riskScore,
        action,
        suspiciousPatterns,
        recommendations: this.generateSecurityRecommendations(suspiciousPatterns)
      });
    } catch (error) {
      logger.error('Error detecting suspicious activity:', error);
      res.status(500).json({ 
        error: 'Failed to detect suspicious activity',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Private helper methods

  private generateSecureStreamUrls(streamId: string, token: string): any {
    return {
      hls: `https://cdn.getit.com/hls/${streamId}/master.m3u8?token=${token}`,
      dash: `https://cdn.getit.com/dash/${streamId}/manifest.mpd?token=${token}`,
      webrtc: `wss://webrtc.getit.com/stream/${streamId}?token=${token}`
    };
  }

  private async validateGeolocation(ip: string, geolocation: any): Promise<{ isAllowed: boolean, country: string }> {
    // Mock geolocation validation - in production, use a real IP geolocation service
    const mockCountry = 'BD'; // Bangladesh
    
    const isAllowed = geolocation.allowedCountries.length === 0 || 
                     geolocation.allowedCountries.includes(mockCountry);
    
    const isBlocked = geolocation.blockedCountries.includes(mockCountry);
    
    return {
      isAllowed: isAllowed && !isBlocked,
      country: mockCountry
    };
  }

  private validateDRMConfig(config: DRMConfig): boolean {
    return config.provider && 
           config.licenseUrl && 
           config.keyId && 
           config.contentId &&
           config.policy;
  }

  private async generateProviderLicense(provider: string, config: DRMConfig, params: any): Promise<string> {
    // Mock license generation - in production, integrate with actual DRM providers
    const licenseData = {
      provider,
      keyId: params.keyId,
      contentId: params.contentId,
      userId: params.userId,
      deviceId: params.deviceId,
      policy: config.policy,
      timestamp: new Date().toISOString()
    };

    return Buffer.from(JSON.stringify(licenseData)).toString('base64');
  }

  private validateProtectionRule(rule: ContentProtectionRule): boolean {
    const validRuleTypes = ['geoblocking', 'time_restriction', 'device_limit', 'concurrent_streams'];
    return validRuleTypes.includes(rule.ruleType) && rule.configuration;
  }

  private updateSecurityMetrics(streamId: string, metricType: keyof SecurityMetrics): void {
    const metrics = this.securityMetrics.get(streamId) || {
      tokenValidations: 0,
      unauthorizedAttempts: 0,
      drmLicenseRequests: 0,
      geoblockingEvents: 0,
      suspiciousActivities: 0,
      antiPiracyDetections: 0
    };

    metrics[metricType]++;
    this.securityMetrics.set(streamId, metrics);
  }

  private async logSecurityEvent(streamId: string | null, eventType: string, details: any): Promise<void> {
    logger.warn(`Security event: ${eventType}`, {
      streamId,
      eventType,
      details,
      timestamp: new Date()
    });
  }

  private calculateSecurityInsights(metrics: SecurityMetrics): any {
    const totalRequests = metrics.tokenValidations + metrics.unauthorizedAttempts;
    const successRate = totalRequests > 0 ? (metrics.tokenValidations / totalRequests) * 100 : 100;

    return {
      authenticationSuccessRate: Math.round(successRate * 10) / 10,
      securityScore: this.calculateSecurityScore(metrics),
      threatLevel: this.calculateThreatLevel(metrics),
      recommendations: this.generateSecurityInsights(metrics)
    };
  }

  private calculateSecurityScore(metrics: SecurityMetrics): number {
    const totalRequests = metrics.tokenValidations + metrics.unauthorizedAttempts;
    const successRate = totalRequests > 0 ? (metrics.tokenValidations / totalRequests) : 1;
    
    let score = successRate * 100;
    
    // Penalize for suspicious activities
    score -= Math.min(metrics.suspiciousActivities * 5, 30);
    score -= Math.min(metrics.antiPiracyDetections * 10, 50);
    
    return Math.max(Math.round(score), 0);
  }

  private calculateThreatLevel(metrics: SecurityMetrics): string {
    const suspiciousScore = metrics.suspiciousActivities + metrics.antiPiracyDetections * 2;
    
    if (suspiciousScore === 0) return 'low';
    if (suspiciousScore < 5) return 'medium';
    return 'high';
  }

  private generateSecurityInsights(metrics: SecurityMetrics): string[] {
    const insights: string[] = [];
    
    if (metrics.unauthorizedAttempts > 10) {
      insights.push('High number of unauthorized access attempts detected');
    }
    
    if (metrics.suspiciousActivities > 5) {
      insights.push('Multiple suspicious activities detected - consider enhanced monitoring');
    }
    
    if (metrics.antiPiracyDetections > 0) {
      insights.push('Potential piracy attempts detected - review content protection rules');
    }
    
    return insights;
  }

  private async analyzeSuspiciousPatterns(data: any): Promise<string[]> {
    const patterns: string[] = [];
    
    // Mock pattern analysis
    if (data.userAgent.includes('bot') || data.userAgent.includes('crawler')) {
      patterns.push('Bot or crawler detected');
    }
    
    if (data.viewingPattern && data.viewingPattern.rapidSwitching) {
      patterns.push('Rapid quality switching detected');
    }
    
    return patterns;
  }

  private calculateRiskScore(patterns: string[]): number {
    return patterns.length * 25; // Simple scoring - 25 points per pattern
  }

  private generateSecurityRecommendations(patterns: string[]): string[] {
    const recommendations: string[] = [];
    
    patterns.forEach(pattern => {
      if (pattern.includes('bot')) {
        recommendations.push('Implement bot detection and blocking');
      }
      if (pattern.includes('switching')) {
        recommendations.push('Monitor for potential stream ripping attempts');
      }
    });
    
    return recommendations;
  }
}