/**
 * Circuit Breaker Middleware
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Production-ready circuit breaker pattern for fault tolerance
 * Prevents cascade failures and provides automatic recovery
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db';
import { apiGatewayCircuitBreakers } from '../../../../shared/schema';
import { eq, and, gte } from 'drizzle-orm';
import { GatewayConfig } from '../config/gateway.config';
import { AuthenticatedRequest } from './authentication';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'circuit-breaker-middleware' }
});

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerMetrics {
  failureCount: number;
  successCount: number;
  requestCount: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  state: CircuitState;
  nextAttemptTime: Date | null;
}

class CircuitBreakerManager {
  private circuits: Map<string, CircuitBreakerMetrics> = new Map();
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
    this.loadCircuitStates();
  }

  private async loadCircuitStates(): Promise<void> {
    try {
      const circuits = await db.select().from(apiGatewayCircuitBreakers);
      
      for (const circuit of circuits) {
        this.circuits.set(circuit.serviceId!, {
          failureCount: circuit.failureCount || 0,
          successCount: 0,
          requestCount: 0,
          lastFailureTime: circuit.lastFailureAt,
          lastSuccessTime: null,
          state: circuit.state as CircuitState || CircuitState.CLOSED,
          nextAttemptTime: circuit.nextAttemptAt
        });
      }

      logger.info('Circuit breaker states loaded', {
        circuitCount: this.circuits.size
      });

    } catch (error) {
      logger.error('Failed to load circuit states', {
        error: error.message
      });
    }
  }

  async getCircuitState(serviceName: string): Promise<CircuitState> {
    const circuit = this.circuits.get(serviceName);
    
    if (!circuit) {
      // Initialize new circuit in CLOSED state
      const newCircuit: CircuitBreakerMetrics = {
        failureCount: 0,
        successCount: 0,
        requestCount: 0,
        lastFailureTime: null,
        lastSuccessTime: null,
        state: CircuitState.CLOSED,
        nextAttemptTime: null
      };
      
      this.circuits.set(serviceName, newCircuit);
      await this.persistCircuitState(serviceName, newCircuit);
      return CircuitState.CLOSED;
    }

    // Check if HALF_OPEN should transition back to CLOSED or OPEN
    if (circuit.state === CircuitState.HALF_OPEN) {
      if (circuit.successCount > 0) {
        circuit.state = CircuitState.CLOSED;
        circuit.failureCount = 0;
        await this.persistCircuitState(serviceName, circuit);
        logger.info('Circuit breaker transitioned to CLOSED', { serviceName });
      }
    }

    // Check if OPEN should transition to HALF_OPEN
    if (circuit.state === CircuitState.OPEN && 
        circuit.nextAttemptTime && 
        new Date() > circuit.nextAttemptTime) {
      circuit.state = CircuitState.HALF_OPEN;
      circuit.successCount = 0;
      circuit.requestCount = 0;
      await this.persistCircuitState(serviceName, circuit);
      logger.info('Circuit breaker transitioned to HALF_OPEN', { serviceName });
    }

    return circuit.state;
  }

  async recordSuccess(serviceName: string): Promise<void> {
    const circuit = this.circuits.get(serviceName);
    if (!circuit) return;

    circuit.successCount++;
    circuit.requestCount++;
    circuit.lastSuccessTime = new Date();

    // If in HALF_OPEN and we have enough successes, close the circuit
    if (circuit.state === CircuitState.HALF_OPEN && circuit.successCount >= 3) {
      circuit.state = CircuitState.CLOSED;
      circuit.failureCount = 0;
      logger.info('Circuit breaker reset to CLOSED after successful recovery', { 
        serviceName,
        successCount: circuit.successCount 
      });
    }

    await this.persistCircuitState(serviceName, circuit);
  }

  async recordFailure(serviceName: string): Promise<void> {
    const circuit = this.circuits.get(serviceName);
    if (!circuit) return;

    circuit.failureCount++;
    circuit.requestCount++;
    circuit.lastFailureTime = new Date();

    // Check if we should open the circuit
    const failureRate = circuit.failureCount / Math.max(circuit.requestCount, 10);
    const shouldOpen = circuit.failureCount >= this.config.circuitBreaker.failureThreshold ||
                      (circuit.requestCount >= 10 && failureRate >= 0.5);

    if (shouldOpen && circuit.state !== CircuitState.OPEN) {
      circuit.state = CircuitState.OPEN;
      circuit.nextAttemptTime = new Date(Date.now() + this.config.circuitBreaker.recoveryTimeout);
      
      logger.warn('Circuit breaker opened', {
        serviceName,
        failureCount: circuit.failureCount,
        failureRate: Math.round(failureRate * 100),
        nextAttemptTime: circuit.nextAttemptTime
      });
    }

    // If in HALF_OPEN and we get a failure, reopen the circuit
    if (circuit.state === CircuitState.HALF_OPEN) {
      circuit.state = CircuitState.OPEN;
      circuit.nextAttemptTime = new Date(Date.now() + this.config.circuitBreaker.recoveryTimeout);
      
      logger.warn('Circuit breaker reopened after failure in HALF_OPEN state', { serviceName });
    }

    await this.persistCircuitState(serviceName, circuit);
  }

  private async persistCircuitState(serviceName: string, circuit: CircuitBreakerMetrics): Promise<void> {
    try {
      // Upsert circuit breaker state
      const existingCircuit = await db.select().from(apiGatewayCircuitBreakers)
        .where(eq(apiGatewayCircuitBreakers.serviceId, serviceName))
        .limit(1);

      if (existingCircuit.length > 0) {
        await db.update(apiGatewayCircuitBreakers)
          .set({
            state: circuit.state,
            failureCount: circuit.failureCount,
            lastFailureAt: circuit.lastFailureTime,
            nextAttemptAt: circuit.nextAttemptTime,
            updatedAt: new Date()
          })
          .where(eq(apiGatewayCircuitBreakers.serviceId, serviceName));
      } else {
        await db.insert(apiGatewayCircuitBreakers).values({
          serviceId: serviceName,
          state: circuit.state,
          failureCount: circuit.failureCount,
          failureThreshold: this.config.circuitBreaker.failureThreshold,
          timeout: this.config.circuitBreaker.recoveryTimeout,
          lastFailureAt: circuit.lastFailureTime,
          nextAttemptAt: circuit.nextAttemptTime
        });
      }
    } catch (error) {
      logger.error('Failed to persist circuit state', {
        serviceName,
        error: error.message
      });
    }
  }

  getCircuitMetrics(serviceName: string): CircuitBreakerMetrics | null {
    return this.circuits.get(serviceName) || null;
  }

  getAllCircuits(): Map<string, CircuitBreakerMetrics> {
    return new Map(this.circuits);
  }
}

// Global circuit breaker manager instance
let circuitBreakerManager: CircuitBreakerManager;

export const circuitBreakerMiddleware = (serviceName: string, config: GatewayConfig) => {
  // Initialize circuit breaker manager if not exists
  if (!circuitBreakerManager) {
    circuitBreakerManager = new CircuitBreakerManager(config);
  }

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const circuitState = await circuitBreakerManager.getCircuitState(serviceName);

      // If circuit is OPEN, reject the request
      if (circuitState === CircuitState.OPEN) {
        const circuit = circuitBreakerManager.getCircuitMetrics(serviceName);
        const retryAfter = circuit?.nextAttemptTime ? 
          Math.ceil((circuit.nextAttemptTime.getTime() - Date.now()) / 1000) : 30;

        logger.warn('Request rejected due to open circuit', {
          serviceName,
          ip: req.ip,
          path: req.path,
          retryAfter
        });

        // Return cached response if available and fallback is enabled
        if (config.circuitBreaker.fallback.enabled) {
          const cachedResponse = await getCachedResponse(serviceName, req.path);
          if (cachedResponse) {
            logger.info('Serving cached response due to circuit breaker', {
              serviceName,
              path: req.path
            });
            return res.json(cachedResponse);
          }
        }

        return res.status(503).json({
          error: 'Service temporarily unavailable',
          code: 'CIRCUIT_BREAKER_OPEN',
          serviceName,
          message: 'Service is currently experiencing issues. Please try again later.',
          retryAfter,
          fallback: config.circuitBreaker.fallback.enabled,
          timestamp: new Date().toISOString()
        });
      }

      // If circuit is HALF_OPEN, allow limited requests
      if (circuitState === CircuitState.HALF_OPEN) {
        const circuit = circuitBreakerManager.getCircuitMetrics(serviceName);
        if (circuit && circuit.requestCount >= 3) {
          // Too many requests in HALF_OPEN state, reject
          return res.status(503).json({
            error: 'Service in recovery mode',
            code: 'CIRCUIT_BREAKER_HALF_OPEN_LIMIT',
            serviceName,
            message: 'Service is recovering. Limited requests allowed.',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Intercept response to track success/failure
      const originalSend = res.send;
      const originalJson = res.json;
      let responseIntercepted = false;

      const interceptResponse = (statusCode: number) => {
        if (responseIntercepted) return;
        responseIntercepted = true;

        if (statusCode >= 200 && statusCode < 400) {
          circuitBreakerManager.recordSuccess(serviceName);
        } else if (statusCode >= 500) {
          circuitBreakerManager.recordFailure(serviceName);
        }
      };

      res.send = function(body: any) {
        interceptResponse(this.statusCode);
        return originalSend.call(this, body);
      };

      res.json = function(body: any) {
        interceptResponse(this.statusCode);
        return originalJson.call(this, body);
      };

      // Handle proxy errors
      req.on('error', () => {
        if (!responseIntercepted) {
          circuitBreakerManager.recordFailure(serviceName);
        }
      });

      // Continue to next middleware
      next();

    } catch (error) {
      logger.error('Circuit breaker middleware error', {
        serviceName,
        error: error.message,
        path: req.path,
        method: req.method
      });
      
      // Continue without circuit breaker protection on error
      next();
    }
  };
};

// Bangladesh-specific circuit breaker enhancements
export const bangladeshCircuitBreakerEnhancements = {
  // Mobile network aware circuit breaker
  mobileNetworkCircuitBreaker: (serviceName: string, config: GatewayConfig) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userAgent = req.headers['user-agent'] as string || '';
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      
      if (isMobile && config.bangladesh.mobile.optimization) {
        // More lenient circuit breaker for mobile users
        const mobileConfig = {
          ...config,
          circuitBreaker: {
            ...config.circuitBreaker,
            failureThreshold: Math.floor(config.circuitBreaker.failureThreshold * 1.5),
            recoveryTimeout: config.circuitBreaker.recoveryTimeout * 2
          }
        };
        
        return circuitBreakerMiddleware(serviceName, mobileConfig)(req, res, next);
      }
      
      return circuitBreakerMiddleware(serviceName, config)(req, res, next);
    };
  },

  // Festival period circuit breaker (more resilient during high traffic)
  festivalCircuitBreaker: (serviceName: string, config: GatewayConfig) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const isFestivalPeriod = checkIfFestivalPeriod(new Date());
      
      if (isFestivalPeriod) {
        const festivalConfig = {
          ...config,
          circuitBreaker: {
            ...config.circuitBreaker,
            failureThreshold: Math.floor(config.circuitBreaker.failureThreshold * 2),
            recoveryTimeout: Math.floor(config.circuitBreaker.recoveryTimeout * 0.5)
          }
        };
        
        return circuitBreakerMiddleware(serviceName, festivalConfig)(req, res, next);
      }
      
      return circuitBreakerMiddleware(serviceName, config)(req, res, next);
    };
  }
};

// Helper functions

async function getCachedResponse(serviceName: string, path: string): Promise<any | null> {
  try {
    // This would integrate with your caching system (Redis, memory, etc.)
    // For now, return a basic fallback response
    return {
      message: 'Service temporarily unavailable. This is a cached response.',
      timestamp: new Date().toISOString(),
      cached: true
    };
  } catch (error) {
    return null;
  }
}

function checkIfFestivalPeriod(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Major Bangladesh festivals (approximate dates)
  const festivals = [
    { month: 4, startDay: 10, endDay: 15 }, // Pohela Boishakh
    { month: 8, startDay: 15, endDay: 20 }, // Eid (approximate)
    { month: 10, startDay: 10, endDay: 15 }, // Durga Puja
    { month: 12, startDay: 15, endDay: 31 }  // Winter shopping season
  ];
  
  return festivals.some(festival => 
    month === festival.month && day >= festival.startDay && day <= festival.endDay
  );
}

// Circuit breaker health check endpoint
export const getCircuitBreakerStatus = () => {
  if (!circuitBreakerManager) {
    return { error: 'Circuit breaker manager not initialized' };
  }

  const circuits = circuitBreakerManager.getAllCircuits();
  const status: Record<string, any> = {};

  for (const [serviceName, metrics] of circuits) {
    status[serviceName] = {
      state: metrics.state,
      failureCount: metrics.failureCount,
      successCount: metrics.successCount,
      requestCount: metrics.requestCount,
      lastFailureTime: metrics.lastFailureTime,
      lastSuccessTime: metrics.lastSuccessTime,
      nextAttemptTime: metrics.nextAttemptTime
    };
  }

  return {
    circuitCount: circuits.size,
    circuits: status,
    timestamp: new Date().toISOString()
  };
};

// Export the manager for external use
export const getCircuitBreakerManager = (): CircuitBreakerManager => {
  return circuitBreakerManager;
};

export default circuitBreakerMiddleware;