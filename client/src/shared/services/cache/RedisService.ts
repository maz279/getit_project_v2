
// Redis service for caching dashboard data
export class RedisService {
  private static baseUrl = 'https://api.upstash.com/v2/redis';
  
  // In production, these would come from environment variables
  private static getHeaders() {
    return {
      'Authorization': 'Bearer YOUR_UPSTASH_TOKEN',
      'Content-Type': 'application/json',
    };
  }

  static async get(key: string): Promise<any> {
    try {
      // For demo purposes, using localStorage as cache fallback
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`cache_${key}`);
        if (cached) {
          const { data, expiry } = JSON.parse(cached);
          if (Date.now() < expiry) {
            return data;
          }
          localStorage.removeItem(`cache_${key}`);
        }
      }
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      // For demo purposes, using localStorage as cache fallback
      if (typeof window !== 'undefined') {
        const cacheData = {
          data: value,
          expiry: Date.now() + (ttlSeconds * 1000)
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`cache_${key}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`cache_${key}`);
        if (cached) {
          const { expiry } = JSON.parse(cached);
          return Date.now() < expiry;
        }
      }
      return false;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  static async flushPattern(pattern: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith('cache_') && key.includes(pattern)
        );
        keys.forEach(key => localStorage.removeItem(key));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Redis flush pattern error:', error);
      return false;
    }
  }
}
