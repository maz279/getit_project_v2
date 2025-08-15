import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../../db';
import { 
  chatSessions, 
  chatMessages, 
  supportAgents, 
  users 
} from '../../../../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import winston from 'winston';
import { WebSocket } from 'ws';

// Logging setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/live-chat-controller.log' })
  ],
});

// Validation schemas
const startChatSchema = z.object({
  customerId: z.number(),
  vendorId: z.string().uuid().optional(),
  sessionType: z.enum(['customer_support', 'vendor_support', 'sales']).default('customer_support'),
  category: z.enum(['order', 'payment', 'shipping', 'product', 'technical', 'general']).default('general'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  source: z.enum(['website', 'mobile_app', 'whatsapp', 'facebook']).default('website'),
  initialMessage: z.string().optional(),
  language: z.enum(['en', 'bn', 'hi', 'ar']).default('en'),
});

const sendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  senderId: z.number(),
  senderType: z.enum(['customer', 'agent', 'vendor', 'system']),
  message: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'file', 'system']).default('text'),
  attachments: z.array(z.object({
    url: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

const endChatSchema = z.object({
  sessionId: z.string().uuid(),
  satisfaction: z.number().min(1).max(5).optional(),
  feedback: z.string().max(500).optional(),
  reason: z.enum(['resolved', 'transferred', 'abandoned', 'escalated']).default('resolved'),
});

const transferChatSchema = z.object({
  sessionId: z.string().uuid(),
  fromAgentId: z.number(),
  toAgentId: z.number(),
  reason: z.string().max(200),
});

export class LiveChatController {
  private activeSessions: Map<string, WebSocket[]> = new Map();
  private agentSessions: Map<number, WebSocket> = new Map();

  // Start new chat session
  async startChatSession(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = startChatSchema.parse(req.body);
      
      // Find available agent
      const availableAgent = await this.findAvailableAgent(
        validatedData.category, 
        validatedData.language,
        validatedData.sessionType
      );

      // Create chat session
      const [newSession] = await db.insert(chatSessions).values({
        customerId: validatedData.customerId,
        vendorId: validatedData.vendorId,
        agentId: availableAgent?.userId || null,
        sessionType: validatedData.sessionType,
        status: availableAgent ? 'active' : 'waiting',
        priority: validatedData.priority,
        category: validatedData.category,
        source: validatedData.source,
        startedAt: new Date(),
        metadata: {
          language: validatedData.language,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        },
      }).returning();

      // Send initial message if provided
      if (validatedData.initialMessage) {
        await this.createChatMessage({
          sessionId: newSession.id,
          senderId: validatedData.customerId,
          senderType: 'customer',
          message: validatedData.initialMessage,
          messageType: 'text',
        });
      }

      // Send system welcome message
      const welcomeMessage = await this.getWelcomeMessage(validatedData.language, availableAgent);
      await this.createChatMessage({
        sessionId: newSession.id,
        senderId: 0, // System user
        senderType: 'system',
        message: welcomeMessage,
        messageType: 'system',
      });

      // Log session start
      logger.info('Chat session started', {
        sessionId: newSession.id,
        customerId: validatedData.customerId,
        agentId: availableAgent?.userId,
        category: validatedData.category,
        language: validatedData.language,
      });

      // Notify agent if available
      if (availableAgent && this.agentSessions.has(availableAgent.userId)) {
        this.notifyAgent(availableAgent.userId, 'new_chat', newSession);
      }

      // Get complete session details
      const completeSession = await this.getSessionWithDetails(newSession.id);

      res.status(201).json({
        success: true,
        session: completeSession,
        message: availableAgent ? 'Chat session started with agent' : 'Chat session created, waiting for agent',
        estimatedWaitTime: availableAgent ? 0 : await this.getEstimatedWaitTime(),
      });
    } catch (error) {
      logger.error('Error starting chat session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request data',
      });
    }
  }

  // Send chat message
  async sendChatMessage(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = sendMessageSchema.parse(req.body);
      
      // Verify session exists and is active
      const session = await this.getActiveSession(validatedData.sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Chat session not found or inactive',
        });
        return;
      }

      // Create message
      const message = await this.createChatMessage(validatedData);

      // Update session activity
      await db
        .update(chatSessions)
        .set({ 
          updatedAt: new Date(),
          // Update agent assignment if customer message and no agent assigned
          ...(validatedData.senderType === 'customer' && !session.agentId && {
            agentId: (await this.findAvailableAgent(session.category, 'en'))?.userId
          })
        })
        .where(eq(chatSessions.id, validatedData.sessionId));

      // Broadcast message to session participants
      await this.broadcastMessage(validatedData.sessionId, message);

      // Log message
      logger.info('Chat message sent', {
        sessionId: validatedData.sessionId,
        messageId: message.id,
        senderType: validatedData.senderType,
        messageLength: validatedData.message.length,
      });

      res.json({
        success: true,
        message,
      });
    } catch (error) {
      logger.error('Error sending chat message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  }

  // Get chat history
  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      // Verify session access
      const session = await this.getSessionWithDetails(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Chat session not found',
        });
        return;
      }

      // Get messages with sender details
      const messages = await db
        .select({
          id: chatMessages.id,
          message: chatMessages.message,
          messageType: chatMessages.messageType,
          attachments: chatMessages.attachments,
          senderType: chatMessages.senderType,
          isRead: chatMessages.isRead,
          readAt: chatMessages.readAt,
          createdAt: chatMessages.createdAt,
          sender: {
            id: users.id,
            username: users.username,
            fullName: users.fullName,
            avatar: users.avatar,
          },
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.senderId, users.id))
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      // Get total message count
      const [totalResult] = await db
        .select({ count: sql`count(*)` })
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId));

      const total = Number(totalResult.count);

      // Mark messages as read for the current user
      if (req.user?.id) {
        await this.markMessagesAsRead(sessionId, req.user.id);
      }

      res.json({
        success: true,
        session,
        messages: messages.reverse(), // Show oldest first
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching chat history', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: req.params.sessionId,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch chat history',
      });
    }
  }

  // End chat session
  async endChatSession(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = endChatSchema.parse(req.body);
      
      // Verify session exists
      const session = await this.getActiveSession(validatedData.sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Chat session not found',
        });
        return;
      }

      // Calculate duration
      const duration = Math.floor((new Date().getTime() - new Date(session.startedAt).getTime()) / 1000);

      // Update session
      await db
        .update(chatSessions)
        .set({
          status: 'closed',
          endedAt: new Date(),
          duration,
          satisfaction: validatedData.satisfaction,
          feedback: validatedData.feedback,
          metadata: {
            ...session.metadata,
            endReason: validatedData.reason,
          },
        })
        .where(eq(chatSessions.id, validatedData.sessionId));

      // Send closing message
      const closingMessage = await this.getClosingMessage(session.metadata?.language || 'en');
      await this.createChatMessage({
        sessionId: validatedData.sessionId,
        senderId: 0,
        senderType: 'system',
        message: closingMessage,
        messageType: 'system',
      });

      // Notify participants
      await this.broadcastSessionEnd(validatedData.sessionId);

      // Log session end
      logger.info('Chat session ended', {
        sessionId: validatedData.sessionId,
        duration,
        satisfaction: validatedData.satisfaction,
        reason: validatedData.reason,
      });

      // Clean up WebSocket connections
      this.activeSessions.delete(validatedData.sessionId);

      res.json({
        success: true,
        message: 'Chat session ended successfully',
        sessionSummary: {
          duration,
          satisfaction: validatedData.satisfaction,
          totalMessages: await this.getMessageCount(validatedData.sessionId),
        },
      });
    } catch (error) {
      logger.error('Error ending chat session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to end chat session',
      });
    }
  }

  // Transfer chat to another agent
  async transferChatSession(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = transferChatSchema.parse(req.body);
      
      // Verify session and agents
      const session = await this.getActiveSession(validatedData.sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Chat session not found',
        });
        return;
      }

      // Verify target agent availability
      const targetAgent = await this.getAgentById(validatedData.toAgentId);
      if (!targetAgent || !targetAgent.isActive) {
        res.status(400).json({
          success: false,
          error: 'Target agent not available',
        });
        return;
      }

      // Update session
      await db
        .update(chatSessions)
        .set({
          agentId: validatedData.toAgentId,
          status: 'transferred',
          metadata: {
            ...session.metadata,
            transferHistory: [
              ...(session.metadata?.transferHistory || []),
              {
                fromAgentId: validatedData.fromAgentId,
                toAgentId: validatedData.toAgentId,
                reason: validatedData.reason,
                timestamp: new Date(),
              },
            ],
          },
        })
        .where(eq(chatSessions.id, validatedData.sessionId));

      // Send transfer message
      const transferMessage = `Chat has been transferred to ${targetAgent.fullName || 'another agent'}. Reason: ${validatedData.reason}`;
      await this.createChatMessage({
        sessionId: validatedData.sessionId,
        senderId: 0,
        senderType: 'system',
        message: transferMessage,
        messageType: 'system',
      });

      // Notify both agents
      this.notifyAgent(validatedData.fromAgentId, 'chat_transferred_out', session);
      this.notifyAgent(validatedData.toAgentId, 'chat_transferred_in', session);

      logger.info('Chat session transferred', {
        sessionId: validatedData.sessionId,
        fromAgentId: validatedData.fromAgentId,
        toAgentId: validatedData.toAgentId,
        reason: validatedData.reason,
      });

      res.json({
        success: true,
        message: 'Chat session transferred successfully',
        newAgent: {
          id: targetAgent.userId,
          name: targetAgent.fullName,
        },
      });
    } catch (error) {
      logger.error('Error transferring chat session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer chat session',
      });
    }
  }

  // Get active chat sessions for agent
  async getAgentChats(req: Request, res: Response): Promise<void> {
    try {
      const { agentId } = req.params;
      
      const sessions = await db
        .select({
          id: chatSessions.id,
          customerId: chatSessions.customerId,
          sessionType: chatSessions.sessionType,
          status: chatSessions.status,
          priority: chatSessions.priority,
          category: chatSessions.category,
          source: chatSessions.source,
          startedAt: chatSessions.startedAt,
          metadata: chatSessions.metadata,
          customer: {
            id: users.id,
            username: users.username,
            fullName: users.fullName,
            avatar: users.avatar,
          },
          lastMessage: sql`(
            SELECT message 
            FROM chat_messages 
            WHERE session_id = chat_sessions.id 
            ORDER BY created_at DESC 
            LIMIT 1
          )`,
          unreadCount: sql`(
            SELECT count(*) 
            FROM chat_messages 
            WHERE session_id = chat_sessions.id 
            AND sender_type != 'agent'
            AND is_read = false
          )`,
        })
        .from(chatSessions)
        .leftJoin(users, eq(chatSessions.customerId, users.id))
        .where(
          and(
            eq(chatSessions.agentId, Number(agentId)),
            eq(chatSessions.status, 'active')
          )
        )
        .orderBy(desc(chatSessions.startedAt));

      res.json({
        success: true,
        sessions,
        activeCount: sessions.length,
      });
    } catch (error) {
      logger.error('Error fetching agent chats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        agentId: req.params.agentId,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agent chats',
      });
    }
  }

  // WebSocket connection handler
  handleWebSocketConnection(ws: WebSocket, sessionId: string, userId: number): void {
    // Add connection to active sessions
    if (!this.activeSessions.has(sessionId)) {
      this.activeSessions.set(sessionId, []);
    }
    this.activeSessions.get(sessionId)!.push(ws);

    // Handle WebSocket messages
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleWebSocketMessage(sessionId, userId, message);
      } catch (error) {
        logger.error('Error handling WebSocket message', { error, sessionId, userId });
      }
    });

    // Handle connection close
    ws.on('close', () => {
      this.removeWebSocketConnection(sessionId, ws);
    });

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_confirmed',
      sessionId,
      timestamp: new Date(),
    }));
  }

  // Private helper methods
  private async findAvailableAgent(category: string, language: string, sessionType: string = 'customer_support') {
    const [agent] = await db
      .select({
        userId: supportAgents.userId,
        department: supportAgents.department,
        maxConcurrentChats: supportAgents.maxConcurrentChats,
        fullName: users.fullName,
      })
      .from(supportAgents)
      .leftJoin(users, eq(supportAgents.userId, users.id))
      .where(
        and(
          eq(supportAgents.isActive, true),
          sql`${supportAgents.skills} ? ${category}`,
          sql`${supportAgents.languages} ? ${language}`,
          sql`(
            SELECT count(*) 
            FROM chat_sessions 
            WHERE agent_id = support_agents.user_id 
            AND status = 'active'
          ) < support_agents.max_concurrent_chats`
        )
      )
      .limit(1);

    return agent;
  }

  private async createChatMessage(messageData: any) {
    const [message] = await db.insert(chatMessages).values({
      sessionId: messageData.sessionId,
      senderId: messageData.senderId,
      senderType: messageData.senderType,
      message: messageData.message,
      messageType: messageData.messageType,
      attachments: messageData.attachments || [],
      createdAt: new Date(),
    }).returning();

    return message;
  }

  private async getSessionWithDetails(sessionId: string) {
    const [session] = await db
      .select({
        id: chatSessions.id,
        customerId: chatSessions.customerId,
        vendorId: chatSessions.vendorId,
        agentId: chatSessions.agentId,
        sessionType: chatSessions.sessionType,
        status: chatSessions.status,
        priority: chatSessions.priority,
        category: chatSessions.category,
        source: chatSessions.source,
        startedAt: chatSessions.startedAt,
        endedAt: chatSessions.endedAt,
        duration: chatSessions.duration,
        satisfaction: chatSessions.satisfaction,
        feedback: chatSessions.feedback,
        metadata: chatSessions.metadata,
        customer: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar,
        },
        agent: {
          id: sql`agent.id`,
          username: sql`agent.username`,
          fullName: sql`agent.full_name`,
          avatar: sql`agent.avatar`,
        },
      })
      .from(chatSessions)
      .leftJoin(users, eq(chatSessions.customerId, users.id))
      .leftJoin(sql`users as agent`, sql`chat_sessions.agent_id = agent.id`)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);

    return session;
  }

  private async getActiveSession(sessionId: string) {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.status, 'active')
        )
      )
      .limit(1);

    return session;
  }

  private async getAgentById(agentId: number) {
    const [agent] = await db
      .select({
        userId: supportAgents.userId,
        isActive: supportAgents.isActive,
        fullName: users.fullName,
      })
      .from(supportAgents)
      .leftJoin(users, eq(supportAgents.userId, users.id))
      .where(eq(supportAgents.userId, agentId))
      .limit(1);

    return agent;
  }

  private async getEstimatedWaitTime(): Promise<number> {
    // Calculate estimated wait time based on queue length and average handling time
    const [queueStats] = await db
      .select({
        waitingCount: sql`count(*) filter (where status = 'waiting')`,
        avgDuration: sql`avg(duration) filter (where status = 'closed' and duration is not null)`,
      })
      .from(chatSessions);

    const waitingCount = Number(queueStats.waitingCount) || 0;
    const avgDuration = Number(queueStats.avgDuration) || 300; // 5 minutes default

    return waitingCount * (avgDuration / 3); // Rough estimate
  }

  private async broadcastMessage(sessionId: string, message: any): Promise<void> {
    const connections = this.activeSessions.get(sessionId);
    if (connections) {
      const messageData = JSON.stringify({
        type: 'new_message',
        message,
        timestamp: new Date(),
      });

      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageData);
        }
      });
    }
  }

  private async broadcastSessionEnd(sessionId: string): Promise<void> {
    const connections = this.activeSessions.get(sessionId);
    if (connections) {
      const endData = JSON.stringify({
        type: 'session_ended',
        sessionId,
        timestamp: new Date(),
      });

      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(endData);
        }
      });
    }
  }

  private notifyAgent(agentId: number, eventType: string, data: any): void {
    const agentWs = this.agentSessions.get(agentId);
    if (agentWs && agentWs.readyState === WebSocket.OPEN) {
      agentWs.send(JSON.stringify({
        type: eventType,
        data,
        timestamp: new Date(),
      }));
    }
  }

  private removeWebSocketConnection(sessionId: string, ws: WebSocket): void {
    const connections = this.activeSessions.get(sessionId);
    if (connections) {
      const index = connections.indexOf(ws);
      if (index !== -1) {
        connections.splice(index, 1);
      }
      if (connections.length === 0) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  private async markMessagesAsRead(sessionId: string, userId: number): Promise<void> {
    await db
      .update(chatMessages)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(chatMessages.sessionId, sessionId),
          sql`sender_id != ${userId}`,
          eq(chatMessages.isRead, false)
        )
      );
  }

  private async getMessageCount(sessionId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId));

    return Number(result.count);
  }

  private async getWelcomeMessage(language: string, agent: any): Promise<string> {
    const messages = {
      en: agent 
        ? `Hello! I'm ${agent.fullName || 'your support agent'}. How can I help you today?`
        : 'Hello! Welcome to GetIt support. An agent will be with you shortly.',
      bn: agent
        ? `হ্যালো! আমি ${agent.fullName || 'আপনার সাপোর্ট এজেন্ট'}। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?`
        : 'হ্যালো! GetIt সাপোর্টে স্বাগতম। একজন এজেন্ট শীঘ্রই আপনার সাথে যোগাযোগ করবেন।',
    };

    return messages[language as keyof typeof messages] || messages.en;
  }

  private async getClosingMessage(language: string): Promise<string> {
    const messages = {
      en: 'Thank you for contacting GetIt support. This chat session has been closed. If you need further assistance, please start a new chat.',
      bn: 'GetIt সাপোর্টে যোগাযোগ করার জন্য ধন্যবাদ। এই চ্যাট সেশন বন্ধ করা হয়েছে। আরও সহায়তার প্রয়োজন হলে, দয়া করে একটি নতুন চ্যাট শুরু করুন।',
    };

    return messages[language as keyof typeof messages] || messages.en;
  }

  private async handleWebSocketMessage(sessionId: string, userId: number, message: any): Promise<void> {
    switch (message.type) {
      case 'typing_start':
        await this.broadcastTypingStatus(sessionId, userId, true);
        break;
      case 'typing_stop':
        await this.broadcastTypingStatus(sessionId, userId, false);
        break;
      case 'mark_read':
        await this.markMessagesAsRead(sessionId, userId);
        break;
    }
  }

  private async broadcastTypingStatus(sessionId: string, userId: number, isTyping: boolean): Promise<void> {
    const connections = this.activeSessions.get(sessionId);
    if (connections) {
      const typingData = JSON.stringify({
        type: 'typing_status',
        userId,
        isTyping,
        timestamp: new Date(),
      });

      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(typingData);
        }
      });
    }
  }

  // Health check
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      service: 'live-chat-controller',
      status: 'healthy',
      activeSessions: this.activeSessions.size,
      connectedAgents: this.agentSessions.size,
      timestamp: new Date().toISOString(),
    });
  }
}