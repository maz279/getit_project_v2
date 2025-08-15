import { db } from '../../../../db';
import { 
  reportTemplates,
  users,
  type ReportTemplate,
  type InsertReportTemplate
} from '../../../../../shared/schema';
import { eq, and, desc, asc, like, sql, gte, lte, inArray, count, sum, avg } from 'drizzle-orm';

/**
 * Report Template Model - Amazon.com/Shopee.sg Level
 * Handles all report template operations and management
 * Provides comprehensive template creation, customization, and sharing capabilities
 */
export class ReportTemplateModel {
  
  /**
   * Get available report templates with filtering
   */
  async getReportTemplates(params: {
    category?: string;
    createdBy?: string;
    isPublic?: boolean;
    searchTerm?: string;
    sortBy?: 'name' | 'created_date' | 'usage_count' | 'rating';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    const { 
      category, 
      createdBy, 
      isPublic, 
      searchTerm, 
      sortBy = 'created_date', 
      sortOrder = 'desc',
      limit = 50,
      offset = 0 
    } = params;

    const templatesQuery = db
      .select({
        id: reportTemplates.id,
        name: reportTemplates.name,
        description: reportTemplates.description,
        category: reportTemplates.category,
        isPublic: reportTemplates.isPublic,
        isActive: reportTemplates.isActive,
        createdBy: reportTemplates.createdBy,
        creatorName: users.name,
        createdAt: reportTemplates.createdAt,
        updatedAt: reportTemplates.updatedAt,
        usageCount: reportTemplates.usageCount,
        rating: reportTemplates.rating,
        configuration: reportTemplates.configuration,
        thumbnail: reportTemplates.thumbnail,
        tags: reportTemplates.tags,
      })
      .from(reportTemplates)
      .leftJoin(users, eq(reportTemplates.createdBy, users.id))
      .where(
        and(
          eq(reportTemplates.isActive, true),
          category ? eq(reportTemplates.category, category) : undefined,
          createdBy ? eq(reportTemplates.createdBy, createdBy) : undefined,
          isPublic !== undefined ? eq(reportTemplates.isPublic, isPublic) : undefined,
          searchTerm ? 
            sql`(
              ${reportTemplates.name} ILIKE ${`%${searchTerm}%`} OR 
              ${reportTemplates.description} ILIKE ${`%${searchTerm}%`} OR 
              ${reportTemplates.tags} ILIKE ${`%${searchTerm}%`}
            )` : undefined
        )
      )
      .orderBy(
        sortOrder === 'desc' ? 
          desc(this.getSortColumn(sortBy)) : 
          asc(this.getSortColumn(sortBy))
      )
      .limit(limit)
      .offset(offset);

    return await templatesQuery;
  }

  /**
   * Get a specific report template by ID
   */
  async getReportTemplateById(id: string, userId?: string) {
    const templateQuery = db
      .select({
        id: reportTemplates.id,
        name: reportTemplates.name,
        description: reportTemplates.description,
        category: reportTemplates.category,
        isPublic: reportTemplates.isPublic,
        isActive: reportTemplates.isActive,
        createdBy: reportTemplates.createdBy,
        creatorName: users.name,
        createdAt: reportTemplates.createdAt,
        updatedAt: reportTemplates.updatedAt,
        usageCount: reportTemplates.usageCount,
        rating: reportTemplates.rating,
        configuration: reportTemplates.configuration,
        thumbnail: reportTemplates.thumbnail,
        tags: reportTemplates.tags,
        metadata: reportTemplates.metadata,
      })
      .from(reportTemplates)
      .leftJoin(users, eq(reportTemplates.createdBy, users.id))
      .where(
        and(
          eq(reportTemplates.id, id),
          eq(reportTemplates.isActive, true),
          // Access control: public templates or user's own templates
          userId ? 
            sql`(${reportTemplates.isPublic} = true OR ${reportTemplates.createdBy} = ${userId})` :
            eq(reportTemplates.isPublic, true)
        )
      );

    const [template] = await templateQuery;
    
    if (template) {
      // Increment usage count
      await this.incrementUsageCount(id);
    }

    return template;
  }

  /**
   * Create a new report template
   */
  async createReportTemplate(data: InsertReportTemplate) {
    // Validate configuration structure
    if (data.configuration && !this.validateConfiguration(data.configuration)) {
      throw new Error('Invalid report configuration structure');
    }

    // Set default values
    const templateData = {
      ...data,
      isActive: data.isActive ?? true,
      isPublic: data.isPublic ?? false,
      usageCount: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const [createdTemplate] = await db
      .insert(reportTemplates)
      .values(templateData)
      .returning();

    return createdTemplate;
  }

  /**
   * Update an existing report template
   */
  async updateReportTemplate(
    id: string, 
    data: Partial<InsertReportTemplate>, 
    userId: string
  ) {
    // Check if user has permission to update
    const [existingTemplate] = await db
      .select({ createdBy: reportTemplates.createdBy })
      .from(reportTemplates)
      .where(eq(reportTemplates.id, id));

    if (!existingTemplate || existingTemplate.createdBy !== userId) {
      throw new Error('Unauthorized to update this template');
    }

    // Validate configuration if provided
    if (data.configuration && !this.validateConfiguration(data.configuration)) {
      throw new Error('Invalid report configuration structure');
    }

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const [updatedTemplate] = await db
      .update(reportTemplates)
      .set(updateData)
      .where(eq(reportTemplates.id, id))
      .returning();

    return updatedTemplate;
  }

  /**
   * Delete a report template (soft delete)
   */
  async deleteReportTemplate(id: string, userId: string) {
    // Check if user has permission to delete
    const [existingTemplate] = await db
      .select({ createdBy: reportTemplates.createdBy })
      .from(reportTemplates)
      .where(eq(reportTemplates.id, id));

    if (!existingTemplate || existingTemplate.createdBy !== userId) {
      throw new Error('Unauthorized to delete this template');
    }

    await db
      .update(reportTemplates)
      .set({ 
        isActive: false, 
        updatedAt: new Date().toISOString() 
      })
      .where(eq(reportTemplates.id, id));

    return { success: true, message: 'Template deleted successfully' };
  }

  /**
   * Duplicate a report template
   */
  async duplicateReportTemplate(id: string, userId: string, customizations?: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }) {
    const originalTemplate = await this.getReportTemplateById(id, userId);
    
    if (!originalTemplate) {
      throw new Error('Template not found or access denied');
    }

    const duplicatedData: InsertReportTemplate = {
      name: customizations?.name || `Copy of ${originalTemplate.name}`,
      description: customizations?.description || originalTemplate.description,
      category: originalTemplate.category,
      configuration: originalTemplate.configuration,
      isPublic: customizations?.isPublic ?? false,
      createdBy: userId,
      tags: originalTemplate.tags,
      metadata: {
        ...originalTemplate.metadata,
        originalTemplateId: originalTemplate.id,
        duplicatedAt: new Date().toISOString(),
      },
    };

    return await this.createReportTemplate(duplicatedData);
  }

  /**
   * Rate a report template
   */
  async rateReportTemplate(id: string, userId: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if template exists and is accessible
    const template = await this.getReportTemplateById(id, userId);
    if (!template) {
      throw new Error('Template not found or access denied');
    }

    // For simplicity, we'll update the average rating directly
    // In a production system, you'd store individual ratings and calculate averages
    const currentRating = template.rating || 0;
    const currentUsage = template.usageCount || 1;
    
    // Simple running average calculation
    const newRating = ((currentRating * currentUsage) + rating) / (currentUsage + 1);

    await db
      .update(reportTemplates)
      .set({ 
        rating: Math.round(newRating * 100) / 100, // Round to 2 decimal places
        updatedAt: new Date().toISOString() 
      })
      .where(eq(reportTemplates.id, id));

    return { success: true, newRating };
  }

  /**
   * Get template categories with counts
   */
  async getTemplateCategories() {
    return await db
      .select({
        category: reportTemplates.category,
        count: sql<number>`COUNT(*)`,
        publicCount: sql<number>`COUNT(CASE WHEN ${reportTemplates.isPublic} = true THEN 1 END)`,
        averageRating: sql<number>`ROUND(COALESCE(AVG(${reportTemplates.rating}), 0), 2)`,
      })
      .from(reportTemplates)
      .where(eq(reportTemplates.isActive, true))
      .groupBy(reportTemplates.category)
      .orderBy(desc(sql`COUNT(*)`));
  }

  /**
   * Get popular report templates
   */
  async getPopularReportTemplates(limit: number = 10) {
    return await db
      .select({
        id: reportTemplates.id,
        name: reportTemplates.name,
        description: reportTemplates.description,
        category: reportTemplates.category,
        usageCount: reportTemplates.usageCount,
        rating: reportTemplates.rating,
        creatorName: users.name,
        thumbnail: reportTemplates.thumbnail,
        tags: reportTemplates.tags,
      })
      .from(reportTemplates)
      .leftJoin(users, eq(reportTemplates.createdBy, users.id))
      .where(
        and(
          eq(reportTemplates.isActive, true),
          eq(reportTemplates.isPublic, true)
        )
      )
      .orderBy(
        desc(sql`${reportTemplates.usageCount} + ${reportTemplates.rating} * 10`)
      )
      .limit(limit);
  }

  /**
   * Search report templates with advanced filters
   */
  async searchReportTemplates(params: {
    query: string;
    filters: {
      categories?: string[];
      tags?: string[];
      ratingMin?: number;
      dateFrom?: Date;
      dateTo?: Date;
    };
    limit?: number;
    offset?: number;
  }) {
    const { query, filters, limit = 20, offset = 0 } = params;

    return await db
      .select({
        id: reportTemplates.id,
        name: reportTemplates.name,
        description: reportTemplates.description,
        category: reportTemplates.category,
        rating: reportTemplates.rating,
        usageCount: reportTemplates.usageCount,
        creatorName: users.name,
        createdAt: reportTemplates.createdAt,
        tags: reportTemplates.tags,
        thumbnail: reportTemplates.thumbnail,
        // Search relevance score
        relevanceScore: sql<number>`
          (
            CASE WHEN ${reportTemplates.name} ILIKE ${`%${query}%`} THEN 3 ELSE 0 END +
            CASE WHEN ${reportTemplates.description} ILIKE ${`%${query}%`} THEN 2 ELSE 0 END +
            CASE WHEN ${reportTemplates.tags} ILIKE ${`%${query}%`} THEN 1 ELSE 0 END
          ) * (1 + ${reportTemplates.rating} / 5 + ${reportTemplates.usageCount} / 100)
        `,
      })
      .from(reportTemplates)
      .leftJoin(users, eq(reportTemplates.createdBy, users.id))
      .where(
        and(
          eq(reportTemplates.isActive, true),
          eq(reportTemplates.isPublic, true),
          sql`(
            ${reportTemplates.name} ILIKE ${`%${query}%`} OR 
            ${reportTemplates.description} ILIKE ${`%${query}%`} OR 
            ${reportTemplates.tags} ILIKE ${`%${query}%`}
          )`,
          filters.categories && filters.categories.length > 0 ? 
            inArray(reportTemplates.category, filters.categories) : undefined,
          filters.ratingMin ? gte(reportTemplates.rating, filters.ratingMin) : undefined,
          filters.dateFrom ? gte(reportTemplates.createdAt, filters.dateFrom.toISOString()) : undefined,
          filters.dateTo ? lte(reportTemplates.createdAt, filters.dateTo.toISOString()) : undefined
        )
      )
      .orderBy(desc(sql`relevanceScore`))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get template usage analytics
   */
  async getTemplateUsageAnalytics(templateId?: string) {
    const usageQuery = db
      .select({
        templateId: reportTemplates.id,
        templateName: reportTemplates.name,
        totalUsage: reportTemplates.usageCount,
        averageRating: reportTemplates.rating,
        category: reportTemplates.category,
        isPublic: reportTemplates.isPublic,
        createdAt: reportTemplates.createdAt,
        // Calculate usage growth (simplified)
        usageGrowth: sql<number>`
          CASE 
            WHEN ${reportTemplates.createdAt} >= NOW() - INTERVAL '30 days' THEN 
              ${reportTemplates.usageCount}
            ELSE 
              ROUND(${reportTemplates.usageCount} * 0.1)
          END
        `,
      })
      .from(reportTemplates)
      .where(
        and(
          eq(reportTemplates.isActive, true),
          templateId ? eq(reportTemplates.id, templateId) : undefined
        )
      )
      .orderBy(desc(reportTemplates.usageCount));

    return await usageQuery;
  }

  // Helper methods
  private async incrementUsageCount(id: string) {
    await db
      .update(reportTemplates)
      .set({ 
        usageCount: sql`${reportTemplates.usageCount} + 1`,
        updatedAt: new Date().toISOString()
      })
      .where(eq(reportTemplates.id, id));
  }

  private getSortColumn(sortBy: string) {
    switch (sortBy) {
      case 'name':
        return reportTemplates.name;
      case 'usage_count':
        return reportTemplates.usageCount;
      case 'rating':
        return reportTemplates.rating;
      case 'created_date':
      default:
        return reportTemplates.createdAt;
    }
  }

  private validateConfiguration(configuration: any): boolean {
    // Basic validation for report configuration structure
    if (!configuration || typeof configuration !== 'object') {
      return false;
    }

    // Required fields for a valid report configuration
    const requiredFields = ['reportType', 'dataSource', 'visualizations'];
    
    for (const field of requiredFields) {
      if (!(field in configuration)) {
        return false;
      }
    }

    // Validate report type
    const validReportTypes = [
      'sales_analytics', 
      'customer_analytics', 
      'product_analytics', 
      'vendor_analytics', 
      'marketing_analytics',
      'financial_report',
      'operational_report',
      'executive_summary'
    ];

    if (!validReportTypes.includes(configuration.reportType)) {
      return false;
    }

    // Validate data source
    if (!configuration.dataSource || typeof configuration.dataSource !== 'object') {
      return false;
    }

    // Validate visualizations array
    if (!Array.isArray(configuration.visualizations) || configuration.visualizations.length === 0) {
      return false;
    }

    return true;
  }
}