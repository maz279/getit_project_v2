/**
 * Amazon.com/Shopee.sg-Level Auction Controller
 * Complete auction lifecycle management with professional features
 */

import { Router, Request, Response } from 'express';
import { db } from '../../../../db';
import { auctionProducts, products, users, vendors } from '../../../../../shared/schema';
import { eq, and, sql, gte, lte, desc, asc } from 'drizzle-orm';

export class AuctionController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Core auction management (implemented methods only)
    this.router.post('/create', this.createAuction.bind(this));
    this.router.get('/:id', this.getAuction.bind(this));
    this.router.get('/', this.getAllAuctions.bind(this));
    
    // Auction status management
    this.router.post('/:id/start', this.startAuction.bind(this));
    this.router.post('/:id/end', this.endAuction.bind(this));
    
    // Reserve price management
    this.router.put('/:id/reserve-price', this.updateReservePrice.bind(this));
    
    // Search and filtering
    this.router.get('/search/query', this.searchAuctions.bind(this));
    
    // Bangladesh-specific features
    this.router.get('/bangladesh/trending', this.getBangladeshTrendingAuctions.bind(this));
  }

  async createAuction(req: Request, res: Response) {
    try {
      const {
        productId,
        vendorId,
        auctionTitle,
        startingPrice,
        reservePrice,
        buyNowPrice,
        startTime,
        endTime,
        autoExtendEnabled,
        auctionType,
        description
      } = req.body;

      // Validate required fields
      if (!productId || !vendorId || !auctionTitle || !startingPrice || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Create auction
      const auction = await db.insert(auctionProducts).values({
        productId,
        vendorId,
        auctionTitle,
        startingPrice: startingPrice.toString(),
        reservePrice: reservePrice?.toString(),
        buyNowPrice: buyNowPrice?.toString(),
        currentBid: startingPrice.toString(),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        autoExtendEnabled: autoExtendEnabled || false,
        auctionType: auctionType || 'standard',
        description,
        status: 'scheduled',
        isActive: false,
        reserveMet: false,
        totalBids: 0,
        viewCount: 0
      }).returning();

      res.json({
        success: true,
        data: auction[0],
        message: 'Auction created successfully'
      });

    } catch (error) {
      console.error('Create auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create auction'
      });
    }
  }

  async getAuction(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const auction = await db
        .select({
          auction: auctionProducts,
          product: products,
          vendor: vendors
        })
        .from(auctionProducts)
        .leftJoin(products, eq(auctionProducts.productId, products.id))
        .leftJoin(vendors, eq(auctionProducts.vendorId, vendors.id))
        .where(eq(auctionProducts.id, id))
        .limit(1);

      if (!auction.length) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      // Update view count
      await db
        .update(auctionProducts)
        .set({ 
          viewCount: sql`${auctionProducts.viewCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, id));

      res.json({
        success: true,
        data: auction[0]
      });

    } catch (error) {
      console.error('Get auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get auction'
      });
    }
  }

  async getAllAuctions(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'active',
        sortBy = 'ending_soon',
        minPrice,
        maxPrice
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      let whereConditions = eq(auctionProducts.status, status as string);

      // Apply price filters
      if (minPrice) {
        whereConditions = and(
          whereConditions,
          gte(sql`CAST(${auctionProducts.currentBid} AS DECIMAL)`, Number(minPrice))
        ) as any;
      }

      if (maxPrice) {
        whereConditions = and(
          whereConditions,
          lte(sql`CAST(${auctionProducts.currentBid} AS DECIMAL)`, Number(maxPrice))
        ) as any;
      }

      // Determine sort order
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
        case 'lowest_bid':
          orderBy = asc(sql`CAST(${auctionProducts.currentBid} AS DECIMAL)`);
          break;
        default:
          orderBy = asc(auctionProducts.endTime);
      }

      const auctions = await db
        .select({
          auction: auctionProducts,
          product: products,
          vendor: vendors
        })
        .from(auctionProducts)
        .leftJoin(products, eq(auctionProducts.productId, products.id))
        .leftJoin(vendors, eq(auctionProducts.vendorId, vendors.id))
        .where(whereConditions)
        .orderBy(orderBy)
        .limit(Number(limit))
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: sql`count(*)` })
        .from(auctionProducts)
        .where(whereConditions);

      res.json({
        success: true,
        data: auctions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(totalResult[0].count),
          pages: Math.ceil(Number(totalResult[0].count) / Number(limit))
        }
      });

    } catch (error) {
      console.error('Get auctions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get auctions'
      });
    }
  }

  async startAuction(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await db
        .update(auctionProducts)
        .set({
          status: 'active',
          isActive: true,
          actualStartTime: new Date(),
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, id));

      res.json({
        success: true,
        message: 'Auction started successfully'
      });

    } catch (error) {
      console.error('Start auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start auction'
      });
    }
  }

  async endAuction(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await db
        .update(auctionProducts)
        .set({
          status: 'ended',
          isActive: false,
          actualEndTime: new Date(),
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, id));

      res.json({
        success: true,
        message: 'Auction ended successfully'
      });

    } catch (error) {
      console.error('End auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end auction'
      });
    }
  }

  async updateReservePrice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reservePrice } = req.body;

      await db
        .update(auctionProducts)
        .set({
          reservePrice: reservePrice.toString(),
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, id));

      res.json({
        success: true,
        message: 'Reserve price updated successfully'
      });

    } catch (error) {
      console.error('Update reserve price error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reserve price'
      });
    }
  }

  async searchAuctions(req: Request, res: Response) {
    try {
      const { q, category, minPrice, maxPrice, status = 'active' } = req.query;

      let whereConditions = eq(auctionProducts.status, status as string);

      if (q) {
        whereConditions = and(
          whereConditions,
          sql`${auctionProducts.auctionTitle} ILIKE ${'%' + q + '%'}`
        ) as any;
      }

      const auctions = await db
        .select({
          auction: auctionProducts,
          product: products,
          vendor: vendors
        })
        .from(auctionProducts)
        .leftJoin(products, eq(auctionProducts.productId, products.id))
        .leftJoin(vendors, eq(auctionProducts.vendorId, vendors.id))
        .where(whereConditions)
        .orderBy(asc(auctionProducts.endTime))
        .limit(50);

      res.json({
        success: true,
        data: auctions
      });

    } catch (error) {
      console.error('Search auctions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search auctions'
      });
    }
  }

  async getBangladeshTrendingAuctions(req: Request, res: Response) {
    try {
      const auctions = await db
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
            eq(auctionProducts.isActive, true)
          )
        )
        .orderBy(desc(auctionProducts.totalBids), desc(auctionProducts.viewCount))
        .limit(20);

      res.json({
        success: true,
        data: auctions
      });

    } catch (error) {
      console.error('Get Bangladesh trending auctions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending auctions'
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}