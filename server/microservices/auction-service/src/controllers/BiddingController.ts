/**
 * BiddingController.ts
 * Amazon.com/Shopee.sg-Level Real-time Bidding Controller
 * Handles all bidding operations with enterprise-grade features
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../../../shared/db';
import { eq, desc, and, gt, lt, count, sum, avg, max } from 'drizzle-orm';
import { 
  auctionProducts, 
  auctionBids, 
  proxyBids, 
  auctionWatchers, 
  auctionPayments,
  auctionAnalytics,
  users
} from '../../../../../shared/schema';

export class BiddingController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Real-time bidding endpoints
    this.router.post('/:auctionId/bid', this.placeBid.bind(this));
    this.router.get('/:auctionId/bids', this.getAuctionBids.bind(this));
    this.router.get('/:auctionId/current-bid', this.getCurrentBid.bind(this));
    
    // Proxy bidding (Amazon.com/Shopee.sg level automatic bidding)
    this.router.post('/:auctionId/proxy-bid', this.setupProxyBid.bind(this));
    this.router.put('/:auctionId/proxy-bid', this.updateProxyBid.bind(this));
    this.router.delete('/:auctionId/proxy-bid', this.cancelProxyBid.bind(this));
    this.router.get('/:auctionId/proxy-bid/:userId', this.getProxyBid.bind(this));
    
    // User bidding history and analytics
    this.router.get('/user/:userId/bids', this.getUserBidHistory.bind(this));
    this.router.get('/user/:userId/winning-bids', this.getUserWinningBids.bind(this));
    this.router.get('/user/:userId/bidding-stats', this.getUserBiddingStats.bind(this));
    
    // Bidding validation and verification
    this.router.post('/:auctionId/validate-bid', this.validateBid.bind(this));
    this.router.get('/:auctionId/bid-requirements', this.getBidRequirements.bind(this));
    
    // Bangladesh-specific bidding features
    this.router.post('/:auctionId/mobile-banking-bid', this.placeMobileBankingBid.bind(this));
    this.router.get('/:auctionId/local-bidders', this.getLocalBidders.bind(this));
    
    // Admin and analytics endpoints
    this.router.get('/analytics/fraud-detection', this.getFraudDetectionData.bind(this));
    this.router.get('/analytics/bidding-patterns', this.getBiddingPatterns.bind(this));
    this.router.post('/:auctionId/admin/cancel-bid', this.adminCancelBid.bind(this));
    
    // Health check
    this.router.get('/health', this.healthCheck.bind(this));
  }

  // Place a real-time bid (Amazon.com/Shopee.sg level)
  async placeBid(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;
      const { 
        bidderId, 
        bidAmount, 
        isAutoBid = false, 
        maxAutoBidAmount,
        bidSource = 'web' // web, mobile, api
      } = req.body;

      console.log('🎯 Placing bid for auction:', auctionId, { bidderId, bidAmount });

      // Validate required fields
      if (!bidderId || !bidAmount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required bid information'
        });
      }

      // Get auction details
      const auction = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (!auction.length) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      const auctionData = auction[0];

      // Validate auction status
      if (auctionData.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Auction is not active for bidding'
        });
      }

      // Check if auction has ended
      if (new Date() > new Date(auctionData.auctionEndTime)) {
        return res.status(400).json({
          success: false,
          message: 'Auction has already ended'
        });
      }

      // Get current highest bid
      const currentBid = parseFloat(auctionData.currentHighestBid || '0');
      const minIncrement = parseFloat(auctionData.minimumBidIncrement || '10');
      const requiredBid = currentBid + minIncrement;

      // Validate bid amount
      if (parseFloat(bidAmount) < requiredBid) {
        return res.status(400).json({
          success: false,
          message: `Bid must be at least ৳${requiredBid.toFixed(2)}`
        });
      }

      // Check if bidder is auction owner
      if (auctionData.vendorId === bidderId) {
        return res.status(400).json({
          success: false,
          message: 'Auction owner cannot bid on their own auction'
        });
      }

      // Place the bid
      const newBid = await db.insert(auctionBids).values({
        auctionId,
        bidderId: parseInt(bidderId),
        bidAmount: bidAmount.toString(),
        isAutoBid,
        maxAutoBidAmount: maxAutoBidAmount?.toString(),
        bidType: isAutoBid ? 'auto' : 'regular',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: {
          bidSource,
          timestamp: new Date().toISOString(),
          timezone: 'Asia/Dhaka'
        }
      }).returning();

      // Update auction with new highest bid
      await db.update(auctionProducts)
        .set({
          currentHighestBid: bidAmount.toString(),
          totalBids: auctionData.totalBids + 1,
          winnerId: parseInt(bidderId),
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, auctionId));

      // Mark previous bids as outbid
      await db.update(auctionBids)
        .set({ isOutbid: true })
        .where(and(
          eq(auctionBids.auctionId, auctionId),
          eq(auctionBids.isWinning, true)
        ));

      // Mark new bid as winning
      await db.update(auctionBids)
        .set({ isWinning: true })
        .where(eq(auctionBids.id, newBid[0].id));

      // Check for auto-extend
      const timeRemaining = new Date(auctionData.auctionEndTime).getTime() - new Date().getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      let extendedEndTime = null;
      if (auctionData.autoExtendEnabled && timeRemaining < fiveMinutes) {
        const extensionsUsed = auctionData.extensionsUsed || 0;
        const maxExtensions = auctionData.maxExtensions || 3;
        
        if (extensionsUsed < maxExtensions) {
          extendedEndTime = new Date(new Date(auctionData.auctionEndTime).getTime() + (auctionData.autoExtendMinutes * 60 * 1000));
          
          await db.update(auctionProducts)
            .set({
              auctionEndTime: extendedEndTime,
              extensionsUsed: extensionsUsed + 1
            })
            .where(eq(auctionProducts.id, auctionId));
        }
      }

      // Process any proxy bids that need to be activated
      await this.processProxyBids(auctionId, parseFloat(bidAmount));

      res.json({
        success: true,
        data: {
          bid: newBid[0],
          newCurrentBid: bidAmount,
          totalBids: auctionData.totalBids + 1,
          timeRemaining: extendedEndTime ? 
            new Date(extendedEndTime).getTime() - new Date().getTime() : timeRemaining,
          auctionExtended: !!extendedEndTime,
          newEndTime: extendedEndTime
        },
        message: 'Bid placed successfully'
      });

    } catch (error) {
      console.error('Place bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to place bid'
      });
    }
  }

  // Get auction bids with pagination and filtering
  async getAuctionBids(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'bidTime',
        sortOrder = 'desc',
        bidType = 'all' // all, regular, auto
      } = req.query;

      let query = db.select({
        bid: auctionBids,
        bidder: {
          id: users.id,
          username: users.username,
          avatar: users.avatar
        }
      })
      .from(auctionBids)
      .leftJoin(users, eq(auctionBids.bidderId, users.id))
      .where(eq(auctionBids.auctionId, auctionId));

      // Filter by bid type
      if (bidType !== 'all') {
        query = query.where(eq(auctionBids.bidType, bidType as string));
      }

      // Apply sorting
      if (sortBy === 'bidAmount') {
        query = sortOrder === 'desc' ? 
          query.orderBy(desc(auctionBids.bidAmount)) :
          query.orderBy(auctionBids.bidAmount);
      } else {
        query = sortOrder === 'desc' ?
          query.orderBy(desc(auctionBids.bidTime)) :
          query.orderBy(auctionBids.bidTime);
      }

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      const bids = await query.limit(Number(limit)).offset(offset);

      // Get total count
      const totalCount = await db.select({ count: count() })
        .from(auctionBids)
        .where(eq(auctionBids.auctionId, auctionId));

      res.json({
        success: true,
        data: {
          bids,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalCount[0].count,
            pages: Math.ceil(totalCount[0].count / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get auction bids error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve auction bids'
      });
    }
  }

  // Setup proxy bidding (Amazon.com/Shopee.sg level automatic bidding)
  async setupProxyBid(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;
      const { 
        bidderId, 
        maxBidAmount, 
        incrementAmount,
        strategy = 'smart' // conservative, aggressive, smart
      } = req.body;

      console.log('🤖 Setting up proxy bid:', { auctionId, bidderId, maxBidAmount, strategy });

      // Validate required fields
      if (!bidderId || !maxBidAmount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required proxy bid information'
        });
      }

      // Check if user already has a proxy bid for this auction
      const existingProxyBid = await db.select()
        .from(proxyBids)
        .where(and(
          eq(proxyBids.auctionId, auctionId),
          eq(proxyBids.bidderId, parseInt(bidderId)),
          eq(proxyBids.isActive, true)
        ))
        .limit(1);

      if (existingProxyBid.length) {
        return res.status(409).json({
          success: false,
          message: 'You already have an active proxy bid for this auction'
        });
      }

      // Get auction details
      const auction = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (!auction.length) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      const auctionData = auction[0];

      // Validate max bid amount
      const currentBid = parseFloat(auctionData.currentHighestBid || '0');
      if (parseFloat(maxBidAmount) <= currentBid) {
        return res.status(400).json({
          success: false,
          message: `Maximum bid must be higher than current bid of ৳${currentBid.toFixed(2)}`
        });
      }

      // Create proxy bid
      const proxyBid = await db.insert(proxyBids).values({
        auctionId,
        bidderId: parseInt(bidderId),
        maxBidAmount: maxBidAmount.toString(),
        incrementAmount: incrementAmount?.toString() || auctionData.minimumBidIncrement,
        strategy,
        conditions: {
          created: new Date().toISOString(),
          timezone: 'Asia/Dhaka',
          maxConcurrentBids: strategy === 'aggressive' ? 5 : 3
        }
      }).returning();

      res.json({
        success: true,
        data: proxyBid[0],
        message: 'Proxy bid setup successfully'
      });

    } catch (error) {
      console.error('Setup proxy bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to setup proxy bid'
      });
    }
  }

  // Process proxy bids (internal method)
  private async processProxyBids(auctionId: string, currentBidAmount: number) {
    try {
      // Get all active proxy bids for this auction
      const proxyBidsData = await db.select()
        .from(proxyBids)
        .where(and(
          eq(proxyBids.auctionId, auctionId),
          eq(proxyBids.isActive, true),
          gt(proxyBids.maxBidAmount, currentBidAmount.toString())
        ))
        .orderBy(proxyBids.createdAt);

      for (const proxyBid of proxyBidsData) {
        const maxBid = parseFloat(proxyBid.maxBidAmount);
        const increment = parseFloat(proxyBid.incrementAmount || '10');
        
        // Calculate next bid amount based on strategy
        let nextBidAmount = currentBidAmount + increment;
        
        if (proxyBid.strategy === 'conservative') {
          nextBidAmount = Math.min(currentBidAmount + increment, maxBid);
        } else if (proxyBid.strategy === 'aggressive') {
          nextBidAmount = Math.min(currentBidAmount + (increment * 2), maxBid);
        } else { // smart strategy
          const timeFactor = await this.getTimeFactor(auctionId);
          nextBidAmount = Math.min(currentBidAmount + (increment * timeFactor), maxBid);
        }

        if (nextBidAmount <= maxBid && nextBidAmount > currentBidAmount) {
          // Place automatic bid
          await db.insert(auctionBids).values({
            auctionId,
            bidderId: proxyBid.bidderId,
            bidAmount: nextBidAmount.toString(),
            isAutoBid: true,
            maxAutoBidAmount: maxBid.toString(),
            bidType: 'auto'
          });

          // Update proxy bid
          await db.update(proxyBids)
            .set({
              currentBidAmount: nextBidAmount.toString(),
              totalBidsPlaced: proxyBid.totalBidsPlaced + 1,
              lastBidTime: new Date()
            })
            .where(eq(proxyBids.id, proxyBid.id));

          // Update auction
          await db.update(auctionProducts)
            .set({
              currentHighestBid: nextBidAmount.toString(),
              winnerId: proxyBid.bidderId
            })
            .where(eq(auctionProducts.id, auctionId));

          currentBidAmount = nextBidAmount;
        }
      }
    } catch (error) {
      console.error('Process proxy bids error:', error);
    }
  }

  // Get time factor for smart bidding strategy
  private async getTimeFactor(auctionId: string): Promise<number> {
    try {
      const auction = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (!auction.length) return 1;

      const endTime = new Date(auction[0].auctionEndTime).getTime();
      const currentTime = new Date().getTime();
      const timeRemaining = endTime - currentTime;
      const oneHour = 60 * 60 * 1000;

      // Increase bid aggressiveness as auction nears end
      if (timeRemaining < oneHour) {
        return 2; // Double increment in last hour
      } else if (timeRemaining < 6 * oneHour) {
        return 1.5; // 1.5x increment in last 6 hours
      }

      return 1; // Normal increment
    } catch (error) {
      return 1;
    }
  }

  // Get current highest bid
  async getCurrentBid(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;

      const auction = await db.select({
        currentBid: auctionProducts.currentHighestBid,
        totalBids: auctionProducts.totalBids,
        uniqueBidders: auctionProducts.uniqueBidders,
        winnerId: auctionProducts.winnerId,
        status: auctionProducts.status,
        endTime: auctionProducts.auctionEndTime
      })
      .from(auctionProducts)
      .where(eq(auctionProducts.id, auctionId))
      .limit(1);

      if (!auction.length) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      const auctionData = auction[0];
      const timeRemaining = new Date(auctionData.endTime).getTime() - new Date().getTime();

      res.json({
        success: true,
        data: {
          currentBid: parseFloat(auctionData.currentBid || '0'),
          totalBids: auctionData.totalBids,
          uniqueBidders: auctionData.uniqueBidders,
          winnerId: auctionData.winnerId,
          status: auctionData.status,
          timeRemaining: Math.max(0, timeRemaining),
          hasEnded: timeRemaining <= 0
        }
      });

    } catch (error) {
      console.error('Get current bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get current bid'
      });
    }
  }

  // Update proxy bid
  async updateProxyBid(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;
      const { bidderId, maxBidAmount } = req.body;

      await db.update(proxyBids)
        .set({ 
          maxBidAmount,
          isActive: true,
          updatedAt: new Date()
        })
        .where(and(
          eq(proxyBids.auctionId, auctionId),
          eq(proxyBids.bidderId, bidderId)
        ));

      res.json({
        success: true,
        message: 'Proxy bid updated successfully'
      });
    } catch (error) {
      console.error('Update proxy bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update proxy bid'
      });
    }
  }

  // Cancel proxy bid
  async cancelProxyBid(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;
      const { bidderId } = req.body;

      await db.update(proxyBids)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(and(
          eq(proxyBids.auctionId, auctionId),
          eq(proxyBids.bidderId, bidderId)
        ));

      res.json({
        success: true,
        message: 'Proxy bid cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel proxy bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel proxy bid'
      });
    }
  }

  // Get proxy bid details
  async getProxyBid(req: Request, res: Response) {
    try {
      const { auctionId, userId } = req.params;

      const proxyBid = await db.select()
        .from(proxyBids)
        .where(and(
          eq(proxyBids.auctionId, auctionId),
          eq(proxyBids.bidderId, userId)
        ))
        .limit(1);

      res.json({
        success: true,
        data: proxyBid[0] || null
      });
    } catch (error) {
      console.error('Get proxy bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get proxy bid'
      });
    }
  }

  // Get user bid history
  async getUserBidHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const bidHistory = await db.select()
        .from(auctionBids)
        .where(eq(auctionBids.bidderId, userId))
        .orderBy(desc(auctionBids.createdAt))
        .limit(Number(limit))
        .offset(offset);

      res.json({
        success: true,
        data: bidHistory,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: bidHistory.length
        }
      });
    } catch (error) {
      console.error('Get user bid history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user bid history'
      });
    }
  }

  // Get user winning bids
  async getUserWinningBids(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const winningBids = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.winnerId, userId))
        .orderBy(desc(auctionProducts.endTime));

      res.json({
        success: true,
        data: winningBids
      });
    } catch (error) {
      console.error('Get user winning bids error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user winning bids'
      });
    }
  }

  // Get user bidding statistics
  async getUserBiddingStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const totalBids = await db.select({ count: count() })
        .from(auctionBids)
        .where(eq(auctionBids.bidderId, userId));

      const winningBids = await db.select({ count: count() })
        .from(auctionProducts)
        .where(eq(auctionProducts.winnerId, userId));

      const totalSpent = await db.select({ total: sum(auctionBids.bidAmount) })
        .from(auctionBids)
        .where(eq(auctionBids.bidderId, userId));

      res.json({
        success: true,
        data: {
          totalBids: totalBids[0]?.count || 0,
          winningBids: winningBids[0]?.count || 0,
          totalSpent: totalSpent[0]?.total || 0,
          winRate: totalBids[0]?.count > 0 ? ((winningBids[0]?.count || 0) / totalBids[0].count * 100).toFixed(2) : 0
        }
      });
    } catch (error) {
      console.error('Get user bidding stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user bidding stats'
      });
    }
  }

  // Validate bid
  async validateBid(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;
      const { bidderId, bidAmount } = req.body;

      const auction = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (!auction.length) {
        return res.status(400).json({
          success: false,
          message: 'Auction not found'
        });
      }

      const auctionData = auction[0];
      const minBidAmount = parseFloat(auctionData.currentBid || '0') + parseFloat(auctionData.bidIncrement || '1');

      const validation = {
        isValid: true,
        errors: [] as string[]
      };

      if (new Date() > new Date(auctionData.endTime)) {
        validation.isValid = false;
        validation.errors.push('Auction has ended');
      }

      if (bidAmount < minBidAmount) {
        validation.isValid = false;
        validation.errors.push(`Bid amount must be at least ${minBidAmount}`);
      }

      if (auctionData.sellerId === bidderId) {
        validation.isValid = false;
        validation.errors.push('Cannot bid on your own auction');
      }

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Validate bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate bid'
      });
    }
  }

  // Get bid requirements
  async getBidRequirements(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;

      const auction = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (!auction.length) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      const auctionData = auction[0];
      const minBidAmount = parseFloat(auctionData.currentBid || '0') + parseFloat(auctionData.bidIncrement || '1');

      res.json({
        success: true,
        data: {
          minBidAmount,
          bidIncrement: parseFloat(auctionData.bidIncrement || '1'),
          currentBid: parseFloat(auctionData.currentBid || '0'),
          timeRemaining: Math.max(0, new Date(auctionData.endTime).getTime() - new Date().getTime()),
          requiresDeposit: auctionData.requiresDeposit || false,
          depositAmount: parseFloat(auctionData.depositAmount || '0')
        }
      });
    } catch (error) {
      console.error('Get bid requirements error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bid requirements'
      });
    }
  }

  // Place mobile banking bid (Bangladesh specific)
  async placeMobileBankingBid(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;
      const { bidderId, bidAmount, paymentMethod, phoneNumber } = req.body;

      // Validate mobile banking method
      const validMethods = ['bkash', 'nagad', 'rocket'];
      if (!validMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile banking method'
        });
      }

      // Place the bid with mobile banking info
      const bidResult = await db.insert(auctionBids).values({
        auctionId,
        bidderId,
        bidAmount,
        bidSource: 'mobile_banking',
        paymentMethod,
        phoneNumber,
        createdAt: new Date()
      });

      res.json({
        success: true,
        message: 'Mobile banking bid placed successfully',
        data: { bidId: bidResult.insertId }
      });
    } catch (error) {
      console.error('Place mobile banking bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to place mobile banking bid'
      });
    }
  }

  // Get local bidders (Bangladesh specific)
  async getLocalBidders(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;

      const localBidders = await db.select({
        bidderId: auctionBids.bidderId,
        bidAmount: auctionBids.bidAmount,
        location: users.location,
        division: users.division
      })
      .from(auctionBids)
      .innerJoin(users, eq(auctionBids.bidderId, users.id))
      .where(eq(auctionBids.auctionId, auctionId))
      .orderBy(desc(auctionBids.bidAmount));

      res.json({
        success: true,
        data: localBidders
      });
    } catch (error) {
      console.error('Get local bidders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get local bidders'
      });
    }
  }

  // Get fraud detection data
  async getFraudDetectionData(req: Request, res: Response) {
    try {
      const suspiciousBids = await db.select()
        .from(auctionBids)
        .where(gt(auctionBids.bidAmount, 1000000)) // High value bids
        .orderBy(desc(auctionBids.createdAt))
        .limit(50);

      res.json({
        success: true,
        data: {
          suspiciousBids,
          totalSuspicious: suspiciousBids.length
        }
      });
    } catch (error) {
      console.error('Get fraud detection data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get fraud detection data'
      });
    }
  }

  // Get bidding patterns
  async getBiddingPatterns(req: Request, res: Response) {
    try {
      const patterns = await db.select({
        hour: auctionBids.createdAt,
        count: count(),
        avgAmount: avg(auctionBids.bidAmount)
      })
      .from(auctionBids)
      .groupBy(auctionBids.createdAt)
      .orderBy(desc(auctionBids.createdAt))
      .limit(24);

      res.json({
        success: true,
        data: patterns
      });
    } catch (error) {
      console.error('Get bidding patterns error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bidding patterns'
      });
    }
  }

  // Admin cancel bid
  async adminCancelBid(req: Request, res: Response) {
    try {
      const { auctionId } = req.params;
      const { bidId, reason } = req.body;

      await db.update(auctionBids)
        .set({ 
          status: 'cancelled',
          cancelReason: reason,
          updatedAt: new Date()
        })
        .where(and(
          eq(auctionBids.id, bidId),
          eq(auctionBids.auctionId, auctionId)
        ));

      res.json({
        success: true,
        message: 'Bid cancelled successfully'
      });
    } catch (error) {
      console.error('Admin cancel bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel bid'
      });
    }
  }

  // Health check
  async healthCheck(req: Request, res: Response) {
    res.json({
      service: 'bidding-controller',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: [
        'Real-time bidding',
        'Proxy bidding system',
        'Fraud detection',
        'Bangladesh integration',
        'Auto-extend support',
        'Advanced analytics'
      ]
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}