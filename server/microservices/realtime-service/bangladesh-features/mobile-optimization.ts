/**
 * Mobile Optimization for Bangladesh Networks
 * Optimizes real-time features for Bangladesh mobile networks (2G/3G/4G)
 */

import { Socket } from 'socket.io';
import { createClient } from 'redis';

interface NetworkCondition {
  bandwidth: '2g' | '3g' | '4g' | 'wifi';
  latency: number;
  packetLoss: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}

interface OptimizationSettings {
  reducedUpdateFrequency: boolean;
  messageCompression: boolean;
  imageCompression: boolean;
  batchUpdates: boolean;
  prioritizeText: boolean;
  enableOfflineSync: boolean;
  reducedAnimations: boolean;
  banglaFontOptimization: boolean;
}

export class BangladeshMobileOptimizer {
  private redis = createClient();
  private optimizationProfiles = new Map<string, OptimizationSettings>();

  constructor() {
    this.initializeRedis();
    this.setupOptimizationProfiles();
  }

  private async initializeRedis() {
    try {
      await this.redis.connect();
      console.log('✅ Redis connected for Bangladesh Mobile Optimizer');
    } catch (error) {
      console.warn('⚠️ Redis connection failed for Mobile Optimizer:', error.message);
    }
  }

  private setupOptimizationProfiles() {
    // 2G Network Optimization Profile
    this.optimizationProfiles.set('2g', {
      reducedUpdateFrequency: true,
      messageCompression: true,
      imageCompression: true,
      batchUpdates: true,
      prioritizeText: true,
      enableOfflineSync: true,
      reducedAnimations: true,
      banglaFontOptimization: true
    });

    // 3G Network Optimization Profile
    this.optimizationProfiles.set('3g', {
      reducedUpdateFrequency: true,
      messageCompression: true,
      imageCompression: true,
      batchUpdates: true,
      prioritizeText: false,
      enableOfflineSync: true,
      reducedAnimations: false,
      banglaFontOptimization: true
    });

    // 4G Network Optimization Profile
    this.optimizationProfiles.set('4g', {
      reducedUpdateFrequency: false,
      messageCompression: false,
      imageCompression: false,
      batchUpdates: false,
      prioritizeText: false,
      enableOfflineSync: false,
      reducedAnimations: false,
      banglaFontOptimization: true
    });

    // WiFi Optimization Profile
    this.optimizationProfiles.set('wifi', {
      reducedUpdateFrequency: false,
      messageCompression: false,
      imageCompression: false,
      batchUpdates: false,
      prioritizeText: false,
      enableOfflineSync: false,
      reducedAnimations: false,
      banglaFontOptimization: false
    });
  }

  public async optimizeForBangladeshNetwork(socket: Socket, networkCondition: NetworkCondition) {
    try {
      const optimization = this.getOptimizationSettings(networkCondition);
      const userId = (socket as any).userId;

      // Store optimization settings
      if (userId) {
        await this.redis.hSet(`user_optimization:${userId}`, {
          settings: JSON.stringify(optimization),
          networkCondition: JSON.stringify(networkCondition),
          lastUpdated: Date.now().toString()
        });
      }

      // Apply optimizations
      await this.applyOptimizations(socket, optimization, networkCondition);

      // Log optimization applied
      console.log(`📱 Bangladesh mobile optimization applied for ${socket.id}: ${networkCondition.bandwidth}`);

      socket.emit('bangladesh_optimization_applied', {
        networkCondition,
        optimizations: optimization,
        message: 'আপনার নেটওয়ার্কের জন্য অপ্টিমাইজেশন প্রয়োগ করা হয়েছে',
        message_en: 'Optimization applied for your network'
      });
    } catch (error) {
      console.error('❌ Error applying Bangladesh mobile optimization:', error);
    }
  }

  private getOptimizationSettings(networkCondition: NetworkCondition): OptimizationSettings {
    const baseSettings = this.optimizationProfiles.get(networkCondition.bandwidth) || 
                        this.optimizationProfiles.get('2g')!;

    // Further optimize based on latency and packet loss
    const optimizedSettings = { ...baseSettings };

    if (networkCondition.latency > 1000) {
      optimizedSettings.reducedUpdateFrequency = true;
      optimizedSettings.batchUpdates = true;
      optimizedSettings.prioritizeText = true;
    }

    if (networkCondition.packetLoss > 5) {
      optimizedSettings.messageCompression = true;
      optimizedSettings.enableOfflineSync = true;
    }

    return optimizedSettings;
  }

  private async applyOptimizations(
    socket: Socket, 
    settings: OptimizationSettings, 
    networkCondition: NetworkCondition
  ) {
    // Reduce update frequency for poor networks
    if (settings.reducedUpdateFrequency) {
      socket.emit('set_update_frequency', {
        realtime_updates: networkCondition.bandwidth === '2g' ? 5000 : 2000, // milliseconds
        presence_updates: 30000,
        typing_indicators: false
      });
    }

    // Enable message compression
    if (settings.messageCompression) {
      socket.compress(true);
    }

    // Configure batch updates
    if (settings.batchUpdates) {
      socket.emit('enable_batch_updates', {
        batchSize: networkCondition.bandwidth === '2g' ? 5 : 10,
        batchDelay: networkCondition.bandwidth === '2g' ? 2000 : 1000
      });
    }

    // Prioritize text over media
    if (settings.prioritizeText) {
      socket.emit('content_priority', {
        text: 'high',
        images: 'low',
        videos: 'disabled',
        animations: 'disabled'
      });
    }

    // Enable offline sync for unreliable connections
    if (settings.enableOfflineSync) {
      socket.emit('enable_offline_sync', {
        enabled: true,
        syncInterval: 30000,
        maxOfflineMessages: 100
      });
    }

    // Bangladesh-specific optimizations
    if (settings.banglaFontOptimization) {
      socket.emit('bangla_font_optimization', {
        enabled: true,
        fontSubset: 'basic', // Load only basic Bangla characters
        fallbackFont: 'SolaimanLipi',
        renderingOptimization: true
      });
    }

    // Reduce animations for low-end devices
    if (settings.reducedAnimations) {
      socket.emit('animation_settings', {
        reduce_motion: true,
        disable_transitions: networkCondition.bandwidth === '2g',
        simple_ui: true
      });
    }
  }

  public async handleNetworkQualityUpdate(socket: Socket, qualityData: any) {
    try {
      const networkCondition: NetworkCondition = {
        bandwidth: qualityData.bandwidth || '3g',
        latency: qualityData.latency || 500,
        packetLoss: qualityData.packetLoss || 0,
        quality: this.calculateNetworkQuality(qualityData)
      };

      // Store network quality data
      const userId = (socket as any).userId;
      if (userId) {
        await this.redis.hSet(`user_network:${userId}`, {
          condition: JSON.stringify(networkCondition),
          lastUpdated: Date.now().toString(),
          location: qualityData.location || 'BD'
        });

        // Update Bangladesh network statistics
        await this.updateBangladeshNetworkStats(networkCondition, qualityData.location);
      }

      // Auto-optimize if network quality is poor
      if (networkCondition.quality === 'poor' || networkCondition.quality === 'fair') {
        await this.optimizeForBangladeshNetwork(socket, networkCondition);
      }

      // Send network tips for Bangladesh users
      if (networkCondition.quality === 'poor') {
        socket.emit('bangladesh_network_tips', {
          tips: [
            'WiFi এ সংযোগ করার চেষ্টা করুন',
            'অ্যাপ ক্যাশ পরিষ্কার করুন',
            'অন্য location এ যান যেখানে signal ভালো',
            'Data saver mode চালু করুন'
          ],
          tips_en: [
            'Try connecting to WiFi',
            'Clear app cache',
            'Move to a location with better signal',
            'Enable data saver mode'
          ],
          autoOptimizationEnabled: true
        });
      }
    } catch (error) {
      console.error('❌ Error handling network quality update:', error);
    }
  }

  private calculateNetworkQuality(qualityData: any): 'poor' | 'fair' | 'good' | 'excellent' {
    const { bandwidth, latency = 500, packetLoss = 0 } = qualityData;

    if (bandwidth === '2g' || latency > 2000 || packetLoss > 10) {
      return 'poor';
    } else if (bandwidth === '3g' || latency > 1000 || packetLoss > 5) {
      return 'fair';
    } else if (bandwidth === '4g' || latency > 300 || packetLoss > 2) {
      return 'good';
    } else {
      return 'excellent';
    }
  }

  public async getBangladeshNetworkStats() {
    try {
      const stats = {
        totalUsers: await this.redis.sCard('bangladesh_users'),
        networkDistribution: {
          '2g': await this.redis.sCard('bangladesh_users_2g'),
          '3g': await this.redis.sCard('bangladesh_users_3g'),
          '4g': await this.redis.sCard('bangladesh_users_4g'),
          'wifi': await this.redis.sCard('bangladesh_users_wifi')
        },
        cityBreakdown: {
          'Dhaka': await this.redis.hGet('bangladesh_network_cities', 'Dhaka') || '0',
          'Chittagong': await this.redis.hGet('bangladesh_network_cities', 'Chittagong') || '0',
          'Sylhet': await this.redis.hGet('bangladesh_network_cities', 'Sylhet') || '0',
          'Rajshahi': await this.redis.hGet('bangladesh_network_cities', 'Rajshahi') || '0',
          'Khulna': await this.redis.hGet('bangladesh_network_cities', 'Khulna') || '0'
        },
        optimizationStats: {
          totalOptimized: await this.redis.sCard('optimized_bangladesh_users'),
          averageLatency: await this.getAverageLatency(),
          commonOptimizations: await this.getCommonOptimizations()
        }
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting Bangladesh network stats:', error);
      return null;
    }
  }

  private async updateBangladeshNetworkStats(condition: NetworkCondition, location: string = 'BD') {
    try {
      // Update network type distribution
      await this.redis.sAdd(`bangladesh_users_${condition.bandwidth}`, location);

      // Update city breakdown
      if (location && location !== 'BD') {
        await this.redis.hIncrBy('bangladesh_network_cities', location, 1);
      }

      // Update quality stats
      await this.redis.hIncrBy('bangladesh_network_quality', condition.quality, 1);

      // Store latency for averaging
      await this.redis.lPush('bangladesh_latencies', condition.latency.toString());
      await this.redis.lTrim('bangladesh_latencies', 0, 999); // Keep last 1000 readings
    } catch (error) {
      console.warn('⚠️ Failed to update Bangladesh network stats:', error.message);
    }
  }

  private async getAverageLatency(): Promise<number> {
    try {
      const latencies = await this.redis.lRange('bangladesh_latencies', 0, -1);
      if (latencies.length === 0) return 0;

      const sum = latencies.reduce((acc, lat) => acc + parseInt(lat), 0);
      return Math.round(sum / latencies.length);
    } catch (error) {
      return 0;
    }
  }

  private async getCommonOptimizations(): Promise<Record<string, number>> {
    try {
      const optimizations = await this.redis.hGetAll('common_bangladesh_optimizations');
      const result: Record<string, number> = {};
      
      Object.keys(optimizations).forEach(key => {
        result[key] = parseInt(optimizations[key]);
      });

      return result;
    } catch (error) {
      return {};
    }
  }

  // Bangladesh-specific offline sync
  public async enableBangladeshOfflineSync(socket: Socket, userId: string) {
    try {
      // Store offline messages for unreliable Bangladesh networks
      const offlineMessages = await this.redis.lRange(`offline_messages:${userId}`, 0, -1);
      
      if (offlineMessages.length > 0) {
        // Send offline messages in batches
        const batchSize = 5;
        for (let i = 0; i < offlineMessages.length; i += batchSize) {
          const batch = offlineMessages.slice(i, i + batchSize);
          const messages = batch.map(msg => JSON.parse(msg));
          
          socket.emit('offline_messages_batch', {
            messages,
            batchNumber: Math.floor(i / batchSize) + 1,
            totalBatches: Math.ceil(offlineMessages.length / batchSize)
          });

          // Delay between batches for 2G/3G networks
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Clear offline messages after delivery
        await this.redis.del(`offline_messages:${userId}`);

        socket.emit('offline_sync_complete', {
          totalMessages: offlineMessages.length,
          message: 'সব অফলাইন বার্তা পাঠানো হয়েছে',
          message_en: 'All offline messages delivered'
        });
      }
    } catch (error) {
      console.error('❌ Error enabling Bangladesh offline sync:', error);
    }
  }

  // Data usage optimization for Bangladesh
  public async optimizeBangladeshDataUsage(socket: Socket, userId: string) {
    try {
      const dataUsage = await this.redis.hGetAll(`data_usage:${userId}`);
      const dailyUsage = parseInt(dataUsage.dailyUsage || '0');
      const monthlyLimit = parseInt(dataUsage.monthlyLimit || '1048576'); // 1GB default

      if (dailyUsage > monthlyLimit * 0.1) { // 10% of monthly limit per day
        socket.emit('bangladesh_data_warning', {
          usage: dailyUsage,
          limit: monthlyLimit,
          percentage: (dailyUsage / monthlyLimit) * 100,
          message: 'আপনার ডেটা সীমা শেষ হয়ে আসছে। ডেটা সেভার মোড চালু করুন।',
          message_en: 'Your data limit is running low. Enable data saver mode.',
          recommendations: [
            'Image quality কমান',
            'Auto-download বন্ধ করুন',
            'Text-only mode চালু করুন',
            'WiFi তে সংযোগ করুন'
          ]
        });

        // Auto-enable data saver mode
        await this.optimizeForBangladeshNetwork(socket, {
          bandwidth: '2g',
          latency: 1000,
          packetLoss: 5,
          quality: 'poor'
        });
      }
    } catch (error) {
      console.error('❌ Error optimizing Bangladesh data usage:', error);
    }
  }

  public async getUserOptimizationSettings(userId: string): Promise<OptimizationSettings | null> {
    try {
      const settingsData = await this.redis.hGet(`user_optimization:${userId}`, 'settings');
      return settingsData ? JSON.parse(settingsData) : null;
    } catch (error) {
      return null;
    }
  }

  public async updateUserOptimization(userId: string, settings: Partial<OptimizationSettings>) {
    try {
      const currentSettings = await this.getUserOptimizationSettings(userId) || 
                             this.optimizationProfiles.get('3g')!;
      
      const updatedSettings = { ...currentSettings, ...settings };
      
      await this.redis.hSet(`user_optimization:${userId}`, {
        settings: JSON.stringify(updatedSettings),
        lastUpdated: Date.now().toString()
      });

      return updatedSettings;
    } catch (error) {
      console.error('❌ Error updating user optimization:', error);
      return null;
    }
  }
}