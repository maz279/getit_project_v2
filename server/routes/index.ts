/**
 * 🎯 ENTERPRISE ROUTES ARCHITECTURE - SINGLE SOURCE OF TRUTH
 * 
 * This file serves as the MAIN routes entry point following software engineering principles:
 * - Single Source of Truth
 * - Feature-based organization
 * - Separation of Concerns
 * - DRY (Don't Repeat Yourself)
 * - Clear maintainability
 * 
 * Architecture Pattern: Feature-based modular routing
 * Each domain has its own route file with consistent naming
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";

// Core Infrastructure
import { initializeDatabase } from "../database-init";
import { storage } from "../storage";

// Security & Middleware
import { 
  standardRateLimit, 
  aiRateLimit, 
  initializeRateLimiting,
} from "../middleware/rateLimiting";

// 🔍 SEARCH & AI DOMAIN - Core search functionality
import { searchRoutes } from "./search.js";
import { aiRoutes } from "./ai.js";

// 📦 PRODUCT DOMAIN - Product management
import { productRoutes } from "./products.js";

// 👤 USER DOMAIN - Authentication & user management  
import { userRoutes } from "./users.js";

// 🛒 COMMERCE DOMAIN - Cart, orders, payments
import { cartRoutes } from "./cart.js";
import { orderRoutes } from "./orders.js";

// 🏥 SYSTEM DOMAIN - Health, monitoring, admin
import { healthRoutes } from "./health.js";
import { adminRoutes } from "./admin.js";

/**
 * 🚀 MAIN ROUTE REGISTRATION FUNCTION
 * 
 * Registers all routes following enterprise patterns:
 * - Security-first middleware setup
 * - Feature-based route organization
 * - Consistent error handling
 * - Performance optimization
 */
export async function registerRoutes(app: Express): Promise<Server> {
  console.log('🚀 Starting Enterprise Routes Architecture...');

  // 🔒 SECURITY MIDDLEWARE - Applied first for all routes
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://replit.com"],
        connectSrc: ["'self'", "wss:", "ws:", "https://replit.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  
  app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint'],
  }));
  
  app.use(compression());
  app.use(morgan('combined'));

  // 🔧 API MIDDLEWARE - Ensures proper JSON responses
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  // 📊 INITIALIZE CORE SERVICES
  await initializeDatabase();
  await initializeRateLimiting();

  // 🎯 DOMAIN-BASED ROUTE REGISTRATION
  // Each domain is self-contained and independently maintainable
  
  // Health & System Monitoring (no rate limiting for health checks)
  app.use('/api/health', await healthRoutes());
  
  // Search & AI Services (with AI-specific rate limiting)
  app.use('/api/search', aiRateLimit, await searchRoutes(storage));
  app.use('/api/ai', aiRateLimit, await aiRoutes());
  
  // Core Business Domains (with standard rate limiting)
  app.use('/api/products', standardRateLimit, await productRoutes(storage));
  app.use('/api/users', standardRateLimit, await userRoutes(storage));
  app.use('/api/cart', standardRateLimit, await cartRoutes(storage));
  app.use('/api/orders', standardRateLimit, await orderRoutes(storage));
  
  // Admin & Management (with strict rate limiting)
  app.use('/api/admin', standardRateLimit, await adminRoutes(storage));

  console.log('✅ Enterprise Routes Architecture initialized successfully');
  console.log('📋 Registered domains: Search, AI, Products, Users, Cart, Orders, Health, Admin');

  return createServer(app);
}

/**
 * 🏗️ ARCHITECTURE BENEFITS:
 * 
 * ✅ Single Source of Truth - One main routes file
 * ✅ Feature-based Organization - Each domain in separate file  
 * ✅ DRY Principle - No code duplication
 * ✅ Separation of Concerns - Clear domain boundaries
 * ✅ Maintainability - Easy to find and modify routes
 * ✅ Scalability - Easy to add new domains
 * ✅ Testing - Each domain can be tested independently
 * ✅ Security - Consistent middleware application
 * ✅ Performance - Optimized rate limiting per domain
 */