/**
 * Chat Controller - Real-Time Chat Management
 * Amazon.com/Shopee.sg-Level live chat functionality
 */

import { Router, Request, Response } from 'express';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

interface ChatRoom {
  id: string;
  type: 'customer_support' | 'vendor_chat' | 'group_chat' | 'order_discussion';
  participants: ChatParticipant[];
  createdBy: string;
  createdAt: Date;
  lastActivity: Date;
  status: 'active' | 'archived' | 'closed';
  metadata: {
    orderId?: string;
    productId?: string;
    vendorId?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
  };
  messageCount: number;
  settings: {
    allowFileUploads: boolean;
    maxParticipants: number;
    autoClose: boolean;
    recordHistory: boolean;
  };
}

interface ChatParticipant {
  userId: string;
  role: 'customer' | 'vendor' | 'support_agent' | 'admin';
  joinedAt: Date;
  lastReadAt: Date;
  permissions: string[];
  status: 'active' | 'inactive';
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'order_update' | 'product_link';
  timestamp: Date;
  editedAt?: Date;
  metadata: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
    productId?: string;
    orderId?: string;
    replyTo?: string;
  };
  readBy: string[];
  reactions: Record<string, string[]>; // emoji -> userIds
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export class ChatController {
  private router = Router();
  private redis = createClient();

  constructor() {
    this.initializeRoutes();
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      await this.redis.connect();
      console.log('✅ Redis connected for Chat controller');
    } catch (error) {
      console.warn('⚠️ Redis connection failed for Chat:', error.message);
    }
  }

  private initializeRoutes() {
    // Chat room management
    this.router.post('/rooms', this.createChatRoom.bind(this));
    this.router.get('/rooms', this.getChatRooms.bind(this));
    this.router.get('/rooms/:roomId', this.getChatRoom.bind(this));
    this.router.put('/rooms/:roomId', this.updateChatRoom.bind(this));
    this.router.delete('/rooms/:roomId', this.deleteChatRoom.bind(this));
    
    // Participant management
    this.router.post('/rooms/:roomId/join', this.joinChatRoom.bind(this));
    this.router.post('/rooms/:roomId/leave', this.leaveChatRoom.bind(this));
    this.router.get('/rooms/:roomId/participants', this.getRoomParticipants.bind(this));
    this.router.put('/rooms/:roomId/participants/:userId', this.updateParticipant.bind(this));
    
    // Message management
    this.router.post('/rooms/:roomId/messages', this.sendMessage.bind(this));
    this.router.get('/rooms/:roomId/messages', this.getChatHistory.bind(this));
    this.router.put('/messages/:messageId', this.editMessage.bind(this));
    this.router.delete('/messages/:messageId', this.deleteMessage.bind(this));
    this.router.post('/messages/:messageId/read', this.markMessageAsRead.bind(this));
    this.router.post('/messages/:messageId/react', this.reactToMessage.bind(this));
    
    // File sharing
    this.router.post('/rooms/:roomId/upload', this.uploadFile.bind(this));
    this.router.get('/files/:fileId', this.downloadFile.bind(this));
    
    // Customer support specific
    this.router.post('/support/create-ticket', this.createSupportTicket.bind(this));
    this.router.get('/support/tickets', this.getSupportTickets.bind(this));
    this.router.post('/support/assign-agent', this.assignSupportAgent.bind(this));
    this.router.post('/support/escalate', this.escalateTicket.bind(this));
    
    // Vendor chat features
    this.router.post('/vendor/contact', this.contactVendor.bind(this));
    this.router.get('/vendor/:vendorId/chats', this.getVendorChats.bind(this));
    
    // Bangladesh-specific features
    this.router.post('/bangladesh/create-bangla-room', this.createBanglaRoom.bind(this));
    this.router.get('/bangladesh/support-agents', this.getBanglaSupportAgents.bind(this));
    
    // Analytics
    this.router.get('/analytics/chat-metrics', this.getChatMetrics.bind(this));
    this.router.get('/analytics/response-times', this.getResponseTimes.bind(this));
    this.router.get('/analytics/satisfaction', this.getSatisfactionRatings.bind(this));
    
    // Search and filters
    this.router.get('/search/messages', this.searchMessages.bind(this));
    this.router.get('/search/rooms', this.searchRooms.bind(this));
    
    // Health check
    this.router.get('/health', this.healthCheck.bind(this));
  }

  private async createChatRoom(req: Request, res: Response) {
    try {
      const { type, participants, metadata, settings } = req.body;
      const createdBy = req.body.createdBy || req.user?.id;

      if (!createdBy) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const roomId = uuidv4();
      const chatRoom: ChatRoom = {
        id: roomId,
        type: type || 'customer_support',
        participants: participants?.map((p: any) => ({
          userId: p.userId,
          role: p.role || 'customer',
          joinedAt: new Date(),
          lastReadAt: new Date(),
          permissions: p.permissions || ['read', 'write'],
          status: 'active'
        })) || [],
        createdBy,
        createdAt: new Date(),
        lastActivity: new Date(),
        status: 'active',
        metadata: {
          orderId: metadata?.orderId,
          productId: metadata?.productId,
          vendorId: metadata?.vendorId,
          priority: metadata?.priority || 'medium',
          category: metadata?.category
        },
        messageCount: 0,
        settings: {
          allowFileUploads: settings?.allowFileUploads !== false,
          maxParticipants: settings?.maxParticipants || 10,
          autoClose: settings?.autoClose !== false,
          recordHistory: settings?.recordHistory !== false
        }
      };

      // Store in Redis
      await this.redis.hSet(`chat_room:${roomId}`, {
        data: JSON.stringify(chatRoom)
      });

      // Add to user's rooms
      for (const participant of chatRoom.participants) {
        await this.redis.sAdd(`user_rooms:${participant.userId}`, roomId);
      }

      // Add to global room list
      await this.redis.sAdd('active_chat_rooms', roomId);

      // Index by type
      await this.redis.sAdd(`rooms_by_type:${type}`, roomId);

      res.json({
        success: true,
        message: 'Chat room created successfully',
        data: chatRoom
      });
    } catch (error) {
      console.error('❌ Error creating chat room:', error);
      res.status(500).json({ error: 'Failed to create chat room' });
    }
  }

  private async getChatRooms(req: Request, res: Response) {
    try {
      const { userId, type, status, page = 1, limit = 20 } = req.query;

      let roomIds: string[] = [];

      if (userId) {
        roomIds = await this.redis.sMembers(`user_rooms:${userId}`);
      } else if (type) {
        roomIds = await this.redis.sMembers(`rooms_by_type:${type}`);
      } else {
        roomIds = await this.redis.sMembers('active_chat_rooms');
      }

      const rooms = [];
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedRoomIds = roomIds.slice(startIndex, endIndex);

      for (const roomId of paginatedRoomIds) {
        const roomData = await this.redis.hGet(`chat_room:${roomId}`, 'data');
        if (roomData) {
          const room = JSON.parse(roomData);
          if (!status || room.status === status) {
            rooms.push(room);
          }
        }
      }

      res.json({
        success: true,
        data: {
          rooms,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: roomIds.length,
            totalPages: Math.ceil(roomIds.length / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('❌ Error getting chat rooms:', error);
      res.status(500).json({ error: 'Failed to get chat rooms' });
    }
  }

  private async getChatRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const roomData = await this.redis.hGet(`chat_room:${roomId}`, 'data');

      if (!roomData) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      const room = JSON.parse(roomData);
      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('❌ Error getting chat room:', error);
      res.status(500).json({ error: 'Failed to get chat room' });
    }
  }

  private async joinChatRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const { userId, role } = req.body;

      const roomData = await this.redis.hGet(`chat_room:${roomId}`, 'data');
      if (!roomData) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      const room: ChatRoom = JSON.parse(roomData);

      // Check if user is already a participant
      const existingParticipant = room.participants.find(p => p.userId === userId);
      if (existingParticipant) {
        return res.status(400).json({ error: 'User already in chat room' });
      }

      // Check max participants
      if (room.participants.length >= room.settings.maxParticipants) {
        return res.status(400).json({ error: 'Chat room is full' });
      }

      // Add participant
      const newParticipant: ChatParticipant = {
        userId,
        role: role || 'customer',
        joinedAt: new Date(),
        lastReadAt: new Date(),
        permissions: ['read', 'write'],
        status: 'active'
      };

      room.participants.push(newParticipant);
      room.lastActivity = new Date();

      // Update room
      await this.redis.hSet(`chat_room:${roomId}`, {
        data: JSON.stringify(room)
      });

      // Add to user's rooms
      await this.redis.sAdd(`user_rooms:${userId}`, roomId);

      // Send system message
      await this.sendSystemMessage(roomId, `${userId} joined the chat`, {
        userId,
        action: 'join'
      });

      res.json({
        success: true,
        message: 'Successfully joined chat room',
        data: newParticipant
      });
    } catch (error) {
      console.error('❌ Error joining chat room:', error);
      res.status(500).json({ error: 'Failed to join chat room' });
    }
  }

  private async sendMessage(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const { senderId, message, messageType, metadata } = req.body;

      if (!senderId || !message) {
        return res.status(400).json({ error: 'Sender ID and message are required' });
      }

      // Verify room exists and user is participant
      const roomData = await this.redis.hGet(`chat_room:${roomId}`, 'data');
      if (!roomData) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      const room: ChatRoom = JSON.parse(roomData);
      const isParticipant = room.participants.some(p => p.userId === senderId && p.status === 'active');
      
      if (!isParticipant) {
        return res.status(403).json({ error: 'Not authorized to send messages in this room' });
      }

      const messageId = uuidv4();
      const chatMessage: ChatMessage = {
        id: messageId,
        roomId,
        senderId,
        message,
        messageType: messageType || 'text',
        timestamp: new Date(),
        metadata: metadata || {},
        readBy: [senderId], // Sender automatically reads their own message
        reactions: {},
        status: 'sent'
      };

      // Store message
      await this.redis.lPush(`chat_messages:${roomId}`, JSON.stringify(chatMessage));
      await this.redis.hSet(`chat_message:${messageId}`, {
        data: JSON.stringify(chatMessage)
      });

      // Update room
      room.messageCount++;
      room.lastActivity = new Date();
      await this.redis.hSet(`chat_room:${roomId}`, {
        data: JSON.stringify(room)
      });

      // Update last read for sender
      const participant = room.participants.find(p => p.userId === senderId);
      if (participant) {
        participant.lastReadAt = new Date();
        await this.redis.hSet(`chat_room:${roomId}`, {
          data: JSON.stringify(room)
        });
      }

      res.json({
        success: true,
        message: 'Message sent successfully',
        data: chatMessage
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  private async getChatHistory(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 50, before } = req.query;

      // Verify room exists
      const roomData = await this.redis.hGet(`chat_room:${roomId}`, 'data');
      if (!roomData) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      // Get messages from Redis list
      const totalMessages = await this.redis.lLen(`chat_messages:${roomId}`);
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit) - 1;

      const messageStrings = await this.redis.lRange(`chat_messages:${roomId}`, startIndex, endIndex);
      const messages = messageStrings.map(str => JSON.parse(str));

      // Filter by timestamp if 'before' is specified
      let filteredMessages = messages;
      if (before) {
        const beforeDate = new Date(before as string);
        filteredMessages = messages.filter(m => new Date(m.timestamp) < beforeDate);
      }

      // Sort by timestamp (newest first)
      filteredMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json({
        success: true,
        data: {
          messages: filteredMessages,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalMessages,
            totalPages: Math.ceil(totalMessages / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('❌ Error getting chat history:', error);
      res.status(500).json({ error: 'Failed to get chat history' });
    }
  }

  private async markMessageAsRead(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;

      const messageData = await this.redis.hGet(`chat_message:${messageId}`, 'data');
      if (!messageData) {
        return res.status(404).json({ error: 'Message not found' });
      }

      const message: ChatMessage = JSON.parse(messageData);
      
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        await this.redis.hSet(`chat_message:${messageId}`, {
          data: JSON.stringify(message)
        });
      }

      res.json({
        success: true,
        message: 'Message marked as read'
      });
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  }

  private async createSupportTicket(req: Request, res: Response) {
    try {
      const { customerId, subject, description, priority, category, orderId, productId } = req.body;

      const roomId = uuidv4();
      const supportRoom: ChatRoom = {
        id: roomId,
        type: 'customer_support',
        participants: [
          {
            userId: customerId,
            role: 'customer',
            joinedAt: new Date(),
            lastReadAt: new Date(),
            permissions: ['read', 'write'],
            status: 'active'
          }
        ],
        createdBy: customerId,
        createdAt: new Date(),
        lastActivity: new Date(),
        status: 'active',
        metadata: {
          orderId,
          productId,
          priority: priority || 'medium',
          category: category || 'general'
        },
        messageCount: 0,
        settings: {
          allowFileUploads: true,
          maxParticipants: 5,
          autoClose: true,
          recordHistory: true
        }
      };

      // Store room
      await this.redis.hSet(`chat_room:${roomId}`, {
        data: JSON.stringify(supportRoom)
      });

      // Add to various indexes
      await this.redis.sAdd(`user_rooms:${customerId}`, roomId);
      await this.redis.sAdd('active_chat_rooms', roomId);
      await this.redis.sAdd('rooms_by_type:customer_support', roomId);
      await this.redis.sAdd('unassigned_support_tickets', roomId);

      // Send initial system message
      await this.sendSystemMessage(roomId, `Support ticket created: ${subject}`, {
        subject,
        description,
        priority,
        category
      });

      res.json({
        success: true,
        message: 'Support ticket created successfully',
        data: {
          ticketId: roomId,
          room: supportRoom
        }
      });
    } catch (error) {
      console.error('❌ Error creating support ticket:', error);
      res.status(500).json({ error: 'Failed to create support ticket' });
    }
  }

  private async assignSupportAgent(req: Request, res: Response) {
    try {
      const { ticketId, agentId } = req.body;

      const roomData = await this.redis.hGet(`chat_room:${ticketId}`, 'data');
      if (!roomData) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }

      const room: ChatRoom = JSON.parse(roomData);

      // Add agent as participant
      const agentParticipant: ChatParticipant = {
        userId: agentId,
        role: 'support_agent',
        joinedAt: new Date(),
        lastReadAt: new Date(),
        permissions: ['read', 'write', 'close_ticket'],
        status: 'active'
      };

      room.participants.push(agentParticipant);
      room.lastActivity = new Date();

      // Update room
      await this.redis.hSet(`chat_room:${ticketId}`, {
        data: JSON.stringify(room)
      });

      // Remove from unassigned tickets
      await this.redis.sRem('unassigned_support_tickets', ticketId);

      // Add to agent's rooms
      await this.redis.sAdd(`user_rooms:${agentId}`, ticketId);

      // Send system message
      await this.sendSystemMessage(ticketId, `Support agent ${agentId} has been assigned to this ticket`, {
        agentId,
        action: 'assign'
      });

      res.json({
        success: true,
        message: 'Support agent assigned successfully'
      });
    } catch (error) {
      console.error('❌ Error assigning support agent:', error);
      res.status(500).json({ error: 'Failed to assign support agent' });
    }
  }

  private async getChatMetrics(req: Request, res: Response) {
    try {
      const totalRooms = await this.redis.sCard('active_chat_rooms');
      const supportTickets = await this.redis.sCard('rooms_by_type:customer_support');
      const vendorChats = await this.redis.sCard('rooms_by_type:vendor_chat');
      const unassignedTickets = await this.redis.sCard('unassigned_support_tickets');

      // Get average response time (would need to implement calculation)
      const averageResponseTime = 300; // 5 minutes placeholder

      const metrics = {
        totalRooms,
        supportTickets,
        vendorChats,
        unassignedTickets,
        averageResponseTime,
        timestamp: new Date()
      };

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('❌ Error getting chat metrics:', error);
      res.status(500).json({ error: 'Failed to get chat metrics' });
    }
  }

  private async createBanglaRoom(req: Request, res: Response) {
    try {
      const { participants, topic } = req.body;

      const roomId = uuidv4();
      const banglaRoom: ChatRoom = {
        id: roomId,
        type: 'group_chat',
        participants: participants?.map((p: any) => ({
          userId: p.userId,
          role: p.role || 'customer',
          joinedAt: new Date(),
          lastReadAt: new Date(),
          permissions: ['read', 'write'],
          status: 'active'
        })) || [],
        createdBy: req.body.createdBy,
        createdAt: new Date(),
        lastActivity: new Date(),
        status: 'active',
        metadata: {
          priority: 'medium',
          category: 'bangla_discussion'
        },
        messageCount: 0,
        settings: {
          allowFileUploads: true,
          maxParticipants: 50,
          autoClose: false,
          recordHistory: true
        }
      };

      // Store room
      await this.redis.hSet(`chat_room:${roomId}`, {
        data: JSON.stringify(banglaRoom)
      });

      // Send welcome message in Bangla
      await this.sendSystemMessage(roomId, `স্বাগতম! এই চ্যাট রুমে আপনি বাংলায় কথা বলতে পারেন। বিষয়: ${topic}`, {
        language: 'bn',
        topic
      });

      res.json({
        success: true,
        message: 'বাংলা চ্যাট রুম তৈরি হয়েছে',
        data: banglaRoom
      });
    } catch (error) {
      console.error('❌ Error creating Bangla room:', error);
      res.status(500).json({ error: 'বাংলা চ্যাট রুম তৈরি করতে ব্যর্থ' });
    }
  }

  private async healthCheck(req: Request, res: Response) {
    try {
      const totalRooms = await this.redis.sCard('active_chat_rooms');
      
      res.json({
        service: 'chat-controller',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: {
          totalActiveRooms: totalRooms,
          redisConnected: this.redis.isReady
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Health check failed' });
    }
  }

  // Helper methods

  private async sendSystemMessage(roomId: string, message: string, metadata: any = {}) {
    const systemMessage: ChatMessage = {
      id: uuidv4(),
      roomId,
      senderId: 'system',
      message,
      messageType: 'system',
      timestamp: new Date(),
      metadata,
      readBy: [],
      reactions: {},
      status: 'sent'
    };

    await this.redis.lPush(`chat_messages:${roomId}`, JSON.stringify(systemMessage));
    await this.redis.hSet(`chat_message:${systemMessage.id}`, {
      data: JSON.stringify(systemMessage)
    });
  }

  // Placeholder methods for additional endpoints
  private async updateChatRoom(req: Request, res: Response) {
    res.json({ success: true, message: 'Update chat room - Implementation needed' });
  }

  private async deleteChatRoom(req: Request, res: Response) {
    res.json({ success: true, message: 'Delete chat room - Implementation needed' });
  }

  private async leaveChatRoom(req: Request, res: Response) {
    res.json({ success: true, message: 'Leave chat room - Implementation needed' });
  }

  private async getRoomParticipants(req: Request, res: Response) {
    res.json({ success: true, message: 'Get room participants - Implementation needed' });
  }

  private async updateParticipant(req: Request, res: Response) {
    res.json({ success: true, message: 'Update participant - Implementation needed' });
  }

  private async editMessage(req: Request, res: Response) {
    res.json({ success: true, message: 'Edit message - Implementation needed' });
  }

  private async deleteMessage(req: Request, res: Response) {
    res.json({ success: true, message: 'Delete message - Implementation needed' });
  }

  private async reactToMessage(req: Request, res: Response) {
    res.json({ success: true, message: 'React to message - Implementation needed' });
  }

  private async uploadFile(req: Request, res: Response) {
    res.json({ success: true, message: 'Upload file - Implementation needed' });
  }

  private async downloadFile(req: Request, res: Response) {
    res.json({ success: true, message: 'Download file - Implementation needed' });
  }

  private async getSupportTickets(req: Request, res: Response) {
    res.json({ success: true, message: 'Get support tickets - Implementation needed' });
  }

  private async escalateTicket(req: Request, res: Response) {
    res.json({ success: true, message: 'Escalate ticket - Implementation needed' });
  }

  private async contactVendor(req: Request, res: Response) {
    res.json({ success: true, message: 'Contact vendor - Implementation needed' });
  }

  private async getVendorChats(req: Request, res: Response) {
    res.json({ success: true, message: 'Get vendor chats - Implementation needed' });
  }

  private async getBanglaSupportAgents(req: Request, res: Response) {
    res.json({ success: true, message: 'Get Bangla support agents - Implementation needed' });
  }

  private async getResponseTimes(req: Request, res: Response) {
    res.json({ success: true, message: 'Get response times - Implementation needed' });
  }

  private async getSatisfactionRatings(req: Request, res: Response) {
    res.json({ success: true, message: 'Get satisfaction ratings - Implementation needed' });
  }

  private async searchMessages(req: Request, res: Response) {
    res.json({ success: true, message: 'Search messages - Implementation needed' });
  }

  private async searchRooms(req: Request, res: Response) {
    res.json({ success: true, message: 'Search rooms - Implementation needed' });
  }

  getRouter() {
    return this.router;
  }
}