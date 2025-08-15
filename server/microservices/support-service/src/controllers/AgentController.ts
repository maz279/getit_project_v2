/**
 * Agent Controller - Amazon.com/Shopee.sg Level
 * Comprehensive agent management with performance tracking and Bangladesh support
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  supportAgents, 
  supportTickets,
  supportAnalytics,
  supportFeedback,
  users,
  insertSupportAgentSchema,
  SupportAgent
} from '../../../../../shared/schema';
import { eq, desc, and, count, sql, avg, gte, lte } from 'drizzle-orm';

export class AgentController {
  /**
   * Create new support agent
   */
  static async createAgent(req: Request, res: Response) {
    try {
      const validatedData = insertSupportAgentSchema.parse(req.body);
      
      // Generate unique agent code
      const agentCode = await AgentController.generateAgentCode(validatedData.department);
      
      // Verify user exists and has appropriate role
      const user = await db.select()
        .from(users)
        .where(eq(users.id, validatedData.userId))
        .limit(1);
        
      if (!user.length) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          messageBn: 'ব্যবহারকারী পাওয়া যায়নি'
        });
      }
      
      // Check if user already has agent profile
      const existingAgent = await db.select()
        .from(supportAgents)
        .where(eq(supportAgents.userId, validatedData.userId))
        .limit(1);
        
      if (existingAgent.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User already has an agent profile',
          messageBn: 'ব্যবহারকারীর ইতিমধ্যে একটি এজেন্ট প্রোফাইল রয়েছে'
        });
      }
      
      const agentData = {
        ...validatedData,
        agentCode,
        performanceMetrics: {
          totalTicketsHandled: 0,
          averageResponseTime: 0,
          customerSatisfactionRating: 0,
          resolutionRate: 0,
          escalationRate: 0,
          qualityScore: 0
        },
        certificationInfo: validatedData.certificationInfo || {
          customerServiceCertified: false,
          bangladeshCulturalTraining: false,
          languageProficiency: validatedData.languages || ['en'],
          lastTrainingDate: null
        }
      };
      
      const [newAgent] = await db.insert(supportAgents)
        .values(agentData)
        .returning();
      
      // Update user role to include support
      await db.update(users)
        .set({ role: 'support' })
        .where(eq(users.id, validatedData.userId));
      
      res.status(201).json({
        success: true,
        message: 'Support agent created successfully',
        messageBn: 'সাপোর্ট এজেন্ট সফলভাবে তৈরি হয়েছে',
        data: newAgent
      });
      
    } catch (error) {
      console.error('Error creating agent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create agent',
        messageBn: 'এজেন্ট তৈরি করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get all agents with filtering and performance metrics
   */
  static async getAgents(req: Request, res: Response) {
    try {
      const { 
        department, 
        status, 
        skillLevel, 
        language,
        page = 1, 
        limit = 20,
        includeMetrics = true 
      } = req.query;
      
      let query = db.select({
        agent: supportAgents,
        user: {
          username: users.username,
          fullName: users.fullName,
          email: users.email,
          avatar: users.avatar
        }
      })
      .from(supportAgents)
      .leftJoin(users, eq(supportAgents.userId, users.id));
      
      // Apply filters
      let conditions = [eq(supportAgents.isActive, true)];
      
      if (department) {
        conditions.push(eq(supportAgents.department, department as string));
      }
      
      if (status) {
        conditions.push(eq(supportAgents.status, status as string));
      }
      
      if (skillLevel) {
        conditions.push(eq(supportAgents.skillLevel, skillLevel as string));
      }
      
      if (language) {
        conditions.push(sql`${supportAgents.languages}::jsonb ? ${language}`);
      }
      
      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
      
      // Get agents with pagination
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const agents = await query
        .where(whereClause)
        .orderBy(desc(supportAgents.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);
      
      // Get total count
      const [totalCount] = await db.select({ count: count() })
        .from(supportAgents)
        .where(whereClause);
      
      // Add performance metrics if requested
      let agentsWithMetrics = agents;
      if (includeMetrics === 'true') {
        agentsWithMetrics = await Promise.all(
          agents.map(async (agent) => {
            const metrics = await AgentController.calculateAgentMetrics(agent.agent.id);
            return {
              ...agent,
              performanceMetrics: metrics
            };
          })
        );
      }
      
      res.json({
        success: true,
        data: {
          agents: agentsWithMetrics,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: totalCount.count,
            pages: Math.ceil(totalCount.count / parseInt(limit as string))
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching agents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch agents',
        messageBn: 'এজেন্ট আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get agent performance dashboard
   */
  static async getAgentPerformance(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const { 
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), 
        dateTo = new Date().toISOString() 
      } = req.query;
      
      // Get agent details
      const agent = await db.select({
        agent: supportAgents,
        user: {
          username: users.username,
          fullName: users.fullName,
          email: users.email
        }
      })
      .from(supportAgents)
      .leftJoin(users, eq(supportAgents.userId, users.id))
      .where(eq(supportAgents.id, agentId))
      .limit(1);
      
      if (!agent.length) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found',
          messageBn: 'এজেন্ট পাওয়া যায়নি'
        });
      }
      
      const agentData = agent[0];
      
      // Calculate comprehensive metrics
      const metrics = await AgentController.calculateDetailedMetrics(
        agentId,
        new Date(dateFrom as string),
        new Date(dateTo as string)
      );
      
      // Get daily performance data for charts
      const dailyStats = await db.select({
        date: supportAnalytics.date,
        totalTickets: supportAnalytics.totalTickets,
        resolvedTickets: supportAnalytics.resolvedTickets,
        averageResponseTime: supportAnalytics.averageResponseTime,
        customerSatisfactionAvg: supportAnalytics.customerSatisfactionAvg
      })
      .from(supportAnalytics)
      .where(and(
        eq(supportAnalytics.agentId, agentId),
        gte(supportAnalytics.date, dateFrom as string),
        lte(supportAnalytics.date, dateTo as string)
      ))
      .orderBy(supportAnalytics.date);
      
      // Get recent tickets
      const recentTickets = await db.select({
        ticket: supportTickets,
        customer: {
          username: users.username,
          fullName: users.fullName
        }
      })
      .from(supportTickets)
      .leftJoin(users, eq(supportTickets.customerId, users.id))
      .where(eq(supportTickets.assignedAgentId, agentId))
      .orderBy(desc(supportTickets.updatedAt))
      .limit(10);
      
      // Calculate performance ranking
      const ranking = await AgentController.calculateAgentRanking(agentId, agentData.agent.department);
      
      res.json({
        success: true,
        data: {
          agent: agentData,
          metrics,
          dailyStats,
          recentTickets,
          ranking,
          dateRange: {
            from: dateFrom,
            to: dateTo
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance data',
        messageBn: 'পারফরম্যান্স ডেটা আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Update agent status and availability
   */
  static async updateAgentStatus(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const { status, maxConcurrentTickets, shiftStart, shiftEnd, workingDays } = req.body;
      
      const updateData: Partial<SupportAgent> = {};
      
      if (status) updateData.status = status;
      if (maxConcurrentTickets) updateData.maxConcurrentTickets = maxConcurrentTickets;
      if (shiftStart) updateData.shiftStart = shiftStart;
      if (shiftEnd) updateData.shiftEnd = shiftEnd;
      if (workingDays) updateData.workingDays = workingDays;
      
      updateData.updatedAt = new Date();
      
      const [updatedAgent] = await db.update(supportAgents)
        .set(updateData)
        .where(eq(supportAgents.id, agentId))
        .returning();
      
      if (!updatedAgent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found',
          messageBn: 'এজেন্ট পাওয়া যায়নি'
        });
      }
      
      res.json({
        success: true,
        message: 'Agent status updated successfully',
        messageBn: 'এজেন্ট স্ট্যাটাস সফলভাবে আপডেট হয়েছে',
        data: updatedAgent
      });
      
    } catch (error) {
      console.error('Error updating agent status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update agent status',
        messageBn: 'এজেন্ট স্ট্যাটাস আপডেট করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get agent workload distribution
   */
  static async getWorkloadDistribution(req: Request, res: Response) {
    try {
      const { department } = req.query;
      
      let query = db.select({
        agent: {
          id: supportAgents.id,
          agentCode: supportAgents.agentCode,
          department: supportAgents.department,
          skillLevel: supportAgents.skillLevel,
          status: supportAgents.status,
          currentTicketCount: supportAgents.currentTicketCount,
          maxConcurrentTickets: supportAgents.maxConcurrentTickets
        },
        user: {
          fullName: users.fullName
        }
      })
      .from(supportAgents)
      .leftJoin(users, eq(supportAgents.userId, users.id))
      .where(eq(supportAgents.isActive, true));
      
      if (department) {
        query = query.where(and(
          eq(supportAgents.isActive, true),
          eq(supportAgents.department, department as string)
        ));
      }
      
      const agents = await query.orderBy(supportAgents.department, supportAgents.skillLevel);
      
      // Calculate workload metrics
      const workloadData = agents.map(agent => {
        const utilizationRate = agent.agent.maxConcurrentTickets > 0 
          ? (agent.agent.currentTicketCount / agent.agent.maxConcurrentTickets) * 100 
          : 0;
          
        return {
          ...agent,
          utilizationRate,
          availableCapacity: Math.max(0, agent.agent.maxConcurrentTickets - agent.agent.currentTicketCount),
          status: agent.agent.status,
          isOverloaded: agent.agent.currentTicketCount > agent.agent.maxConcurrentTickets
        };
      });
      
      // Calculate department summary
      const departmentSummary = workloadData.reduce((acc, agent) => {
        const dept = agent.agent.department;
        if (!acc[dept]) {
          acc[dept] = {
            totalAgents: 0,
            activeAgents: 0,
            totalCapacity: 0,
            currentLoad: 0,
            averageUtilization: 0
          };
        }
        
        acc[dept].totalAgents++;
        if (agent.agent.status === 'available' || agent.agent.status === 'busy') {
          acc[dept].activeAgents++;
        }
        acc[dept].totalCapacity += agent.agent.maxConcurrentTickets;
        acc[dept].currentLoad += agent.agent.currentTicketCount;
        
        return acc;
      }, {} as Record<string, any>);
      
      // Calculate average utilization for each department
      Object.keys(departmentSummary).forEach(dept => {
        departmentSummary[dept].averageUtilization = 
          departmentSummary[dept].totalCapacity > 0 
            ? (departmentSummary[dept].currentLoad / departmentSummary[dept].totalCapacity) * 100 
            : 0;
      });
      
      res.json({
        success: true,
        data: {
          agents: workloadData,
          departmentSummary,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error fetching workload distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch workload data',
        messageBn: 'কর্মভার ডেটা আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Helper methods
  private static async generateAgentCode(department: string): Promise<string> {
    const departmentPrefix = {
      'customer_service': 'CS',
      'technical_support': 'TS',
      'billing': 'BL',
      'vendor_support': 'VS',
      'escalation': 'ES'
    }[department] || 'GT';
    
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${departmentPrefix}-${timestamp}-${random}`;
  }
  
  private static async calculateAgentMetrics(agentId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get ticket stats
    const ticketStats = await db.select({
      total: count(),
      status: supportTickets.status,
      firstResponseAt: supportTickets.firstResponseAt,
      resolvedAt: supportTickets.resolvedAt,
      escalationLevel: supportTickets.escalationLevel
    })
    .from(supportTickets)
    .where(and(
      eq(supportTickets.assignedAgentId, agentId),
      gte(supportTickets.createdAt, thirtyDaysAgo)
    ))
    .groupBy(supportTickets.status);
    
    // Get customer satisfaction
    const [satisfactionData] = await db.select({
      averageRating: avg(supportFeedback.overallRating),
      totalFeedbacks: count()
    })
    .from(supportFeedback)
    .where(eq(supportFeedback.agentId, agentId));
    
    const totalTickets = ticketStats.reduce((sum, stat) => sum + stat.total, 0);
    const resolvedTickets = ticketStats.filter(s => s.status === 'resolved').reduce((sum, stat) => sum + stat.total, 0);
    const escalatedTickets = ticketStats.filter(s => s.escalationLevel > 0).reduce((sum, stat) => sum + stat.total, 0);
    
    return {
      totalTicketsHandled: totalTickets,
      resolutionRate: totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : '0',
      escalationRate: totalTickets > 0 ? ((escalatedTickets / totalTickets) * 100).toFixed(1) : '0',
      customerSatisfactionRating: satisfactionData?.averageRating || 0,
      totalFeedbacks: satisfactionData?.totalFeedbacks || 0,
      period: '30 days'
    };
  }
  
  private static async calculateDetailedMetrics(agentId: string, dateFrom: Date, dateTo: Date) {
    // Comprehensive metrics calculation
    const metrics = await AgentController.calculateAgentMetrics(agentId);
    
    // Add response time analysis
    const responseTimeData = await db.select({
      avgResponseTime: avg(sql`EXTRACT(EPOCH FROM (${supportTickets.firstResponseAt} - ${supportTickets.createdAt}))/60`)
    })
    .from(supportTickets)
    .where(and(
      eq(supportTickets.assignedAgentId, agentId),
      gte(supportTickets.createdAt, dateFrom),
      lte(supportTickets.createdAt, dateTo),
      sql`${supportTickets.firstResponseAt} IS NOT NULL`
    ));
    
    return {
      ...metrics,
      averageResponseTimeMinutes: responseTimeData[0]?.avgResponseTime || 0
    };
  }
  
  private static async calculateAgentRanking(agentId: string, department: string) {
    // Get all agents in same department with their metrics
    const departmentAgents = await db.select({
      id: supportAgents.id,
      agentCode: supportAgents.agentCode
    })
    .from(supportAgents)
    .where(and(
      eq(supportAgents.department, department),
      eq(supportAgents.isActive, true)
    ));
    
    // Calculate ranking based on multiple factors
    // In production, this would use a more sophisticated scoring algorithm
    const totalAgents = departmentAgents.length;
    const currentAgentIndex = departmentAgents.findIndex(agent => agent.id === agentId);
    
    return {
      rank: currentAgentIndex + 1,
      totalInDepartment: totalAgents,
      percentile: totalAgents > 1 ? Math.round(((totalAgents - currentAgentIndex) / totalAgents) * 100) : 100
    };
  }
}