/**
 * Redis Connection Guard - Prevents Redis connections during module loading
 * Provides a centralized way to disable Redis connections when Redis is not available
 */

export class RedisConnectionGuard {
  private static instance: RedisConnectionGuard;
  private _redisEnabled: boolean = false;
  private _initialized: boolean = false;

  private constructor() {}

  static getInstance(): RedisConnectionGuard {
    if (!RedisConnectionGuard.instance) {
      RedisConnectionGuard.instance = new RedisConnectionGuard();
    }
    return RedisConnectionGuard.instance;
  }

  /**
   * Check if Redis connections are allowed
   */
  isRedisEnabled(): boolean {
    return this._redisEnabled;
  }

  /**
   * Enable Redis connections (call this after server starts)
   */
  enableRedis(): void {
    this._redisEnabled = true;
    this._initialized = true;
    console.log('✅ Redis connections enabled');
  }

  /**
   * Disable Redis connections (used during module loading)
   */
  disableRedis(): void {
    this._redisEnabled = false;
    console.log('⚠️ Redis connections disabled');
  }

  /**
   * Check if the guard has been initialized
   */
  isInitialized(): boolean {
    return this._initialized;
  }
}

export const redisGuard = RedisConnectionGuard.getInstance();