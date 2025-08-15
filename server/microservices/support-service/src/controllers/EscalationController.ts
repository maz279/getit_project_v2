/**
 * Escalation Controller - Amazon.com/Shopee.sg Level
 * Advanced escalation management with automated workflows and Bangladesh compliance
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  supportEscalations, 
  supportTickets,
  supportAgents,
  users,
  insertSupportEscalationSchema,
  SupportEscalation
} from '../../../../../shared/schema';
import { eq, desc, and, count, sql, gte, lte } from 'drizzle-orm';

export class EscalationController {
  /**
   * Create escalation with intelligent routing
   */
  static async createEscalation(req: Request, res: Response) {
    try {
      const validatedData = insertSupportEscalationSchema.parse(req.body);
      
      // Verify ticket exists and can be escalated
      const ticket = await db.select({
        ticket: supportTickets,
        currentAgent: {
          id: supportAgents.id,
          agentCode: supportAgents.agentCode,
          skillLevel: supportAgents.skillLevel,
          department: supportAgents.department
        }
      })
      .from(supportTickets)
      .leftJoin(supportAgents, eq(supportTickets.assignedAgentId, supportAgents.id))
      .where(eq(supportTickets.id, validatedData.ticketId))
      .limit(1);
      
      if (!ticket.length) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
          messageBn: 'টিকিট পাওয়া যায়নি'
        });
      }
      
      const ticketData = ticket[0];
      
      // Check escalation eligibility
      const canEscalate = await EscalationController.validateEscalation(
        ticketData.ticket,
        validatedData.escalationType
      );
      
      if (!canEscalate.valid) {
        return res.status(400).json({
          success: false,
          message: canEscalate.reason,
          messageBn: canEscalate.reasonBn
        });
      }
      
      // Find appropriate escalation target
      const targetAgent = await EscalationController.findEscalationTarget(
        ticketData.currentAgent,
        validatedData.escalationType,
        ticketData.ticket.category
      );
      
      if (!targetAgent) {
        return res.status(400).json({
          success: false,
          message: 'No suitable agent available for escalation',
          messageBn: 'এসকেলেশনের জন্য কোন উপযুক্ত এজেন্ট উপলব্ধ নেই'
        });
      }
      
      // Create escalation record
      const escalationData = {
        ...validatedData,
        fromAgentId: ticketData.currentAgent?.id,
        toAgentId: targetAgent.id,
        fromLevel: ticketData.currentAgent?.skillLevel,
        toLevel: targetAgent.skillLevel
      };
      
      const [newEscalation] = await db.insert(supportEscalations)
        .values(escalationData)
        .returning();
      
      // Update ticket with escalation info
      await db.update(supportTickets)
        .set({
          assignedAgentId: targetAgent.id,
          escalationLevel: sql`${supportTickets.escalationLevel} + 1`,
          escalatedAt: new Date(),
          escalatedBy: newEscalation.id,
          escalationReason: validatedData.reason,
          status: 'escalated',
          priority: EscalationController.getEscalatedPriority(ticketData.ticket.priority)
        })
        .where(eq(supportTickets.id, validatedData.ticketId));
      
      // Update agent workloads
      if (ticketData.currentAgent?.id) {
        await db.update(supportAgents)
          .set({ currentTicketCount: sql`${supportAgents.currentTicketCount} - 1` })
          .where(eq(supportAgents.id, ticketData.currentAgent.id));
      }
      
      await db.update(supportAgents)
        .set({ currentTicketCount: sql`${supportAgents.currentTicketCount} + 1` })
        .where(eq(supportAgents.id, targetAgent.id));
      
      // Create escalation notification
      await EscalationController.createEscalationNotification(
        newEscalation,
        ticketData.ticket,
        targetAgent
      );
      
      // Log escalation analytics
      await EscalationController.logEscalationAnalytics(newEscalation, ticketData.ticket);
      
      res.status(201).json({
        success: true,
        message: 'Ticket escalated successfully',
        messageBn: 'টিকিট সফলভাবে এসকেলেট হয়েছে',
        data: {
          escalation: newEscalation,
          targetAgent: {
            agentCode: targetAgent.agentCode,
            department: targetAgent.department,
            skillLevel: targetAgent.skillLevel
          },
          escalationPath: `${ticketData.currentAgent?.skillLevel || 'unassigned'} → ${targetAgent.skillLevel}`,
          expectedResolutionTime: EscalationController.calculateExpectedResolution(
            targetAgent.skillLevel,
            ticketData.ticket.category
          )
        }
      });
      
    } catch (error) {
      console.error('Error creating escalation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to escalate ticket',
        messageBn: 'টিকিট এসকেলেট করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get escalation history for ticket
   */
  static async getTicketEscalations(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      
      const escalations = await db.select({
        escalation: supportEscalations,
        fromAgent: {
          agentCode: sql`from_agent.agent_code`,
          fullName: sql`from_user.full_name`,
          department: sql`from_agent.department`
        },
        toAgent: {
          agentCode: sql`to_agent.agent_code`,
          fullName: sql`to_user.full_name`,
          department: sql`to_agent.department`
        },
        escalatedBy: {
          username: sql`escalated_user.username`,
          fullName: sql`escalated_user.full_name`
        }
      })
      .from(supportEscalations)
      .leftJoin(
        sql`${supportAgents} as from_agent`,
        eq(supportEscalations.fromAgentId, sql`from_agent.id`)
      )
      .leftJoin(
        sql`${users} as from_user`,
        eq(sql`from_agent.user_id`, sql`from_user.id`)
      )
      .leftJoin(
        sql`${supportAgents} as to_agent`,
        eq(supportEscalations.toAgentId, sql`to_agent.id`)
      )
      .leftJoin(
        sql`${users} as to_user`,
        eq(sql`to_agent.user_id`, sql`to_user.id`)
      )
      .leftJoin(
        sql`${users} as escalated_user`,
        eq(supportEscalations.escalatedBy, sql`escalated_user.id`)
      )
      .where(eq(supportEscalations.ticketId, ticketId))
      .orderBy(desc(supportEscalations.escalatedAt));
      
      // Get ticket info for context
      const [ticket] = await db.select({
        ticketNumber: supportTickets.ticketNumber,
        title: supportTickets.title,
        currentEscalationLevel: supportTickets.escalationLevel,
        status: supportTickets.status
      })
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId))
      .limit(1);
      
      res.json({
        success: true,
        data: {
          ticket,
          escalations,
          totalEscalations: escalations.length,
          currentLevel: ticket?.currentEscalationLevel || 0
        }
      });
      
    } catch (error) {
      console.error('Error fetching escalations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch escalation history',
        messageBn: 'এসকেলেশন ইতিহাস আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Resolve escalation
   */
  static async resolveEscalation(req: Request, res: Response) {
    try {
      const { escalationId } = req.params;
      const { resolutionNotes, ticketResolution } = req.body;
      
      // Get escalation details
      const [escalation] = await db.select()
        .from(supportEscalations)
        .where(eq(supportEscalations.id, escalationId))
        .limit(1);
        
      if (!escalation) {
        return res.status(404).json({
          success: false,
          message: 'Escalation not found',
          messageBn: 'এসকেলেশন পাওয়া যায়নি'
        });
      }
      
      if (escalation.resolved) {
        return res.status(400).json({
          success: false,
          message: 'Escalation already resolved',
          messageBn: 'এসকেলেশন ইতিমধ্যে সমাধান হয়েছে'
        });
      }
      
      // Update escalation
      const [updatedEscalation] = await db.update(supportEscalations)
        .set({
          resolved: true,
          resolutionNotes,
          resolvedAt: new Date()
        })
        .where(eq(supportEscalations.id, escalationId))
        .returning();
      
      // Update ticket if resolution provided
      if (ticketResolution) {
        await db.update(supportTickets)
          .set({
            status: ticketResolution.status || 'resolved',
            resolutionSummary: ticketResolution.summary,
            resolvedAt: new Date()
          })
          .where(eq(supportTickets.id, escalation.ticketId));
      }
      
      // Record resolution analytics
      await EscalationController.recordResolutionAnalytics(updatedEscalation);
      
      res.json({
        success: true,
        message: 'Escalation resolved successfully',
        messageBn: 'এসকেলেশন সফলভাবে সমাধান হয়েছে',
        data: updatedEscalation
      });
      
    } catch (error) {
      console.error('Error resolving escalation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resolve escalation',
        messageBn: 'এসকেলেশন সমাধান করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get escalation analytics
   */
  static async getEscalationAnalytics(req: Request, res: Response) {
    try {
      const { 
        department, 
        agentId, 
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo = new Date().toISOString() 
      } = req.query;
      
      // Build query conditions
      let conditions = [
        gte(supportEscalations.escalatedAt, new Date(dateFrom as string)),
        lte(supportEscalations.escalatedAt, new Date(dateTo as string))
      ];
      
      if (agentId) {
        conditions.push(eq(supportEscalations.toAgentId, agentId as string));
      }
      
      // Get escalation data
      let escalationQuery = db.select({
        escalation: supportEscalations,
        ticket: supportTickets,
        fromAgent: supportAgents,
        toAgent: sql`to_agent.*`
      })
      .from(supportEscalations)
      .leftJoin(supportTickets, eq(supportEscalations.ticketId, supportTickets.id))
      .leftJoin(supportAgents, eq(supportEscalations.fromAgentId, supportAgents.id))
      .leftJoin(
        sql`${supportAgents} as to_agent`,
        eq(supportEscalations.toAgentId, sql`to_agent.id`)
      );
      
      if (department) {
        escalationQuery = escalationQuery.where(and(
          ...conditions,
          eq(sql`to_agent.department`, department)
        ));
      } else {
        escalationQuery = escalationQuery.where(and(...conditions));
      }
      
      const escalations = await escalationQuery;
      
      // Calculate analytics
      const analytics = EscalationController.calculateEscalationAnalytics(escalations);
      
      // Get escalation trends
      const trends = EscalationController.calculateEscalationTrends(escalations);
      
      // Get top escalation reasons
      const topReasons = EscalationController.getTopEscalationReasons(escalations);
      
      // Get department breakdown
      const departmentBreakdown = EscalationController.getDepartmentBreakdown(escalations);
      
      res.json({
        success: true,
        data: {
          summary: analytics,
          trends,
          topReasons,
          departmentBreakdown,
          period: {
            from: dateFrom,
            to: dateTo,
            totalEscalations: escalations.length
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching escalation analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        messageBn: 'অ্যানালিটিক্স আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Auto-escalate tickets based on SLA breach
   */
  static async autoEscalateTickets(req: Request, res: Response) {
    try {
      // Find tickets breaching SLA
      const breachedTickets = await db.select({
        ticket: supportTickets,
        agent: supportAgents
      })
      .from(supportTickets)
      .leftJoin(supportAgents, eq(supportTickets.assignedAgentId, supportAgents.id))
      .where(and(
        sql`${supportTickets.slaTargetResponse} < NOW()`,
        eq(supportTickets.status, 'open'),
        eq(supportTickets.isBreached, false)
      ));
      
      const escalatedTickets = [];
      
      for (const { ticket, agent } of breachedTickets) {
        try {
          // Find escalation target
          const targetAgent = await EscalationController.findEscalationTarget(
            agent,
            'time_based',
            ticket.category
          );
          
          if (targetAgent) {
            // Create auto-escalation
            const [escalation] = await db.insert(supportEscalations)
              .values({
                ticketId: ticket.id,
                escalationType: 'time_based',
                fromAgentId: agent?.id,
                toAgentId: targetAgent.id,
                fromLevel: agent?.skillLevel,
                toLevel: targetAgent.skillLevel,
                reason: 'Automatic escalation due to SLA breach',
                escalatedBy: 1 // System user
              })
              .returning();
            
            // Update ticket
            await db.update(supportTickets)
              .set({
                assignedAgentId: targetAgent.id,
                escalationLevel: sql`${supportTickets.escalationLevel} + 1`,
                escalatedAt: new Date(),
                isBreached: true,
                status: 'escalated'
              })
              .where(eq(supportTickets.id, ticket.id));
            
            escalatedTickets.push({
              ticketNumber: ticket.ticketNumber,
              escalationId: escalation.id,
              targetAgent: targetAgent.agentCode
            });
          }
        } catch (error) {
          console.error(`Failed to auto-escalate ticket ${ticket.ticketNumber}:`, error);
        }
      }
      
      res.json({
        success: true,
        message: `Auto-escalated ${escalatedTickets.length} tickets`,
        messageBn: `${escalatedTickets.length}টি টিকিট স্বয়ংক্রিয়ভাবে এসকেলেট হয়েছে`,
        data: {
          escalatedTickets,
          totalProcessed: breachedTickets.length,
          successRate: breachedTickets.length > 0 
            ? ((escalatedTickets.length / breachedTickets.length) * 100).toFixed(1) 
            : '100'
        }
      });
      
    } catch (error) {
      console.error('Error in auto-escalation:', error);
      res.status(500).json({
        success: false,
        message: 'Auto-escalation failed',
        messageBn: 'স্বয়ংক্রিয় এসকেলেশন ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Helper methods
  private static async validateEscalation(ticket: any, escalationType: string) {
    // Business rules for escalation validation
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      return {
        valid: false,
        reason: 'Cannot escalate closed or resolved tickets',
        reasonBn: 'বন্ধ বা সমাধান হওয়া টিকিট এসকেলেট করা যায় না'
      };
    }
    
    if (ticket.escalationLevel >= 3) {
      return {
        valid: false,
        reason: 'Maximum escalation level reached',
        reasonBn: 'সর্বোচ্চ এসকেলেশন লেভেল পৌঁছেছে'
      };
    }
    
    // Check minimum time before escalation
    const hoursSinceCreation = (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
    if (escalationType !== 'manual' && hoursSinceCreation < 1) {
      return {
        valid: false,
        reason: 'Minimum 1 hour required before escalation',
        reasonBn: 'এসকেলেশনের আগে ন্যূনতম ১ ঘন্টা প্রয়োজন'
      };
    }
    
    return { valid: true };
  }
  
  private static async findEscalationTarget(
    currentAgent: any, 
    escalationType: string, 
    category: string
  ) {
    const targetLevels = {
      'junior': ['senior', 'expert', 'supervisor'],
      'senior': ['expert', 'supervisor'],
      'expert': ['supervisor', 'manager'],
      'supervisor': ['manager'],
      'manager': [] // Can't escalate further
    };
    
    const currentLevel = currentAgent?.skillLevel || 'junior';
    const possibleLevels = targetLevels[currentLevel] || [];
    
    if (possibleLevels.length === 0) {
      return null;
    }
    
    // Find available agent with higher skill level
    const targetAgent = await db.select()
      .from(supportAgents)
      .where(and(
        eq(supportAgents.isActive, true),
        eq(supportAgents.status, 'available'),
        sql`${supportAgents.skillLevel} = ANY(${possibleLevels})`,
        sql`${supportAgents.currentTicketCount} < ${supportAgents.maxConcurrentTickets}`
      ))
      .orderBy(supportAgents.skillLevel, supportAgents.currentTicketCount)
      .limit(1);
    
    return targetAgent[0] || null;
  }
  
  private static getEscalatedPriority(currentPriority: string) {
    const priorityMap = {
      'low': 'medium',
      'medium': 'high',
      'high': 'urgent',
      'urgent': 'critical',
      'critical': 'critical'
    };
    
    return priorityMap[currentPriority] || currentPriority;
  }
  
  private static calculateExpectedResolution(skillLevel: string, category: string) {
    // Expected resolution time in hours based on skill level and category
    const baseTime = {
      'junior': 24,
      'senior': 8,
      'expert': 4,
      'supervisor': 2,
      'manager': 1
    }[skillLevel] || 24;
    
    const categoryMultiplier = {
      'technical_issue': 1.5,
      'billing_issue': 1.2,
      'account_issue': 1.0,
      'general_inquiry': 0.8
    }[category] || 1.0;
    
    return Math.round(baseTime * categoryMultiplier);
  }
  
  private static async createEscalationNotification(
    escalation: SupportEscalation,
    ticket: any,
    targetAgent: any
  ) {
    // In production, integrate with notification service
    console.log(`Escalation notification: Ticket ${ticket.ticketNumber} escalated to ${targetAgent.agentCode}`);
  }
  
  private static async logEscalationAnalytics(escalation: SupportEscalation, ticket: any) {
    // Record escalation for analytics
    // In production, integrate with analytics service
  }
  
  private static async recordResolutionAnalytics(escalation: SupportEscalation) {
    // Record resolution metrics
    const resolutionTime = escalation.resolvedAt && escalation.escalatedAt
      ? (escalation.resolvedAt.getTime() - escalation.escalatedAt.getTime()) / (1000 * 60 * 60)
      : 0;
      
    // In production, store in analytics service
    console.log(`Escalation resolved in ${resolutionTime} hours`);
  }
  
  private static calculateEscalationAnalytics(escalations: any[]) {
    const total = escalations.length;
    const resolved = escalations.filter(e => e.escalation.resolved).length;
    const avgResolutionTime = escalations
      .filter(e => e.escalation.resolved && e.escalation.resolvedAt && e.escalation.escalatedAt)
      .reduce((sum, e) => {
        const time = (e.escalation.resolvedAt.getTime() - e.escalation.escalatedAt.getTime()) / (1000 * 60 * 60);
        return sum + time;
      }, 0) / Math.max(resolved, 1);
    
    return {
      totalEscalations: total,
      resolvedEscalations: resolved,
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : '0',
      averageResolutionTimeHours: avgResolutionTime.toFixed(1),
      pendingEscalations: total - resolved
    };
  }
  
  private static calculateEscalationTrends(escalations: any[]) {
    // Group by day to show trends
    const daily = escalations.reduce((acc, e) => {
      const date = new Date(e.escalation.escalatedAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }
  
  private static getTopEscalationReasons(escalations: any[]) {
    const reasons = escalations.reduce((acc, e) => {
      const reason = e.escalation.reason || 'No reason specified';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(reasons)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));
  }
  
  private static getDepartmentBreakdown(escalations: any[]) {
    const departments = escalations.reduce((acc, e) => {
      const dept = e.toAgent?.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { total: 0, resolved: 0 };
      }
      acc[dept].total++;
      if (e.escalation.resolved) {
        acc[dept].resolved++;
      }
      return acc;
    }, {} as Record<string, any>);
    
    return Object.entries(departments).map(([department, stats]) => ({
      department,
      totalEscalations: stats.total,
      resolvedEscalations: stats.resolved,
      resolutionRate: stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : '0'
    }));
  }
}