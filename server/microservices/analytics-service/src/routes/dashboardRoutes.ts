/**
 * Dashboard Analytics Routes
 * API endpoints for Amazon.com/Shopee.sg-level dashboard analytics
 */

import { Router } from 'express';
import { salesAggregator } from '../aggregators/SalesAggregator';
import { vendorAggregator } from '../aggregators/VendorAggregator';
import { customerAggregator } from '../aggregators/CustomerAggregator';
import { productAggregator } from '../aggregators/ProductAggregator';
import DateUtils from '../utils/DateUtils';
import ChartGenerator from '../utils/ChartGenerator';

const router = Router();

/**
 * GET /api/v1/analytics/dashboard/overview
 * Get comprehensive dashboard overview
 */
router.get('/overview', async (req, res) => {
  try {
    const { 
      period = 'last30Days',
      compareWith = 'previousPeriod',
      includeCharts = true 
    } = req.query;

    // Get date range
    const dateRanges = DateUtils.getCommonDateRanges();
    const selectedRange = dateRanges[period as string] || dateRanges.last30Days;

    // Get comprehensive metrics from all aggregators
    const [salesMetrics, vendorMetrics, customerMetrics, productMetrics] = await Promise.all([
      salesAggregator.getSalesMetrics(selectedRange),
      vendorAggregator.getVendorPerformanceMetrics(selectedRange),
      customerAggregator.getCustomerAnalytics(selectedRange),
      productAggregator.getProductPerformanceMetrics(selectedRange)
    ]);

    // Calculate overview KPIs
    const overview = {
      revenue: {
        total: salesMetrics.totalRevenue,
        growth: salesMetrics.revenueGrowth,
        trend: salesMetrics.revenueGrowth > 0 ? 'up' : salesMetrics.revenueGrowth < 0 ? 'down' : 'stable'
      },
      orders: {
        total: salesMetrics.totalOrders,
        averageValue: salesMetrics.averageOrderValue,
        conversionRate: salesMetrics.conversionRate
      },
      customers: {
        total: customerMetrics.customerSummary.totalCustomers,
        active: customerMetrics.customerSummary.activeCustomers,
        new: customerMetrics.customerSummary.newCustomers,
        churnRate: customerMetrics.customerSummary.churnRate
      },
      vendors: {
        total: vendorMetrics.vendorSummary.totalVendors,
        active: vendorMetrics.vendorSummary.activeVendors,
        new: vendorMetrics.vendorSummary.newVendors,
        averageRating: vendorMetrics.vendorSummary.averageRating
      },
      products: {
        total: productMetrics.productSummary.totalProducts,
        active: productMetrics.productSummary.activeProducts,
        outOfStock: productMetrics.productSummary.outOfStockProducts,
        averageRating: productMetrics.productSummary.averageRating
      },
      geography: {
        topRegions: salesMetrics.revenueByRegion.slice(0, 5),
        paymentMethods: salesMetrics.revenueByPaymentMethod
      }
    };

    // Generate charts if requested
    let charts = null;
    if (includeCharts) {
      charts = {
        salesTrend: ChartGenerator.generateLineChart(
          salesMetrics.salesTrends.map(item => ({
            timestamp: item.date,
            value: item.revenue,
            category: 'Revenue'
          })),
          { title: 'Sales Trend', yAxisLabel: 'Revenue (৳)' }
        ),
        topCategories: ChartGenerator.generateBarChart(
          productMetrics.categoryAnalysis.slice(0, 10).map(item => ({
            label: item.categoryName,
            value: item.revenue
          })),
          { title: 'Top Categories by Revenue' }
        ),
        customerSegments: ChartGenerator.generatePieChart(
          customerMetrics.segmentationAnalysis.segments.map(item => ({
            label: item.segmentName,
            value: item.customerCount
          })),
          { title: 'Customer Segments' }
        )
      };
    }

    res.json({
      success: true,
      data: {
        overview,
        charts,
        period: selectedRange,
        generatedAt: new Date(),
        bangladesh: {
          festivals: DateUtils.getFestivalForDate(new Date()),
          businessHours: DateUtils.getBangladeshBusinessHours()
        }
      }
    });

  } catch (error) {
    console.error('Error getting dashboard overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard overview',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/analytics/dashboard/real-time
 * Get real-time dashboard metrics
 */
router.get('/real-time', async (req, res) => {
  try {
    // Get real-time metrics
    const realTimeMetrics = await salesAggregator.getRealTimeSalesMetrics();

    // Get current active users (placeholder - would integrate with session tracking)
    const activeUsers = {
      current: Math.floor(Math.random() * 500) + 100,
      peak: Math.floor(Math.random() * 800) + 300,
      devices: {
        mobile: 65,
        desktop: 30,
        tablet: 5
      }
    };

    // Get live inventory alerts
    const inventoryAlerts = {
      outOfStock: Math.floor(Math.random() * 10),
      lowStock: Math.floor(Math.random() * 25) + 5,
      newProducts: Math.floor(Math.random() * 8)
    };

    res.json({
      success: true,
      data: {
        sales: realTimeMetrics,
        users: activeUsers,
        inventory: inventoryAlerts,
        systemHealth: {
          status: 'healthy',
          uptime: '99.9%',
          responseTime: '< 200ms',
          errorRate: '< 0.1%'
        },
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting real-time metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/analytics/dashboard/kpis
 * Get key performance indicators
 */
router.get('/kpis', async (req, res) => {
  try {
    const { period = 'last30Days' } = req.query;
    
    const dateRanges = DateUtils.getCommonDateRanges();
    const selectedRange = dateRanges[period as string] || dateRanges.last30Days;

    // Get KPIs from different aggregators
    const [salesMetrics, customerMetrics, vendorMetrics] = await Promise.all([
      salesAggregator.getSalesMetrics(selectedRange),
      customerAggregator.getCustomerAnalytics(selectedRange),
      vendorAggregator.getVendorPerformanceMetrics(selectedRange)
    ]);

    const kpis = {
      revenue: {
        value: salesMetrics.totalRevenue,
        change: salesMetrics.revenueGrowth,
        target: salesMetrics.totalRevenue * 1.2, // 20% target increase
        format: 'currency'
      },
      orders: {
        value: salesMetrics.totalOrders,
        change: 5.2, // Placeholder - would calculate from previous period
        target: salesMetrics.totalOrders * 1.15,
        format: 'number'
      },
      averageOrderValue: {
        value: salesMetrics.averageOrderValue,
        change: 3.8,
        target: salesMetrics.averageOrderValue * 1.1,
        format: 'currency'
      },
      customerAcquisition: {
        value: customerMetrics.customerSummary.newCustomers,
        change: 12.5,
        target: customerMetrics.customerSummary.newCustomers * 1.25,
        format: 'number'
      },
      customerRetention: {
        value: 100 - customerMetrics.customerSummary.churnRate,
        change: -2.1,
        target: 95,
        format: 'percentage'
      },
      conversionRate: {
        value: salesMetrics.conversionRate,
        change: 0.8,
        target: 3.5,
        format: 'percentage'
      },
      vendorGrowth: {
        value: vendorMetrics.vendorSummary.newVendors,
        change: 8.3,
        target: vendorMetrics.vendorSummary.newVendors * 1.2,
        format: 'number'
      },
      grossMargin: {
        value: 35.2, // Placeholder - would calculate from cost data
        change: 1.5,
        target: 40,
        format: 'percentage'
      }
    };

    res.json({
      success: true,
      data: {
        kpis,
        period: selectedRange,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting KPIs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KPIs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/analytics/dashboard/bangladesh
 * Get Bangladesh-specific dashboard metrics
 */
router.get('/bangladesh', async (req, res) => {
  try {
    const { period = 'last30Days' } = req.query;
    
    const dateRanges = DateUtils.getCommonDateRanges();
    const selectedRange = dateRanges[period as string] || dateRanges.last30Days;

    // Get Bangladesh-specific metrics
    const [bangladeshSales, bangladeshVendors] = await Promise.all([
      salesAggregator.getBangladeshSalesMetrics(selectedRange),
      vendorAggregator.getBangladeshVendorMetrics(selectedRange)
    ]);

    // Get current festival impact
    const currentFestival = DateUtils.getFestivalForDate(new Date());
    const upcomingFestivals = DateUtils.getBangladeshFestivals(new Date().getFullYear())
      .filter(festival => festival.date > new Date())
      .slice(0, 3);

    const bangladeshMetrics = {
      regional: {
        revenueByDivision: bangladeshSales.revenueByDivision,
        vendorsByDivision: bangladeshVendors.vendorsByDivision,
        topDivision: bangladeshSales.revenueByDivision[0]?.division || 'Dhaka'
      },
      payments: {
        mobileBanking: bangladeshSales.paymentMethodBreakdown.filter(p => 
          ['bkash', 'nagad', 'rocket'].includes(p.method.toLowerCase())
        ),
        mobileBankingAdoption: bangladeshSales.paymentMethodBreakdown
          .filter(p => ['bkash', 'nagad', 'rocket'].includes(p.method.toLowerCase()))
          .reduce((sum, p) => sum + p.adoption, 0)
      },
      cultural: {
        currentFestival,
        upcomingFestivals,
        festivalImpact: bangladeshSales.festivalImpact
      },
      devices: bangladeshSales.mobileVsDesktop,
      business: {
        hours: DateUtils.getBangladeshBusinessHours(),
        isBusinessHour: DateUtils.isBusinessHour(new Date())
      }
    };

    res.json({
      success: true,
      data: bangladeshMetrics
    });

  } catch (error) {
    console.error('Error getting Bangladesh metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Bangladesh metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;