/**
 * Sales Analytics Routes
 * API endpoints for Amazon.com/Shopee.sg-level sales analytics
 */

import { Router } from 'express';
import { salesAggregator } from '../aggregators/SalesAggregator';
import DateUtils from '../utils/DateUtils';
import ChartGenerator from '../utils/ChartGenerator';
import ExportUtils from '../utils/ExportUtils';

const router = Router();

/**
 * GET /api/v1/analytics/sales/overview
 * Get comprehensive sales analytics overview
 */
router.get('/overview', async (req, res) => {
  try {
    const { 
      period = 'last30Days',
      vendorId,
      categoryId,
      includeCharts = true,
      includeForecasts = false
    } = req.query;

    const dateRanges = DateUtils.getCommonDateRanges();
    const selectedRange = dateRanges[period as string] || dateRanges.last30Days;

    // Get comprehensive sales metrics
    const salesMetrics = await salesAggregator.getSalesMetrics({
      ...selectedRange,
      vendorId: vendorId as string,
      categoryId: categoryId as string
    });

    // Generate charts if requested
    let charts = null;
    if (includeCharts) {
      charts = {
        revenueTrend: ChartGenerator.generateLineChart(
          salesMetrics.salesTrends.map(item => ({
            timestamp: item.date,
            value: item.revenue,
            category: 'Revenue'
          })),
          { title: 'Revenue Trend', yAxisLabel: 'Revenue (৳)' }
        ),
        ordersTrend: ChartGenerator.generateLineChart(
          salesMetrics.salesTrends.map(item => ({
            timestamp: item.date,
            value: item.orders,
            category: 'Orders'
          })),
          { title: 'Orders Trend', yAxisLabel: 'Number of Orders' }
        ),
        paymentMethods: ChartGenerator.generatePieChart(
          salesMetrics.revenueByPaymentMethod.map(item => ({
            label: item.paymentMethod,
            value: item.revenue
          })),
          { title: 'Revenue by Payment Method' }
        ),
        topRegions: ChartGenerator.generateBarChart(
          salesMetrics.revenueByRegion.slice(0, 10).map(item => ({
            label: item.region,
            value: item.revenue
          })),
          { title: 'Top Regions by Revenue' }
        )
      };
    }

    res.json({
      success: true,
      data: {
        metrics: salesMetrics,
        charts,
        period: selectedRange,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting sales overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales overview',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/analytics/sales/real-time
 * Get real-time sales metrics
 */
router.get('/real-time', async (req, res) => {
  try {
    const realTimeMetrics = await salesAggregator.getRealTimeSalesMetrics();

    res.json({
      success: true,
      data: realTimeMetrics
    });

  } catch (error) {
    console.error('Error getting real-time sales:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time sales metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/analytics/sales/bangladesh
 * Get Bangladesh-specific sales analytics
 */
router.get('/bangladesh', async (req, res) => {
  try {
    const { period = 'last30Days' } = req.query;
    
    const dateRanges = DateUtils.getCommonDateRanges();
    const selectedRange = dateRanges[period as string] || dateRanges.last30Days;

    const bangladeshMetrics = await salesAggregator.getBangladeshSalesMetrics(selectedRange);

    res.json({
      success: true,
      data: bangladeshMetrics
    });

  } catch (error) {
    console.error('Error getting Bangladesh sales:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Bangladesh sales metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/analytics/sales/trends
 * Get detailed sales trend analysis
 */
router.get('/trends', async (req, res) => {
  try {
    const { 
      period = 'last90Days',
      interval = 'day',
      vendorId,
      categoryId
    } = req.query;

    const dateRanges = DateUtils.getCommonDateRanges();
    const selectedRange = dateRanges[period as string] || dateRanges.last90Days;

    const trends = await salesAggregator.getSalesTrends({
      ...selectedRange,
      interval: interval as 'hour' | 'day' | 'week' | 'month',
      vendorId: vendorId as string,
      categoryId: categoryId as string
    });

    // Generate trend charts
    const charts = {
      revenue: ChartGenerator.generateLineChart(
        trends.map(item => ({
          timestamp: item.date,
          value: item.revenue,
          category: 'Revenue'
        })),
        { title: 'Revenue Trend Analysis' }
      ),
      orders: ChartGenerator.generateLineChart(
        trends.map(item => ({
          timestamp: item.date,
          value: item.orders,
          category: 'Orders'
        })),
        { title: 'Order Volume Trend' }
      ),
      aov: ChartGenerator.generateLineChart(
        trends.map(item => ({
          timestamp: item.date,
          value: item.averageOrderValue,
          category: 'AOV'
        })),
        { title: 'Average Order Value Trend' }
      )
    };

    res.json({
      success: true,
      data: {
        trends,
        charts,
        summary: {
          totalRevenue: trends.reduce((sum, item) => sum + item.revenue, 0),
          totalOrders: trends.reduce((sum, item) => sum + item.orders, 0),
          averageAOV: trends.reduce((sum, item) => sum + item.averageOrderValue, 0) / trends.length
        }
      }
    });

  } catch (error) {
    console.error('Error getting sales trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales trends',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/analytics/sales/export
 * Export sales data
 */
router.post('/export', async (req, res) => {
  try {
    const { 
      period = 'last30Days',
      format = 'excel',
      vendorId,
      categoryId,
      includeDetails = true
    } = req.body;

    const dateRanges = DateUtils.getCommonDateRanges();
    const selectedRange = dateRanges[period as string] || dateRanges.last30Days;

    // Get sales data for export
    const salesData = await salesAggregator.getSalesMetrics({
      ...selectedRange,
      vendorId,
      categoryId
    });

    // Prepare export data
    const exportData = includeDetails ? {
      'Sales Summary': [{
        totalRevenue: salesData.totalRevenue,
        totalOrders: salesData.totalOrders,
        averageOrderValue: salesData.averageOrderValue,
        conversionRate: salesData.conversionRate,
        period: `${selectedRange.startDate.toLocaleDateString()} - ${selectedRange.endDate.toLocaleDateString()}`
      }],
      'Daily Trends': salesData.salesTrends,
      'Revenue by Region': salesData.revenueByRegion,
      'Payment Methods': salesData.revenueByPaymentMethod
    } : salesData.salesTrends;

    // Generate export
    const exportResult = format === 'excel' 
      ? await ExportUtils.exportToExcel(exportData, {
          fileName: `sales_analytics_${period}_${Date.now()}.xlsx`,
          formatting: { currency: 'BDT' }
        })
      : await ExportUtils.exportToCSV(Array.isArray(exportData) ? exportData : exportData['Daily Trends'], {
          fileName: `sales_analytics_${period}_${Date.now()}.csv`,
          formatting: { currency: 'BDT' }
        });

    res.setHeader('Content-Type', exportResult.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
    res.send(exportResult.buffer);

  } catch (error) {
    console.error('Error exporting sales data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export sales data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;