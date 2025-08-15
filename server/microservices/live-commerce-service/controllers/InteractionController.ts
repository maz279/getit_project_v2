/**
 * Interaction Controller - Real-time Live Commerce Interactions
 * Amazon.com/Shopee.sg-Level real-time interaction management with advanced features
 * 
 * @fileoverview Enterprise-grade interaction controller with WebSocket support
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../db.js';
import { 
  liveStreamInteractions,
  liveStreamGifts,
  liveStreamPolls,
  liveStreamPollResponses,
  liveCommerceProducts,
  liveCommerceSessions,
  users
} from '../../../../shared/schema.js';
import { eq, desc, and, gte, count, sum } from 'drizzle-orm';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'interaction-controller' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/interaction-controller.log' })
  ]
});

export class InteractionController {

  // Send interaction (like, heart, comment, etc.)
  async sendInteraction(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { 
        userId, 
        interactionType, 
        content, 
        metadata = {},
        targetId // For product-specific interactions
      } = req.body;

      // Validate session is live
      const session = await db.select().from(liveCommerceSessions)
        .where(eq(liveCommerceSessions.id, sessionId))
        .limit(1);

      if (session.length === 0 || session[0].status !== 'live') {
        res.status(404).json({
          success: false,
          error: 'Session not found or not live'
        });
        return;
      }

      // Create interaction record
      const interaction = await db.insert(liveStreamInteractions).values({
        sessionId,
        userId,
        interactionType,
        content: content || null,
        targetId: targetId || null,
        metadata: {
          ...metadata,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date()
      }).returning();

      // Handle specific interaction types
      await this.handleInteractionType(sessionId, interactionType, targetId, userId);

      res.json({
        success: true,
        data: {
          interaction: interaction[0],
          message: 'Interaction sent successfully'
        }
      });

      logger.info('💬 Interaction sent', {
        sessionId,
        userId,
        interactionType,
        targetId
      });

    } catch (error: any) {
      logger.error('❌ Error sending interaction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to send interaction'
      });
    }
  }

  // Get session interactions with real-time updates
  async getSessionInteractions(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { 
        type = 'all',
        limit = 50,
        offset = 0,
        since
      } = req.query;

      let query = db.select({
        id: liveStreamInteractions.id,
        userId: liveStreamInteractions.userId,
        interactionType: liveStreamInteractions.interactionType,
        content: liveStreamInteractions.content,
        targetId: liveStreamInteractions.targetId,
        metadata: liveStreamInteractions.metadata,
        timestamp: liveStreamInteractions.timestamp
      }).from(liveStreamInteractions)
        .where(eq(liveStreamInteractions.sessionId, sessionId));

      // Filter by interaction type
      if (type !== 'all') {
        query = query.where(and(
          eq(liveStreamInteractions.sessionId, sessionId),
          eq(liveStreamInteractions.interactionType, type as string)
        ));
      }

      // Filter by time
      if (since) {
        query = query.where(and(
          eq(liveStreamInteractions.sessionId, sessionId),
          gte(liveStreamInteractions.timestamp, new Date(since as string))
        ));
      }

      const interactions = await query
        .orderBy(desc(liveStreamInteractions.timestamp))
        .limit(Number(limit))
        .offset(Number(offset));

      // Get interaction statistics
      const stats = await this.getInteractionStats(sessionId);

      res.json({
        success: true,
        data: {
          interactions,
          stats,
          pagination: {
            limit: Number(limit),
            offset: Number(offset),
            total: interactions.length
          }
        }
      });

      logger.info('📊 Session interactions retrieved', {
        sessionId,
        type,
        count: interactions.length
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving interactions', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve interactions'
      });
    }
  }

  // Send virtual gift
  async sendGift(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { 
        senderId, 
        recipientId, 
        giftType, 
        giftValue, 
        message, 
        messageBn 
      } = req.body;

      // Validate session is live
      const session = await db.select().from(liveCommerceSessions)
        .where(eq(liveCommerceSessions.id, sessionId))
        .limit(1);

      if (session.length === 0 || session[0].status !== 'live') {
        res.status(404).json({
          success: false,
          error: 'Session not found or not live'
        });
        return;
      }

      // Create gift record
      const gift = await db.insert(liveStreamGifts).values({
        streamId: sessionId,
        senderId,
        recipientId,
        giftType,
        giftValue,
        message: message || null,
        messageBn: messageBn || null,
        metadata: {
          sessionTitle: session[0].title,
          timestamp: new Date().toISOString()
        }
      }).returning();

      // Create interaction record for gift
      await db.insert(liveStreamInteractions).values({
        sessionId,
        userId: senderId,
        interactionType: 'gift',
        content: `Sent ${giftType} gift (${giftValue} BDT)`,
        targetId: recipientId,
        metadata: {
          giftId: gift[0].id,
          giftType,
          giftValue,
          message
        },
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: {
          gift: gift[0],
          message: 'Gift sent successfully'
        }
      });

      logger.info('🎁 Gift sent', {
        sessionId,
        senderId,
        recipientId,
        giftType,
        giftValue
      });

    } catch (error: any) {
      logger.error('❌ Error sending gift', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to send gift'
      });
    }
  }

  // Create poll
  async createPoll(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { 
        createdBy, 
        question, 
        questionBn, 
        options, 
        optionsBn, 
        endTime 
      } = req.body;

      // Validate session is live
      const session = await db.select().from(liveCommerceSessions)
        .where(eq(liveCommerceSessions.id, sessionId))
        .limit(1);

      if (session.length === 0 || session[0].status !== 'live') {
        res.status(404).json({
          success: false,
          error: 'Session not found or not live'
        });
        return;
      }

      // Create poll
      const poll = await db.insert(liveStreamPolls).values({
        streamId: sessionId,
        createdBy,
        question,
        questionBn: questionBn || null,
        options,
        optionsBn: optionsBn || null,
        endTime: endTime ? new Date(endTime) : new Date(Date.now() + 5 * 60 * 1000), // 5 minutes default
        metadata: {
          sessionTitle: session[0].title,
          createdAt: new Date().toISOString()
        }
      }).returning();

      // Create interaction record for poll creation
      await db.insert(liveStreamInteractions).values({
        sessionId,
        userId: createdBy,
        interactionType: 'poll',
        content: `Created poll: ${question}`,
        targetId: poll[0].id,
        metadata: {
          pollId: poll[0].id,
          question,
          options
        },
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: {
          poll: poll[0],
          message: 'Poll created successfully'
        }
      });

      logger.info('📊 Poll created', {
        sessionId,
        pollId: poll[0].id,
        createdBy,
        question
      });

    } catch (error: any) {
      logger.error('❌ Error creating poll', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create poll'
      });
    }
  }

  // Vote in poll
  async voteInPoll(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, pollId } = req.params;
      const { userId, optionIndex } = req.body;

      // Validate poll exists and is active
      const poll = await db.select().from(liveStreamPolls)
        .where(eq(liveStreamPolls.id, pollId))
        .limit(1);

      if (poll.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Poll not found'
        });
        return;
      }

      if (!poll[0].isActive || new Date() > poll[0].endTime) {
        res.status(400).json({
          success: false,
          error: 'Poll is no longer active'
        });
        return;
      }

      // Check if user already voted
      const existingVote = await db.select().from(liveStreamPollResponses)
        .where(and(
          eq(liveStreamPollResponses.pollId, pollId),
          eq(liveStreamPollResponses.userId, userId)
        ))
        .limit(1);

      if (existingVote.length > 0) {
        res.status(400).json({
          success: false,
          error: 'User has already voted in this poll'
        });
        return;
      }

      // Create vote record
      const vote = await db.insert(liveStreamPollResponses).values({
        pollId,
        userId,
        optionIndex,
        metadata: {
          sessionId,
          votedAt: new Date().toISOString()
        }
      }).returning();

      // Update poll results
      const currentResults = poll[0].results as any || {};
      const optionKey = `option_${optionIndex}`;
      currentResults[optionKey] = (currentResults[optionKey] || 0) + 1;

      await db.update(liveStreamPolls)
        .set({
          totalVotes: poll[0].totalVotes + 1,
          results: currentResults
        })
        .where(eq(liveStreamPolls.id, pollId));

      // Create interaction record for vote
      await db.insert(liveStreamInteractions).values({
        sessionId,
        userId,
        interactionType: 'poll_response',
        content: `Voted in poll: ${poll[0].question}`,
        targetId: pollId,
        metadata: {
          pollId,
          optionIndex,
          votedAt: new Date().toISOString()
        },
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: {
          vote: vote[0],
          pollResults: currentResults,
          totalVotes: poll[0].totalVotes + 1,
          message: 'Vote recorded successfully'
        }
      });

      logger.info('🗳️ Poll vote recorded', {
        sessionId,
        pollId,
        userId,
        optionIndex
      });

    } catch (error: any) {
      logger.error('❌ Error recording vote', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to record vote'
      });
    }
  }

  // Get poll results
  async getPollResults(req: Request, res: Response): Promise<void> {
    try {
      const { pollId } = req.params;

      const poll = await db.select().from(liveStreamPolls)
        .where(eq(liveStreamPolls.id, pollId))
        .limit(1);

      if (poll.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Poll not found'
        });
        return;
      }

      // Get detailed vote breakdown
      const votes = await db.select().from(liveStreamPollResponses)
        .where(eq(liveStreamPollResponses.pollId, pollId));

      const voteBreakdown = votes.reduce((acc, vote) => {
        const optionKey = `option_${vote.optionIndex}`;
        acc[optionKey] = (acc[optionKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        success: true,
        data: {
          poll: poll[0],
          results: poll[0].results,
          voteBreakdown,
          totalVotes: poll[0].totalVotes,
          isActive: poll[0].isActive && new Date() <= poll[0].endTime,
          timeRemaining: poll[0].endTime.getTime() - Date.now()
        }
      });

      logger.info('📊 Poll results retrieved', {
        pollId,
        totalVotes: poll[0].totalVotes
      });

    } catch (error: any) {
      logger.error('❌ Error retrieving poll results', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve poll results'
      });
    }
  }

  // Product interaction (add to cart, wishlist, etc.)
  async productInteraction(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, productId } = req.params;
      const { userId, action, metadata = {} } = req.body;

      // Validate product exists in session
      const product = await db.select().from(liveCommerceProducts)
        .where(and(
          eq(liveCommerceProducts.sessionId, sessionId),
          eq(liveCommerceProducts.productId, productId)
        ))
        .limit(1);

      if (product.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Product not found in this session'
        });
        return;
      }

      // Update product interaction counters
      const updates: any = {};
      switch (action) {
        case 'add_to_cart':
          updates.addToCartCount = product[0].addToCartCount + 1;
          break;
        case 'purchase':
          updates.purchaseCount = product[0].purchaseCount + 1;
          updates.soldQuantity = product[0].soldQuantity + (metadata.quantity || 1);
          break;
        case 'view':
          updates.viewCount = product[0].viewCount + 1;
          break;
      }

      if (Object.keys(updates).length > 0) {
        await db.update(liveCommerceProducts)
          .set(updates)
          .where(eq(liveCommerceProducts.id, product[0].id));
      }

      // Create interaction record
      await db.insert(liveStreamInteractions).values({
        sessionId,
        userId,
        interactionType: 'product_interaction',
        content: `${action} - Product interaction`,
        targetId: productId,
        metadata: {
          productId,
          action,
          ...metadata,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: {
          action,
          productId,
          updatedCounts: updates,
          message: 'Product interaction recorded'
        }
      });

      logger.info('🛍️ Product interaction recorded', {
        sessionId,
        productId,
        userId,
        action
      });

    } catch (error: any) {
      logger.error('❌ Error recording product interaction', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to record product interaction'
      });
    }
  }

  // Get interaction analytics
  async getInteractionAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { timeRange = '1h' } = req.query;

      const stats = await this.getInteractionStats(sessionId, timeRange as string);

      res.json({
        success: true,
        data: {
          analytics: stats,
          timestamp: new Date(),
          timeRange
        }
      });

      logger.info('📊 Interaction analytics retrieved', { sessionId, timeRange });

    } catch (error: any) {
      logger.error('❌ Error retrieving interaction analytics', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics'
      });
    }
  }

  // Private helper methods
  private async handleInteractionType(
    sessionId: string, 
    type: string, 
    targetId: string | null, 
    userId: string
  ): Promise<void> {
    switch (type) {
      case 'like':
      case 'heart':
        // Could trigger real-time notifications
        break;
      case 'purchase_intent':
        // Could trigger product highlighting
        if (targetId) {
          await this.highlightProduct(sessionId, targetId);
        }
        break;
      case 'question':
        // Could trigger moderator notification
        break;
    }
  }

  private async highlightProduct(sessionId: string, productId: string): Promise<void> {
    await db.update(liveCommerceProducts)
      .set({
        isHighlighted: true,
        showStartTime: new Date()
      })
      .where(and(
        eq(liveCommerceProducts.sessionId, sessionId),
        eq(liveCommerceProducts.productId, productId)
      ));
  }

  private async getInteractionStats(sessionId: string, timeRange: string = '1h'): Promise<any> {
    const timeRangeMap = {
      '1h': new Date(Date.now() - 60 * 60 * 1000),
      '24h': new Date(Date.now() - 24 * 60 * 60 * 1000),
      '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };

    const since = timeRangeMap[timeRange as keyof typeof timeRangeMap] || timeRangeMap['1h'];

    // Get interaction breakdown by type
    const interactionBreakdown = await db.select({
      interactionType: liveStreamInteractions.interactionType,
      count: count()
    }).from(liveStreamInteractions)
      .where(and(
        eq(liveStreamInteractions.sessionId, sessionId),
        gte(liveStreamInteractions.timestamp, since)
      ))
      .groupBy(liveStreamInteractions.interactionType);

    // Get gift stats
    const giftStats = await db.select({
      totalGifts: count(),
      totalValue: sum(liveStreamGifts.giftValue)
    }).from(liveStreamGifts)
      .where(and(
        eq(liveStreamGifts.streamId, sessionId),
        gte(liveStreamGifts.sentAt, since)
      ));

    // Get poll stats
    const pollStats = await db.select({
      totalPolls: count(),
      totalVotes: sum(liveStreamPolls.totalVotes)
    }).from(liveStreamPolls)
      .where(and(
        eq(liveStreamPolls.streamId, sessionId),
        gte(liveStreamPolls.createdAt, since)
      ));

    return {
      interactions: {
        breakdown: interactionBreakdown.reduce((acc, item) => {
          acc[item.interactionType] = item.count;
          return acc;
        }, {} as Record<string, number>),
        total: interactionBreakdown.reduce((sum, item) => sum + item.count, 0)
      },
      gifts: {
        total: giftStats[0]?.totalGifts || 0,
        totalValue: Number(giftStats[0]?.totalValue || 0)
      },
      polls: {
        total: pollStats[0]?.totalPolls || 0,
        totalVotes: Number(pollStats[0]?.totalVotes || 0)
      }
    };
  }
}