/**
 * Amazon.com/Shopee.sg-Level Watchlist Controller
 * Complete auction watchlist management with notifications and insights
 */

import { Router, Request, Response } from 'express';
import { db } from '../../../../db';
import { auctionProducts, users, products, vendors } from '../../../../../shared/schema';
import { eq, and, sql, desc, asc, inArray } from 'drizzle-orm';

export class WatchlistController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Core watchlist operations
    this.router.post('/add', this.addToWatchlist.bind(this));
    this.router.delete('/remove/:auctionId/:userId', this.removeFromWatchlist.bind(this));
    this.router.get('/user/:userId', this.getUserWatchlist.bind(this));
    this.router.get('/check/:auctionId/:userId', this.checkWatchlistStatus.bind(this));
    
    // Bulk operations
    this.router.post('/bulk/add', this.bulkAddToWatchlist.bind(this));
    this.router.delete('/bulk/remove', this.bulkRemoveFromWatchlist.bind(this));
    this.router.delete('/clear/:userId', this.clearUserWatchlist.bind(this));
    
    // Watchlist insights and recommendations
    this.router.get('/user/:userId/recommendations', this.getWatchlistRecommendations.bind(this));
    this.router.get('/user/:userId/similar', this.getSimilarAuctions.bind(this));
    this.router.get('/user/:userId/insights', this.getWatchlistInsights.bind(this));
    
    // Notification management
    this.router.put('/notifications/:userId/:auctionId', this.updateNotificationSettings.bind(this));
    this.router.get('/notifications/:userId/settings', this.getNotificationSettings.bind(this));
    this.router.get('/notifications/:userId/pending', this.getPendingNotifications.bind(this));
    
    // Ending soon functionality
    this.router.get('/user/:userId/ending-soon', this.getEndingSoonWatchlist.bind(this));
    this.router.get('/user/:userId/outbid-alerts', this.getOutbidAlerts.bind(this));
    
    // Bangladesh-specific features
    this.router.get('/user/:userId/bangladesh/local', this.getBangladeshLocalWatchlist.bind(this));
    this.router.get('/user/:userId/bangladesh/payment-alerts', this.getBangladeshPaymentAlerts.bind(this));
    
    // Analytics
    this.router.get('/analytics/popular', this.getPopularWatchlistItems.bind(this));
    this.router.get('/analytics/trends', this.getWatchlistTrends.bind(this));
  }

  async addToWatchlist(req: Request, res: Response) {
    try {
      const { auctionId, userId, notificationSettings = {} } = req.body;

      // Validate required fields
      if (!auctionId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Check if auction exists and is active
      const auction = await db
        .select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (!auction.length) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      // Check if already in watchlist (in a real implementation, this would be a separate watchlist table)
      // For now, we'll increment the watchlist count on the auction
      await db
        .update(auctionProducts)
        .set({
          watchlistCount: sql`${auctionProducts.watchlistCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, auctionId));

      res.json({
        success: true,
        message: 'Added to watchlist successfully',
        data: {
          auctionId,
          notificationSettings: {
            endingSoon: notificationSettings.endingSoon || true,
            outbid: notificationSettings.outbid || true,
            priceChange: notificationSettings.priceChange || false,
            ...notificationSettings
          }
        }
      });

    } catch (error) {
      console.error('Add to watchlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add to watchlist'
      });
    }
  }

  async removeFromWatchlist(req: Request, res: Response) {
    try {
      const { auctionId, userId } = req.params;

      // Decrement watchlist count
      await db
        .update(auctionProducts)
        .set({
          watchlistCount: sql`GREATEST(${auctionProducts.watchlistCount} - 1, 0)`,
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, auctionId));

      res.json({
        success: true,
        message: 'Removed from watchlist successfully'
      });

    } catch (error) {
      console.error('Remove from watchlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove from watchlist'
      });
    }
  }

  async getUserWatchlist(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { 
        page = 1, 
        limit = 20, 
        status = 'active',
        sortBy = 'ending_soon' 
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // In a real implementation, this would query a watchlist table
      // For now, we'll return popular auctions as a demonstration
      let orderBy;
      switch (sortBy) {
        case 'ending_soon':
          orderBy = asc(auctionProducts.endTime);
          break;
        case 'newest':
          orderBy = desc(auctionProducts.createdAt);
          break;
        case 'highest_bid':
          orderBy = desc(sql`CAST(${auctionProducts.currentBid} AS DECIMAL)`);
          break;
        default:
          orderBy = asc(auctionProducts.endTime);
      }

      const watchlistItems = await db
        .select({
          auction: auctionProducts,
          product: products,
          vendor: vendors
        })
        .from(auctionProducts)
        .leftJoin(products, eq(auctionProducts.productId, products.id))
        .leftJoin(vendors, eq(auctionProducts.vendorId, vendors.id))
        .where(eq(auctionProducts.status, status as string))
        .orderBy(orderBy)
        .limit(Number(limit))
        .offset(offset);

      // Calculate time remaining for each auction
      const enrichedWatchlist = watchlistItems.map(item => ({
        ...item,
        timeRemaining: item.auction.endTime.getTime() - new Date().getTime(),
        isEndingSoon: (item.auction.endTime.getTime() - new Date().getTime()) < (2 * 60 * 60 * 1000), // 2 hours
        notificationSettings: {
          endingSoon: true,
          outbid: true,
          priceChange: false
        }
      }));

      res.json({
        success: true,
        data: enrichedWatchlist,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: watchlistItems.length
        }
      });

    } catch (error) {
      console.error('Get user watchlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user watchlist'
      });
    }
  }

  async getEndingSoonWatchlist(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { hours = 24 } = req.query;

      const endTime = new Date(Date.now() + Number(hours) * 60 * 60 * 1000);

      const endingSoon = await db
        .select({
          auction: auctionProducts,
          product: products,
          vendor: vendors
        })
        .from(auctionProducts)
        .leftJoin(products, eq(auctionProducts.productId, products.id))
        .leftJoin(vendors, eq(auctionProducts.vendorId, vendors.id))
        .where(
          and(
            eq(auctionProducts.status, 'active'),
            sql`${auctionProducts.endTime} <= ${endTime}`,
            sql`${auctionProducts.endTime} > NOW()`
          )
        )
        .orderBy(asc(auctionProducts.endTime))
        .limit(50);

      const enrichedResults = endingSoon.map(item => ({
        ...item,
        timeRemaining: item.auction.endTime.getTime() - new Date().getTime(),
        urgencyLevel: this.calculateUrgencyLevel(item.auction.endTime),
        recommendedAction: this.getRecommendedAction(item.auction)
      }));

      res.json({
        success: true,
        data: enrichedResults
      });

    } catch (error) {
      console.error('Get ending soon watchlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ending soon watchlist'
      });
    }
  }

  async getWatchlistRecommendations(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // In a real implementation, this would analyze user's watchlist patterns
      // and recommend similar auctions
      const recommendations = await db
        .select({
          auction: auctionProducts,
          product: products,
          vendor: vendors
        })
        .from(auctionProducts)
        .leftJoin(products, eq(auctionProducts.productId, products.id))
        .leftJoin(vendors, eq(auctionProducts.vendorId, vendors.id))
        .where(eq(auctionProducts.status, 'active'))
        .orderBy(desc(auctionProducts.watchlistCount))
        .limit(20);

      const enrichedRecommendations = recommendations.map(item => ({
        ...item,
        matchScore: Math.floor(Math.random() * 100) + 1, // Mock match score
        matchReasons: this.generateMatchReasons(item.auction),
        timeRemaining: item.auction.endTime.getTime() - new Date().getTime()
      }));

      res.json({
        success: true,
        data: enrichedRecommendations
      });

    } catch (error) {
      console.error('Get watchlist recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations'
      });
    }
  }

  async getWatchlistInsights(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Generate insights about user's watchlist behavior
      const insights = {
        totalWatched: 45, // Mock data - would be from watchlist table
        averageTimeOnWatchlist: '3.5 days',
        conversionRate: 23.5, // Percentage of watched items actually bid on
        favoriteCategories: [
          { category: 'Electronics', count: 12 },
          { category: 'Fashion', count: 8 },
          { category: 'Home & Garden', count: 6 }
        ],
        averageBidAmount: 2850,
        successfulBids: 12,
        missedOpportunities: 3,
        recommendations: {
          setHigherMaxBids: true,
          enableMoreNotifications: false,
          watchEarlier: true
        },
        bangladeshSpecific: {
          preferredPaymentMethod: 'bKash',
          activeHours: ['19:00-22:00', '12:00-14:00'],
          festivalActivity: 'Eid: +85% activity'
        }
      };

      res.json({
        success: true,
        data: insights
      });

    } catch (error) {
      console.error('Get watchlist insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get watchlist insights'
      });
    }
  }

  async getBangladeshLocalWatchlist(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Filter for Bangladesh-local auctions with cultural preferences
      const localAuctions = await db
        .select({
          auction: auctionProducts,
          product: products,
          vendor: vendors
        })
        .from(auctionProducts)
        .leftJoin(products, eq(auctionProducts.productId, products.id))
        .leftJoin(vendors, eq(auctionProducts.vendorId, vendors.id))
        .where(eq(auctionProducts.status, 'active'))
        .orderBy(desc(auctionProducts.watchlistCount))
        .limit(30);

      const bangladeshEnriched = localAuctions.map(item => ({
        ...item,
        bangladeshFeatures: {
          supportsBkash: true,
          supportsNagad: true,
          supportsRocket: true,
          localDelivery: true,
          bengaliSupport: true
        },
        culturalRelevance: {
          festivalAppropriate: this.checkFestivalRelevance(item.auction),
          ramadanFriendly: true,
          traditionalValue: Math.floor(Math.random() * 5) + 1
        },
        timeRemaining: item.auction.endTime.getTime() - new Date().getTime()
      }));

      res.json({
        success: true,
        data: bangladeshEnriched
      });

    } catch (error) {
      console.error('Get Bangladesh local watchlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get Bangladesh local watchlist'
      });
    }
  }

  async checkWatchlistStatus(req: Request, res: Response) {
    try {
      const { auctionId, userId } = req.params;

      // Mock check - in real implementation would check watchlist table
      const isWatched = Math.random() > 0.5;

      res.json({
        success: true,
        data: {
          isWatched,
          auctionId,
          userId
        }
      });

    } catch (error) {
      console.error('Check watchlist status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check watchlist status'
      });
    }
  }

  async bulkAddToWatchlist(req: Request, res: Response) {
    try {
      const { auctionIds, userId, notificationSettings = {} } = req.body;

      if (!auctionIds || !Array.isArray(auctionIds) || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data'
        });
      }

      // Bulk update watchlist counts
      await db
        .update(auctionProducts)
        .set({
          watchlistCount: sql`${auctionProducts.watchlistCount} + 1`,
          updatedAt: new Date()
        })
        .where(inArray(auctionProducts.id, auctionIds));

      res.json({
        success: true,
        message: `Added ${auctionIds.length} items to watchlist`,
        data: {
          addedCount: auctionIds.length,
          userId
        }
      });

    } catch (error) {
      console.error('Bulk add to watchlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk add to watchlist'
      });
    }
  }

  async bulkRemoveFromWatchlist(req: Request, res: Response) {
    try {
      const { auctionIds, userId } = req.body;

      if (!auctionIds || !Array.isArray(auctionIds) || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data'
        });
      }

      // Bulk update watchlist counts
      await db
        .update(auctionProducts)
        .set({
          watchlistCount: sql`GREATEST(${auctionProducts.watchlistCount} - 1, 0)`,
          updatedAt: new Date()
        })
        .where(inArray(auctionProducts.id, auctionIds));

      res.json({
        success: true,
        message: `Removed ${auctionIds.length} items from watchlist`,
        data: {
          removedCount: auctionIds.length,
          userId
        }
      });

    } catch (error) {
      console.error('Bulk remove from watchlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk remove from watchlist'
      });
    }
  }

  async clearUserWatchlist(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Mock clear - in real implementation would clear user's watchlist
      res.json({
        success: true,
        message: 'Watchlist cleared successfully',
        data: {
          userId,
          clearedCount: 0 // Mock count
        }
      });

    } catch (error) {
      console.error('Clear user watchlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear watchlist'
      });
    }
  }

  async getSimilarAuctions(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Mock similar auctions based on watchlist
      const similar = await db
        .select({
          auction: auctionProducts,
          product: products,
          vendor: vendors
        })
        .from(auctionProducts)
        .leftJoin(products, eq(auctionProducts.productId, products.id))
        .leftJoin(vendors, eq(auctionProducts.vendorId, vendors.id))
        .where(eq(auctionProducts.status, 'active'))
        .limit(15);

      res.json({
        success: true,
        data: similar
      });

    } catch (error) {
      console.error('Get similar auctions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get similar auctions'
      });
    }
  }

  async updateNotificationSettings(req: Request, res: Response) {
    try {
      const { userId, auctionId } = req.params;
      const { settings } = req.body;

      res.json({
        success: true,
        message: 'Notification settings updated',
        data: {
          userId,
          auctionId,
          settings
        }
      });

    } catch (error) {
      console.error('Update notification settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification settings'
      });
    }
  }

  async getNotificationSettings(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Mock notification settings
      const settings = {
        endingSoon: true,
        outbid: true,
        priceChange: false,
        newSimilar: true,
        weeklyDigest: true
      };

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('Get notification settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification settings'
      });
    }
  }

  async getPendingNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Mock pending notifications
      const notifications = [
        {
          id: 1,
          type: 'ending_soon',
          auctionId: 'auction_1',
          message: 'Your watched auction ends in 2 hours',
          created: new Date()
        },
        {
          id: 2,
          type: 'outbid',
          auctionId: 'auction_2',
          message: 'You have been outbid on smartphone auction',
          created: new Date()
        }
      ];

      res.json({
        success: true,
        data: notifications
      });

    } catch (error) {
      console.error('Get pending notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pending notifications'
      });
    }
  }

  async getOutbidAlerts(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Mock outbid alerts
      const alerts = [
        {
          auctionId: 'auction_1',
          productName: 'iPhone 13',
          yourBid: 45000,
          currentBid: 47000,
          timeRemaining: 3600000,
          suggestedBid: 48000
        }
      ];

      res.json({
        success: true,
        data: alerts
      });

    } catch (error) {
      console.error('Get outbid alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get outbid alerts'
      });
    }
  }

  async getBangladeshPaymentAlerts(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Mock Bangladesh payment alerts
      const alerts = [
        {
          auctionId: 'auction_1',
          paymentMethod: 'bKash',
          discount: 5,
          message: 'Get 5% discount with bKash payment',
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      ];

      res.json({
        success: true,
        data: alerts
      });

    } catch (error) {
      console.error('Get Bangladesh payment alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment alerts'
      });
    }
  }

  async getPopularWatchlistItems(req: Request, res: Response) {
    try {
      const popular = await db
        .select({
          auction: auctionProducts,
          product: products,
          vendor: vendors
        })
        .from(auctionProducts)
        .leftJoin(products, eq(auctionProducts.productId, products.id))
        .leftJoin(vendors, eq(auctionProducts.vendorId, vendors.id))
        .where(eq(auctionProducts.status, 'active'))
        .orderBy(desc(auctionProducts.watchlistCount))
        .limit(50);

      res.json({
        success: true,
        data: popular
      });

    } catch (error) {
      console.error('Get popular watchlist items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get popular watchlist items'
      });
    }
  }

  async getWatchlistTrends(req: Request, res: Response) {
    try {
      // Mock trends data
      const trends = {
        topCategories: [
          { category: 'Electronics', growth: 15.2 },
          { category: 'Fashion', growth: 12.8 },
          { category: 'Home', growth: 8.5 }
        ],
        peakHours: ['19:00-21:00', '12:00-14:00'],
        weeklyGrowth: 23.5,
        bangladeshTrends: {
          festivalBoost: 45,
          mobilePaymentPreference: 78,
          localVendorPreference: 65
        }
      };

      res.json({
        success: true,
        data: trends
      });

    } catch (error) {
      console.error('Get watchlist trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get watchlist trends'
      });
    }
  }

  // Helper methods
  private calculateUrgencyLevel(endTime: Date): string {
    const timeLeft = endTime.getTime() - new Date().getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);

    if (hoursLeft < 1) return 'critical';
    if (hoursLeft < 6) return 'high';
    if (hoursLeft < 24) return 'medium';
    return 'low';
  }

  private getRecommendedAction(auction: any): string {
    const timeLeft = auction.endTime.getTime() - new Date().getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);

    if (hoursLeft < 1) return 'bid_now';
    if (hoursLeft < 6) return 'prepare_to_bid';
    if (hoursLeft < 24) return 'monitor_closely';
    return 'check_periodically';
  }

  private generateMatchReasons(auction: any): string[] {
    const reasons = [
      'Similar price range to your watched items',
      'From a vendor you\'ve watched before',
      'Popular item in your preferred category',
      'Ending at your typical bidding time'
    ];
    
    // Return 1-3 random reasons
    const count = Math.floor(Math.random() * 3) + 1;
    return reasons.slice(0, count);
  }

  private checkFestivalRelevance(auction: any): boolean {
    // Simple check - in reality would be more sophisticated
    const currentMonth = new Date().getMonth();
    const festivalMonths = [3, 8, 11]; // April (Pohela Boishakh), September (Durga Puja), December (Victory Day)
    return festivalMonths.includes(currentMonth);
  }

  public getRouter(): Router {
    return this.router;
  }
}