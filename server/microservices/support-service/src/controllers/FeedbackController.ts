/**
 * Feedback Controller - Amazon.com/Shopee.sg Level
 * Customer feedback and satisfaction management with Bangladesh context
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  supportFeedback, 
  supportTickets,
  supportAgents,
  users,
  insertSupportFeedbackSchema,
  SupportFeedback
} from '../../../../../shared/schema';
import { eq, desc, and, count, sql, avg, gte, lte } from 'drizzle-orm';

export class FeedbackController {
  /**
   * Submit customer feedback
   */
  static async submitFeedback(req: Request, res: Response) {
    try {
      const validatedData = insertSupportFeedbackSchema.parse(req.body);
      
      // Verify ticket exists and belongs to customer
      const ticket = await db.select({
        ticket: supportTickets,
        agent: {
          id: supportAgents.id,
          agentCode: supportAgents.agentCode
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
      
      if (ticket[0].ticket.customerId !== validatedData.customerId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to ticket',
          messageBn: 'টিকিটে অনুমোদিত অ্যাক্সেস নেই'
        });
      }
      
      // Check if feedback already exists for this ticket
      const existingFeedback = await db.select()
        .from(supportFeedback)
        .where(and(
          eq(supportFeedback.ticketId, validatedData.ticketId),
          eq(supportFeedback.customerId, validatedData.customerId)
        ))
        .limit(1);
        
      if (existingFeedback.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Feedback already submitted for this ticket',
          messageBn: 'এই টিকিটের জন্য ইতিমধ্যে ফিডব্যাক জমা দেওয়া হয়েছে'
        });
      }
      
      // Create feedback record
      const feedbackData = {
        ...validatedData,
        agentId: ticket[0].agent?.id || null
      };
      
      const [newFeedback] = await db.insert(supportFeedback)
        .values(feedbackData)
        .returning();
      
      // Update ticket with satisfaction rating
      await db.update(supportTickets)
        .set({ 
          customerSatisfactionRating: validatedData.overallRating,
          customerFeedback: validatedData.comments
        })
        .where(eq(supportTickets.id, validatedData.ticketId));
      
      // Update agent performance metrics (async)
      if (ticket[0].agent?.id) {
        FeedbackController.updateAgentMetrics(ticket[0].agent.id);
      }
      
      // Generate insights from feedback
      const insights = await FeedbackController.generateFeedbackInsights(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Thank you for your feedback',
        messageBn: 'আপনার ফিডব্যাকের জন্য ধন্যবাদ',
        data: {
          feedback: newFeedback,
          insights,
          ticketNumber: ticket[0].ticket.ticketNumber
        }
      });
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        messageBn: 'ফিডব্যাক জমা দিতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get customer feedback history
   */
  static async getCustomerFeedback(req: Request, res: Response) {
    try {
      const customerId = parseInt(req.params.customerId);
      const { page = 1, limit = 10, dateFrom, dateTo } = req.query;
      
      let query = db.select({
        feedback: supportFeedback,
        ticket: {
          ticketNumber: supportTickets.ticketNumber,
          title: supportTickets.title,
          category: supportTickets.category,
          status: supportTickets.status
        },
        agent: {
          agentCode: supportAgents.agentCode,
          department: supportAgents.department
        },
        agentUser: {
          fullName: users.fullName
        }
      })
      .from(supportFeedback)
      .leftJoin(supportTickets, eq(supportFeedback.ticketId, supportTickets.id))
      .leftJoin(supportAgents, eq(supportFeedback.agentId, supportAgents.id))
      .leftJoin(users, eq(supportAgents.userId, users.id))
      .where(eq(supportFeedback.customerId, customerId));
      
      // Apply date filters
      let conditions = [eq(supportFeedback.customerId, customerId)];
      
      if (dateFrom) {
        conditions.push(gte(supportFeedback.submittedAt, new Date(dateFrom as string)));
      }
      
      if (dateTo) {
        conditions.push(lte(supportFeedback.submittedAt, new Date(dateTo as string)));
      }
      
      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
      
      // Get feedback with pagination
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const feedback = await query
        .where(whereClause)
        .orderBy(desc(supportFeedback.submittedAt))
        .limit(parseInt(limit as string))
        .offset(offset);
      
      // Get total count
      const [totalCount] = await db.select({ count: count() })
        .from(supportFeedback)
        .where(whereClause);
      
      // Calculate customer satisfaction statistics
      const [satisfactionStats] = await db.select({
        averageRating: avg(supportFeedback.overallRating),
        totalFeedbacks: count(),
        recommendationRate: sql<number>`
          (COUNT(CASE WHEN ${supportFeedback.wouldRecommend} = true THEN 1 END) * 100.0 / COUNT(*))
        `
      })
      .from(supportFeedback)
      .where(eq(supportFeedback.customerId, customerId));
      
      res.json({
        success: true,
        data: {
          feedback,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: totalCount.count,
            pages: Math.ceil(totalCount.count / parseInt(limit as string))
          },
          statistics: {
            averageRating: satisfactionStats?.averageRating || 0,
            totalFeedbacks: satisfactionStats?.totalFeedbacks || 0,
            recommendationRate: satisfactionStats?.recommendationRate || 0
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching customer feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch feedback',
        messageBn: 'ফিডব্যাক আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get feedback analytics for agents/admin
   */
  static async getFeedbackAnalytics(req: Request, res: Response) {
    try {
      const { 
        agentId, 
        department, 
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo = new Date().toISOString(),
        groupBy = 'day'
      } = req.query;
      
      // Build base query
      let query = db.select({
        feedback: supportFeedback,
        ticket: {
          category: supportTickets.category,
          priority: supportTickets.priority,
          channel: supportTickets.channel
        },
        agent: {
          agentCode: supportAgents.agentCode,
          department: supportAgents.department,
          skillLevel: supportAgents.skillLevel
        }
      })
      .from(supportFeedback)
      .leftJoin(supportTickets, eq(supportFeedback.ticketId, supportTickets.id))
      .leftJoin(supportAgents, eq(supportFeedback.agentId, supportAgents.id));
      
      // Apply filters
      let conditions = [
        gte(supportFeedback.submittedAt, new Date(dateFrom as string)),
        lte(supportFeedback.submittedAt, new Date(dateTo as string))
      ];
      
      if (agentId) {
        conditions.push(eq(supportFeedback.agentId, agentId as string));
      }
      
      if (department) {
        conditions.push(eq(supportAgents.department, department as string));
      }
      
      const whereClause = and(...conditions);
      const feedback = await query.where(whereClause);
      
      // Calculate comprehensive analytics
      const analytics = FeedbackController.calculateAnalytics(feedback, groupBy as string);
      
      // Get top performing agents
      const topAgents = await db.select({
        agent: {
          id: supportAgents.id,
          agentCode: supportAgents.agentCode,
          department: supportAgents.department
        },
        user: {
          fullName: users.fullName
        },
        averageRating: avg(supportFeedback.overallRating),
        totalFeedbacks: count(),
        recommendationRate: sql<number>`
          (COUNT(CASE WHEN ${supportFeedback.wouldRecommend} = true THEN 1 END) * 100.0 / COUNT(*))
        `
      })
      .from(supportFeedback)
      .leftJoin(supportAgents, eq(supportFeedback.agentId, supportAgents.id))
      .leftJoin(users, eq(supportAgents.userId, users.id))
      .where(whereClause)
      .groupBy(supportAgents.id, users.id)
      .having(sql`COUNT(*) >= 5`) // Minimum 5 feedbacks for ranking
      .orderBy(desc(avg(supportFeedback.overallRating)))
      .limit(10);
      
      // Get sentiment analysis
      const sentimentAnalysis = FeedbackController.analyzeFeedbackSentiment(feedback);
      
      res.json({
        success: true,
        data: {
          analytics,
          topAgents,
          sentimentAnalysis,
          period: {
            from: dateFrom,
            to: dateTo,
            totalFeedbacks: feedback.length
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        messageBn: 'অ্যানালিটিক্স আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get feedback insights and recommendations
   */
  static async getFeedbackInsights(req: Request, res: Response) {
    try {
      const { department, agentId, period = '30d' } = req.query;
      
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const dateFrom = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
      
      // Get feedback data
      let query = db.select({
        feedback: supportFeedback,
        ticket: supportTickets,
        agent: supportAgents
      })
      .from(supportFeedback)
      .leftJoin(supportTickets, eq(supportFeedback.ticketId, supportTickets.id))
      .leftJoin(supportAgents, eq(supportFeedback.agentId, supportAgents.id))
      .where(gte(supportFeedback.submittedAt, dateFrom));
      
      if (department) {
        query = query.where(and(
          gte(supportFeedback.submittedAt, dateFrom),
          eq(supportAgents.department, department as string)
        ));
      }
      
      if (agentId) {
        query = query.where(and(
          gte(supportFeedback.submittedAt, dateFrom),
          eq(supportFeedback.agentId, agentId as string)
        ));
      }
      
      const feedbackData = await query;
      
      // Generate insights
      const insights = {
        overallTrends: FeedbackController.calculateTrends(feedbackData),
        commonIssues: FeedbackController.identifyCommonIssues(feedbackData),
        performanceGaps: FeedbackController.identifyPerformanceGaps(feedbackData),
        recommendations: FeedbackController.generateRecommendations(feedbackData),
        bangladeshSpecificInsights: FeedbackController.getBangladeshInsights(feedbackData)
      };
      
      res.json({
        success: true,
        data: {
          insights,
          period: `${daysBack} days`,
          totalFeedbacks: feedbackData.length,
          generatedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error generating insights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate insights',
        messageBn: 'অন্তর্দৃষ্টি তৈরি করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Helper methods
  private static async updateAgentMetrics(agentId: string) {
    // Calculate updated performance metrics
    const [metrics] = await db.select({
      averageRating: avg(supportFeedback.overallRating),
      totalFeedbacks: count(),
      recommendationRate: sql<number>`
        (COUNT(CASE WHEN ${supportFeedback.wouldRecommend} = true THEN 1 END) * 100.0 / COUNT(*))
      `
    })
    .from(supportFeedback)
    .where(eq(supportFeedback.agentId, agentId));
    
    // Update agent performance metrics
    await db.update(supportAgents)
      .set({
        performanceMetrics: sql`
          COALESCE(${supportAgents.performanceMetrics}, '{}')::jsonb || 
          jsonb_build_object(
            'customerSatisfactionRating', ${metrics?.averageRating || 0},
            'totalFeedbacks', ${metrics?.totalFeedbacks || 0},
            'recommendationRate', ${metrics?.recommendationRate || 0},
            'lastUpdated', NOW()
          )
        `
      })
      .where(eq(supportAgents.id, agentId));
  }
  
  private static async generateFeedbackInsights(feedback: typeof insertSupportFeedbackSchema._type) {
    const insights = [];
    
    if (feedback.overallRating <= 2) {
      insights.push({
        type: 'concern',
        message: 'Low satisfaction rating detected',
        messageBn: 'কম সন্তুষ্টি রেটিং সনাক্ত করা হয়েছে',
        action: 'followup_required'
      });
    }
    
    if (feedback.responseTimeRating && feedback.responseTimeRating <= 2) {
      insights.push({
        type: 'improvement',
        message: 'Response time needs improvement',
        messageBn: 'প্রতিক্রিয়ার সময় উন্নতি প্রয়োজন',
        action: 'training_recommended'
      });
    }
    
    if (feedback.wouldRecommend === false) {
      insights.push({
        type: 'alert',
        message: 'Customer would not recommend service',
        messageBn: 'গ্রাহক সেবার সুপারিশ করবেন না',
        action: 'escalation_required'
      });
    }
    
    return insights;
  }
  
  private static calculateAnalytics(feedback: any[], groupBy: string) {
    // Group feedback by time period
    const grouped = feedback.reduce((acc, item) => {
      const date = new Date(item.feedback.submittedAt);
      const key = groupBy === 'day' 
        ? date.toISOString().split('T')[0]
        : groupBy === 'week'
        ? `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
        : `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = {
          period: key,
          totalFeedbacks: 0,
          averageRating: 0,
          ratingsSum: 0,
          recommendations: 0,
          categories: {}
        };
      }
      
      acc[key].totalFeedbacks++;
      acc[key].ratingsSum += item.feedback.overallRating;
      acc[key].averageRating = acc[key].ratingsSum / acc[key].totalFeedbacks;
      
      if (item.feedback.wouldRecommend) {
        acc[key].recommendations++;
      }
      
      // Group by category
      const category = item.ticket?.category || 'unknown';
      if (!acc[key].categories[category]) {
        acc[key].categories[category] = 0;
      }
      acc[key].categories[category]++;
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped);
  }
  
  private static analyzeFeedbackSentiment(feedback: any[]) {
    const sentiments = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    feedback.forEach(item => {
      const rating = item.feedback.overallRating;
      if (rating >= 4) sentiments.positive++;
      else if (rating >= 3) sentiments.neutral++;
      else sentiments.negative++;
    });
    
    const total = feedback.length;
    return {
      positive: total > 0 ? (sentiments.positive / total * 100).toFixed(1) : 0,
      neutral: total > 0 ? (sentiments.neutral / total * 100).toFixed(1) : 0,
      negative: total > 0 ? (sentiments.negative / total * 100).toFixed(1) : 0,
      total
    };
  }
  
  private static calculateTrends(feedback: any[]) {
    // Simple trend calculation - in production, use more sophisticated algorithms
    const recentFeedback = feedback.slice(-10);
    const olderFeedback = feedback.slice(-20, -10);
    
    const recentAvg = recentFeedback.reduce((sum, f) => sum + f.feedback.overallRating, 0) / recentFeedback.length;
    const olderAvg = olderFeedback.reduce((sum, f) => sum + f.feedback.overallRating, 0) / olderFeedback.length;
    
    const trend = recentAvg - olderAvg;
    
    return {
      direction: trend > 0.1 ? 'improving' : trend < -0.1 ? 'declining' : 'stable',
      change: trend.toFixed(2),
      recentAverage: recentAvg.toFixed(2),
      previousAverage: olderAvg.toFixed(2)
    };
  }
  
  private static identifyCommonIssues(feedback: any[]) {
    const issueKeywords = ['slow', 'delayed', 'unhelpful', 'confusing', 'difficult', 'error', 'problem'];
    const issues = {} as Record<string, number>;
    
    feedback.forEach(item => {
      if (item.feedback.comments) {
        const comment = item.feedback.comments.toLowerCase();
        issueKeywords.forEach(keyword => {
          if (comment.includes(keyword)) {
            issues[keyword] = (issues[keyword] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }
  
  private static identifyPerformanceGaps(feedback: any[]) {
    // Identify areas needing improvement based on low ratings
    const gaps = [];
    
    const lowResponseTime = feedback.filter(f => f.feedback.responseTimeRating && f.feedback.responseTimeRating <= 2).length;
    const lowSolutionQuality = feedback.filter(f => f.feedback.solutionQualityRating && f.feedback.solutionQualityRating <= 2).length;
    const lowAgentHelpfulness = feedback.filter(f => f.feedback.agentHelpfulnessRating && f.feedback.agentHelpfulnessRating <= 2).length;
    
    if (lowResponseTime > feedback.length * 0.2) {
      gaps.push({
        area: 'Response Time',
        severity: 'high',
        affectedPercentage: ((lowResponseTime / feedback.length) * 100).toFixed(1)
      });
    }
    
    if (lowSolutionQuality > feedback.length * 0.2) {
      gaps.push({
        area: 'Solution Quality',
        severity: 'high',
        affectedPercentage: ((lowSolutionQuality / feedback.length) * 100).toFixed(1)
      });
    }
    
    if (lowAgentHelpfulness > feedback.length * 0.2) {
      gaps.push({
        area: 'Agent Helpfulness',
        severity: 'medium',
        affectedPercentage: ((lowAgentHelpfulness / feedback.length) * 100).toFixed(1)
      });
    }
    
    return gaps;
  }
  
  private static generateRecommendations(feedback: any[]) {
    const recommendations = [];
    
    const avgRating = feedback.reduce((sum, f) => sum + f.feedback.overallRating, 0) / feedback.length;
    
    if (avgRating < 3.5) {
      recommendations.push({
        priority: 'high',
        action: 'Implement immediate training program for agents',
        reason: 'Overall satisfaction below acceptable threshold'
      });
    }
    
    const lowRecommendationRate = feedback.filter(f => f.feedback.wouldRecommend === false).length / feedback.length;
    if (lowRecommendationRate > 0.3) {
      recommendations.push({
        priority: 'critical',
        action: 'Review and improve service quality standards',
        reason: 'High percentage of customers would not recommend service'
      });
    }
    
    return recommendations;
  }
  
  private static getBangladeshInsights(feedback: any[]) {
    // Bangladesh-specific insights based on cultural context
    const insights = [];
    
    const bengaliSpeakingIssues = feedback.filter(f => 
      f.ticket?.language === 'bn' && f.feedback.overallRating <= 2
    );
    
    if (bengaliSpeakingIssues.length > 0) {
      insights.push({
        type: 'cultural',
        message: 'Bengali speaking customers showing lower satisfaction',
        messageBn: 'বাংলা ভাষী গ্রাহকরা কম সন্তুষ্টি দেখাচ্ছেন',
        recommendation: 'Increase Bengali language support and cultural training'
      });
    }
    
    return insights;
  }
}