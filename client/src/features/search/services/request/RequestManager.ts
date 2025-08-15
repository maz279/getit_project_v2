/**
 * Request Manager - Enhanced request lifecycle management
 * Extracted from AISearchBar for better maintainability
 */

import { REQUEST_CONFIG } from '../../constants/searchConstants';
import type { RequestInfo, QueuedRequest } from '../../components/AISearchBar/AISearchBar.types';

export class RequestManager {
  private activeRequests = new Map<string, AbortController>();
  private requestQueue: Array<{ id: string; execute: () => Promise<void> }> = [];
  private isProcessing = false;

  public createRequest(id: string): AbortController {
    // Cancel existing request with same ID
    this.cancelRequest(id);
    
    const controller = new AbortController();
    this.activeRequests.set(id, controller);
    return controller;
  }

  public cancelRequest(id: string): void {
    const controller = this.activeRequests.get(id);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(id);
    }
  }

  public cancelAllRequests(): void {
    for (const [id, controller] of this.activeRequests.entries()) {
      controller.abort();
    }
    this.activeRequests.clear();
    this.requestQueue.length = 0;
  }

  public addToQueue(id: string, execute: () => Promise<void>): void {
    this.requestQueue.push({ id, execute });
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request.execute();
        } catch (error) {
          console.error(`Request ${request.id} failed:`, error);
        }
      }
    }
    
    this.isProcessing = false;
  }

  public getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  public destroy(): void {
    this.cancelAllRequests();
    this.requestQueue.length = 0;
  }
}

export class EnhancedRequestManager {
  private activeRequests = new Map<string, AbortController>();
  private requestQueue: Array<{ id: string; priority: number; execute: () => Promise<void> }> = [];
  private isProcessing = false;
  private rateLimiter = new Map<string, number>();

  public createRequest(id: string, priority: number = 0): AbortController {
    this.cancelRequest(id);
    
    if (!this.checkRateLimit(id)) {
      throw new Error('Rate limit exceeded');
    }
    
    const controller = new AbortController();
    this.activeRequests.set(id, controller);
    return controller;
  }

  private checkRateLimit(id: string): boolean {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const key = `${id}-${minute}`;
    
    const count = this.rateLimiter.get(key) || 0;
    if (count >= REQUEST_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    this.rateLimiter.set(key, count + 1);
    
    // Clean old entries
    for (const [k] of this.rateLimiter) {
      const [, timestamp] = k.split('-');
      if (parseInt(timestamp) < minute - 1) {
        this.rateLimiter.delete(k);
      }
    }
    
    return true;
  }

  public cancelRequest(id: string): void {
    const controller = this.activeRequests.get(id);
    if (controller && !controller.signal.aborted) {
      controller.abort();
      this.activeRequests.delete(id);
    }
  }

  public cancelAllRequests(): void {
    for (const [id, controller] of this.activeRequests.entries()) {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    }
    this.activeRequests.clear();
    this.requestQueue = [];
  }

  public destroy(): void {
    this.cancelAllRequests();
    this.rateLimiter.clear();
  }

  public getActiveRequestCount(): number {
    return this.activeRequests.size;
  }
}