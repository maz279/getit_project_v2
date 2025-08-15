import { db } from '../../../../db';
import { 
  analyticsEvents,
  users,
  userSessions,
  type AnalyticsEvent,
  type InsertAnalyticsEvent
} from '../../../../../shared/schema';
import { eq, and, desc, asc, like, sql, gte, lte, inArray, count, sum, avg } from 'drizzle-orm';

/**
 * Analytics Event Model - Amazon.com/Shopee.sg Level
 * Handles all event tracking and analytics data operations
 * Provides comprehensive event capture, processing, and analysis capabilities
 */
export class AnalyticsEventModel {
  
  /**
   * Record a new analytics event
   */
  async recordEvent(data: InsertAnalyticsEvent) {
    // Validate event data
    if (!this.validateEventData(data)) {
      throw new Error('Invalid event data structure');
    }

    // Enrich event with additional metadata
    const enrichedData = await this.enrichEventData(data);

    const [recordedEvent] = await db
      .insert(analyticsEvents)
      .values(enrichedData)
      .returning();

    // Trigger real-time processing if needed
    await this.processEventInRealTime(recordedEvent);

    return recordedEvent;
  }

  /**
   * Record multiple events in batch
   */
  async recordEventsBatch(events: InsertAnalyticsEvent[]) {
    // Validate all events
    const invalidEvents = events.filter(event => !this.validateEventData(event));
    if (invalidEvents.length > 0) {
      throw new Error(`Invalid events found: ${invalidEvents.length} out of ${events.length}`);
    }

    // Enrich all events
    const enrichedEvents = await Promise.all(
      events.map(event => this.enrichEventData(event))
    );

    const recordedEvents = await db
      .insert(analyticsEvents)
      .values(enrichedEvents)
      .returning();

    // Process high-priority events in real-time
    const highPriorityEvents = recordedEvents.filter(event => 
      ['purchase', 'signup', 'critical_error'].includes(event.eventName)
    );

    await Promise.all(
      highPriorityEvents.map(event => this.processEventInRealTime(event))
    );

    return {
      totalRecorded: recordedEvents.length,
      highPriorityProcessed: highPriorityEvents.length,
      events: recordedEvents
    };
  }

  /**
   * Get events with filtering and aggregation
   */
  async getEvents(params: {
    eventName?: string;
    eventCategory?: string;
    userId?: string;
    sessionId?: string;
    timeRange?: { startDate: Date; endDate: Date };
    properties?: Record<string, any>;
    sortBy?: 'timestamp' | 'event_name' | 'user_id';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    const { 
      eventName, 
      eventCategory, 
      userId, 
      sessionId, 
      timeRange, 
      properties,
      sortBy = 'timestamp', 
      sortOrder = 'desc',
      limit = 100,
      offset = 0 
    } = params;

    const eventsQuery = db
      .select({
        id: analyticsEvents.id,
        eventName: analyticsEvents.eventName,
        eventCategory: analyticsEvents.eventCategory,
        userId: analyticsEvents.userId,
        sessionId: analyticsEvents.sessionId,
        timestamp: analyticsEvents.timestamp,
        properties: analyticsEvents.properties,
        userAgent: analyticsEvents.userAgent,
        ipAddress: analyticsEvents.ipAddress,
        referrer: analyticsEvents.referrer,
        pageUrl: analyticsEvents.pageUrl,
        deviceType: analyticsEvents.deviceType,
        browser: analyticsEvents.browser,
        operatingSystem: analyticsEvents.operatingSystem,
        country: analyticsEvents.country,
        city: analyticsEvents.city,
        isProcessed: analyticsEvents.isProcessed,
        metadata: analyticsEvents.metadata,
        userName: users.name,
      })
      .from(analyticsEvents)
      .leftJoin(users, eq(analyticsEvents.userId, users.id))
      .where(
        and(
          eventName ? eq(analyticsEvents.eventName, eventName) : undefined,
          eventCategory ? eq(analyticsEvents.eventCategory, eventCategory) : undefined,
          userId ? eq(analyticsEvents.userId, userId) : undefined,
          sessionId ? eq(analyticsEvents.sessionId, sessionId) : undefined,
          timeRange ? gte(analyticsEvents.timestamp, timeRange.startDate.toISOString()) : undefined,
          timeRange ? lte(analyticsEvents.timestamp, timeRange.endDate.toISOString()) : undefined,
          properties ? this.buildPropertiesWhere(properties) : undefined
        )
      )
      .orderBy(
        sortOrder === 'desc' ? 
          desc(this.getSortColumn(sortBy)) : 
          asc(this.getSortColumn(sortBy))
      )
      .limit(limit)
      .offset(offset);

    return await eventsQuery;
  }

  /**
   * Get event analytics with aggregations
   */
  async getEventAnalytics(params: {
    eventNames?: string[];
    eventCategories?: string[];
    timeRange: { startDate: Date; endDate: Date };
    groupBy?: 'hour' | 'day' | 'week' | 'month';
    includeUserMetrics?: boolean;
    includeDeviceMetrics?: boolean;
    includeLocationMetrics?: boolean;
  }) {
    const { 
      eventNames, 
      eventCategories, 
      timeRange, 
      groupBy = 'day',
      includeUserMetrics = false,
      includeDeviceMetrics = false,
      includeLocationMetrics = false
    } = params;

    let groupByClause: any;
    switch (groupBy) {
      case 'hour':
        groupByClause = sql`DATE_TRUNC('hour', ${analyticsEvents.timestamp})`;
        break;
      case 'week':
        groupByClause = sql`DATE_TRUNC('week', ${analyticsEvents.timestamp})`;
        break;
      case 'month':
        groupByClause = sql`DATE_TRUNC('month', ${analyticsEvents.timestamp})`;
        break;
      default:
        groupByClause = sql`DATE(${analyticsEvents.timestamp})`;
    }

    const analyticsQuery = db
      .select({
        period: groupByClause,
        eventName: analyticsEvents.eventName,
        eventCategory: analyticsEvents.eventCategory,
        totalEvents: sql<number>`COUNT(*)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${analyticsEvents.userId})`,
        uniqueSessions: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})`,
        ...(includeDeviceMetrics ? {
          mobileEvents: sql<number>`COUNT(CASE WHEN ${analyticsEvents.deviceType} = 'mobile' THEN 1 END)`,
          desktopEvents: sql<number>`COUNT(CASE WHEN ${analyticsEvents.deviceType} = 'desktop' THEN 1 END)`,
          tabletEvents: sql<number>`COUNT(CASE WHEN ${analyticsEvents.deviceType} = 'tablet' THEN 1 END)`,
        } : {}),
        ...(includeLocationMetrics ? {
          topCountry: sql<string>`MODE() WITHIN GROUP (ORDER BY ${analyticsEvents.country})`,
          topCity: sql<string>`MODE() WITHIN GROUP (ORDER BY ${analyticsEvents.city})`,
        } : {}),
      })
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.timestamp, timeRange.startDate.toISOString()),
          lte(analyticsEvents.timestamp, timeRange.endDate.toISOString()),
          eventNames && eventNames.length > 0 ? 
            inArray(analyticsEvents.eventName, eventNames) : undefined,
          eventCategories && eventCategories.length > 0 ? 
            inArray(analyticsEvents.eventCategory, eventCategories) : undefined
        )
      )
      .groupBy(groupByClause, analyticsEvents.eventName, analyticsEvents.eventCategory)
      .orderBy(groupByClause, analyticsEvents.eventName);

    return await analyticsQuery;
  }

  /**
   * Get funnel analysis for a sequence of events
   */
  async getFunnelAnalysis(params: {
    funnelSteps: string[];
    timeRange: { startDate: Date; endDate: Date };
    timeWindow?: number; // Hours within which all steps must complete
    groupBy?: 'user' | 'session';
  }) {
    const { funnelSteps, timeRange, timeWindow = 24, groupBy = 'session' } = params;

    if (funnelSteps.length < 2) {
      throw new Error('Funnel analysis requires at least 2 steps');
    }

    const groupByColumn = groupBy === 'user' ? analyticsEvents.userId : analyticsEvents.sessionId;

    // Build funnel query with CTEs for each step
    const funnelQuery = db
      .select({
        [`${groupBy}Id`]: groupByColumn,
        ...funnelSteps.reduce((acc, step, index) => {
          acc[`step${index + 1}_completed`] = sql<boolean>`
            BOOL_OR(CASE WHEN ${analyticsEvents.eventName} = ${step} THEN true ELSE false END)
          `;
          acc[`step${index + 1}_timestamp`] = sql<string>`
            MIN(CASE WHEN ${analyticsEvents.eventName} = ${step} THEN ${analyticsEvents.timestamp} END)
          `;
          return acc;
        }, {} as Record<string, any>)
      })
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.timestamp, timeRange.startDate.toISOString()),
          lte(analyticsEvents.timestamp, timeRange.endDate.toISOString()),
          inArray(analyticsEvents.eventName, funnelSteps)
        )
      )
      .groupBy(groupByColumn);

    const funnelData = await funnelQuery;

    // Calculate funnel metrics
    const funnelMetrics = this.calculateFunnelMetrics(funnelData, funnelSteps, timeWindow);

    return funnelMetrics;
  }

  /**
   * Get cohort analysis based on events
   */
  async getCohortAnalysis(params: {
    cohortEvent: string; // Event that defines cohort (e.g., 'signup')
    returnEvent: string; // Event that defines return (e.g., 'login')
    timeRange: { startDate: Date; endDate: Date };
    cohortPeriod: 'week' | 'month';
    analysisPeriods: number; // Number of periods to analyze
  }) {
    const { cohortEvent, returnEvent, timeRange, cohortPeriod, analysisPeriods } = params;

    const periodTrunc = cohortPeriod === 'week' ? 'week' : 'month';

    // Get cohorts (users who performed the cohort event)
    const cohortsQuery = db
      .select({
        userId: analyticsEvents.userId,
        cohortPeriod: sql<string>`DATE_TRUNC('${sql.raw(periodTrunc)}', ${analyticsEvents.timestamp})`,
        cohortDate: sql<string>`MIN(${analyticsEvents.timestamp})`,
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventName, cohortEvent),
          gte(analyticsEvents.timestamp, timeRange.startDate.toISOString()),
          lte(analyticsEvents.timestamp, timeRange.endDate.toISOString())
        )
      )
      .groupBy(analyticsEvents.userId, sql`DATE_TRUNC('${sql.raw(periodTrunc)}', ${analyticsEvents.timestamp})`);

    const cohorts = await cohortsQuery;

    // Get return events for cohort users
    const cohortUserIds = cohorts.map(c => c.userId);
    
    if (cohortUserIds.length === 0) {
      return { cohorts: [], retention: [] };
    }

    const returnEventsQuery = db
      .select({
        userId: analyticsEvents.userId,
        eventPeriod: sql<string>`DATE_TRUNC('${sql.raw(periodTrunc)}', ${analyticsEvents.timestamp})`,
        eventDate: analyticsEvents.timestamp,
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventName, returnEvent),
          inArray(analyticsEvents.userId, cohortUserIds),
          gte(analyticsEvents.timestamp, timeRange.startDate.toISOString())
        )
      );

    const returnEvents = await returnEventsQuery;

    // Calculate retention rates
    const retentionData = this.calculateCohortRetention(cohorts, returnEvents, analysisPeriods, cohortPeriod);

    return retentionData;
  }

  /**
   * Get real-time event stream
   */
  async getRealTimeEventStream(params: {
    eventTypes?: string[];
    lastEventId?: string;
    limit?: number;
  }) {
    const { eventTypes, lastEventId, limit = 50 } = params;

    return await db
      .select({
        id: analyticsEvents.id,
        eventName: analyticsEvents.eventName,
        eventCategory: analyticsEvents.eventCategory,
        userId: analyticsEvents.userId,
        timestamp: analyticsEvents.timestamp,
        properties: analyticsEvents.properties,
        deviceType: analyticsEvents.deviceType,
        country: analyticsEvents.country,
        isProcessed: analyticsEvents.isProcessed,
      })
      .from(analyticsEvents)
      .where(
        and(
          eventTypes && eventTypes.length > 0 ? 
            inArray(analyticsEvents.eventName, eventTypes) : undefined,
          lastEventId ? sql`${analyticsEvents.id} > ${lastEventId}` : undefined
        )
      )
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(limit);
  }

  /**
   * Get event performance metrics
   */
  async getEventPerformanceMetrics(params: {
    timeRange: { startDate: Date; endDate: Date };
    includeProcessingTimes?: boolean;
  }) {
    const { timeRange, includeProcessingTimes = false } = params;

    const metricsQuery = db
      .select({
        totalEvents: sql<number>`COUNT(*)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${analyticsEvents.userId})`,
        uniqueSessions: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})`,
        processedEvents: sql<number>`COUNT(CASE WHEN ${analyticsEvents.isProcessed} = true THEN 1 END)`,
        processingRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${analyticsEvents.isProcessed} = true THEN 1 END)::float / 
             COUNT(*)::float) * 100, 
            2
          )
        `,
        eventsPerHour: sql<number>`
          ROUND(
            COUNT(*)::float / 
            GREATEST(EXTRACT(EPOCH FROM ('${timeRange.endDate.toISOString()}'::timestamp - '${timeRange.startDate.toISOString()}'::timestamp)) / 3600, 1),
            2
          )
        `,
        topEventName: sql<string>`
          (SELECT event_name FROM ${analyticsEvents} ae2 
           WHERE ae2.timestamp >= '${timeRange.startDate.toISOString()}'
           AND ae2.timestamp <= '${timeRange.endDate.toISOString()}'
           GROUP BY ae2.event_name 
           ORDER BY COUNT(*) DESC LIMIT 1)
        `,
        topEventCategory: sql<string>`
          (SELECT event_category FROM ${analyticsEvents} ae2 
           WHERE ae2.timestamp >= '${timeRange.startDate.toISOString()}'
           AND ae2.timestamp <= '${timeRange.endDate.toISOString()}'
           GROUP BY ae2.event_category 
           ORDER BY COUNT(*) DESC LIMIT 1)
        `,
      })
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.timestamp, timeRange.startDate.toISOString()),
          lte(analyticsEvents.timestamp, timeRange.endDate.toISOString())
        )
      );

    const [metrics] = await metricsQuery;
    return metrics;
  }

  /**
   * Mark events as processed
   */
  async markEventsAsProcessed(eventIds: string[]) {
    await db
      .update(analyticsEvents)
      .set({ 
        isProcessed: true,
        metadata: sql`COALESCE(${analyticsEvents.metadata}, '{}')::jsonb || '{"processedAt": "${new Date().toISOString()}"}'::jsonb`
      })
      .where(inArray(analyticsEvents.id, eventIds));

    return { processedCount: eventIds.length };
  }

  // Helper methods
  private validateEventData(data: InsertAnalyticsEvent): boolean {
    // Required fields validation
    if (!data.eventName || !data.eventCategory || !data.timestamp) {
      return false;
    }

    // Event name validation (should be lowercase with underscores)
    if (!/^[a-z_]+$/.test(data.eventName)) {
      return false;
    }

    // Timestamp validation
    const timestamp = new Date(data.timestamp);
    if (isNaN(timestamp.getTime())) {
      return false;
    }

    // Properties validation (should be valid JSON)
    if (data.properties && typeof data.properties !== 'object') {
      return false;
    }

    return true;
  }

  private async enrichEventData(data: InsertAnalyticsEvent): Promise<InsertAnalyticsEvent> {
    const enriched = { ...data };

    // Add server-side timestamp if not provided
    if (!enriched.timestamp) {
      enriched.timestamp = new Date().toISOString();
    }

    // Extract device information from user agent
    if (enriched.userAgent) {
      const deviceInfo = this.parseUserAgent(enriched.userAgent);
      enriched.deviceType = enriched.deviceType || deviceInfo.deviceType;
      enriched.browser = enriched.browser || deviceInfo.browser;
      enriched.operatingSystem = enriched.operatingSystem || deviceInfo.operatingSystem;
    }

    // Add geolocation data (simplified - would use proper IP geolocation service)
    if (enriched.ipAddress && !enriched.country) {
      const geoData = await this.getGeolocationFromIP(enriched.ipAddress);
      enriched.country = geoData.country;
      enriched.city = geoData.city;
    }

    // Set processing status
    enriched.isProcessed = false;

    return enriched;
  }

  private async processEventInRealTime(event: AnalyticsEvent) {
    // Real-time processing logic would go here
    // This could include:
    // - Triggering alerts
    // - Updating real-time dashboards
    // - Processing business rules
    // - Sending notifications

    console.log(`Real-time processing for event: ${event.eventName}`);
  }

  private buildPropertiesWhere(properties: Record<string, any>) {
    // Build JSON property queries
    const conditions = Object.entries(properties).map(([key, value]) => 
      sql`${analyticsEvents.properties}->>${key} = ${value.toString()}`
    );

    return conditions.length > 0 ? sql`(${sql.join(conditions, sql` AND `)})` : undefined;
  }

  private getSortColumn(sortBy: string) {
    switch (sortBy) {
      case 'event_name':
        return analyticsEvents.eventName;
      case 'user_id':
        return analyticsEvents.userId;
      case 'timestamp':
      default:
        return analyticsEvents.timestamp;
    }
  }

  private calculateFunnelMetrics(funnelData: any[], funnelSteps: string[], timeWindow: number) {
    const totalUsers = funnelData.length;
    const stepCompletions = funnelSteps.map((_, index) => {
      const stepColumn = `step${index + 1}_completed`;
      return funnelData.filter(user => user[stepColumn]).length;
    });

    const conversionRates = stepCompletions.map((completions, index) => {
      if (index === 0) return 100; // First step is 100% by definition
      return (completions / stepCompletions[0]) * 100;
    });

    const dropoffRates = conversionRates.map((rate, index) => {
      if (index === 0) return 0;
      return conversionRates[index - 1] - rate;
    });

    return {
      totalUsers,
      steps: funnelSteps.map((step, index) => ({
        step: step,
        completions: stepCompletions[index],
        conversionRate: Math.round(conversionRates[index] * 100) / 100,
        dropoffRate: Math.round(dropoffRates[index] * 100) / 100,
      })),
    };
  }

  private calculateCohortRetention(cohorts: any[], returnEvents: any[], analysisPeriods: number, cohortPeriod: string) {
    // Group cohorts by period
    const cohortGroups = cohorts.reduce((acc, cohort) => {
      const period = cohort.cohortPeriod;
      if (!acc[period]) acc[period] = [];
      acc[period].push(cohort);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate retention for each cohort
    const retentionData = Object.entries(cohortGroups).map(([period, cohortUsers]) => {
      const retentionRates = [];
      
      for (let periodOffset = 0; periodOffset < analysisPeriods; periodOffset++) {
        const targetPeriod = this.addPeriods(period, periodOffset, cohortPeriod);
        const activeUsers = returnEvents.filter(event => 
          cohortUsers.some(user => user.userId === event.userId) &&
          event.eventPeriod === targetPeriod
        );

        const retentionRate = (activeUsers.length / cohortUsers.length) * 100;
        retentionRates.push(Math.round(retentionRate * 100) / 100);
      }

      return {
        cohortPeriod: period,
        cohortSize: cohortUsers.length,
        retentionRates,
      };
    });

    return {
      cohorts: retentionData,
      retention: retentionData
    };
  }

  private parseUserAgent(userAgent: string) {
    // Simplified user agent parsing - would use a proper library in production
    const mobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const tablet = /iPad|Android(?!.*Mobile)/.test(userAgent);
    
    let deviceType = 'desktop';
    if (tablet) deviceType = 'tablet';
    else if (mobile) deviceType = 'mobile';

    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' : 'Other';

    const operatingSystem = userAgent.includes('Windows') ? 'Windows' :
                           userAgent.includes('Mac') ? 'macOS' :
                           userAgent.includes('Linux') ? 'Linux' :
                           userAgent.includes('Android') ? 'Android' :
                           userAgent.includes('iOS') ? 'iOS' : 'Other';

    return { deviceType, browser, operatingSystem };
  }

  private async getGeolocationFromIP(ipAddress: string) {
    // Simplified geolocation - would use proper IP geolocation service
    // For now, return Bangladesh as default for demonstration
    return {
      country: 'Bangladesh',
      city: 'Dhaka'
    };
  }

  private addPeriods(basePeriod: string, offset: number, periodType: string): string {
    const date = new Date(basePeriod);
    
    if (periodType === 'week') {
      date.setDate(date.getDate() + (offset * 7));
    } else if (periodType === 'month') {
      date.setMonth(date.getMonth() + offset);
    }

    return periodType === 'week' ? 
      date.toISOString().split('T')[0] : // YYYY-MM-DD for week
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM for month
  }
}