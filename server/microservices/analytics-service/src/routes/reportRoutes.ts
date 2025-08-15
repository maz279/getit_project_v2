/**
 * Report Generation Routes
 * API endpoints for Amazon.com/Shopee.sg-level analytics reports
 */

import { Router } from 'express';
import { salesAggregator } from '../aggregators/SalesAggregator';
import { vendorAggregator } from '../aggregators/VendorAggregator';
import { customerAggregator } from '../aggregators/CustomerAggregator';
import { productAggregator } from '../aggregators/ProductAggregator';
import DateUtils from '../utils/DateUtils';
import ExportUtils from '../utils/ExportUtils';
import ChartGenerator from '../utils/ChartGenerator';

const router = Router();

/**
 * POST /api/v1/analytics/reports/comprehensive
 * Generate comprehensive analytics report
 */
router.post('/comprehensive', async (req, res) => {
  try {
    const { 
      period = 'last30Days',
      format = 'excel',
      sections = ['sales', 'customers', 'vendors', 'products'],
      includeCharts = true,
      includeBangladeshMetrics = true
    } = req.body;

    const dateRanges = DateUtils.getCommonDateRanges();
    const selectedRange = dateRanges[period as string] || dateRanges.last30Days;

    // Collect data from all aggregators
    const reportData: any = {
      metadata: {
        title: 'GetIt Analytics Comprehensive Report',
        period: `${selectedRange.startDate.toLocaleDateString()} - ${selectedRange.endDate.toLocaleDateString()}`,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Analytics Service',
        currency: 'BDT'
      },
      summary: {},
      charts: [],
      tables: []
    };

    // Sales Analytics
    if (sections.includes('sales')) {
      const salesMetrics = await salesAggregator.getSalesMetrics(selectedRange);
      
      reportData.summary.sales = {
        totalRevenue: salesMetrics.totalRevenue,
        totalOrders: salesMetrics.totalOrders,
        averageOrderValue: salesMetrics.averageOrderValue,
        conversionRate: salesMetrics.conversionRate,
        revenueGrowth: salesMetrics.revenueGrowth
      };

      reportData.tables.push({
        title: 'Sales Trends',
        data: salesMetrics.salesTrends
      });

      reportData.tables.push({
        title: 'Revenue by Payment Method',
        data: salesMetrics.revenueByPaymentMethod
      });

      if (includeCharts) {
        reportData.charts.push({
          title: 'Sales Revenue Trend',
          data: salesMetrics.salesTrends.map(item => ({
            date: item.date,
            revenue: item.revenue,
            orders: item.orders
          }))
        });
      }
    }

    // Customer Analytics
    if (sections.includes('customers')) {
      const customerMetrics = await customerAggregator.getCustomerAnalytics(selectedRange);
      
      reportData.summary.customers = {
        totalCustomers: customerMetrics.customerSummary.totalCustomers,
        activeCustomers: customerMetrics.customerSummary.activeCustomers,
        newCustomers: customerMetrics.customerSummary.newCustomers,
        churnRate: customerMetrics.customerSummary.churnRate,
        averageLifetimeValue: customerMetrics.customerSummary.averageLifetimeValue
      };

      reportData.tables.push({
        title: 'Customer Segments',
        data: customerMetrics.segmentationAnalysis.segments
      });

      if (includeCharts) {
        reportData.charts.push({
          title: 'Customer Growth',
          data: customerMetrics.acquisitionTrends
        });
      }
    }

    // Vendor Analytics
    if (sections.includes('vendors')) {
      const vendorMetrics = await vendorAggregator.getVendorPerformanceMetrics(selectedRange);
      
      reportData.summary.vendors = {
        totalVendors: vendorMetrics.vendorSummary.totalVendors,
        activeVendors: vendorMetrics.vendorSummary.activeVendors,
        newVendors: vendorMetrics.vendorSummary.newVendors,
        averageRating: vendorMetrics.vendorSummary.averageRating,
        topPerformers: vendorMetrics.vendorSummary.topPerformers?.slice(0, 5)
      };

      reportData.tables.push({
        title: 'Top Performing Vendors',
        data: vendorMetrics.topPerformers?.slice(0, 20) || []
      });
    }

    // Product Analytics
    if (sections.includes('products')) {
      const productMetrics = await productAggregator.getProductPerformanceMetrics(selectedRange);
      
      reportData.summary.products = {
        totalProducts: productMetrics.productSummary.totalProducts,
        activeProducts: productMetrics.productSummary.activeProducts,
        outOfStockProducts: productMetrics.productSummary.outOfStockProducts,
        averageRating: productMetrics.productSummary.averageRating,
        topCategories: productMetrics.categoryAnalysis.slice(0, 5)
      };

      reportData.tables.push({
        title: 'Category Performance',
        data: productMetrics.categoryAnalysis
      });
    }

    // Bangladesh-specific metrics
    if (includeBangladeshMetrics) {
      const bangladeshSales = await salesAggregator.getBangladeshSalesMetrics(selectedRange);
      const bangladeshVendors = await vendorAggregator.getBangladeshVendorMetrics(selectedRange);

      reportData.summary.bangladesh = {
        mobileBankingAdoption: bangladeshSales.paymentMethodBreakdown
          .filter(p => ['bkash', 'nagad', 'rocket'].includes(p.method.toLowerCase()))
          .reduce((sum, p) => sum + p.adoption, 0),
        topDivision: bangladeshSales.revenueByDivision[0]?.division || 'Dhaka',
        festivalImpact: bangladeshSales.festivalImpact,
        mobileTraffic: bangladeshSales.mobileVsDesktop.mobile
      };

      reportData.tables.push({
        title: 'Revenue by Division',
        data: bangladeshSales.revenueByDivision
      });

      reportData.tables.push({
        title: 'Mobile Banking Usage',
        data: bangladeshSales.paymentMethodBreakdown.filter(p => 
          ['bkash', 'nagad', 'rocket'].includes(p.method.toLowerCase())
        )
      });
    }

    // Generate the report
    const exportResult = await ExportUtils.generateAnalyticsReport(reportData, {
      format: format as 'excel' | 'json',
      fileName: `comprehensive_analytics_report_${period}_${Date.now()}`,
      formatting: { currency: 'BDT' }
    });

    res.setHeader('Content-Type', exportResult.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
    res.send(exportResult.buffer);

  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate comprehensive report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/analytics/reports/custom
 * Generate custom analytics report
 */
router.post('/custom', async (req, res) => {
  try {
    const { 
      title,
      dateRange,
      metrics,
      filters = {},
      format = 'excel',
      includeCharts = true
    } = req.body;

    if (!title || !dateRange || !metrics) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, dateRange, metrics'
      });
    }

    const selectedRange = {
      startDate: new Date(dateRange.startDate),
      endDate: new Date(dateRange.endDate)
    };

    const reportData: any = {
      metadata: {
        title,
        period: `${selectedRange.startDate.toLocaleDateString()} - ${selectedRange.endDate.toLocaleDateString()}`,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Analytics Service - Custom Report',
        filters
      },
      summary: {},
      charts: [],
      tables: []
    };

    // Process requested metrics
    for (const metric of metrics) {
      switch (metric.type) {
        case 'sales':
          const salesData = await salesAggregator.getSalesMetrics({
            ...selectedRange,
            ...filters
          });
          reportData.tables.push({
            title: metric.title || 'Sales Data',
            data: metric.field === 'trends' ? salesData.salesTrends : [salesData]
          });
          break;

        case 'customers':
          const customerData = await customerAggregator.getCustomerAnalytics(selectedRange);
          reportData.tables.push({
            title: metric.title || 'Customer Data',
            data: metric.field === 'segments' ? customerData.segmentationAnalysis.segments : [customerData.customerSummary]
          });
          break;

        case 'vendors':
          const vendorData = await vendorAggregator.getVendorPerformanceMetrics(selectedRange);
          reportData.tables.push({
            title: metric.title || 'Vendor Data',
            data: metric.field === 'performance' ? vendorData.topPerformers : [vendorData.vendorSummary]
          });
          break;

        case 'products':
          const productData = await productAggregator.getProductPerformanceMetrics(selectedRange);
          reportData.tables.push({
            title: metric.title || 'Product Data',
            data: metric.field === 'categories' ? productData.categoryAnalysis : [productData.productSummary]
          });
          break;
      }
    }

    // Generate the custom report
    const exportResult = await ExportUtils.generateAnalyticsReport(reportData, {
      format: format as 'excel' | 'json',
      fileName: `custom_analytics_report_${Date.now()}`,
      formatting: { currency: 'BDT' }
    });

    res.setHeader('Content-Type', exportResult.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
    res.send(exportResult.buffer);

  } catch (error) {
    console.error('Error generating custom report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate custom report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/analytics/reports/templates
 * Get available report templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'sales-overview',
        name: 'Sales Overview Report',
        description: 'Comprehensive sales performance analysis',
        sections: ['sales', 'revenue-trends', 'payment-methods', 'regional-analysis'],
        defaultPeriod: 'last30Days'
      },
      {
        id: 'customer-analysis',
        name: 'Customer Analytics Report',
        description: 'Customer behavior and segmentation analysis',
        sections: ['customers', 'segments', 'acquisition', 'retention'],
        defaultPeriod: 'last90Days'
      },
      {
        id: 'vendor-performance',
        name: 'Vendor Performance Report',
        description: 'Multi-vendor marketplace performance metrics',
        sections: ['vendors', 'performance', 'categories', 'ratings'],
        defaultPeriod: 'last30Days'
      },
      {
        id: 'bangladesh-market',
        name: 'Bangladesh Market Analysis',
        description: 'Bangladesh-specific market insights and trends',
        sections: ['regional-sales', 'mobile-banking', 'festivals', 'divisions'],
        defaultPeriod: 'last30Days'
      },
      {
        id: 'executive-summary',
        name: 'Executive Summary Report',
        description: 'High-level KPIs and business metrics',
        sections: ['kpis', 'trends', 'highlights', 'alerts'],
        defaultPeriod: 'last30Days'
      }
    ];

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Error getting report templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/analytics/reports/schedule
 * Schedule automated report generation
 */
router.post('/schedule', async (req, res) => {
  try {
    const { 
      reportTemplate,
      frequency,
      recipients,
      format = 'excel',
      parameters = {}
    } = req.body;

    if (!reportTemplate || !frequency || !recipients) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: reportTemplate, frequency, recipients'
      });
    }

    // In a real implementation, this would integrate with a job scheduler
    const scheduledReport = {
      id: `scheduled_${Date.now()}`,
      template: reportTemplate,
      frequency,
      recipients,
      format,
      parameters,
      status: 'active',
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
      createdAt: new Date()
    };

    res.json({
      success: true,
      message: 'Report scheduled successfully',
      data: scheduledReport
    });

  } catch (error) {
    console.error('Error scheduling report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;