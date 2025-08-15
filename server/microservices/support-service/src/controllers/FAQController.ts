import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../../../db';
import { faqs, users } from '../../../../../shared/schema';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import winston from 'winston';

// Logging setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/faq-controller.log' })
  ],
});

// Validation schemas
const createFAQSchema = z.object({
  question: z.string().min(10).max(500),
  answer: z.string().min(20).max(5000),
  category: z.enum(['orders', 'payments', 'shipping', 'returns', 'account', 'product', 'technical', 'general']),
  subCategory: z.string().optional(),
  language: z.enum(['en', 'bn', 'hi', 'ar']).default('en'),
  tags: z.array(z.string()).optional(),
  priority: z.number().min(0).max(100).default(0),
});

const updateFAQSchema = z.object({
  question: z.string().min(10).max(500).optional(),
  answer: z.string().min(20).max(5000).optional(),
  category: z.enum(['orders', 'payments', 'shipping', 'returns', 'account', 'product', 'technical', 'general']).optional(),
  subCategory: z.string().optional(),
  language: z.enum(['en', 'bn', 'hi', 'ar']).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

const faqFilterSchema = z.object({
  category: z.string().optional(),
  subCategory: z.string().optional(),
  language: z.enum(['en', 'bn', 'hi', 'ar']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

const rateFAQSchema = z.object({
  isHelpful: z.boolean(),
});

export class FAQController {
  // Get FAQs with filtering and pagination
  async getFAQs(req: Request, res: Response): Promise<void> {
    try {
      const filters = faqFilterSchema.parse(req.query);
      
      // Build dynamic where conditions
      const whereConditions = [];
      
      if (filters.category) {
        whereConditions.push(eq(faqs.category, filters.category));
      }
      
      if (filters.subCategory) {
        whereConditions.push(eq(faqs.subCategory, filters.subCategory));
      }
      
      if (filters.language) {
        whereConditions.push(eq(faqs.language, filters.language));
      }
      
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(faqs.isActive, filters.isActive));
      }
      
      if (filters.search) {
        whereConditions.push(
          or(
            ilike(faqs.question, `%${filters.search}%`),
            ilike(faqs.answer, `%${filters.search}%`)
          )
        );
      }
      
      if (filters.tags && filters.tags.length > 0) {
        // Check if any of the provided tags exist in the FAQ tags array
        const tagConditions = filters.tags.map(tag => 
          sql`${faqs.tags} ? ${tag}`
        );
        whereConditions.push(or(...tagConditions));
      }
      
      if (filters.priority) {
        const priorityRanges = {
          high: { min: 70, max: 100 },
          medium: { min: 30, max: 69 },
          low: { min: 0, max: 29 },
        };
        const range = priorityRanges[filters.priority];
        whereConditions.push(
          and(
            sql`${faqs.priority} >= ${range.min}`,
            sql`${faqs.priority} <= ${range.max}`
          )
        );
      }

      // Get FAQs with creator information
      const faqList = await db
        .select({
          id: faqs.id,
          question: faqs.question,
          answer: faqs.answer,
          category: faqs.category,
          subCategory: faqs.subCategory,
          language: faqs.language,
          tags: faqs.tags,
          priority: faqs.priority,
          isActive: faqs.isActive,
          viewCount: faqs.viewCount,
          helpfulCount: faqs.helpfulCount,
          notHelpfulCount: faqs.notHelpfulCount,
          createdAt: faqs.createdAt,
          updatedAt: faqs.updatedAt,
          creator: {
            id: users.id,
            username: users.username,
            fullName: users.fullName,
          },
        })
        .from(faqs)
        .leftJoin(users, eq(faqs.createdBy, users.id))
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .orderBy(desc(faqs.priority), desc(faqs.createdAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit);

      // Get total count for pagination
      const [totalResult] = await db
        .select({ count: sql`count(*)` })
        .from(faqs)
        .where(whereConditions.length ? and(...whereConditions) : undefined);

      const total = Number(totalResult.count);

      // Get category breakdown
      const categoryBreakdown = await db
        .select({
          category: faqs.category,
          count: sql`count(*)`,
          language: faqs.language,
        })
        .from(faqs)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .groupBy(faqs.category, faqs.language);

      res.json({
        success: true,
        faqs: faqList,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
        categoryBreakdown,
        appliedFilters: filters,
      });
    } catch (error) {
      logger.error('Error fetching FAQs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: req.query,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch FAQs',
      });
    }
  }

  // Get single FAQ by ID
  async getFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const [faq] = await db
        .select({
          id: faqs.id,
          question: faqs.question,
          answer: faqs.answer,
          category: faqs.category,
          subCategory: faqs.subCategory,
          language: faqs.language,
          tags: faqs.tags,
          priority: faqs.priority,
          isActive: faqs.isActive,
          viewCount: faqs.viewCount,
          helpfulCount: faqs.helpfulCount,
          notHelpfulCount: faqs.notHelpfulCount,
          createdAt: faqs.createdAt,
          updatedAt: faqs.updatedAt,
          creator: {
            id: users.id,
            username: users.username,
            fullName: users.fullName,
          },
          updater: {
            id: sql`updater.id`,
            username: sql`updater.username`,
            fullName: sql`updater.full_name`,
          },
        })
        .from(faqs)
        .leftJoin(users, eq(faqs.createdBy, users.id))
        .leftJoin(sql`users as updater`, sql`faqs.updated_by = updater.id`)
        .where(eq(faqs.id, id))
        .limit(1);

      if (!faq) {
        res.status(404).json({
          success: false,
          error: 'FAQ not found',
        });
        return;
      }

      // Increment view count
      await this.incrementViewCount(id);

      res.json({
        success: true,
        faq,
      });
    } catch (error) {
      logger.error('Error fetching FAQ', {
        error: error instanceof Error ? error.message : 'Unknown error',
        faqId: req.params.id,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch FAQ',
      });
    }
  }

  // Create new FAQ
  async createFAQ(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createFAQSchema.parse(req.body);
      const createdBy = req.user?.id || 1; // Default to system user if not authenticated
      
      const [newFAQ] = await db.insert(faqs).values({
        question: validatedData.question,
        answer: validatedData.answer,
        category: validatedData.category,
        subCategory: validatedData.subCategory,
        language: validatedData.language,
        tags: validatedData.tags || [],
        priority: validatedData.priority,
        isActive: true,
        viewCount: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        createdBy,
        updatedBy: createdBy,
      }).returning();

      logger.info('FAQ created', {
        faqId: newFAQ.id,
        category: validatedData.category,
        language: validatedData.language,
        createdBy,
      });

      // Get complete FAQ with creator info
      const completeFAQ = await this.getFAQWithDetails(newFAQ.id);

      res.status(201).json({
        success: true,
        faq: completeFAQ,
        message: 'FAQ created successfully',
      });
    } catch (error) {
      logger.error('Error creating FAQ', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request data',
      });
    }
  }

  // Update FAQ
  async updateFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateFAQSchema.parse(req.body);
      const updatedBy = req.user?.id || 1;
      
      // Check if FAQ exists
      const existingFAQ = await db
        .select()
        .from(faqs)
        .where(eq(faqs.id, id))
        .limit(1);
      
      if (existingFAQ.length === 0) {
        res.status(404).json({
          success: false,
          error: 'FAQ not found',
        });
        return;
      }

      // Update FAQ
      const updateData = {
        ...validatedData,
        updatedBy,
        updatedAt: new Date(),
      };

      await db
        .update(faqs)
        .set(updateData)
        .where(eq(faqs.id, id));

      logger.info('FAQ updated', {
        faqId: id,
        updates: validatedData,
        updatedBy,
      });

      // Get updated FAQ with details
      const updatedFAQ = await this.getFAQWithDetails(id);

      res.json({
        success: true,
        faq: updatedFAQ,
        message: 'FAQ updated successfully',
      });
    } catch (error) {
      logger.error('Error updating FAQ', {
        error: error instanceof Error ? error.message : 'Unknown error',
        faqId: req.params.id,
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request data',
      });
    }
  }

  // Delete FAQ
  async deleteFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if FAQ exists
      const existingFAQ = await db
        .select()
        .from(faqs)
        .where(eq(faqs.id, id))
        .limit(1);
      
      if (existingFAQ.length === 0) {
        res.status(404).json({
          success: false,
          error: 'FAQ not found',
        });
        return;
      }

      // Soft delete by setting isActive to false (or hard delete if preferred)
      await db
        .update(faqs)
        .set({ 
          isActive: false,
          updatedBy: req.user?.id || 1,
          updatedAt: new Date(),
        })
        .where(eq(faqs.id, id));

      logger.info('FAQ deleted', {
        faqId: id,
        deletedBy: req.user?.id || 1,
      });

      res.json({
        success: true,
        message: 'FAQ deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting FAQ', {
        error: error instanceof Error ? error.message : 'Unknown error',
        faqId: req.params.id,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to delete FAQ',
      });
    }
  }

  // Search FAQs
  async searchFAQs(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.params;
      const language = req.query.language as string || 'en';
      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim().length < 2) {
        res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters long',
        });
        return;
      }

      // Build search conditions
      const whereConditions = [
        eq(faqs.isActive, true),
        eq(faqs.language, language),
        or(
          ilike(faqs.question, `%${query}%`),
          ilike(faqs.answer, `%${query}%`),
          sql`${faqs.tags}::text ILIKE ${`%${query}%`}`
        ),
      ];

      if (category) {
        whereConditions.push(eq(faqs.category, category));
      }

      // Search FAQs with relevance scoring
      const searchResults = await db
        .select({
          id: faqs.id,
          question: faqs.question,
          answer: faqs.answer,
          category: faqs.category,
          subCategory: faqs.subCategory,
          language: faqs.language,
          tags: faqs.tags,
          viewCount: faqs.viewCount,
          helpfulCount: faqs.helpfulCount,
          notHelpfulCount: faqs.notHelpfulCount,
          // Calculate relevance score based on question match priority
          relevanceScore: sql`
            CASE 
              WHEN LOWER(question) LIKE LOWER(${`%${query}%`}) THEN 3
              WHEN LOWER(answer) LIKE LOWER(${`%${query}%`}) THEN 2
              WHEN tags::text ILIKE ${`%${query}%`} THEN 1
              ELSE 0
            END + (helpful_count * 0.1) + (view_count * 0.01)
          `,
        })
        .from(faqs)
        .where(and(...whereConditions))
        .orderBy(sql`relevance_score DESC`, desc(faqs.priority))
        .limit(limit);

      // Get search suggestions based on partial matches
      const suggestions = await this.getSearchSuggestions(query, language, category);

      // Log search for analytics
      logger.info('FAQ search performed', {
        query,
        language,
        category,
        resultsCount: searchResults.length,
      });

      res.json({
        success: true,
        results: searchResults,
        suggestions,
        query,
        totalResults: searchResults.length,
      });
    } catch (error) {
      logger.error('Error searching FAQs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: req.params.query,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to search FAQs',
      });
    }
  }

  // Rate FAQ (helpful/not helpful)
  async rateFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isHelpful } = rateFAQSchema.parse(req.body);
      
      // Check if FAQ exists
      const existingFAQ = await db
        .select()
        .from(faqs)
        .where(eq(faqs.id, id))
        .limit(1);
      
      if (existingFAQ.length === 0) {
        res.status(404).json({
          success: false,
          error: 'FAQ not found',
        });
        return;
      }

      // Update helpful/not helpful count
      const updateField = isHelpful ? 'helpfulCount' : 'notHelpfulCount';
      
      await db
        .update(faqs)
        .set({
          [updateField]: sql`${faqs[updateField]} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(faqs.id, id));

      logger.info('FAQ rated', {
        faqId: id,
        isHelpful,
        ratedBy: req.user?.id || 'anonymous',
      });

      // Get updated counts
      const [updatedFAQ] = await db
        .select({
          helpfulCount: faqs.helpfulCount,
          notHelpfulCount: faqs.notHelpfulCount,
        })
        .from(faqs)
        .where(eq(faqs.id, id))
        .limit(1);

      res.json({
        success: true,
        message: 'Thank you for your feedback!',
        rating: {
          isHelpful,
          helpfulCount: updatedFAQ.helpfulCount,
          notHelpfulCount: updatedFAQ.notHelpfulCount,
        },
      });
    } catch (error) {
      logger.error('Error rating FAQ', {
        error: error instanceof Error ? error.message : 'Unknown error',
        faqId: req.params.id,
        requestBody: req.body,
      });
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request data',
      });
    }
  }

  // Get FAQ categories with counts
  async getFAQCategories(req: Request, res: Response): Promise<void> {
    try {
      const language = req.query.language as string || 'en';
      
      const categories = await db
        .select({
          category: faqs.category,
          count: sql`count(*)`,
          subcategories: sql`array_agg(DISTINCT sub_category) FILTER (WHERE sub_category IS NOT NULL)`,
        })
        .from(faqs)
        .where(
          and(
            eq(faqs.isActive, true),
            eq(faqs.language, language)
          )
        )
        .groupBy(faqs.category)
        .orderBy(sql`count(*) DESC`);

      res.json({
        success: true,
        categories,
        language,
      });
    } catch (error) {
      logger.error('Error fetching FAQ categories', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch FAQ categories',
      });
    }
  }

  // Get popular FAQs
  async getPopularFAQs(req: Request, res: Response): Promise<void> {
    try {
      const language = req.query.language as string || 'en';
      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 10;

      const whereConditions = [
        eq(faqs.isActive, true),
        eq(faqs.language, language),
      ];

      if (category) {
        whereConditions.push(eq(faqs.category, category));
      }

      const popularFAQs = await db
        .select({
          id: faqs.id,
          question: faqs.question,
          category: faqs.category,
          viewCount: faqs.viewCount,
          helpfulCount: faqs.helpfulCount,
          popularityScore: sql`(view_count * 0.7) + (helpful_count * 1.5)`,
        })
        .from(faqs)
        .where(and(...whereConditions))
        .orderBy(sql`popularity_score DESC`)
        .limit(limit);

      res.json({
        success: true,
        popularFAQs,
        language,
        category,
      });
    } catch (error) {
      logger.error('Error fetching popular FAQs', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular FAQs',
      });
    }
  }

  // Get FAQ analytics
  async getFAQAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const language = req.query.language as string;

      // Build filter conditions
      const whereConditions = [eq(faqs.isActive, true)];
      
      if (language) {
        whereConditions.push(eq(faqs.language, language));
      }
      
      if (startDate) {
        whereConditions.push(sql`${faqs.createdAt} >= ${startDate}`);
      }
      
      if (endDate) {
        whereConditions.push(sql`${faqs.createdAt} <= ${endDate}`);
      }

      // Get analytics data
      const [analytics] = await db
        .select({
          totalFAQs: sql`count(*)`,
          totalViews: sql`sum(view_count)`,
          totalHelpful: sql`sum(helpful_count)`,
          totalNotHelpful: sql`sum(not_helpful_count)`,
          avgHelpfulRatio: sql`
            CASE 
              WHEN sum(helpful_count + not_helpful_count) > 0 
              THEN (sum(helpful_count)::float / sum(helpful_count + not_helpful_count)) * 100
              ELSE 0 
            END
          `,
        })
        .from(faqs)
        .where(whereConditions.length ? and(...whereConditions) : undefined);

      // Get category breakdown
      const categoryAnalytics = await db
        .select({
          category: faqs.category,
          count: sql`count(*)`,
          totalViews: sql`sum(view_count)`,
          avgHelpfulRatio: sql`
            CASE 
              WHEN sum(helpful_count + not_helpful_count) > 0 
              THEN (sum(helpful_count)::float / sum(helpful_count + not_helpful_count)) * 100
              ELSE 0 
            END
          `,
        })
        .from(faqs)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .groupBy(faqs.category);

      // Get language breakdown
      const languageAnalytics = await db
        .select({
          language: faqs.language,
          count: sql`count(*)`,
          totalViews: sql`sum(view_count)`,
        })
        .from(faqs)
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .groupBy(faqs.language);

      res.json({
        success: true,
        analytics,
        categoryAnalytics,
        languageAnalytics,
        filters: {
          startDate,
          endDate,
          language,
        },
      });
    } catch (error) {
      logger.error('Error fetching FAQ analytics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch FAQ analytics',
      });
    }
  }

  // Private helper methods
  private async getFAQWithDetails(faqId: string) {
    const [faq] = await db
      .select({
        id: faqs.id,
        question: faqs.question,
        answer: faqs.answer,
        category: faqs.category,
        subCategory: faqs.subCategory,
        language: faqs.language,
        tags: faqs.tags,
        priority: faqs.priority,
        isActive: faqs.isActive,
        viewCount: faqs.viewCount,
        helpfulCount: faqs.helpfulCount,
        notHelpfulCount: faqs.notHelpfulCount,
        createdAt: faqs.createdAt,
        updatedAt: faqs.updatedAt,
        creator: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
        },
      })
      .from(faqs)
      .leftJoin(users, eq(faqs.createdBy, users.id))
      .where(eq(faqs.id, faqId))
      .limit(1);

    return faq;
  }

  private async incrementViewCount(faqId: string): Promise<void> {
    await db
      .update(faqs)
      .set({
        viewCount: sql`${faqs.viewCount} + 1`,
      })
      .where(eq(faqs.id, faqId));
  }

  private async getSearchSuggestions(query: string, language: string, category?: string): Promise<string[]> {
    const whereConditions = [
      eq(faqs.isActive, true),
      eq(faqs.language, language),
    ];

    if (category) {
      whereConditions.push(eq(faqs.category, category));
    }

    // Get tags that contain the search query
    const suggestions = await db
      .select({
        tags: faqs.tags,
      })
      .from(faqs)
      .where(
        and(
          ...whereConditions,
          sql`tags::text ILIKE ${`%${query}%`}`
        )
      )
      .limit(20);

    // Extract unique tags that match the query
    const allTags = suggestions.flatMap(item => item.tags || []);
    const matchingTags = allTags
      .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
      .filter((tag, index, self) => self.indexOf(tag) === index) // Remove duplicates
      .slice(0, 5);

    return matchingTags;
  }

  // Health check
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      service: 'faq-controller',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }
}