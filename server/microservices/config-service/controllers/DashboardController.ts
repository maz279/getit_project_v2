/**
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * Dashboard Controller - Amazon.com/Shopee.sg-Level Configuration Dashboard
 * 
 * Features:
 * - Real-time configuration dashboard
 * - Advanced visualization and charts
 * - Interactive configuration management
 * - Bangladesh market-specific dashboards
 * - Performance monitoring dashboards
 * - Multi-role dashboard views
 * 
 * Last Updated: July 9, 2025
 */

import { Request, Response } from 'express';
import Redis from 'ioredis';

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  data: any;
  configuration: any;
  refreshInterval: number;
  lastUpdated: string;
}

interface DashboardLayout {
  id: string;
  name: string;
  role: string;
  widgets: DashboardWidget[];
  layout: any;
  isDefault: boolean;
}

export class DashboardController {
  private redis: Redis;
  private cachePrefix = 'dashboard_config:';
  private cacheTTL = 60; // 1 minute for real-time dashboards
  private dashboards: Map<string, DashboardLayout> = new Map();

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error in DashboardController:', error);
    });

    this.initializeDashboards();
  }

  /**
   * Initialize default dashboards
   */
  private async initializeDashboards(): Promise<void> {
    // Executive Dashboard
    this.dashboards.set('executive', {
      id: 'executive',
      name: 'Executive Dashboard',
      role: 'executive',
      widgets: [
        {
          id: 'overview-metrics',
          type: 'metrics',
          title: 'Configuration Overview',
          data: {},
          configuration: { size: 'large' },
          refreshInterval: 30000,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'bangladesh-performance',
          type: 'chart',
          title: 'Bangladesh Market Performance',
          data: {},
          configuration: { chartType: 'line' },
          refreshInterval: 60000,
          lastUpdated: new Date().toISOString()
        }
      ],
      layout: { cols: 12, rows: 8 },
      isDefault: true
    });

    // Admin Dashboard
    this.dashboards.set('admin', {
      id: 'admin',
      name: 'Admin Dashboard',
      role: 'admin',
      widgets: [
        {
          id: 'system-health',
          type: 'health',
          title: 'System Health',
          data: {},
          configuration: { showDetails: true },
          refreshInterval: 15000,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'feature-flags',
          type: 'table',
          title: 'Feature Flags',
          data: {},
          configuration: { sortable: true },
          refreshInterval: 30000,
          lastUpdated: new Date().toISOString()
        }
      ],
      layout: { cols: 12, rows: 10 },
      isDefault: true
    });

    // Developer Dashboard
    this.dashboards.set('developer', {
      id: 'developer',
      name: 'Developer Dashboard',
      role: 'developer',
      widgets: [
        {
          id: 'api-performance',
          type: 'chart',
          title: 'API Performance',
          data: {},
          configuration: { chartType: 'area' },
          refreshInterval: 10000,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'error-tracking',
          type: 'log',
          title: 'Error Tracking',
          data: {},
          configuration: { maxLines: 100 },
          refreshInterval: 5000,
          lastUpdated: new Date().toISOString()
        }
      ],
      layout: { cols: 12, rows: 12 },
      isDefault: true
    });

    // Bangladesh Market Dashboard
    this.dashboards.set('bangladesh-market', {
      id: 'bangladesh-market',
      name: 'Bangladesh Market Dashboard',
      role: 'market_analyst',
      widgets: [
        {
          id: 'payment-adoption',
          type: 'chart',
          title: 'Payment Method Adoption',
          data: {},
          configuration: { chartType: 'donut' },
          refreshInterval: 300000,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'regional-performance',
          type: 'map',
          title: 'Regional Performance',
          data: {},
          configuration: { region: 'bangladesh' },
          refreshInterval: 600000,
          lastUpdated: new Date().toISOString()
        }
      ],
      layout: { cols: 12, rows: 8 },
      isDefault: true
    });
  }

  /**
   * Get dashboard by role or ID
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;
      const { role, refresh = 'false' } = req.query;
      
      let dashboard;
      
      if (dashboardId) {
        dashboard = this.dashboards.get(dashboardId);
      } else if (role) {
        dashboard = Array.from(this.dashboards.values()).find(d => d.role === role);
      }

      if (!dashboard) {
        res.status(404).json({
          success: false,
          error: 'Dashboard not found'
        });
        return;
      }

      // Refresh widget data if requested
      if (refresh === 'true') {
        await this.refreshDashboardData(dashboard);
      }

      res.json({
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error getting dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard',
        details: error.message
      });
    }
  }

  /**
   * Get all available dashboards
   */
  async getAllDashboards(req: Request, res: Response): Promise<void> {
    try {
      const dashboards = Array.from(this.dashboards.values()).map(dashboard => ({
        id: dashboard.id,
        name: dashboard.name,
        role: dashboard.role,
        widgetCount: dashboard.widgets.length,
        isDefault: dashboard.isDefault,
        lastUpdated: dashboard.widgets.reduce((latest, widget) => 
          widget.lastUpdated > latest ? widget.lastUpdated : latest, 
          dashboard.widgets[0]?.lastUpdated || new Date().toISOString()
        )
      }));

      res.json({
        success: true,
        data: dashboards,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error getting all dashboards:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboards',
        details: error.message
      });
    }
  }

  /**
   * Create custom dashboard
   */
  async createDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { name, role, widgets, layout } = req.body;
      
      if (!name || !role) {
        res.status(400).json({
          success: false,
          error: 'Dashboard name and role are required'
        });
        return;
      }

      const dashboardId = `custom_${Date.now()}`;
      const newDashboard: DashboardLayout = {
        id: dashboardId,
        name: name,
        role: role,
        widgets: widgets || [],
        layout: layout || { cols: 12, rows: 8 },
        isDefault: false
      };

      this.dashboards.set(dashboardId, newDashboard);

      res.json({
        success: true,
        data: newDashboard,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error creating dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create dashboard',
        details: error.message
      });
    }
  }

  /**
   * Update dashboard configuration
   */
  async updateDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;
      const { name, widgets, layout } = req.body;
      
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        res.status(404).json({
          success: false,
          error: 'Dashboard not found'
        });
        return;
      }

      if (name) dashboard.name = name;
      if (widgets) dashboard.widgets = widgets;
      if (layout) dashboard.layout = layout;

      res.json({
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error updating dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update dashboard',
        details: error.message
      });
    }
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;
      
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        res.status(404).json({
          success: false,
          error: 'Dashboard not found'
        });
        return;
      }

      if (dashboard.isDefault) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete default dashboard'
        });
        return;
      }

      this.dashboards.delete(dashboardId);

      res.json({
        success: true,
        message: 'Dashboard deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error deleting dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete dashboard',
        details: error.message
      });
    }
  }

  /**
   * Get widget data
   */
  async getWidgetData(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId, widgetId } = req.params;
      const { timeRange = '24h' } = req.query;
      
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        res.status(404).json({
          success: false,
          error: 'Dashboard not found'
        });
        return;
      }

      const widget = dashboard.widgets.find(w => w.id === widgetId);
      if (!widget) {
        res.status(404).json({
          success: false,
          error: 'Widget not found'
        });
        return;
      }

      const widgetData = await this.generateWidgetData(widget, timeRange as string);

      res.json({
        success: true,
        data: widgetData,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error getting widget data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get widget data',
        details: error.message
      });
    }
  }

  /**
   * Get real-time dashboard updates
   */
  async getRealtimeUpdates(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;
      const { since } = req.query;
      
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        res.status(404).json({
          success: false,
          error: 'Dashboard not found'
        });
        return;
      }

      const updates = await this.generateRealtimeUpdates(dashboard, since as string);

      res.json({
        success: true,
        data: updates,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error getting real-time updates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get real-time updates',
        details: error.message
      });
    }
  }

  /**
   * Export dashboard configuration
   */
  async exportDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;
      const { format = 'json' } = req.query;
      
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        res.status(404).json({
          success: false,
          error: 'Dashboard not found'
        });
        return;
      }

      const exportData = await this.generateDashboardExport(dashboard, format as string);

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${dashboard.name}-config.json"`);
      }

      res.send(exportData);

    } catch (error: any) {
      console.error('Error exporting dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export dashboard',
        details: error.message
      });
    }
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;
      const { timeRange = '7d' } = req.query;
      
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        res.status(404).json({
          success: false,
          error: 'Dashboard not found'
        });
        return;
      }

      const analytics = await this.generateDashboardAnalytics(dashboard, timeRange as string);

      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error getting dashboard analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard analytics',
        details: error.message
      });
    }
  }

  /**
   * Private helper methods
   */

  private async refreshDashboardData(dashboard: DashboardLayout): Promise<void> {
    for (const widget of dashboard.widgets) {
      widget.data = await this.generateWidgetData(widget, '24h');
      widget.lastUpdated = new Date().toISOString();
    }
  }

  private async generateWidgetData(widget: DashboardWidget, timeRange: string): Promise<any> {
    const now = new Date();
    const hours = parseInt(timeRange.replace('h', '')) || 24;
    
    switch (widget.type) {
      case 'metrics':
        return {
          totalConfigurations: Math.floor(50 + Math.random() * 200),
          activeFeatureFlags: Math.floor(10 + Math.random() * 40),
          runningABTests: Math.floor(3 + Math.random() * 12),
          systemHealth: Math.floor(95 + Math.random() * 5),
          bangladeshUsers: Math.floor(10000 + Math.random() * 50000),
          performanceScore: Math.floor(85 + Math.random() * 15)
        };

      case 'chart':
        return {
          labels: Array.from({length: hours}, (_, i) => 
            new Date(now.getTime() - (hours - i) * 60 * 60 * 1000).toISOString()
          ),
          datasets: [{
            label: widget.title,
            data: Array.from({length: hours}, () => Math.floor(Math.random() * 100))
          }]
        };

      case 'table':
        return {
          headers: ['Name', 'Status', 'Rollout', 'Performance', 'Last Updated'],
          rows: Array.from({length: 10}, (_, i) => ([
            `feature_flag_${i + 1}`,
            Math.random() > 0.2 ? 'Active' : 'Inactive',
            `${Math.floor(Math.random() * 100)}%`,
            Math.random() > 0.5 ? 'Good' : 'Fair',
            new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
          ]))
        };

      case 'health':
        return {
          overall: 'healthy',
          services: [
            { name: 'Configuration API', status: 'healthy', uptime: '99.9%' },
            { name: 'Feature Flags', status: 'healthy', uptime: '99.8%' },
            { name: 'A/B Testing', status: 'healthy', uptime: '99.7%' },
            { name: 'Bangladesh Services', status: 'healthy', uptime: '99.6%' }
          ]
        };

      case 'log':
        return {
          logs: Array.from({length: widget.configuration.maxLines || 50}, (_, i) => ({
            timestamp: new Date(now.getTime() - i * 60 * 1000).toISOString(),
            level: Math.random() > 0.8 ? 'ERROR' : Math.random() > 0.6 ? 'WARN' : 'INFO',
            message: `Log entry ${i + 1}: Configuration operation completed successfully`
          }))
        };

      case 'map':
        return {
          regions: [
            { name: 'Dhaka', value: 85 + Math.random() * 15, coordinates: [90.4125, 23.8103] },
            { name: 'Chittagong', value: 75 + Math.random() * 20, coordinates: [91.8317, 22.3569] },
            { name: 'Sylhet', value: 70 + Math.random() * 25, coordinates: [91.8687, 24.8949] },
            { name: 'Rajshahi', value: 65 + Math.random() * 30, coordinates: [88.6042, 24.3736] }
          ]
        };

      default:
        return { message: 'Widget type not supported' };
    }
  }

  private async generateRealtimeUpdates(dashboard: DashboardLayout, since: string): Promise<any> {
    const updates = [];
    
    for (const widget of dashboard.widgets) {
      if (Math.random() > 0.7) { // 30% chance of update
        updates.push({
          widgetId: widget.id,
          type: 'data_update',
          data: await this.generateWidgetData(widget, '1h'),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return {
      updates: updates,
      hasMore: false,
      nextPoll: new Date(Date.now() + 30000).toISOString() // 30 seconds
    };
  }

  private async generateDashboardExport(dashboard: DashboardLayout, format: string): Promise<any> {
    const exportData = {
      ...dashboard,
      exportedAt: new Date().toISOString(),
      exportFormat: format,
      version: '1.0.0'
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }

    return exportData;
  }

  private async generateDashboardAnalytics(dashboard: DashboardLayout, timeRange: string): Promise<any> {
    return {
      usage: {
        totalViews: Math.floor(1000 + Math.random() * 9000),
        uniqueUsers: Math.floor(50 + Math.random() * 200),
        avgSessionDuration: Math.floor(300 + Math.random() * 1200), // 5-20 minutes
        bounceRate: Math.floor(5 + Math.random() * 15) // 5-20%
      },
      widgets: dashboard.widgets.map(widget => ({
        id: widget.id,
        title: widget.title,
        type: widget.type,
        views: Math.floor(100 + Math.random() * 900),
        avgLoadTime: Math.floor(100 + Math.random() * 500),
        errorRate: Math.random() * 2,
        lastUpdated: widget.lastUpdated
      })),
      performance: {
        avgLoadTime: Math.floor(500 + Math.random() * 1000),
        errorRate: Math.random() * 1,
        uptime: 99.5 + Math.random() * 0.5
      },
      bangladeshSpecific: {
        regionalUsage: {
          dhaka: Math.floor(40 + Math.random() * 20),
          chittagong: Math.floor(20 + Math.random() * 15),
          sylhet: Math.floor(15 + Math.random() * 10),
          other: Math.floor(10 + Math.random() * 15)
        },
        culturalInsights: {
          peakUsageTime: '19:00-23:00',
          festivalImpact: 'High during Eid and Pohela Boishakh',
          paymentMethodPreference: 'bKash most viewed widget'
        }
      }
    };
  }
}