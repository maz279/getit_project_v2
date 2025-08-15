/**
 * AuctionWebSocketService.ts
 * Amazon.com/Shopee.sg-Level Real-time Auction Communication
 * WebSocket service for real-time bidding, notifications, and auction updates
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { db } from '../../../../db.js';
import { eq, and, gte, desc, count } from 'drizzle-orm';
import { 
  auctionProducts, 
  auctionBids, 
  auctionWatchers,
  users 
} from '../../../../../shared/schema.js';

interface AuctionRoom {
  auctionId: string;
  viewers: Set<string>;
  bidders: Set<string>;
  lastActivity: Date;
}

interface UserConnection {
  userId?: number;
  sessionId: string;
  connectedAt: Date;
  watchedAuctions: Set<string>;
  isActive: boolean;
}

export class AuctionWebSocketService {
  private io: SocketIOServer;
  private auctionRooms: Map<string, AuctionRoom> = new Map();
  private userConnections: Map<string, UserConnection> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      path: '/socket.io'
    });

    this.initializeSocketHandlers();
    this.startHeartbeat();
    
    console.log('🔌 Auction WebSocket Service initialized');
  }

  // Initialize socket event handlers
  private initializeSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`👤 User connected: ${socket.id}`);

      // Initialize user connection
      this.userConnections.set(socket.id, {
        sessionId: socket.id,
        connectedAt: new Date(),
        watchedAuctions: new Set(),
        isActive: true
      });

      // Authentication handler
      socket.on('authenticate', (data: { userId?: number; token?: string }) => {
        this.handleAuthentication(socket, data);
      });

      // Auction room management
      socket.on('join_auction', (data: { auctionId: string }) => {
        this.handleJoinAuction(socket, data.auctionId);
      });

      socket.on('leave_auction', (data: { auctionId: string }) => {
        this.handleLeaveAuction(socket, data.auctionId);
      });

      // Real-time bidding
      socket.on('place_bid', (data: {
        auctionId: string;
        bidAmount: number;
        userId: number;
      }) => {
        this.handlePlaceBid(socket, data);
      });

      socket.on('watch_auction', (data: { auctionId: string; userId: number }) => {
        this.handleWatchAuction(socket, data);
      });

      socket.on('unwatch_auction', (data: { auctionId: string; userId: number }) => {
        this.handleUnwatchAuction(socket, data);
      });

      // Real-time auction updates request
      socket.on('get_auction_status', (data: { auctionId: string }) => {
        this.handleGetAuctionStatus(socket, data.auctionId);
      });

      // Bangladesh-specific features
      socket.on('request_mobile_banking_status', (data: { auctionId: string }) => {
        this.handleMobileBankingStatus(socket, data.auctionId);
      });

      socket.on('prayer_time_notification', (data: { enabled: boolean }) => {
        this.handlePrayerTimeNotification(socket, data.enabled);
      });

      // Connection management
      socket.on('heartbeat', () => {
        this.handleHeartbeat(socket);
      });

      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  // Handle user authentication
  private async handleAuthentication(socket: Socket, data: { userId?: number; token?: string }) {
    try {
      // In production, validate token here
      if (data.userId) {
        const connection = this.userConnections.get(socket.id);
        if (connection) {
          connection.userId = data.userId;
          
          // Notify user of their watched auctions
          await this.sendWatchedAuctionsStatus(socket, data.userId);
        }

        socket.emit('authentication_success', {
          userId: data.userId,
          timestamp: new Date().toISOString()
        });

        console.log(`✅ User ${data.userId} authenticated on socket ${socket.id}`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authentication_error', { message: 'Authentication failed' });
    }
  }

  // Handle joining auction room
  private async handleJoinAuction(socket: Socket, auctionId: string) {
    try {
      // Validate auction exists and is active
      const auction = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (!auction.length) {
        socket.emit('auction_error', { message: 'Auction not found' });
        return;
      }

      const auctionData = auction[0];

      // Join socket room
      socket.join(`auction_${auctionId}`);

      // Update auction room tracking
      if (!this.auctionRooms.has(auctionId)) {
        this.auctionRooms.set(auctionId, {
          auctionId,
          viewers: new Set(),
          bidders: new Set(),
          lastActivity: new Date()
        });
      }

      const room = this.auctionRooms.get(auctionId)!;
      room.viewers.add(socket.id);
      room.lastActivity = new Date();

      // Update user connection
      const connection = this.userConnections.get(socket.id);
      if (connection) {
        connection.watchedAuctions.add(auctionId);
      }

      // Send current auction status
      const currentStatus = await this.getAuctionCurrentStatus(auctionId);
      socket.emit('auction_status', currentStatus);

      // Notify room about new viewer
      socket.to(`auction_${auctionId}`).emit('viewer_joined', {
        viewerCount: room.viewers.size,
        timestamp: new Date().toISOString()
      });

      console.log(`👁️ User joined auction ${auctionId} - Viewers: ${room.viewers.size}`);

    } catch (error) {
      console.error('Join auction error:', error);
      socket.emit('auction_error', { message: 'Failed to join auction' });
    }
  }

  // Handle leaving auction room
  private handleLeaveAuction(socket: Socket, auctionId: string) {
    try {
      socket.leave(`auction_${auctionId}`);

      // Update auction room tracking
      const room = this.auctionRooms.get(auctionId);
      if (room) {
        room.viewers.delete(socket.id);
        room.bidders.delete(socket.id);

        // Notify remaining viewers
        socket.to(`auction_${auctionId}`).emit('viewer_left', {
          viewerCount: room.viewers.size,
          timestamp: new Date().toISOString()
        });

        // Clean up empty rooms
        if (room.viewers.size === 0) {
          this.auctionRooms.delete(auctionId);
        }
      }

      // Update user connection
      const connection = this.userConnections.get(socket.id);
      if (connection) {
        connection.watchedAuctions.delete(auctionId);
      }

      console.log(`👋 User left auction ${auctionId}`);

    } catch (error) {
      console.error('Leave auction error:', error);
    }
  }

  // Handle real-time bid placement
  private async handlePlaceBid(socket: Socket, data: {
    auctionId: string;
    bidAmount: number;
    userId: number;
  }) {
    try {
      console.log(`💰 Real-time bid received: ${data.auctionId} - ৳${data.bidAmount} by user ${data.userId}`);

      // Validate auction is active
      const auction = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, data.auctionId))
        .limit(1);

      if (!auction.length || auction[0].status !== 'active') {
        socket.emit('bid_error', { message: 'Auction is not active for bidding' });
        return;
      }

      const auctionData = auction[0];

      // Validate bid amount
      const currentBid = parseFloat(auctionData.currentHighestBid || '0');
      const minIncrement = parseFloat(auctionData.minimumBidIncrement || '10');
      const requiredBid = currentBid + minIncrement;

      if (data.bidAmount < requiredBid) {
        socket.emit('bid_error', { 
          message: `Bid must be at least ৳${requiredBid.toFixed(2)}`,
          minimumBid: requiredBid
        });
        return;
      }

      // Check if auction has ended
      if (new Date() > new Date(auctionData.auctionEndTime)) {
        socket.emit('bid_error', { message: 'Auction has already ended' });
        return;
      }

      // Place the bid (this would call the BiddingController)
      const bidResult = await this.placeBidInternal(data);

      if (bidResult.success) {
        // Update auction room
        const room = this.auctionRooms.get(data.auctionId);
        if (room) {
          room.bidders.add(socket.id);
          room.lastActivity = new Date();
        }

        // Broadcast bid to all auction viewers
        this.io.to(`auction_${data.auctionId}`).emit('new_bid', {
          auctionId: data.auctionId,
          bidAmount: data.bidAmount,
          bidderId: data.userId,
          bidderName: await this.getBidderDisplayName(data.userId),
          timestamp: new Date().toISOString(),
          totalBids: auctionData.totalBids + 1,
          timeRemaining: this.calculateTimeRemaining(auctionData.auctionEndTime)
        });

        // Send success to bidder
        socket.emit('bid_success', bidResult.data);

        // Check for auto-extend
        const timeRemaining = new Date(auctionData.auctionEndTime).getTime() - new Date().getTime();
        if (auctionData.autoExtendEnabled && timeRemaining < 5 * 60 * 1000) { // 5 minutes
          const extendedTime = new Date(new Date(auctionData.auctionEndTime).getTime() + 5 * 60 * 1000);
          
          this.io.to(`auction_${data.auctionId}`).emit('auction_extended', {
            auctionId: data.auctionId,
            newEndTime: extendedTime.toISOString(),
            extendedBy: 5 * 60 * 1000,
            reason: 'Last minute bidding activity'
          });
        }

      } else {
        socket.emit('bid_error', { message: bidResult.message });
      }

    } catch (error) {
      console.error('Place bid error:', error);
      socket.emit('bid_error', { message: 'Failed to place bid' });
    }
  }

  // Internal bid placement (integrates with BiddingController logic)
  private async placeBidInternal(data: {
    auctionId: string;
    bidAmount: number;
    userId: number;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // This would call the BiddingController's placeBid method
      // For now, we'll simulate the core functionality

      // Insert bid into database
      const newBid = await db.insert(auctionBids).values({
        auctionId: data.auctionId,
        bidderId: data.userId,
        bidAmount: data.bidAmount.toString(),
        bidType: 'regular',
        metadata: {
          source: 'websocket',
          timestamp: new Date().toISOString()
        }
      }).returning();

      // Update auction
      await db.update(auctionProducts)
        .set({
          currentHighestBid: data.bidAmount.toString(),
          totalBids: auctionProducts.totalBids + 1,
          winnerId: data.userId,
          updatedAt: new Date()
        })
        .where(eq(auctionProducts.id, data.auctionId));

      return {
        success: true,
        data: {
          bid: newBid[0],
          newCurrentBid: data.bidAmount
        }
      };

    } catch (error) {
      console.error('Internal bid placement error:', error);
      return {
        success: false,
        message: 'Failed to process bid'
      };
    }
  }

  // Get auction current status
  private async getAuctionCurrentStatus(auctionId: string) {
    try {
      const auction = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (!auction.length) return null;

      const auctionData = auction[0];

      // Get recent bids
      const recentBids = await db.select({
        bid: auctionBids,
        bidder: users
      })
      .from(auctionBids)
      .leftJoin(users, eq(auctionBids.bidderId, users.id))
      .where(eq(auctionBids.auctionId, auctionId))
      .orderBy(desc(auctionBids.bidTime))
      .limit(5);

      // Get watcher count
      const watcherCount = await db.select({ count: count() })
        .from(auctionWatchers)
        .where(and(
          eq(auctionWatchers.auctionId, auctionId),
          eq(auctionWatchers.isActive, true)
        ));

      return {
        auctionId,
        status: auctionData.status,
        currentBid: parseFloat(auctionData.currentHighestBid || '0'),
        totalBids: auctionData.totalBids,
        uniqueBidders: auctionData.uniqueBidders,
        watchers: watcherCount[0]?.count || 0,
        timeRemaining: this.calculateTimeRemaining(auctionData.auctionEndTime),
        recentBids: recentBids.map(({ bid, bidder }) => ({
          amount: parseFloat(bid.bidAmount),
          bidderName: bidder?.username || 'Anonymous',
          timestamp: bid.bidTime
        })),
        minimumNextBid: parseFloat(auctionData.currentHighestBid || '0') + parseFloat(auctionData.minimumBidIncrement || '10')
      };

    } catch (error) {
      console.error('Get auction status error:', error);
      return null;
    }
  }

  // Handle auction status request
  private async handleGetAuctionStatus(socket: Socket, auctionId: string) {
    try {
      const status = await this.getAuctionCurrentStatus(auctionId);
      if (status) {
        socket.emit('auction_status', status);
      } else {
        socket.emit('auction_error', { message: 'Auction not found' });
      }
    } catch (error) {
      console.error('Handle get auction status error:', error);
      socket.emit('auction_error', { message: 'Failed to get auction status' });
    }
  }

  // Send watched auctions status to authenticated user
  private async sendWatchedAuctionsStatus(socket: Socket, userId: number) {
    try {
      const watchedAuctions = await db.select({
        auctionId: auctionWatchers.auctionId,
        auction: auctionProducts
      })
      .from(auctionWatchers)
      .leftJoin(auctionProducts, eq(auctionWatchers.auctionId, auctionProducts.id))
      .where(and(
        eq(auctionWatchers.userId, userId),
        eq(auctionWatchers.isActive, true)
      ));

      const watchedStatuses = await Promise.all(
        watchedAuctions.map(async ({ auctionId }) => {
          return await this.getAuctionCurrentStatus(auctionId);
        })
      );

      socket.emit('watched_auctions_status', {
        auctions: watchedStatuses.filter(status => status !== null)
      });

    } catch (error) {
      console.error('Send watched auctions status error:', error);
    }
  }

  // Calculate time remaining in milliseconds
  private calculateTimeRemaining(endTime: string): number {
    const endTimeMs = new Date(endTime).getTime();
    const currentTimeMs = new Date().getTime();
    return Math.max(0, endTimeMs - currentTimeMs);
  }

  // Get bidder display name
  private async getBidderDisplayName(userId: number): Promise<string> {
    try {
      const user = await db.select({ username: users.username })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return user.length > 0 ? user[0].username || 'Anonymous' : 'Anonymous';
    } catch (error) {
      return 'Anonymous';
    }
  }

  // Handle heartbeat to keep connections alive
  private handleHeartbeat(socket: Socket) {
    const connection = this.userConnections.get(socket.id);
    if (connection) {
      connection.isActive = true;
    }
  }

  // Handle disconnect
  private handleDisconnect(socket: Socket, reason: string) {
    console.log(`👤 User disconnected: ${socket.id} - Reason: ${reason}`);

    // Clean up auction rooms
    for (const [auctionId, room] of this.auctionRooms.entries()) {
      room.viewers.delete(socket.id);
      room.bidders.delete(socket.id);

      // Notify remaining viewers
      if (room.viewers.size > 0) {
        socket.to(`auction_${auctionId}`).emit('viewer_left', {
          viewerCount: room.viewers.size,
          timestamp: new Date().toISOString()
        });
      }

      // Clean up empty rooms
      if (room.viewers.size === 0) {
        this.auctionRooms.delete(auctionId);
      }
    }

    // Remove user connection
    this.userConnections.delete(socket.id);
  }

  // Bangladesh-specific features
  private async handleMobileBankingStatus(socket: Socket, auctionId: string) {
    try {
      // Check which mobile banking methods are accepted for this auction
      const auction = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (auction.length > 0) {
        socket.emit('mobile_banking_status', {
          auctionId,
          acceptedMethods: ['bkash', 'nagad', 'rocket'], // Bangladesh mobile banking
          processingTime: '2-5 minutes',
          fees: {
            bkash: '1.5%',
            nagad: '1.2%',
            rocket: '1.8%'
          }
        });
      }
    } catch (error) {
      console.error('Mobile banking status error:', error);
    }
  }

  private handlePrayerTimeNotification(socket: Socket, enabled: boolean) {
    // Handle prayer time notification preferences
    socket.emit('prayer_time_notification_updated', {
      enabled,
      nextPrayerTime: this.getNextPrayerTime(),
      message: enabled ? 'Prayer time notifications enabled' : 'Prayer time notifications disabled'
    });
  }

  private getNextPrayerTime(): string {
    // Calculate next prayer time for Bangladesh
    const now = new Date();
    const prayerTimes = ['05:30', '12:15', '15:45', '18:30', '19:45'];
    
    for (const time of prayerTimes) {
      const [hour, minute] = time.split(':').map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(hour, minute, 0, 0);
      
      if (prayerDate > now) {
        return prayerDate.toISOString();
      }
    }
    
    // If no prayer time today, return first prayer time tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(5, 30, 0, 0);
    return tomorrow.toISOString();
  }

  // Start heartbeat service
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      // Clean up inactive connections
      for (const [socketId, connection] of this.userConnections.entries()) {
        if (!connection.isActive) {
          // Connection seems inactive, remove it
          this.userConnections.delete(socketId);
        } else {
          // Reset activity flag
          connection.isActive = false;
        }
      }

      // Send heartbeat to all connected clients
      this.io.emit('heartbeat', {
        timestamp: new Date().toISOString(),
        serverTime: Date.now()
      });

    }, 30000); // Every 30 seconds
  }

  // Public methods for integration with other services

  // Broadcast auction end to all viewers
  public broadcastAuctionEnd(auctionId: string, data: {
    winnerId?: number;
    winningBid?: number;
    result: string;
  }) {
    this.io.to(`auction_${auctionId}`).emit('auction_ended', {
      auctionId,
      ...data,
      timestamp: new Date().toISOString()
    });

    console.log(`📢 Broadcasted auction end: ${auctionId} - Result: ${data.result}`);
  }

  // Broadcast auction start to watchers
  public broadcastAuctionStart(auctionId: string) {
    this.io.to(`auction_${auctionId}`).emit('auction_started', {
      auctionId,
      timestamp: new Date().toISOString()
    });

    console.log(`📢 Broadcasted auction start: ${auctionId}`);
  }

  // Get service statistics
  public getServiceStats() {
    return {
      connectedUsers: this.userConnections.size,
      activeAuctions: this.auctionRooms.size,
      totalViewers: Array.from(this.auctionRooms.values())
        .reduce((total, room) => total + room.viewers.size, 0),
      totalBidders: Array.from(this.auctionRooms.values())
        .reduce((total, room) => total + room.bidders.size, 0)
    };
  }

  // Cleanup resources
  public cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.io.close();
    console.log('🔌 Auction WebSocket Service cleaned up');
  }
}