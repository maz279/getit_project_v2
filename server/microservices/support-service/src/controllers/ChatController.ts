/**
 * Live Chat Controller - Amazon.com/Shopee.sg Level
 * Real-time chat functionality with Socket.IO and Bangladesh support
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  supportChatSessions, 
  supportConversations, 
  supportTickets,
  supportAgents,
  users,
  insertSupportChatSessionSchema,
  insertSupportConversationSchema
} from '../../../../../shared/schema';
import { eq, desc, and, count, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class ChatController {
  /**
   * Initiate new chat session
   */
  static async initiateChat(req: Request, res: Response) {
    try {
      const { customerId, channel = 'web_chat', initialMessage, language = 'en' } = req.body;
      
      // Generate unique session ID
      const sessionId = uuidv4();
      
      // Check if customer has existing active session
      const existingSession = await db.select()
        .from(supportChatSessions)
        .where(and(
          eq(supportChatSessions.customerId, customerId),
          eq(supportChatSessions.status, 'active')
        ))
        .limit(1);
        
      if (existingSession.length > 0) {
        return res.json({
          success: true,
          message: 'Existing chat session found',
          messageBn: 'বিদ্যমান চ্যাট সেশন পাওয়া গেছে',
          data: {
            sessionId: existingSession[0].sessionId,
            isExisting: true
          }
        });
      }
      
      // Get queue position
      const queuePosition = await ChatController.getQueuePosition();
      
      // Create chat session
      const sessionData = insertSupportChatSessionSchema.parse({
        sessionId,
        customerId,
        channel,
        queuePosition,
        sessionMetadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          language,
          initiatedAt: new Date().toISOString(),
          bangladesh: {
            timezone: 'Asia/Dhaka',
            currency: 'BDT'
          }
        }
      });
      
      const [newSession] = await db.insert(supportChatSessions)
        .values(sessionData)
        .returning();
      
      // Create ticket if initial message provided
      let ticketId = null;
      if (initialMessage) {
        const ticketData = {
          ticketNumber: await ChatController.generateTicketNumber(),
          customerId,
          category: 'general_inquiry',
          priority: 'medium',
          title: initialMessage.substring(0, 100),
          description: initialMessage,
          language,
          channel,
          source: 'chatbot'
        };
        
        const [ticket] = await db.insert(supportTickets)
          .values(ticketData)
          .returning();
          
        ticketId = ticket.id;
        
        // Update session with ticket ID
        await db.update(supportChatSessions)
          .set({ ticketId })
          .where(eq(supportChatSessions.id, newSession.id));
          
        // Add initial message to conversation
        await db.insert(supportConversations).values({
          ticketId,
          senderId: customerId,
          senderType: 'customer',
          messageType: 'text',
          content: initialMessage,
          readByCustomer: true,
          readByAgent: false,
          translatedContent: language === 'bn' ? {} : undefined
        });
      }
      
      // Attempt to assign available agent
      const availableAgent = await ChatController.findAvailableAgent(language);
      if (availableAgent) {
        await db.update(supportChatSessions)
          .set({ 
            agentId: availableAgent.id,
            queuePosition: 0,
            waitTime: 0
          })
          .where(eq(supportChatSessions.id, newSession.id));
          
        // Update agent status
        await db.update(supportAgents)
          .set({ 
            status: 'busy',
            currentTicketCount: sql`${supportAgents.currentTicketCount} + 1`
          })
          .where(eq(supportAgents.id, availableAgent.id));
      }
      
      // Calculate estimated wait time
      const estimatedWaitTime = queuePosition * 3; // 3 minutes per position
      
      res.status(201).json({
        success: true,
        message: 'Chat session initiated successfully',
        messageBn: 'চ্যাট সেশন সফলভাবে শুরু হয়েছে',
        data: {
          sessionId,
          ticketId,
          queuePosition: availableAgent ? 0 : queuePosition,
          estimatedWaitTime: availableAgent ? 0 : estimatedWaitTime,
          agent: availableAgent ? {
            agentCode: availableAgent.agentCode,
            department: availableAgent.department
          } : null,
          status: availableAgent ? 'connected' : 'queued'
        }
      });
      
    } catch (error) {
      console.error('Error initiating chat:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate chat',
        messageBn: 'চ্যাট শুরু করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Send chat message
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { senderId, senderType, content, messageType = 'text', attachments } = req.body;
      
      // Get session and ticket info
      const session = await db.select()
        .from(supportChatSessions)
        .where(eq(supportChatSessions.sessionId, sessionId))
        .limit(1);
        
      if (!session.length) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found',
          messageBn: 'চ্যাট সেশন পাওয়া যায়নি'
        });
      }
      
      const chatSession = session[0];
      
      // Auto-translate for Bangladesh users
      let translatedContent = {};
      if (content && chatSession.sessionMetadata?.language === 'bn' && senderType === 'agent') {
        // In production, integrate with Google Translate API
        translatedContent = { bn: content }; // Placeholder
      }
      
      // Create conversation entry
      const messageData = insertSupportConversationSchema.parse({
        ticketId: chatSession.ticketId,
        senderId,
        senderType,
        messageType,
        content,
        attachments: attachments || null,
        readByCustomer: senderType === 'customer',
        readByAgent: senderType === 'agent',
        translatedContent: Object.keys(translatedContent).length > 0 ? translatedContent : null,
        metadata: {
          sessionId,
          timestamp: new Date().toISOString(),
          channel: chatSession.channel
        }
      });
      
      const [newMessage] = await db.insert(supportConversations)
        .values(messageData)
        .returning();
      
      // Update first response time if agent's first message
      if (senderType === 'agent' && chatSession.ticketId) {
        const ticket = await db.select()
          .from(supportTickets)
          .where(eq(supportTickets.id, chatSession.ticketId))
          .limit(1);
          
        if (ticket.length && !ticket[0].firstResponseAt) {
          await db.update(supportTickets)
            .set({ 
              firstResponseAt: new Date(),
              status: 'in_progress'
            })
            .where(eq(supportTickets.id, chatSession.ticketId));
        }
      }
      
      // Emit real-time message via Socket.IO (would be handled by WebSocket service)
      // await this.emitMessage(sessionId, newMessage);
      
      res.json({
        success: true,
        message: 'Message sent successfully',
        messageBn: 'বার্তা সফলভাবে পাঠানো হয়েছে',
        data: newMessage
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        messageBn: 'বার্তা পাঠাতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get chat history
   */
  static async getChatHistory(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      // Get session info
      const session = await db.select()
        .from(supportChatSessions)
        .where(eq(supportChatSessions.sessionId, sessionId))
        .limit(1);
        
      if (!session.length) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found',
          messageBn: 'চ্যাট সেশন পাওয়া যায়নি'
        });
      }
      
      // Get conversation history
      const messages = await db.select({
        message: supportConversations,
        sender: {
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        }
      })
      .from(supportConversations)
      .leftJoin(users, eq(supportConversations.senderId, users.id))
      .where(eq(supportConversations.ticketId, session[0].ticketId))
      .orderBy(desc(supportConversations.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
      
      // Get total message count
      const [totalCount] = await db.select({ count: count() })
        .from(supportConversations)
        .where(eq(supportConversations.ticketId, session[0].ticketId));
      
      res.json({
        success: true,
        data: {
          session: session[0],
          messages: messages.reverse(), // Reverse to show oldest first
          pagination: {
            total: totalCount.count,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            hasMore: totalCount.count > (parseInt(offset as string) + parseInt(limit as string))
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chat history',
        messageBn: 'চ্যাট ইতিহাস আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * End chat session
   */
  static async endSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { reason, rating, feedback } = req.body;
      
      // Update session status
      const [updatedSession] = await db.update(supportChatSessions)
        .set({ 
          status: 'ended',
          endedAt: new Date()
        })
        .where(eq(supportChatSessions.sessionId, sessionId))
        .returning();
        
      if (!updatedSession) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found',
          messageBn: 'চ্যাট সেশন পাওয়া যায়নি'
        });
      }
      
      // Free up agent
      if (updatedSession.agentId) {
        await db.update(supportAgents)
          .set({ 
            status: 'available',
            currentTicketCount: sql`${supportAgents.currentTicketCount} - 1`
          })
          .where(eq(supportAgents.id, updatedSession.agentId));
      }
      
      // Close related ticket if exists
      if (updatedSession.ticketId) {
        await db.update(supportTickets)
          .set({ 
            status: 'closed',
            closedAt: new Date(),
            customerSatisfactionRating: rating,
            customerFeedback: feedback
          })
          .where(eq(supportTickets.id, updatedSession.ticketId));
      }
      
      // Add system message
      if (updatedSession.ticketId) {
        await db.insert(supportConversations).values({
          ticketId: updatedSession.ticketId,
          senderId: updatedSession.customerId,
          senderType: 'system',
          messageType: 'system_note',
          content: `Chat session ended. ${reason ? `Reason: ${reason}` : ''}`,
          readByCustomer: true,
          readByAgent: true,
          translatedContent: {
            bn: `চ্যাট সেশন শেষ হয়েছে। ${reason ? `কারণ: ${reason}` : ''}`
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Chat session ended successfully',
        messageBn: 'চ্যাট সেশন সফলভাবে শেষ হয়েছে',
        data: {
          sessionId,
          duration: updatedSession.endedAt ? 
            (updatedSession.endedAt.getTime() - updatedSession.startedAt.getTime()) / 1000 : 0,
          rating,
          feedback
        }
      });
      
    } catch (error) {
      console.error('Error ending chat session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end chat session',
        messageBn: 'চ্যাট সেশন শেষ করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get agent active chats
   */
  static async getAgentChats(req: Request, res: Response) {
    try {
      const agentId = req.params.agentId;
      
      const activeChats = await db.select({
        session: supportChatSessions,
        customer: {
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        },
        ticket: {
          ticketNumber: supportTickets.ticketNumber,
          category: supportTickets.category,
          priority: supportTickets.priority
        }
      })
      .from(supportChatSessions)
      .leftJoin(users, eq(supportChatSessions.customerId, users.id))
      .leftJoin(supportTickets, eq(supportChatSessions.ticketId, supportTickets.id))
      .where(and(
        eq(supportChatSessions.agentId, agentId),
        eq(supportChatSessions.status, 'active')
      ))
      .orderBy(desc(supportChatSessions.startedAt));
      
      res.json({
        success: true,
        data: activeChats
      });
      
    } catch (error) {
      console.error('Error fetching agent chats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch agent chats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Helper methods
  private static async getQueuePosition(): Promise<number> {
    const [queueCount] = await db.select({ count: count() })
      .from(supportChatSessions)
      .where(and(
        eq(supportChatSessions.status, 'active'),
        sql`${supportChatSessions.agentId} IS NULL`
      ));
      
    return queueCount.count + 1;
  }
  
  private static async findAvailableAgent(language: string) {
    const agents = await db.select()
      .from(supportAgents)
      .where(and(
        eq(supportAgents.isActive, true),
        eq(supportAgents.status, 'available'),
        sql`${supportAgents.currentTicketCount} < ${supportAgents.maxConcurrentTickets}`
      ))
      .orderBy(supportAgents.currentTicketCount);
      
    return agents.find(agent => {
      const languages = agent.languages as string[] || [];
      return languages.includes(language);
    }) || agents[0];
  }
  
  private static async generateTicketNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `CH-${timestamp}-${random}`;
  }
}