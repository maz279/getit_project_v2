/**
 * Auction Service - Amazon.com/Shopee.sg-Level Auction Management
 * Handles product auctions, bidding, reserve prices, auto-extend functionality
 * 
 * @fileoverview Enterprise-grade auction management with real-time bidding
 * @author GetIt Platform Team
 * @version 2.0.0
 */

import express, { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../../shared/db';
import { 
  auctionProducts, 
  auctionBids, 
  auctionWatchers
} from '../../../shared/schema';
import { eq, desc, and, gte, lte, count, max, min, avg } from 'drizzle-orm';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'auction-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/auction-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/auction-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

interface AuctionProduct {
  id: string;
  productId: string;
  vendorId: string;
  startingBid: number;
  reservePrice: number;
  currentBid: number;
  bidIncrement: number;
  startTime: Date;
  endTime: Date;
  status: string;
  autoExtendMinutes: number;
  totalBids: number;
  totalWatchers: number;
}

interface AuctionBid {
  id: string;
  auctionId: string;
  userId: number;
  bidAmount: number;
  isAutoBid: boolean;
  maxAutoBid: number;
  bidTime: Date;
  isWinning: boolean;
}

export class AuctionService {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Auction Management
    this.router.get('/auctions', this.getAuctions.bind(this));
    this.router.get('/auctions/:id', this.getAuction.bind(this));
    this.router.post('/auctions', this.createAuction.bind(this));
    this.router.put('/auctions/:id', this.updateAuction.bind(this));
    this.router.delete('/auctions/:id', this.deleteAuction.bind(this));

    // Bidding
    this.router.post('/auctions/:id/bid', this.placeBid.bind(this));
    this.router.get('/auctions/:id/bids', this.getAuctionBids.bind(this));
    this.router.post('/auctions/:id/auto-bid', this.setupAutoBid.bind(this));
    this.router.delete('/auctions/:id/auto-bid', this.cancelAutoBid.bind(this));

    // Watching
    this.router.post('/auctions/:id/watch', this.watchAuction.bind(this));
    this.router.delete('/auctions/:id/watch', this.unwatchAuction.bind(this));
    this.router.get('/user/:userId/watched', this.getUserWatchedAuctions.bind(this));

    // Analytics
    this.router.get('/analytics/performance', this.getAuctionPerformance.bind(this));
    this.router.get('/analytics/bidding-patterns', this.getBiddingPatterns.bind(this));
    this.router.get('/analytics/conversion', this.getAuctionConversion.bind(this));

    // Administration
    this.router.get('/admin/active-auctions', this.getActiveAuctions.bind(this));
    this.router.put('/admin/auctions/:id/extend', this.extendAuction.bind(this));
    this.router.put('/admin/auctions/:id/close', this.closeAuction.bind(this));

    // Health check
    this.router.get('/health', this.healthCheck.bind(this));

    logger.info('✅ Auction service routes initialized');
  }

  // Get active auctions
  async getAuctions(req: Request, res: Response): Promise<void> {
    try {
      const { 
        status = 'active', 
        category, 
        vendor_id, 
        page = 1, 
        limit = 20,
        sort = 'ending_soon'
      } = req.query;

      let query = db.select().from(auctionProducts);

      // Filter by status
      if (status) {
        query = query.where(eq(auctionProducts.status, status as string));
      }

      // Filter by vendor
      if (vendor_id) {
        query = query.where(eq(auctionProducts.vendorId, vendor_id as string));
      }

      const auctions = await query.limit(Number(limit)).offset((Number(page) - 1) * Number(limit));

      // Get current highest bids for each auction
      const auctionsWithBids = await Promise.all(
        auctions.map(async (auction) => {
          const highestBid = await db.select({
            amount: max(auctionBids.bidAmount),
            bidsCount: count()
          }).from(auctionBids)
            .where(eq(auctionBids.auctionId, auction.id));

          const watchersCount = await db.select({
            count: count()
          }).from(auctionWatchers)
            .where(eq(auctionWatchers.auctionId, auction.id));

          return {
            ...auction,
            currentBid: highestBid[0]?.amount || auction.startingBid,
            totalBids: highestBid[0]?.bidsCount || 0,
            totalWatchers: watchersCount[0]?.count || 0,
            timeRemaining: this.calculateTimeRemaining(auction.endTime)
          };
        })
      );

      res.json({
        success: true,
        data: auctionsWithBids,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: auctions.length
        }
      });

      logger.info('📋 Auctions retrieved', { 
        count: auctions.length,
        status,
        page: Number(page)
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving auctions', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve auctions'
      });
    }
  }

  // Create new auction
  async createAuction(req: Request, res: Response): Promise<void> {
    try {
      const auctionData = req.body;

      // Validate required fields
      const requiredFields = ['productId', 'vendorId', 'startingBid', 'startTime', 'endTime'];
      for (const field of requiredFields) {
        if (!auctionData[field]) {
          res.status(400).json({
            success: false,
            error: `Missing required field: ${field}`
          });
          return;
        }
      }

      // Validate auction timing
      const startTime = new Date(auctionData.startTime);
      const endTime = new Date(auctionData.endTime);
      
      if (endTime <= startTime) {
        res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
        return;
      }

      const newAuction = await db.insert(auctionProducts).values({
        productId: auctionData.productId,
        vendorId: auctionData.vendorId,
        startingBid: auctionData.startingBid,
        reservePrice: auctionData.reservePrice || auctionData.startingBid,
        currentBid: auctionData.startingBid,
        bidIncrement: auctionData.bidIncrement || 10,
        startTime,
        endTime,
        status: startTime > new Date() ? 'scheduled' : 'active',
        autoExtendMinutes: auctionData.autoExtendMinutes || 5,
        buyNowPrice: auctionData.buyNowPrice,
        description: auctionData.description || '',
        terms: auctionData.terms || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      res.status(201).json({
        success: true,
        data: newAuction[0],
        message: 'Auction created successfully'
      });

      logger.info('✅ Auction created', { 
        auctionId: newAuction[0].id,
        productId: auctionData.productId,
        startingBid: auctionData.startingBid
      });

    } catch (error: any) {
      logger.error('❌ Error creating auction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create auction'
      });
    }
  }

  // Place bid on auction
  async placeBid(req: Request, res: Response): Promise<void> {
    try {
      const { id: auctionId } = req.params;
      const { userId, bidAmount, isAutoBid = false, maxAutoBid } = req.body;

      // Validate required fields
      if (!userId || !bidAmount) {
        res.status(400).json({
          success: false,
          error: 'User ID and bid amount are required'
        });
        return;
      }

      // Get auction details
      const auction = await db.select().from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (auction.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Auction not found'
        });
        return;
      }

      const auctionData = auction[0];

      // Validate auction status and timing
      if (auctionData.status !== 'active') {
        res.status(400).json({
          success: false,
          error: 'Auction is not active'
        });
        return;
      }

      const now = new Date();
      if (now < auctionData.startTime || now > auctionData.endTime) {
        res.status(400).json({
          success: false,
          error: 'Auction is not within bidding timeframe'
        });
        return;
      }

      // Validate bid amount
      const minBidAmount = auctionData.currentBid + auctionData.bidIncrement;
      if (bidAmount < minBidAmount) {
        res.status(400).json({
          success: false,
          error: `Bid must be at least ${minBidAmount} BDT`
        });
        return;
      }

      // Check if user already has winning bid
      const existingWinningBid = await db.select().from(auctionBids)
        .where(and(
          eq(auctionBids.auctionId, auctionId),
          eq(auctionBids.userId, userId),
          eq(auctionBids.isWinning, true)
        ))
        .limit(1);

      if (existingWinningBid.length > 0) {
        res.status(400).json({
          success: false,
          error: 'You already have the winning bid'
        });
        return;
      }

      // Update previous winning bids
      await db.update(auctionBids)
        .set({ isWinning: false })
        .where(and(
          eq(auctionBids.auctionId, auctionId),
          eq(auctionBids.isWinning, true)
        ));

      // Place new bid
      const newBid = await db.insert(auctionBids).values({
        auctionId,
        userId,
        bidAmount,
        isAutoBid,
        maxAutoBid: maxAutoBid || bidAmount,
        bidTime: new Date(),
        isWinning: true
      }).returning();

      // Update auction current bid
      await db.update(auctionProducts)
        .set({ 
          currentBid: bidAmount,
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, auctionId));

      // Check for auto-extend
      const timeRemaining = auctionData.endTime.getTime() - now.getTime();
      const autoExtendThreshold = auctionData.autoExtendMinutes * 60 * 1000;

      if (timeRemaining < autoExtendThreshold) {
        const newEndTime = new Date(auctionData.endTime.getTime() + autoExtendThreshold);
        await db.update(auctionProducts)
          .set({ endTime: newEndTime })
          .where(eq(auctionProducts.id, auctionId));

        logger.info('⏰ Auction auto-extended', { 
          auctionId,
          newEndTime,
          extendMinutes: auctionData.autoExtendMinutes
        });
      }

      res.status(201).json({
        success: true,
        data: newBid[0],
        message: 'Bid placed successfully'
      });

      logger.info('✅ Bid placed', { 
        bidId: newBid[0].id,
        auctionId,
        userId,
        bidAmount
      });

    } catch (error: any) {
      logger.error('❌ Error placing bid', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to place bid'
      });
    }
  }

  // Helper method to calculate time remaining
  private calculateTimeRemaining(endTime: Date): object {
    const now = new Date();
    const timeRemaining = endTime.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      return { expired: true, remaining: 0 };
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return {
      expired: false,
      remaining: timeRemaining,
      formatted: { days, hours, minutes, seconds }
    };
  }

  // Get auctions
  async getAuctions(req: Request, res: Response): Promise<void> {
    try {
      const { 
        status, 
        vendor_id, 
        category, 
        ending_soon,
        price_range,
        page = 1, 
        limit = 20 
      } = req.query;

      let query = db.select().from(auctionProducts);

      // Filter by status
      if (status && status !== 'all') {
        query = query.where(eq(auctionProducts.status, status as string));
      }

      // Filter by vendor
      if (vendor_id) {
        query = query.where(eq(auctionProducts.vendorId, vendor_id as string));
      }

      // Ending soon filter (next 24 hours)
      if (ending_soon === 'true') {
        const tomorrow = new Date();
        tomorrow.setHours(tomorrow.getHours() + 24);
        query = query.where(lte(auctionProducts.auctionEndTime, tomorrow));
      }

      const auctions = await query
        .orderBy(desc(auctionProducts.createdAt))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      res.json({
        success: true,
        data: auctions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: auctions.length
        }
      });

      logger.info('📋 Auctions retrieved', { 
        count: auctions.length,
        status,
        vendorId: vendor_id
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving auctions', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve auctions'
      });
    }
  }

  // Get single auction
  async getAuction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const auction = await db.select().from(auctionProducts)
        .where(eq(auctionProducts.id, id))
        .limit(1);

      if (auction.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Auction not found'
        });
        return;
      }

      // Get recent bids
      const recentBids = await db.select().from(auctionBids)
        .where(eq(auctionBids.auctionId, id))
        .orderBy(desc(auctionBids.bidTime))
        .limit(10);

      // Get watch count
      const watchCount = await db.select({ count: count() }).from(auctionWatchers)
        .where(and(
          eq(auctionWatchers.auctionId, id),
          eq(auctionWatchers.isActive, true)
        ));

      const auctionData = {
        ...auction[0],
        recentBids,
        watcherCount: watchCount[0]?.count || 0,
        timeRemaining: this.calculateTimeRemaining(auction[0].auctionEndTime)
      };

      res.json({
        success: true,
        data: auctionData
      });

      logger.info('📋 Auction retrieved', { 
        auctionId: id,
        status: auction[0].status,
        currentBid: auction[0].currentHighestBid
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving auction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve auction'
      });
    }
  }

  // Create auction
  async createAuction(req: Request, res: Response): Promise<void> {
    try {
      const auctionData = req.body;

      // Validate required fields
      const requiredFields = ['productId', 'vendorId', 'auctionTitle', 'startingPrice', 'auctionStartTime', 'auctionEndTime'];
      for (const field of requiredFields) {
        if (!auctionData[field]) {
          res.status(400).json({
            success: false,
            error: `Missing required field: ${field}`
          });
          return;
        }
      }

      const newAuction = await db.insert(auctionProducts).values({
        productId: auctionData.productId,
        vendorId: auctionData.vendorId,
        auctionTitle: auctionData.auctionTitle,
        auctionTitleBn: auctionData.auctionTitleBn || '',
        auctionType: auctionData.auctionType || 'english',
        startingPrice: auctionData.startingPrice,
        reservePrice: auctionData.reservePrice || 0,
        buyNowPrice: auctionData.buyNowPrice || 0,
        currentHighestBid: auctionData.startingPrice,
        minimumBidIncrement: auctionData.minimumBidIncrement || 10,
        auctionStartTime: new Date(auctionData.auctionStartTime),
        auctionEndTime: new Date(auctionData.auctionEndTime),
        autoExtendEnabled: auctionData.autoExtendEnabled !== false,
        autoExtendMinutes: auctionData.autoExtendMinutes || 10,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      res.status(201).json({
        success: true,
        data: newAuction[0],
        message: 'Auction created successfully'
      });

      logger.info('✅ Auction created', { 
        auctionId: newAuction[0].id,
        productId: auctionData.productId,
        vendorId: auctionData.vendorId,
        startingPrice: auctionData.startingPrice
      });

    } catch (error: any) {
      logger.error('❌ Error creating auction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create auction'
      });
    }
  }

  // Update auction
  async updateAuction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedAuction = await db.update(auctionProducts)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, id))
        .returning();

      if (updatedAuction.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Auction not found'
        });
        return;
      }

      res.json({
        success: true,
        data: updatedAuction[0],
        message: 'Auction updated successfully'
      });

      logger.info('✏️ Auction updated', { 
        auctionId: id,
        updatedFields: Object.keys(updateData)
      });

    } catch (error: any) {
      logger.error('❌ Error updating auction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to update auction'
      });
    }
  }

  // Delete auction
  async deleteAuction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if auction has bids
      const bidsCount = await db.select({ count: count() }).from(auctionBids)
        .where(eq(auctionBids.auctionId, id));

      if (bidsCount[0]?.count > 0) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete auction with existing bids'
        });
        return;
      }

      const deletedAuction = await db.delete(auctionProducts)
        .where(eq(auctionProducts.id, id))
        .returning();

      if (deletedAuction.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Auction not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Auction deleted successfully'
      });

      logger.info('🗑️ Auction deleted', { 
        auctionId: id,
        auctionTitle: deletedAuction[0].auctionTitle
      });

    } catch (error: any) {
      logger.error('❌ Error deleting auction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to delete auction'
      });
    }
  }

  // Get auction bids
  async getAuctionBids(req: Request, res: Response): Promise<void> {
    try {
      const { id: auctionId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const bids = await db.select().from(auctionBids)
        .where(eq(auctionBids.auctionId, auctionId))
        .orderBy(desc(auctionBids.bidTime))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      const totalBids = await db.select({ count: count() }).from(auctionBids)
        .where(eq(auctionBids.auctionId, auctionId));

      res.json({
        success: true,
        data: bids,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalBids[0]?.count || 0
        }
      });

      logger.info('📋 Auction bids retrieved', { 
        auctionId,
        count: bids.length
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving auction bids', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve auction bids'
      });
    }
  }

  // Setup auto bid
  async setupAutoBid(req: Request, res: Response): Promise<void> {
    try {
      const { id: auctionId } = req.params;
      const { userId, maxBidAmount, bidIncrement } = req.body;

      if (!userId || !maxBidAmount) {
        res.status(400).json({
          success: false,
          error: 'User ID and max bid amount are required'
        });
        return;
      }

      // Check if auction exists and is active
      const auction = await db.select().from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (auction.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Auction not found'
        });
        return;
      }

      if (auction[0].status !== 'active') {
        res.status(400).json({
          success: false,
          error: 'Auction is not active'
        });
        return;
      }

      // Create auto bid entry
      const autoBid = await db.insert(auctionBids).values({
        auctionId,
        bidderId: userId,
        bidAmount: auction[0].currentHighestBid || auction[0].startingPrice,
        isAutoBid: true,
        maxAutoBidAmount: maxBidAmount,
        bidTime: new Date(),
        bidType: 'auto',
        createdAt: new Date()
      }).returning();

      res.status(201).json({
        success: true,
        data: autoBid[0],
        message: 'Auto bid setup successfully'
      });

      logger.info('🤖 Auto bid setup', { 
        auctionId,
        userId,
        maxBidAmount
      });

    } catch (error: any) {
      logger.error('❌ Error setting up auto bid', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to setup auto bid'
      });
    }
  }

  // Cancel auto bid
  async cancelAutoBid(req: Request, res: Response): Promise<void> {
    try {
      const { id: auctionId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const deletedAutoBid = await db.delete(auctionBids)
        .where(and(
          eq(auctionBids.auctionId, auctionId),
          eq(auctionBids.bidderId, userId),
          eq(auctionBids.isAutoBid, true)
        ))
        .returning();

      if (deletedAutoBid.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Auto bid not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Auto bid cancelled successfully'
      });

      logger.info('🚫 Auto bid cancelled', { 
        auctionId,
        userId
      });

    } catch (error: any) {
      logger.error('❌ Error cancelling auto bid', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to cancel auto bid'
      });
    }
  }

  // Watch auction
  async watchAuction(req: Request, res: Response): Promise<void> {
    try {
      const { id: auctionId } = req.params;
      const { userId, notificationPreferences = {} } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      // Check if already watching
      const existingWatch = await db.select().from(auctionWatchers)
        .where(and(
          eq(auctionWatchers.auctionId, auctionId),
          eq(auctionWatchers.userId, userId)
        ))
        .limit(1);

      if (existingWatch.length > 0) {
        // Update existing watch
        const updatedWatch = await db.update(auctionWatchers)
          .set({
            isActive: true,
            notificationPreferences,
            updatedAt: new Date()
          })
          .where(eq(auctionWatchers.id, existingWatch[0].id))
          .returning();

        res.json({
          success: true,
          data: updatedWatch[0],
          message: 'Watch preferences updated'
        });
      } else {
        // Create new watch
        const newWatch = await db.insert(auctionWatchers).values({
          auctionId,
          userId,
          isActive: true,
          notificationPreferences,
          watchedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();

        res.status(201).json({
          success: true,
          data: newWatch[0],
          message: 'Auction added to watchlist'
        });
      }

      logger.info('👀 Auction watched', { 
        auctionId,
        userId,
        action: existingWatch.length > 0 ? 'updated' : 'created'
      });

    } catch (error: any) {
      logger.error('❌ Error watching auction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to watch auction'
      });
    }
  }

  // Unwatch auction
  async unwatchAuction(req: Request, res: Response): Promise<void> {
    try {
      const { id: auctionId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const updatedWatch = await db.update(auctionWatchers)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(and(
          eq(auctionWatchers.auctionId, auctionId),
          eq(auctionWatchers.userId, userId)
        ))
        .returning();

      if (updatedWatch.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Watch not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Auction removed from watchlist'
      });

      logger.info('👁️‍🗨️ Auction unwatched', { 
        auctionId,
        userId
      });

    } catch (error: any) {
      logger.error('❌ Error unwatching auction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to unwatch auction'
      });
    }
  }

  // Get user watched auctions
  async getUserWatchedAuctions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, status = 'active' } = req.query;

      let query = db.select({
        auction: auctionProducts,
        watch: auctionWatchers
      }).from(auctionWatchers)
        .innerJoin(auctionProducts, eq(auctionWatchers.auctionId, auctionProducts.id))
        .where(and(
          eq(auctionWatchers.userId, Number(userId)),
          eq(auctionWatchers.isActive, true)
        ));

      if (status !== 'all') {
        query = query.where(eq(auctionProducts.status, status as string));
      }

      const watchedAuctions = await query
        .orderBy(desc(auctionWatchers.watchedAt))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      const watchedWithTimeRemaining = watchedAuctions.map(item => ({
        ...item.auction,
        watchDetails: item.watch,
        timeRemaining: this.calculateTimeRemaining(item.auction.auctionEndTime)
      }));

      res.json({
        success: true,
        data: watchedWithTimeRemaining,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: watchedAuctions.length
        }
      });

      logger.info('👀 User watched auctions retrieved', { 
        userId,
        count: watchedAuctions.length,
        status
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving watched auctions', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve watched auctions'
      });
    }
  }

  // Get auction performance analytics
  async getAuctionPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'monthly', vendor_id } = req.query;

      // Basic performance metrics
      let query = db.select({
        totalAuctions: count(),
        avgCurrentBid: avg(auctionProducts.currentHighestBid),
        maxCurrentBid: max(auctionProducts.currentHighestBid),
        minCurrentBid: min(auctionProducts.currentHighestBid)
      }).from(auctionProducts);

      if (vendor_id) {
        query = query.where(eq(auctionProducts.vendorId, vendor_id as string));
      }

      const performance = await query;

      // Get status breakdown
      const statusBreakdown = await db.select({
        status: auctionProducts.status,
        count: count()
      }).from(auctionProducts)
        .groupBy(auctionProducts.status);

      res.json({
        success: true,
        data: {
          performance: performance[0] || {},
          statusBreakdown,
          period
        }
      });

      logger.info('📊 Auction performance retrieved', { 
        period,
        vendorId: vendor_id
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving auction performance', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve auction performance'
      });
    }
  }

  // Get bidding patterns analytics
  async getBiddingPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'monthly', auction_id } = req.query;

      // Bidding frequency by hour
      const hourlyPatterns = await db.select({
        hour: sql`EXTRACT(HOUR FROM ${auctionBids.bidTime})`,
        bidCount: count()
      }).from(auctionBids)
        .groupBy(sql`EXTRACT(HOUR FROM ${auctionBids.bidTime})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${auctionBids.bidTime})`);

      // Auto vs manual bidding
      const biddingTypes = await db.select({
        isAutoBid: auctionBids.isAutoBid,
        count: count(),
        avgAmount: avg(auctionBids.bidAmount)
      }).from(auctionBids)
        .groupBy(auctionBids.isAutoBid);

      // Top bidders
      const topBidders = await db.select({
        bidderId: auctionBids.bidderId,
        totalBids: count(),
        totalAmount: sum(auctionBids.bidAmount),
        avgBidAmount: avg(auctionBids.bidAmount)
      }).from(auctionBids)
        .groupBy(auctionBids.bidderId)
        .orderBy(desc(count()))
        .limit(10);

      res.json({
        success: true,
        data: {
          hourlyPatterns,
          biddingTypes,
          topBidders,
          period
        }
      });

      logger.info('📈 Bidding patterns retrieved', { 
        period,
        auctionId: auction_id
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving bidding patterns', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve bidding patterns'
      });
    }
  }

  // Get auction conversion analytics
  async getAuctionConversion(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'monthly', vendor_id } = req.query;

      // Conversion metrics
      const totalAuctions = await db.select({ count: count() }).from(auctionProducts);
      const soldAuctions = await db.select({ count: count() }).from(auctionProducts)
        .where(eq(auctionProducts.status, 'sold'));
      const activeAuctions = await db.select({ count: count() }).from(auctionProducts)
        .where(eq(auctionProducts.status, 'active'));

      const conversionRate = totalAuctions[0]?.count > 0 
        ? (soldAuctions[0]?.count / totalAuctions[0].count) * 100 
        : 0;

      // Average time to sell
      const avgTimeToSell = await db.select({
        avgDays: sql`AVG(EXTRACT(EPOCH FROM (${auctionProducts.auctionEndTime} - ${auctionProducts.auctionStartTime})) / 86400)`
      }).from(auctionProducts)
        .where(eq(auctionProducts.status, 'sold'));

      res.json({
        success: true,
        data: {
          totalAuctions: totalAuctions[0]?.count || 0,
          soldAuctions: soldAuctions[0]?.count || 0,
          activeAuctions: activeAuctions[0]?.count || 0,
          conversionRate: Math.round(conversionRate * 100) / 100,
          avgTimeToSell: avgTimeToSell[0]?.avgDays || 0,
          period
        }
      });

      logger.info('📊 Auction conversion retrieved', { 
        conversionRate,
        period
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving auction conversion', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve auction conversion'
      });
    }
  }

  // Get active auctions (Admin)
  async getActiveAuctions(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 50, ending_soon } = req.query;

      let query = db.select().from(auctionProducts)
        .where(eq(auctionProducts.status, 'active'));

      // Filter for auctions ending soon (next 24 hours)
      if (ending_soon === 'true') {
        const tomorrow = new Date();
        tomorrow.setHours(tomorrow.getHours() + 24);
        query = query.where(lte(auctionProducts.auctionEndTime, tomorrow));
      }

      const activeAuctions = await query
        .orderBy(asc(auctionProducts.auctionEndTime))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      // Add time remaining for each auction
      const auctionsWithTimeRemaining = activeAuctions.map(auction => ({
        ...auction,
        timeRemaining: this.calculateTimeRemaining(auction.auctionEndTime)
      }));

      res.json({
        success: true,
        data: auctionsWithTimeRemaining,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: activeAuctions.length
        }
      });

      logger.info('🔴 Active auctions retrieved', { 
        count: activeAuctions.length,
        endingSoon: ending_soon
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving active auctions', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve active auctions'
      });
    }
  }

  // Extend auction (Admin)
  async extendAuction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { extension_minutes, reason } = req.body;

      if (!extension_minutes) {
        res.status(400).json({
          success: false,
          error: 'Extension minutes is required'
        });
        return;
      }

      const auction = await db.select().from(auctionProducts)
        .where(eq(auctionProducts.id, id))
        .limit(1);

      if (auction.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Auction not found'
        });
        return;
      }

      // Calculate new end time
      const newEndTime = new Date(auction[0].auctionEndTime);
      newEndTime.setMinutes(newEndTime.getMinutes() + Number(extension_minutes));

      const updatedAuction = await db.update(auctionProducts)
        .set({
          auctionEndTime: newEndTime,
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, id))
        .returning();

      res.json({
        success: true,
        data: updatedAuction[0],
        message: `Auction extended by ${extension_minutes} minutes`
      });

      logger.info('⏰ Auction extended', { 
        auctionId: id,
        extensionMinutes: extension_minutes,
        newEndTime,
        reason
      });

    } catch (error: any) {
      logger.error('❌ Error extending auction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to extend auction'
      });
    }
  }

  // Close auction (Admin)
  async closeAuction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason, notify_participants = true } = req.body;

      const auction = await db.select().from(auctionProducts)
        .where(eq(auctionProducts.id, id))
        .limit(1);

      if (auction.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Auction not found'
        });
        return;
      }

      // Get winning bid
      const winningBid = await db.select().from(auctionBids)
        .where(and(
          eq(auctionBids.auctionId, id),
          eq(auctionBids.isWinning, true)
        ))
        .limit(1);

      // Determine final status
      const finalStatus = winningBid.length > 0 && 
        winningBid[0].bidAmount >= (auction[0].reservePrice || 0) 
        ? 'sold' 
        : 'ended';

      const updatedAuction = await db.update(auctionProducts)
        .set({
          status: finalStatus,
          winnerId: winningBid.length > 0 ? winningBid[0].bidderId : null,
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, id))
        .returning();

      res.json({
        success: true,
        data: updatedAuction[0],
        message: `Auction closed with status: ${finalStatus}`
      });

      logger.info('🔒 Auction closed', { 
        auctionId: id,
        finalStatus,
        winnerId: winningBid.length > 0 ? winningBid[0].bidderId : null,
        reason
      });

    } catch (error: any) {
      logger.error('❌ Error closing auction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to close auction'
      });
    }
  }

  // Health check endpoint
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Test database connection
      const dbTest = await db.select().from(auctionProducts).limit(1);
      
      res.json({
        service: 'auction-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        database: 'connected'
      });

    } catch (error: any) {
      logger.error('❌ Health check failed', { error: error.message });
      res.status(503).json({
        service: 'auction-service',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default AuctionService;