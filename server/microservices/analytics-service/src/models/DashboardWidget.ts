import { db } from '../../../../db';
import { 
  dashboardWidgets,
  users,
  type DashboardWidget,
  type InsertDashboardWidget
} from '../../../../../shared/schema';
import { eq, and, desc, asc, like, sql, gte, lte, inArray, count, sum, avg } from 'drizzle-orm';

/**
 * Dashboard Widget Model - Amazon.com/Shopee.sg Level
 * Handles all dashboard widget operations and management
 * Provides comprehensive widget creation, layout management, and personalization
 */
export class DashboardWidgetModel {
  
  /**
   * Get dashboard widgets with filtering and ordering
   */
  async getDashboardWidgets(params: {
    userId?: string;
    dashboardId?: string;
    widgetType?: string;
    isActive?: boolean;
    sortBy?: 'position' | 'created_date' | 'usage_count';
    sortOrder?: 'asc' | 'desc';
  }) {
    const { 
      userId, 
      dashboardId, 
      widgetType, 
      isActive = true, 
      sortBy = 'position', 
      sortOrder = 'asc' 
    } = params;

    const widgetsQuery = db
      .select({
        id: dashboardWidgets.id,
        dashboardId: dashboardWidgets.dashboardId,
        widgetType: dashboardWidgets.widgetType,
        title: dashboardWidgets.title,
        description: dashboardWidgets.description,
        position: dashboardWidgets.position,
        size: dashboardWidgets.size,
        configuration: dashboardWidgets.configuration,
        isActive: dashboardWidgets.isActive,
        isVisible: dashboardWidgets.isVisible,
        createdBy: dashboardWidgets.createdBy,
        creatorName: users.name,
        createdAt: dashboardWidgets.createdAt,
        updatedAt: dashboardWidgets.updatedAt,
        usageCount: dashboardWidgets.usageCount,
        lastAccessed: dashboardWidgets.lastAccessed,
        refreshInterval: dashboardWidgets.refreshInterval,
        permissions: dashboardWidgets.permissions,
      })
      .from(dashboardWidgets)
      .leftJoin(users, eq(dashboardWidgets.createdBy, users.id))
      .where(
        and(
          userId ? eq(dashboardWidgets.createdBy, userId) : undefined,
          dashboardId ? eq(dashboardWidgets.dashboardId, dashboardId) : undefined,
          widgetType ? eq(dashboardWidgets.widgetType, widgetType) : undefined,
          eq(dashboardWidgets.isActive, isActive)
        )
      )
      .orderBy(
        sortOrder === 'desc' ? 
          desc(this.getSortColumn(sortBy)) : 
          asc(this.getSortColumn(sortBy))
      );

    return await widgetsQuery;
  }

  /**
   * Get a specific dashboard widget by ID
   */
  async getDashboardWidgetById(id: string, userId?: string) {
    const widgetQuery = db
      .select({
        id: dashboardWidgets.id,
        dashboardId: dashboardWidgets.dashboardId,
        widgetType: dashboardWidgets.widgetType,
        title: dashboardWidgets.title,
        description: dashboardWidgets.description,
        position: dashboardWidgets.position,
        size: dashboardWidgets.size,
        configuration: dashboardWidgets.configuration,
        isActive: dashboardWidgets.isActive,
        isVisible: dashboardWidgets.isVisible,
        createdBy: dashboardWidgets.createdBy,
        creatorName: users.name,
        createdAt: dashboardWidgets.createdAt,
        updatedAt: dashboardWidgets.updatedAt,
        usageCount: dashboardWidgets.usageCount,
        lastAccessed: dashboardWidgets.lastAccessed,
        refreshInterval: dashboardWidgets.refreshInterval,
        permissions: dashboardWidgets.permissions,
        dataSource: dashboardWidgets.dataSource,
        styling: dashboardWidgets.styling,
        metadata: dashboardWidgets.metadata,
      })
      .from(dashboardWidgets)
      .leftJoin(users, eq(dashboardWidgets.createdBy, users.id))
      .where(
        and(
          eq(dashboardWidgets.id, id),
          eq(dashboardWidgets.isActive, true),
          // Access control check
          userId ? this.buildAccessControlWhere(userId) : undefined
        )
      );

    const [widget] = await widgetQuery;
    
    if (widget) {
      // Update last accessed and usage count
      await this.updateWidgetAccess(id);
    }

    return widget;
  }

  /**
   * Create a new dashboard widget
   */
  async createDashboardWidget(data: InsertDashboardWidget) {
    // Validate widget configuration
    if (!this.validateWidgetConfiguration(data.widgetType, data.configuration)) {
      throw new Error('Invalid widget configuration for the specified widget type');
    }

    // Get next position for the dashboard
    const nextPosition = await this.getNextPosition(data.dashboardId);

    const widgetData = {
      ...data,
      position: data.position ?? nextPosition,
      isActive: data.isActive ?? true,
      isVisible: data.isVisible ?? true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    };

    const [createdWidget] = await db
      .insert(dashboardWidgets)
      .values(widgetData)
      .returning();

    return createdWidget;
  }

  /**
   * Update an existing dashboard widget
   */
  async updateDashboardWidget(
    id: string, 
    data: Partial<InsertDashboardWidget>, 
    userId: string
  ) {
    // Check if user has permission to update
    const hasPermission = await this.checkWidgetPermission(id, userId, 'edit');
    if (!hasPermission) {
      throw new Error('Unauthorized to update this widget');
    }

    // Validate configuration if provided
    if (data.configuration && data.widgetType) {
      if (!this.validateWidgetConfiguration(data.widgetType, data.configuration)) {
        throw new Error('Invalid widget configuration for the specified widget type');
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const [updatedWidget] = await db
      .update(dashboardWidgets)
      .set(updateData)
      .where(eq(dashboardWidgets.id, id))
      .returning();

    return updatedWidget;
  }

  /**
   * Delete a dashboard widget (soft delete)
   */
  async deleteDashboardWidget(id: string, userId: string) {
    const hasPermission = await this.checkWidgetPermission(id, userId, 'delete');
    if (!hasPermission) {
      throw new Error('Unauthorized to delete this widget');
    }

    await db
      .update(dashboardWidgets)
      .set({ 
        isActive: false, 
        updatedAt: new Date().toISOString() 
      })
      .where(eq(dashboardWidgets.id, id));

    return { success: true, message: 'Widget deleted successfully' };
  }

  /**
   * Update widget positions for dashboard layout management
   */
  async updateWidgetPositions(updates: Array<{ id: string; position: any; size?: any }>, userId: string) {
    const updatePromises = updates.map(async (update) => {
      const hasPermission = await this.checkWidgetPermission(update.id, userId, 'edit');
      if (!hasPermission) {
        throw new Error(`Unauthorized to update widget ${update.id}`);
      }

      return db
        .update(dashboardWidgets)
        .set({
          position: update.position,
          size: update.size || dashboardWidgets.size,
          updatedAt: new Date().toISOString()
        })
        .where(eq(dashboardWidgets.id, update.id));
    });

    await Promise.all(updatePromises);
    return { success: true, message: 'Widget positions updated successfully' };
  }

  /**
   * Duplicate a dashboard widget
   */
  async duplicateDashboardWidget(id: string, userId: string, customizations?: {
    title?: string;
    dashboardId?: string;
    position?: any;
  }) {
    const originalWidget = await this.getDashboardWidgetById(id, userId);
    
    if (!originalWidget) {
      throw new Error('Widget not found or access denied');
    }

    const nextPosition = await this.getNextPosition(
      customizations?.dashboardId || originalWidget.dashboardId
    );

    const duplicatedData: InsertDashboardWidget = {
      dashboardId: customizations?.dashboardId || originalWidget.dashboardId,
      widgetType: originalWidget.widgetType,
      title: customizations?.title || `Copy of ${originalWidget.title}`,
      description: originalWidget.description,
      position: customizations?.position || nextPosition,
      size: originalWidget.size,
      configuration: originalWidget.configuration,
      dataSource: originalWidget.dataSource,
      styling: originalWidget.styling,
      refreshInterval: originalWidget.refreshInterval,
      createdBy: userId,
      metadata: {
        ...originalWidget.metadata,
        originalWidgetId: originalWidget.id,
        duplicatedAt: new Date().toISOString(),
      },
    };

    return await this.createDashboardWidget(duplicatedData);
  }

  /**
   * Get widget analytics and usage statistics
   */
  async getWidgetAnalytics(params: {
    widgetId?: string;
    dashboardId?: string;
    timeRange?: { startDate: Date; endDate: Date };
    userId?: string;
  }) {
    const { widgetId, dashboardId, timeRange, userId } = params;

    const analyticsQuery = db
      .select({
        widgetId: dashboardWidgets.id,
        widgetType: dashboardWidgets.widgetType,
        title: dashboardWidgets.title,
        dashboardId: dashboardWidgets.dashboardId,
        usageCount: dashboardWidgets.usageCount,
        lastAccessed: dashboardWidgets.lastAccessed,
        createdAt: dashboardWidgets.createdAt,
        // Calculate usage metrics
        daysSinceCreated: sql<number>`
          EXTRACT(EPOCH FROM (NOW() - ${dashboardWidgets.createdAt})) / 86400
        `,
        daysSinceLastAccess: sql<number>`
          EXTRACT(EPOCH FROM (NOW() - ${dashboardWidgets.lastAccessed})) / 86400
        `,
        usageFrequency: sql<number>`
          CASE 
            WHEN EXTRACT(EPOCH FROM (NOW() - ${dashboardWidgets.createdAt})) / 86400 = 0 THEN ${dashboardWidgets.usageCount}
            ELSE ${dashboardWidgets.usageCount}::float / 
                 GREATEST(EXTRACT(EPOCH FROM (NOW() - ${dashboardWidgets.createdAt})) / 86400, 1)
          END
        `,
      })
      .from(dashboardWidgets)
      .where(
        and(
          eq(dashboardWidgets.isActive, true),
          widgetId ? eq(dashboardWidgets.id, widgetId) : undefined,
          dashboardId ? eq(dashboardWidgets.dashboardId, dashboardId) : undefined,
          userId ? eq(dashboardWidgets.createdBy, userId) : undefined,
          timeRange ? gte(dashboardWidgets.createdAt, timeRange.startDate.toISOString()) : undefined,
          timeRange ? lte(dashboardWidgets.createdAt, timeRange.endDate.toISOString()) : undefined
        )
      )
      .orderBy(desc(dashboardWidgets.usageCount));

    return await analyticsQuery;
  }

  /**
   * Get widget type statistics
   */
  async getWidgetTypeStatistics() {
    return await db
      .select({
        widgetType: dashboardWidgets.widgetType,
        totalWidgets: sql<number>`COUNT(*)`,
        activeWidgets: sql<number>`COUNT(CASE WHEN ${dashboardWidgets.isActive} = true THEN 1 END)`,
        averageUsage: sql<number>`ROUND(COALESCE(AVG(${dashboardWidgets.usageCount}), 0), 2)`,
        totalUsage: sql<number>`COALESCE(SUM(${dashboardWidgets.usageCount}), 0)`,
        mostUsedWidget: sql<string>`
          (SELECT title FROM ${dashboardWidgets} w2 
           WHERE w2.widget_type = ${dashboardWidgets.widgetType} 
           AND w2.is_active = true
           ORDER BY w2.usage_count DESC LIMIT 1)
        `,
      })
      .from(dashboardWidgets)
      .groupBy(dashboardWidgets.widgetType)
      .orderBy(desc(sql`totalUsage`));
  }

  /**
   * Get popular widget configurations as templates
   */
  async getPopularWidgetTemplates(widgetType?: string, limit: number = 10) {
    return await db
      .select({
        id: dashboardWidgets.id,
        widgetType: dashboardWidgets.widgetType,
        title: dashboardWidgets.title,
        description: dashboardWidgets.description,
        configuration: dashboardWidgets.configuration,
        styling: dashboardWidgets.styling,
        usageCount: dashboardWidgets.usageCount,
        creatorName: users.name,
        // Popularity score based on usage and uniqueness
        popularityScore: sql<number>`
          ${dashboardWidgets.usageCount} * 
          (1 + (5 - ROW_NUMBER() OVER (
            PARTITION BY ${dashboardWidgets.configuration}::text 
            ORDER BY ${dashboardWidgets.usageCount} DESC
          )) / 5)
        `,
      })
      .from(dashboardWidgets)
      .leftJoin(users, eq(dashboardWidgets.createdBy, users.id))
      .where(
        and(
          eq(dashboardWidgets.isActive, true),
          eq(dashboardWidgets.isVisible, true),
          gte(dashboardWidgets.usageCount, 5), // Minimum usage threshold
          widgetType ? eq(dashboardWidgets.widgetType, widgetType) : undefined
        )
      )
      .orderBy(desc(sql`popularityScore`))
      .limit(limit);
  }

  /**
   * Search widgets across dashboards
   */
  async searchWidgets(params: {
    query: string;
    widgetTypes?: string[];
    userId?: string;
    includeShared?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { query, widgetTypes, userId, includeShared = false, limit = 20, offset = 0 } = params;

    return await db
      .select({
        id: dashboardWidgets.id,
        title: dashboardWidgets.title,
        description: dashboardWidgets.description,
        widgetType: dashboardWidgets.widgetType,
        dashboardId: dashboardWidgets.dashboardId,
        usageCount: dashboardWidgets.usageCount,
        creatorName: users.name,
        createdAt: dashboardWidgets.createdAt,
        // Search relevance score
        relevanceScore: sql<number>`
          (
            CASE WHEN ${dashboardWidgets.title} ILIKE ${`%${query}%`} THEN 3 ELSE 0 END +
            CASE WHEN ${dashboardWidgets.description} ILIKE ${`%${query}%`} THEN 2 ELSE 0 END +
            CASE WHEN ${dashboardWidgets.widgetType} ILIKE ${`%${query}%`} THEN 1 ELSE 0 END
          ) * (1 + ${dashboardWidgets.usageCount} / 100)
        `,
      })
      .from(dashboardWidgets)
      .leftJoin(users, eq(dashboardWidgets.createdBy, users.id))
      .where(
        and(
          eq(dashboardWidgets.isActive, true),
          eq(dashboardWidgets.isVisible, true),
          sql`(
            ${dashboardWidgets.title} ILIKE ${`%${query}%`} OR 
            ${dashboardWidgets.description} ILIKE ${`%${query}%`} OR 
            ${dashboardWidgets.widgetType} ILIKE ${`%${query}%`}
          )`,
          widgetTypes && widgetTypes.length > 0 ? 
            inArray(dashboardWidgets.widgetType, widgetTypes) : undefined,
          userId && !includeShared ? 
            eq(dashboardWidgets.createdBy, userId) : undefined
        )
      )
      .orderBy(desc(sql`relevanceScore`))
      .limit(limit)
      .offset(offset);
  }

  // Helper methods
  private async updateWidgetAccess(id: string) {
    await db
      .update(dashboardWidgets)
      .set({ 
        usageCount: sql`${dashboardWidgets.usageCount} + 1`,
        lastAccessed: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(dashboardWidgets.id, id));
  }

  private async getNextPosition(dashboardId: string): Promise<any> {
    const [result] = await db
      .select({
        maxPosition: sql<number>`COALESCE(MAX((${dashboardWidgets.position}->>'row')::int), 0)`
      })
      .from(dashboardWidgets)
      .where(
        and(
          eq(dashboardWidgets.dashboardId, dashboardId),
          eq(dashboardWidgets.isActive, true)
        )
      );

    return {
      row: (result?.maxPosition || 0) + 1,
      col: 1,
      width: 12,
      height: 4
    };
  }

  private getSortColumn(sortBy: string) {
    switch (sortBy) {
      case 'created_date':
        return dashboardWidgets.createdAt;
      case 'usage_count':
        return dashboardWidgets.usageCount;
      case 'position':
      default:
        return sql`(${dashboardWidgets.position}->>'row')::int`;
    }
  }

  private buildAccessControlWhere(userId: string) {
    return sql`(
      ${dashboardWidgets.createdBy} = ${userId} OR
      ${dashboardWidgets.permissions}->>'public' = 'true' OR
      ${dashboardWidgets.permissions}->>'sharedUsers' @> '"${userId}"'
    )`;
  }

  private async checkWidgetPermission(widgetId: string, userId: string, action: 'view' | 'edit' | 'delete'): Promise<boolean> {
    const [widget] = await db
      .select({
        createdBy: dashboardWidgets.createdBy,
        permissions: dashboardWidgets.permissions,
      })
      .from(dashboardWidgets)
      .where(eq(dashboardWidgets.id, widgetId));

    if (!widget) return false;

    // Owner has all permissions
    if (widget.createdBy === userId) return true;

    // Check specific permissions
    const permissions = widget.permissions as any || {};
    
    if (action === 'view') {
      return permissions.public === true || 
             (permissions.sharedUsers && permissions.sharedUsers.includes(userId));
    }

    if (action === 'edit') {
      return permissions.editors && permissions.editors.includes(userId);
    }

    if (action === 'delete') {
      return false; // Only owner can delete
    }

    return false;
  }

  private validateWidgetConfiguration(widgetType: string, configuration: any): boolean {
    if (!configuration || typeof configuration !== 'object') {
      return false;
    }

    // Widget type specific validation
    switch (widgetType) {
      case 'chart':
        return this.validateChartConfig(configuration);
      case 'metric':
        return this.validateMetricConfig(configuration);
      case 'table':
        return this.validateTableConfig(configuration);
      case 'map':
        return this.validateMapConfig(configuration);
      case 'text':
        return this.validateTextConfig(configuration);
      default:
        return true; // Allow custom widget types
    }
  }

  private validateChartConfig(config: any): boolean {
    return !!(config.chartType && config.dataSource && config.dataMapping);
  }

  private validateMetricConfig(config: any): boolean {
    return !!(config.metric && config.dataSource);
  }

  private validateTableConfig(config: any): boolean {
    return !!(config.columns && Array.isArray(config.columns) && config.dataSource);
  }

  private validateMapConfig(config: any): boolean {
    return !!(config.mapType && config.dataSource && config.geoMapping);
  }

  private validateTextConfig(config: any): boolean {
    return !!(config.content || config.dataSource);
  }
}