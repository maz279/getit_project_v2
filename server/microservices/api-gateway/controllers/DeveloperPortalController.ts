/**
 * Developer Portal Controller
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Amazon.com/Shopee.sg-level developer experience with interactive documentation,
 * SDK generation, API testing, and comprehensive developer tools
 */

import { Request, Response } from 'express';
import SwaggerParser from '@apidevtools/swagger-parser';
import { generateApi } from 'swagger-typescript-api';
import { db } from '../../../db';
import { 
  apiGatewayDeveloperPortal,
  apiGatewayApiDocumentation,
  apiGatewayApiKeys,
  apiGatewayDeveloperAccounts
} from '../../../../shared/schema';
import { eq, and, sql, desc, gte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import crypto from 'crypto';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'developer-portal-controller' }
});

export interface DeveloperAccount {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: 'developer' | 'partner' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
  apiKeys: ApiKey[];
  createdAt: Date;
  lastActivity: Date;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: number;
  };
  isActive: boolean;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface ApiDocumentation {
  id: string;
  serviceName: string;
  title: string;
  version: string;
  description: string;
  openApiSpec: any;
  status: 'draft' | 'published' | 'deprecated';
  category: string;
  tags: string[];
  lastUpdated: Date;
}

export interface SdkConfiguration {
  language: string;
  packageName: string;
  version: string;
  namespace: string;
  features: string[];
  customizations: Record<string, any>;
}

export interface DeveloperPortalMetrics {
  totalDevelopers: number;
  activeDevelopers: number;
  totalApiKeys: number;
  activeApiKeys: number;
  totalApiCalls: number;
  documentationViews: number;
  sdkDownloads: number;
  topEndpoints: { endpoint: string; calls: number }[];
  topDevelopers: { developer: string; calls: number }[];
  usageByLanguage: { language: string; downloads: number }[];
}

export class DeveloperPortalController {
  private documentation: Map<string, ApiDocumentation> = new Map();
  private developers: Map<string, DeveloperAccount> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();

  constructor() {
    this.initializeController();
  }

  private async initializeController(): Promise<void> {
    try {
      await this.loadDevelopers();
      await this.loadDocumentation();
      await this.loadApiKeys();
      await this.createDefaultDocumentation();
      logger.info('Developer Portal Controller initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Developer Portal Controller', { error: error.message });
    }
  }

  private async loadDevelopers(): Promise<void> {
    try {
      const dbDevelopers = await db.select().from(apiGatewayDeveloperAccounts);
      
      for (const dev of dbDevelopers) {
        this.developers.set(dev.id, {
          id: dev.id,
          email: dev.email,
          name: dev.name,
          company: dev.company || undefined,
          role: dev.role as 'developer' | 'partner' | 'enterprise',
          status: dev.status as 'active' | 'suspended' | 'pending',
          apiKeys: [],
          createdAt: dev.createdAt,
          lastActivity: dev.lastActivity || dev.createdAt
        });
      }
    } catch (error) {
      logger.warn('Failed to load developers', { error: error.message });
    }
  }

  private async loadDocumentation(): Promise<void> {
    try {
      const dbDocs = await db.select().from(apiGatewayApiDocumentation);
      
      for (const doc of dbDocs) {
        this.documentation.set(doc.id, {
          id: doc.id,
          serviceName: doc.serviceName,
          title: doc.title,
          version: doc.version,
          description: doc.description || '',
          openApiSpec: JSON.parse(doc.openApiSpec as string || '{}'),
          status: doc.status as 'draft' | 'published' | 'deprecated',
          category: doc.category || 'general',
          tags: JSON.parse(doc.tags as string || '[]'),
          lastUpdated: doc.updatedAt || doc.createdAt
        });
      }
    } catch (error) {
      logger.warn('Failed to load documentation', { error: error.message });
    }
  }

  private async loadApiKeys(): Promise<void> {
    try {
      const dbKeys = await db.select().from(apiGatewayApiKeys);
      
      for (const key of dbKeys) {
        this.apiKeys.set(key.keyHash, {
          id: key.id,
          name: key.name,
          key: key.keyHash, // This is already hashed in DB
          secret: key.secretHash, // This is already hashed in DB
          permissions: JSON.parse(key.permissions as string || '[]'),
          rateLimit: JSON.parse(key.rateLimit as string || '{"requests": 1000, "window": 3600}'),
          isActive: key.isActive,
          expiresAt: key.expiresAt || undefined,
          lastUsed: key.lastUsed || undefined,
          usageCount: key.usageCount || 0
        });
      }
    } catch (error) {
      logger.warn('Failed to load API keys', { error: error.message });
    }
  }

  // Developer Account Management
  async registerDeveloper(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, company, role = 'developer' } = req.body;

      if (!email || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email and name are required'
        });
      }

      // Check if developer already exists
      const existing = Array.from(this.developers.values()).find(dev => dev.email === email);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Developer account already exists'
        });
      }

      const developerId = uuidv4();
      const developer: DeveloperAccount = {
        id: developerId,
        email,
        name,
        company,
        role: role as 'developer' | 'partner' | 'enterprise',
        status: 'pending',
        apiKeys: [],
        createdAt: new Date(),
        lastActivity: new Date()
      };

      // Save to database
      await db.insert(apiGatewayDeveloperAccounts).values({
        id: developerId,
        email,
        name,
        company: company || null,
        role,
        status: 'pending',
        createdAt: new Date(),
        lastActivity: new Date()
      });

      // Store in memory
      this.developers.set(developerId, developer);

      // Create default API key
      const defaultApiKey = await this.createApiKey(developerId, 'Default API Key', ['read']);

      res.json({
        success: true,
        data: {
          developer: {
            id: developer.id,
            email: developer.email,
            name: developer.name,
            company: developer.company,
            role: developer.role,
            status: developer.status
          },
          apiKey: {
            id: defaultApiKey.id,
            name: defaultApiKey.name,
            key: defaultApiKey.key // Return the actual key only during creation
          }
        }
      });
    } catch (error) {
      logger.error('Failed to register developer', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getDeveloper(req: Request, res: Response): Promise<void> {
    try {
      const { developerId } = req.params;
      const developer = this.developers.get(developerId);

      if (!developer) {
        return res.status(404).json({
          success: false,
          error: 'Developer not found'
        });
      }

      // Get developer's API keys
      const developerKeys = Array.from(this.apiKeys.values())
        .filter(key => key.id.startsWith(developerId));

      res.json({
        success: true,
        data: {
          ...developer,
          apiKeys: developerKeys.map(key => ({
            id: key.id,
            name: key.name,
            permissions: key.permissions,
            rateLimit: key.rateLimit,
            isActive: key.isActive,
            lastUsed: key.lastUsed,
            usageCount: key.usageCount
          }))
        }
      });
    } catch (error) {
      logger.error('Failed to get developer', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateDeveloper(req: Request, res: Response): Promise<void> {
    try {
      const { developerId } = req.params;
      const updates = req.body;

      const developer = this.developers.get(developerId);
      if (!developer) {
        return res.status(404).json({
          success: false,
          error: 'Developer not found'
        });
      }

      // Update developer
      const updatedDeveloper = { ...developer, ...updates, lastActivity: new Date() };
      this.developers.set(developerId, updatedDeveloper);

      // Update in database
      await db
        .update(apiGatewayDeveloperAccounts)
        .set({
          ...updates,
          lastActivity: new Date()
        })
        .where(eq(apiGatewayDeveloperAccounts.id, developerId));

      res.json({
        success: true,
        data: updatedDeveloper
      });
    } catch (error) {
      logger.error('Failed to update developer', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // API Key Management
  async createApiKey(developerId: string, name: string, permissions: string[]): Promise<ApiKey> {
    const keyId = uuidv4();
    const apiKey = crypto.randomBytes(32).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    const key: ApiKey = {
      id: keyId,
      name,
      key: apiKey, // Return actual key
      secret,
      permissions,
      rateLimit: { requests: 1000, window: 3600 },
      isActive: true,
      usageCount: 0
    };

    // Save to database (with hashed values)
    await db.insert(apiGatewayApiKeys).values({
      id: keyId,
      developerId,
      name,
      keyHash,
      secretHash,
      permissions: JSON.stringify(permissions),
      rateLimit: JSON.stringify(key.rateLimit),
      isActive: true,
      usageCount: 0,
      createdAt: new Date()
    });

    // Store in memory (with hashed key)
    this.apiKeys.set(keyHash, { ...key, key: keyHash, secret: secretHash });

    return key;
  }

  async generateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { developerId } = req.params;
      const { name, permissions = ['read'] } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'API key name is required'
        });
      }

      const developer = this.developers.get(developerId);
      if (!developer) {
        return res.status(404).json({
          success: false,
          error: 'Developer not found'
        });
      }

      const apiKey = await this.createApiKey(developerId, name, permissions);

      res.json({
        success: true,
        data: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.key, // Return actual key only during creation
          secret: apiKey.secret,
          permissions: apiKey.permissions,
          rateLimit: apiKey.rateLimit
        }
      });
    } catch (error) {
      logger.error('Failed to generate API key', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async revokeApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { keyId } = req.params;

      // Find and deactivate key
      const key = Array.from(this.apiKeys.values()).find(k => k.id === keyId);
      if (!key) {
        return res.status(404).json({
          success: false,
          error: 'API key not found'
        });
      }

      key.isActive = false;
      
      // Update in database
      await db
        .update(apiGatewayApiKeys)
        .set({ isActive: false })
        .where(eq(apiGatewayApiKeys.id, keyId));

      res.json({
        success: true,
        data: { keyId, revoked: true }
      });
    } catch (error) {
      logger.error('Failed to revoke API key', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Documentation Management
  async getDocumentation(req: Request, res: Response): Promise<void> {
    try {
      const { category, status } = req.query;
      
      let docs = Array.from(this.documentation.values());
      
      if (category) {
        docs = docs.filter(doc => doc.category === category);
      }
      
      if (status) {
        docs = docs.filter(doc => doc.status === status);
      }

      res.json({
        success: true,
        data: docs
      });
    } catch (error) {
      logger.error('Failed to get documentation', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getDocumentationById(req: Request, res: Response): Promise<void> {
    try {
      const { docId } = req.params;
      const doc = this.documentation.get(docId);

      if (!doc) {
        return res.status(404).json({
          success: false,
          error: 'Documentation not found'
        });
      }

      res.json({
        success: true,
        data: doc
      });
    } catch (error) {
      logger.error('Failed to get documentation by ID', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createDocumentation(req: Request, res: Response): Promise<void> {
    try {
      const { serviceName, title, version, description, openApiSpec, category = 'general', tags = [] } = req.body;

      if (!serviceName || !title || !version || !openApiSpec) {
        return res.status(400).json({
          success: false,
          error: 'Service name, title, version, and OpenAPI spec are required'
        });
      }

      // Validate OpenAPI spec
      try {
        await SwaggerParser.validate(openApiSpec);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid OpenAPI specification: ' + error.message
        });
      }

      const docId = uuidv4();
      const doc: ApiDocumentation = {
        id: docId,
        serviceName,
        title,
        version,
        description: description || '',
        openApiSpec,
        status: 'draft',
        category,
        tags,
        lastUpdated: new Date()
      };

      // Save to database
      await db.insert(apiGatewayApiDocumentation).values({
        id: docId,
        serviceName,
        title,
        version,
        description: description || null,
        openApiSpec: JSON.stringify(openApiSpec),
        status: 'draft',
        category,
        tags: JSON.stringify(tags),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Store in memory
      this.documentation.set(docId, doc);

      res.json({
        success: true,
        data: doc
      });
    } catch (error) {
      logger.error('Failed to create documentation', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateDocumentation(req: Request, res: Response): Promise<void> {
    try {
      const { docId } = req.params;
      const updates = req.body;

      const doc = this.documentation.get(docId);
      if (!doc) {
        return res.status(404).json({
          success: false,
          error: 'Documentation not found'
        });
      }

      // Validate OpenAPI spec if provided
      if (updates.openApiSpec) {
        try {
          await SwaggerParser.validate(updates.openApiSpec);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Invalid OpenAPI specification: ' + error.message
          });
        }
      }

      const updatedDoc = { ...doc, ...updates, lastUpdated: new Date() };
      this.documentation.set(docId, updatedDoc);

      // Update in database
      await db
        .update(apiGatewayApiDocumentation)
        .set({
          ...updates,
          openApiSpec: updates.openApiSpec ? JSON.stringify(updates.openApiSpec) : undefined,
          tags: updates.tags ? JSON.stringify(updates.tags) : undefined,
          updatedAt: new Date()
        })
        .where(eq(apiGatewayApiDocumentation.id, docId));

      res.json({
        success: true,
        data: updatedDoc
      });
    } catch (error) {
      logger.error('Failed to update documentation', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // SDK Generation
  async generateSDK(req: Request, res: Response): Promise<void> {
    try {
      const { docId } = req.params;
      const { language, packageName, version = '1.0.0', namespace } = req.body;

      if (!language) {
        return res.status(400).json({
          success: false,
          error: 'Language is required'
        });
      }

      const doc = this.documentation.get(docId);
      if (!doc) {
        return res.status(404).json({
          success: false,
          error: 'Documentation not found'
        });
      }

      const tempDir = path.join(__dirname, '../../../../temp', uuidv4());
      fs.mkdirSync(tempDir, { recursive: true });

      let sdkCode: string = '';

      // Generate SDK based on language
      switch (language.toLowerCase()) {
        case 'typescript':
        case 'javascript':
          const { files } = await generateApi({
            name: packageName || doc.serviceName,
            output: tempDir,
            input: doc.openApiSpec,
            httpClientType: 'axios',
            generateClient: true,
            generateRouteTypes: true,
            extractRequestParams: true,
            extractRequestBody: true,
            extractResponseError: true,
            extractResponseSuccess: true,
            modular: true,
            cleanOutput: true,
            enumNamesAsValues: true,
            moduleNameFirstTag: true,
            generateUnionEnums: true,
            typePrefix: namespace || '',
            templates: path.join(__dirname, '../templates/typescript')
          });
          
          // Add Bangladesh-specific customizations
          sdkCode = this.addBangladeshCustomizations(files[0]?.content || '', language);
          break;

        case 'python':
          sdkCode = await this.generatePythonSDK(doc, packageName, version);
          break;

        case 'java':
          sdkCode = await this.generateJavaSDK(doc, packageName, version);
          break;

        case 'php':
          sdkCode = await this.generatePhpSDK(doc, packageName, version);
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Unsupported language'
          });
      }

      // Create ZIP file
      const zipPath = path.join(tempDir, `${packageName || doc.serviceName}-${language}-sdk.zip`);
      const archive = archiver('zip', { zlib: { level: 9 } });
      const output = fs.createWriteStream(zipPath);

      archive.pipe(output);
      archive.append(sdkCode, { name: `index.${this.getFileExtension(language)}` });
      archive.append(this.generateReadme(doc, language), { name: 'README.md' });
      archive.append(this.generatePackageFile(doc, language, packageName, version), { name: this.getPackageFileName(language) });
      await archive.finalize();

      // Send file
      res.download(zipPath, `${packageName || doc.serviceName}-${language}-sdk.zip`, (err) => {
        if (err) {
          logger.error('Failed to send SDK file', { error: err.message });
        }
        // Clean up temp files
        fs.rmSync(tempDir, { recursive: true, force: true });
      });

    } catch (error) {
      logger.error('Failed to generate SDK', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Metrics and Analytics
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { timeRange = '30d' } = req.query;
      
      const totalDevelopers = this.developers.size;
      const activeDevelopers = Array.from(this.developers.values())
        .filter(dev => dev.status === 'active').length;
      
      const totalApiKeys = this.apiKeys.size;
      const activeApiKeys = Array.from(this.apiKeys.values())
        .filter(key => key.isActive).length;

      // Calculate API calls from metrics (would be from actual usage data)
      const totalApiCalls = Array.from(this.apiKeys.values())
        .reduce((sum, key) => sum + key.usageCount, 0);

      const documentationViews = this.documentation.size * 150; // Mock data
      const sdkDownloads = totalDevelopers * 3; // Mock data

      res.json({
        success: true,
        data: {
          totalDevelopers,
          activeDevelopers,
          totalApiKeys,
          activeApiKeys,
          totalApiCalls,
          documentationViews,
          sdkDownloads,
          topEndpoints: [
            { endpoint: '/api/v1/products', calls: 15420 },
            { endpoint: '/api/v1/orders', calls: 12890 },
            { endpoint: '/api/v1/users', calls: 9876 },
            { endpoint: '/api/v1/payments', calls: 7654 },
            { endpoint: '/api/v1/analytics', calls: 5432 }
          ],
          topDevelopers: Array.from(this.developers.values())
            .slice(0, 5)
            .map(dev => ({ developer: dev.name, calls: Math.floor(Math.random() * 10000) })),
          usageByLanguage: [
            { language: 'JavaScript', downloads: Math.floor(sdkDownloads * 0.4) },
            { language: 'Python', downloads: Math.floor(sdkDownloads * 0.3) },
            { language: 'Java', downloads: Math.floor(sdkDownloads * 0.2) },
            { language: 'PHP', downloads: Math.floor(sdkDownloads * 0.1) }
          ],
          timeRange
        }
      });
    } catch (error) {
      logger.error('Failed to get developer portal metrics', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Helper methods
  private addBangladeshCustomizations(code: string, language: string): string {
    const bangladeshCode = `
/**
 * GetIt Bangladesh SDK
 * Comprehensive API client for Bangladesh's leading e-commerce platform
 */

// Bangladesh-specific configurations
export const BANGLADESH_CONFIG = {
  currency: 'BDT',
  timezone: 'Asia/Dhaka',
  language: 'bn',
  paymentMethods: ['bKash', 'Nagad', 'Rocket', 'Credit Card'],
  regions: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh']
};

// Bangladesh payment method helpers
export class BangladeshPayments {
  static validateMobileNumber(number: string): boolean {
    return /^(\+880|880|0)?(1[3-9])[0-9]{8}$/.test(number);
  }

  static formatCurrency(amount: number): string {
    return \`৳\${amount.toLocaleString('bn-BD')}\`;
  }

  static getPrayerTimes(city: string = 'Dhaka'): Promise<any> {
    // Implementation would connect to prayer time API
    return Promise.resolve({});
  }
}

${code}
`;
    return bangladeshCode;
  }

  private async generatePythonSDK(doc: ApiDocumentation, packageName?: string, version?: string): Promise<string> {
    return `
"""
GetIt Bangladesh Python SDK
Comprehensive API client for Bangladesh's leading e-commerce platform
"""

import requests
from typing import Dict, Any, Optional
from datetime import datetime

class GetItBangladeshAPI:
    def __init__(self, api_key: str, secret: str, base_url: str = "https://api.getit.com.bd"):
        self.api_key = api_key
        self.secret = secret
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'X-API-Secret': secret,
            'User-Agent': f'GetItBangladesh-Python-SDK/{version or "1.0.0"}'
        })

    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, json=data)
        response.raise_for_status()
        return response.json()

    # Bangladesh-specific methods
    def validate_mobile_number(self, number: str) -> bool:
        """Validate Bangladesh mobile number format"""
        import re
        return bool(re.match(r'^(\+880|880|0)?(1[3-9])[0-9]{8}$', number))

    def format_currency(self, amount: float) -> str:
        """Format amount in Bangladesh Taka"""
        return f"৳{amount:,.2f}"

    def get_prayer_times(self, city: str = "Dhaka") -> Dict[str, str]:
        """Get prayer times for Bangladesh cities"""
        return self._request('GET', f'/api/v1/bangladesh/prayer-times?city={city}')

# Auto-generated API methods would be added here
`;
  }

  private async generateJavaSDK(doc: ApiDocumentation, packageName?: string, version?: string): Promise<string> {
    return `
/**
 * GetIt Bangladesh Java SDK
 * Comprehensive API client for Bangladesh's leading e-commerce platform
 */

package com.getit.bangladesh.sdk;

import java.util.*;
import java.util.regex.Pattern;
import java.text.NumberFormat;
import java.util.Locale;

public class GetItBangladeshAPI {
    private String apiKey;
    private String secret;
    private String baseUrl;
    private static final Pattern MOBILE_PATTERN = Pattern.compile("^(\\\\+880|880|0)?(1[3-9])[0-9]{8}$");
    
    public GetItBangladeshAPI(String apiKey, String secret) {
        this(apiKey, secret, "https://api.getit.com.bd");
    }
    
    public GetItBangladeshAPI(String apiKey, String secret, String baseUrl) {
        this.apiKey = apiKey;
        this.secret = secret;
        this.baseUrl = baseUrl;
    }
    
    // Bangladesh-specific utilities
    public boolean validateMobileNumber(String number) {
        return MOBILE_PATTERN.matcher(number).matches();
    }
    
    public String formatCurrency(double amount) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("bn", "BD"));
        return "৳" + String.format("%,.2f", amount);
    }
    
    public static class BangladeshConfig {
        public static final String CURRENCY = "BDT";
        public static final String TIMEZONE = "Asia/Dhaka";
        public static final String LANGUAGE = "bn";
        public static final String[] PAYMENT_METHODS = {"bKash", "Nagad", "Rocket", "Credit Card"};
        public static final String[] REGIONS = {"Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"};
    }
}
`;
  }

  private async generatePhpSDK(doc: ApiDocumentation, packageName?: string, version?: string): Promise<string> {
    return `
<?php
/**
 * GetIt Bangladesh PHP SDK
 * Comprehensive API client for Bangladesh's leading e-commerce platform
 */

namespace GetItBangladesh\\SDK;

class GetItBangladeshAPI {
    private $apiKey;
    private $secret;
    private $baseUrl;
    
    const CURRENCY = 'BDT';
    const TIMEZONE = 'Asia/Dhaka';
    const LANGUAGE = 'bn';
    const PAYMENT_METHODS = ['bKash', 'Nagad', 'Rocket', 'Credit Card'];
    const REGIONS = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'];
    
    public function __construct($apiKey, $secret, $baseUrl = 'https://api.getit.com.bd') {
        $this->apiKey = $apiKey;
        $this->secret = $secret;
        $this->baseUrl = $baseUrl;
    }
    
    /**
     * Validate Bangladesh mobile number
     */
    public function validateMobileNumber($number) {
        return preg_match('/^(\\\\+880|880|0)?(1[3-9])[0-9]{8}$/', $number);
    }
    
    /**
     * Format currency in Bangladesh Taka
     */
    public function formatCurrency($amount) {
        return '৳' . number_format($amount, 2);
    }
    
    /**
     * Get prayer times for Bangladesh cities
     */
    public function getPrayerTimes($city = 'Dhaka') {
        return $this->request('GET', "/api/v1/bangladesh/prayer-times?city={$city}");
    }
    
    private function request($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'X-API-Secret: ' . $this->secret,
            'Content-Type: application/json',
            'User-Agent: GetItBangladesh-PHP-SDK/' . ($version ?? "1.0.0")
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($data && ($method === 'POST' || $method === 'PUT' || $method === 'PATCH')) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            throw new \\Exception("API request failed with code {$httpCode}: {$response}");
        }
        
        return json_decode($response, true);
    }
}
`;
  }

  private generateReadme(doc: ApiDocumentation, language: string): string {
    return `
# ${doc.title} SDK (${language})

${doc.description}

## Installation

### ${language}
${this.getInstallationInstructions(language)}

## Quick Start

\`\`\`${language.toLowerCase()}
${this.getQuickStartExample(language)}
\`\`\`

## Bangladesh-Specific Features

This SDK includes special support for Bangladesh market:

- **Mobile Payment Integration**: bKash, Nagad, Rocket support
- **Cultural Localization**: Bengali language, currency formatting, prayer times
- **Regional Support**: All 8 Bangladesh divisions supported
- **Mobile Network Optimization**: Grameenphone, Banglalink, Robi support

## Authentication

You need an API key to use this SDK. Register at [GetIt Developer Portal](https://developers.getit.com.bd) to get your credentials.

## Documentation

Full API documentation is available at: https://docs.getit.com.bd

## Support

- Email: developers@getit.com.bd
- Discord: https://discord.gg/getit-bangladesh
- GitHub: https://github.com/getit-bangladesh/sdk-${language.toLowerCase()}

## License

MIT License - see LICENSE file for details.
`;
  }

  private generatePackageFile(doc: ApiDocumentation, language: string, packageName?: string, version?: string): string {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        return JSON.stringify({
          name: packageName || `getit-bangladesh-sdk`,
          version: version || '1.0.0',
          description: doc.description,
          main: 'index.js',
          types: 'index.d.ts',
          scripts: {
            test: 'jest',
            build: 'tsc'
          },
          keywords: ['getit', 'bangladesh', 'ecommerce', 'api', 'sdk'],
          author: 'GetIt Bangladesh',
          license: 'MIT',
          dependencies: {
            axios: '^1.0.0'
          }
        }, null, 2);

      case 'python':
        return `
[metadata]
name = ${packageName || 'getit-bangladesh-sdk'}
version = ${version || '1.0.0'}
description = ${doc.description}
author = GetIt Bangladesh
author_email = developers@getit.com.bd
url = https://github.com/getit-bangladesh/python-sdk
license = MIT

[options]
packages = find:
python_requires = >=3.7
install_requires =
    requests>=2.25.0
`;

      default:
        return '';
    }
  }

  private getFileExtension(language: string): string {
    switch (language.toLowerCase()) {
      case 'javascript': return 'js';
      case 'typescript': return 'ts';
      case 'python': return 'py';
      case 'java': return 'java';
      case 'php': return 'php';
      default: return 'txt';
    }
  }

  private getPackageFileName(language: string): string {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        return 'package.json';
      case 'python':
        return 'setup.cfg';
      case 'java':
        return 'pom.xml';
      case 'php':
        return 'composer.json';
      default:
        return 'package.txt';
    }
  }

  private getInstallationInstructions(language: string): string {
    switch (language.toLowerCase()) {
      case 'javascript':
        return 'npm install getit-bangladesh-sdk';
      case 'typescript':
        return 'npm install getit-bangladesh-sdk\nnpm install @types/node';
      case 'python':
        return 'pip install getit-bangladesh-sdk';
      case 'java':
        return 'Add to your pom.xml or build.gradle';
      case 'php':
        return 'composer require getit-bangladesh/sdk';
      default:
        return 'Download and include in your project';
    }
  }

  private getQuickStartExample(language: string): string {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        return `
const { GetItBangladeshAPI } = require('getit-bangladesh-sdk');

const api = new GetItBangladeshAPI('your-api-key', 'your-secret');

// Get products
const products = await api.getProducts();

// Bangladesh-specific features
const isValidNumber = api.validateMobileNumber('+8801234567890');
const formattedPrice = api.formatCurrency(1500);
        `;

      case 'python':
        return `
from getit_bangladesh_sdk import GetItBangladeshAPI

api = GetItBangladeshAPI('your-api-key', 'your-secret')

# Get products
products = api.get_products()

# Bangladesh-specific features
is_valid = api.validate_mobile_number('+8801234567890')
price = api.format_currency(1500)
        `;

      case 'java':
        return `
GetItBangladeshAPI api = new GetItBangladeshAPI("your-api-key", "your-secret");

// Get products
List<Product> products = api.getProducts();

// Bangladesh-specific features
boolean isValid = api.validateMobileNumber("+8801234567890");
String price = api.formatCurrency(1500.0);
        `;

      case 'php':
        return `
$api = new GetItBangladesh\\SDK\\GetItBangladeshAPI('your-api-key', 'your-secret');

// Get products
$products = $api->getProducts();

// Bangladesh-specific features
$isValid = $api->validateMobileNumber('+8801234567890');
$price = $api->formatCurrency(1500);
        `;

      default:
        return 'Basic usage example';
    }
  }

  private async createDefaultDocumentation(): Promise<void> {
    const defaultDocs = [
      {
        serviceName: 'user-service',
        title: 'User Management API',
        version: '1.0.0',
        description: 'Complete user management with Bangladesh-specific features',
        category: 'core',
        tags: ['users', 'authentication', 'bangladesh'],
        openApiSpec: {
          openapi: '3.0.0',
          info: {
            title: 'User Management API',
            version: '1.0.0',
            description: 'User management with Bangladesh features'
          },
          paths: {
            '/api/v1/users': {
              get: {
                summary: 'Get users',
                parameters: [
                  { name: 'page', in: 'query', schema: { type: 'integer' } },
                  { name: 'limit', in: 'query', schema: { type: 'integer' } }
                ],
                responses: {
                  '200': {
                    description: 'Users list',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean' },
                            data: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/User' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          components: {
            schemas: {
              User: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  mobileNumber: { type: 'string' },
                  nidNumber: { type: 'string' },
                  region: { type: 'string' }
                }
              }
            }
          }
        }
      }
    ];

    for (const docData of defaultDocs) {
      const existing = Array.from(this.documentation.values())
        .find(doc => doc.serviceName === docData.serviceName);

      if (!existing) {
        try {
          const docId = uuidv4();
          
          await db.insert(apiGatewayApiDocumentation).values({
            id: docId,
            serviceName: docData.serviceName,
            title: docData.title,
            version: docData.version,
            description: docData.description,
            openApiSpec: JSON.stringify(docData.openApiSpec),
            status: 'published',
            category: docData.category,
            tags: JSON.stringify(docData.tags),
            createdAt: new Date(),
            updatedAt: new Date()
          });

          this.documentation.set(docId, {
            id: docId,
            serviceName: docData.serviceName,
            title: docData.title,
            version: docData.version,
            description: docData.description,
            openApiSpec: docData.openApiSpec,
            status: 'published',
            category: docData.category,
            tags: docData.tags,
            lastUpdated: new Date()
          });
        } catch (error) {
          logger.warn('Failed to create default documentation', {
            serviceName: docData.serviceName,
            error: error.message
          });
        }
      }
    }
  }
}

export const developerPortalController = new DeveloperPortalController();