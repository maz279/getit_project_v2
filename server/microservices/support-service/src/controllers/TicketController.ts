/**
 * Support Ticket Controller - Amazon.com/Shopee.sg Level
 * Comprehensive ticket lifecycle management with Bangladesh integration
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  supportTickets, 
  supportConversations, 
  supportAgents, 
  users,
  supportSlaConfigs,
  supportAnalytics,
  insertSupportTicketSchema,
  SupportTicket,
  InsertSupportTicket
} from '../../../../../shared/schema';
import { eq, desc, and, count, sql, ilike, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class TicketController {
  /**
   * Create new support ticket with intelligent routing
   */
  static async createTicket(req: Request, res: Response) {
    try {
      const validatedData = insertSupportTicketSchema.parse(req.body);
      
      // Generate unique ticket number
      const ticketNumber = await TicketController.generateTicketNumber();
      
      // Calculate SLA targets based on category and priority
      const slaTargets = await TicketController.calculateSLATargets(
        validatedData.category,
        validatedData.priority || 'medium',
        validatedData.channel
      );
      
      // Auto-assign agent based on availability and specialization
      const assignedAgent = await TicketController.autoAssignAgent(
        validatedData.category,
        validatedData.language || 'en'
      );
      
      const ticketData: InsertSupportTicket = {
        ...validatedData,
        ticketNumber,
        assignedAgentId: assignedAgent?.id,
        assignedAt: assignedAgent ? new Date() : undefined,
        slaTargetResponse: slaTargets.responseTarget,
        slaTargetResolution: slaTargets.resolutionTarget,
        metadata: {
          ...validatedData.metadata,
          createdVia: req.headers['user-agent'],
          ipAddress: req.ip,
          autoAssigned: !!assignedAgent,
          bangladeshContext: {
            timezone: 'Asia/Dhaka',
            language: validatedData.language || 'en'
          }
        }
      };
      
      const [newTicket] = await db.insert(supportTickets).values(ticketData).returning();
      
      // Create initial system message
      await db.insert(supportConversations).values({
        ticketId: newTicket.id,
        senderId: validatedData.customerId,
        senderType: 'system',
        messageType: 'system_note',
        content: `Ticket created. ${assignedAgent ? `Assigned to agent ${assignedAgent.agentCode}` : 'Waiting for agent assignment'}.`,
        readByCustomer: true,
        readByAgent: false,
        translatedContent: validatedData.language === 'bn' ? {
          bn: `টিকিট তৈরি হয়েছে। ${assignedAgent ? `এজেন্ট ${assignedAgent.agentCode} এর কাছে পাঠানো হয়েছে` : 'এজেন্ট নিয়োগের জন্য অপেক্ষা করুন'}.`
        } : undefined
      });
      
      // Update agent ticket count if assigned
      if (assignedAgent) {
        await db.update(supportAgents)
          .set({ 
            currentTicketCount: sql`${supportAgents.currentTicketCount} + 1`,
            status: 'busy'
          })
          .where(eq(supportAgents.id, assignedAgent.id));
      }
      
      // Record analytics
      await TicketController.recordTicketAnalytics('created', newTicket);
      
      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        messageBn: 'সাপোর্ট টিকিট সফলভাবে তৈরি হয়েছে',
        data: {
          ticket: newTicket,
          estimatedResponseTime: slaTargets.responseMinutes,
          assignedAgent: assignedAgent ? {
            agentCode: assignedAgent.agentCode,
            department: assignedAgent.department,
            languages: assignedAgent.languages
          } : null
        }
      });
      
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create support ticket',
        messageBn: 'সাপোর্ট টিকিট তৈরি করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get tickets for customer with advanced filtering
   */
  static async getCustomerTickets(req: Request, res: Response) {
    try {
      const customerId = parseInt(req.params.customerId);
      const { 
        status, 
        category, 
        priority, 
        page = 1, 
        limit = 10,
        search,
        dateFrom,
        dateTo
      } = req.query;
      
      let query = db.select({
        ticket: supportTickets,
        agent: {
          agentCode: supportAgents.agentCode,
          department: supportAgents.department,
          userId: supportAgents.userId
        },
        user: {
          username: users.username,
          fullName: users.fullName
        }
      })
      .from(supportTickets)
      .leftJoin(supportAgents, eq(supportTickets.assignedAgentId, supportAgents.id))
      .leftJoin(users, eq(supportAgents.userId, users.id))
      .where(eq(supportTickets.customerId, customerId));
      
      // Apply filters
      if (status) {
        query = query.where(and(
          eq(supportTickets.customerId, customerId),
          eq(supportTickets.status, status as string)
        ));
      }
      
      if (category) {
        query = query.where(and(
          eq(supportTickets.customerId, customerId),
          eq(supportTickets.category, category as string)
        ));
      }
      
      if (priority) {
        query = query.where(and(
          eq(supportTickets.customerId, customerId),
          eq(supportTickets.priority, priority as string)
        ));
      }
      
      if (search) {
        query = query.where(and(
          eq(supportTickets.customerId, customerId),
          ilike(supportTickets.title, `%${search}%`)
        ));
      }
      
      if (dateFrom) {
        query = query.where(and(
          eq(supportTickets.customerId, customerId),
          gte(supportTickets.createdAt, new Date(dateFrom as string))
        ));
      }
      
      if (dateTo) {
        query = query.where(and(
          eq(supportTickets.customerId, customerId),
          lte(supportTickets.createdAt, new Date(dateTo as string))
        ));
      }
      
      // Add pagination
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const tickets = await query
        .orderBy(desc(supportTickets.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);
      
      // Get total count
      const [totalCount] = await db.select({ count: count() })
        .from(supportTickets)
        .where(eq(supportTickets.customerId, customerId));
      
      res.json({
        success: true,
        data: {
          tickets,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: totalCount.count,
            pages: Math.ceil(totalCount.count / parseInt(limit as string))
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching customer tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tickets',
        messageBn: 'টিকিট আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Update ticket status with SLA tracking
   */
  static async updateTicketStatus(req: Request, res: Response) {
    try {
      const ticketId = req.params.ticketId;
      const { status, resolution, agentNotes } = req.body;
      const agentId = req.user?.id; // Assuming authentication middleware provides user
      
      const updateData: Partial<SupportTicket> = {
        status,
        updatedAt: new Date()
      };
      
      // Handle status-specific updates
      if (status === 'in_progress' && !req.body.firstResponseAt) {
        updateData.firstResponseAt = new Date();
      }
      
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
        updateData.resolutionSummary = resolution;
      }
      
      if (status === 'closed') {
        updateData.closedAt = new Date();
      }
      
      const [updatedTicket] = await db.update(supportTickets)
        .set(updateData)
        .where(eq(supportTickets.id, ticketId))
        .returning();
      
      // Add agent note if provided
      if (agentNotes) {
        await db.insert(supportConversations).values({
          ticketId,
          senderId: agentId,
          senderType: 'agent',
          messageType: 'system_note',
          content: agentNotes,
          isInternal: true,
          readByAgent: true,
          readByCustomer: false
        });
      }
      
      // Check SLA breach
      if (updatedTicket.slaTargetResponse && updatedTicket.firstResponseAt) {
        const isBreached = updatedTicket.firstResponseAt > updatedTicket.slaTargetResponse;
        if (isBreached) {
          await db.update(supportTickets)
            .set({ isBreached: true })
            .where(eq(supportTickets.id, ticketId));
        }
      }
      
      // Record analytics
      await TicketController.recordTicketAnalytics('status_update', updatedTicket);
      
      res.json({
        success: true,
        message: 'Ticket updated successfully',
        messageBn: 'টিকিট সফলভাবে আপডেট হয়েছে',
        data: updatedTicket
      });
      
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update ticket',
        messageBn: 'টিকিট আপডেট করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get ticket statistics for dashboard
   */
  static async getTicketStats(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo, agentId, department } = req.query;
      
      // Base stats query
      const statsQuery = db.select({
        total: count(),
        status: supportTickets.status,
        priority: supportTickets.priority,
        category: supportTickets.category
      }).from(supportTickets);
      
      // Apply filters
      let whereConditions = [];
      if (dateFrom) {
        whereConditions.push(gte(supportTickets.createdAt, new Date(dateFrom as string)));
      }
      if (dateTo) {
        whereConditions.push(lte(supportTickets.createdAt, new Date(dateTo as string)));
      }
      if (agentId) {
        whereConditions.push(eq(supportTickets.assignedAgentId, agentId as string));
      }
      
      const stats = await statsQuery
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .groupBy(supportTickets.status, supportTickets.priority, supportTickets.category);
      
      // Calculate summary metrics
      const totalTickets = stats.reduce((sum, stat) => sum + stat.total, 0);
      const openTickets = stats.filter(s => ['open', 'in_progress'].includes(s.status)).reduce((sum, stat) => sum + stat.total, 0);
      const resolvedTickets = stats.filter(s => s.status === 'resolved').reduce((sum, stat) => sum + stat.total, 0);
      const criticalTickets = stats.filter(s => s.priority === 'critical').reduce((sum, stat) => sum + stat.total, 0);
      
      // SLA performance
      const slaBreaches = await db.select({ count: count() })
        .from(supportTickets)
        .where(and(
          eq(supportTickets.isBreached, true),
          ...(whereConditions.length > 0 ? whereConditions : [])
        ));
      
      res.json({
        success: true,
        data: {
          summary: {
            total: totalTickets,
            open: openTickets,
            resolved: resolvedTickets,
            critical: criticalTickets,
            slaBreaches: slaBreaches[0]?.count || 0,
            resolutionRate: totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : '0'
          },
          breakdown: {
            byStatus: this.groupStats(stats, 'status'),
            byPriority: this.groupStats(stats, 'priority'),
            byCategory: this.groupStats(stats, 'category')
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching ticket statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        messageBn: 'পরিসংখ্যান আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Helper methods
  private static async generateTicketNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `GT-${timestamp}-${random}`;
  }
  
  private static async calculateSLATargets(category: string, priority: string, channel: string) {
    const slaConfig = await db.select()
      .from(supportSlaConfigs)
      .where(and(
        eq(supportSlaConfigs.category, category),
        eq(supportSlaConfigs.priority, priority),
        eq(supportSlaConfigs.isActive, true)
      ))
      .limit(1);
      
    const config = slaConfig[0] || {
      firstResponseTimeMinutes: 30,
      resolutionTimeHours: 24
    };
    
    const now = new Date();
    const responseTarget = new Date(now.getTime() + config.firstResponseTimeMinutes * 60000);
    const resolutionTarget = new Date(now.getTime() + config.resolutionTimeHours * 3600000);
    
    return {
      responseTarget,
      resolutionTarget,
      responseMinutes: config.firstResponseTimeMinutes
    };
  }
  
  private static async autoAssignAgent(category: string, language: string) {
    const availableAgents = await db.select()
      .from(supportAgents)
      .leftJoin(users, eq(supportAgents.userId, users.id))
      .where(and(
        eq(supportAgents.isActive, true),
        eq(supportAgents.status, 'available'),
        sql`${supportAgents.currentTicketCount} < ${supportAgents.maxConcurrentTickets}`
      ))
      .orderBy(supportAgents.currentTicketCount);
      
    // Find agent with matching specialization and language
    return availableAgents.find(agent => {
      const specializations = agent.support_agents.specializations as string[] || [];
      const languages = agent.support_agents.languages as string[] || [];
      return specializations.includes(category) && languages.includes(language);
    })?.support_agents || availableAgents[0]?.support_agents;
  }
  
  private static async recordTicketAnalytics(action: string, ticket: SupportTicket) {
    const today = new Date().toISOString().split('T')[0];
    
    // Update or create analytics record
    await db.insert(supportAnalytics)
      .values({
        date: today,
        agentId: ticket.assignedAgentId,
        totalTickets: action === 'created' ? 1 : 0,
        openTickets: ['open', 'in_progress'].includes(ticket.status) ? 1 : 0,
        resolvedTickets: ticket.status === 'resolved' ? 1 : 0,
        escalatedTickets: ticket.escalationLevel > 0 ? 1 : 0,
        slaBreaches: ticket.isBreached ? 1 : 0,
        metrics: {
          action,
          category: ticket.category,
          priority: ticket.priority,
          channel: ticket.channel,
          language: ticket.language
        }
      })
      .onConflictDoUpdate({
        target: [supportAnalytics.date, supportAnalytics.agentId],
        set: {
          totalTickets: sql`${supportAnalytics.totalTickets} + 1`,
          updatedAt: new Date()
        }
      });
  }
  
  private static groupStats(stats: any[], field: string) {
    return stats.reduce((acc, stat) => {
      const key = stat[field];
      acc[key] = (acc[key] || 0) + stat.total;
      return acc;
    }, {});
  }
}