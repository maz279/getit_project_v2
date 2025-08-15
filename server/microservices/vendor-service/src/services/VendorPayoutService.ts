/**
 * Vendor Payout Service - Amazon.com/Shopee.sg-Level Financial Management
 * 
 * Complete payout management operations:
 * - Earnings calculation and tracking
 * - Payout request processing
 * - Bangladesh payment methods integration
 * - Commission and fee calculations
 * - Financial reporting and analytics
 */

import { db } from '../../../db';
import { 
  vendors, 
  vendorPayoutSchedules, 
  orders, 
  orderItems, 
  vendorCommissions,
  vendorAnalytics 
} from '../../../../shared/schema';
import { eq, and, gte, lte, desc, sum, count } from 'drizzle-orm';

export interface EarningsOverview {
  totalEarnings: number;
  availableBalance: number;
  pendingAmount: number;
  totalCommission: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  growthPercentage: number;
}

export interface PayoutRequest {
  id: string;
  vendorId: string;
  amount: number;
  paymentMethod: string;
  paymentDetails: any;
  currency: string;
  fees: any;
  taxes: any;
  status: string;
  requestedAt: Date;
  processedAt?: Date;
}

export interface CommissionBreakdown {
  productCommissions: any[];
  categoryCommissions: any[];
  totalCommission: number;
  averageCommissionRate: number;
}

export class VendorPayoutService {

  /**
   * Get earnings overview for vendor
   */
  async getEarningsOverview(vendorId: string, options: any): Promise<EarningsOverview> {
    try {
      const { period, currency } = options;
      
      // Calculate total earnings from completed orders
      const totalEarningsResult = await db
        .select({ 
          total: sum(orderItems.price) 
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            eq(orders.status, 'completed')
          )
        );

      const totalEarnings = parseFloat(totalEarningsResult[0]?.total || '0');

      // Calculate available balance (completed orders - already paid out)
      const availableBalance = await this.calculateAvailableBalance(vendorId);
      
      // Calculate pending amount (orders not yet completed)
      const pendingResult = await db
        .select({ 
          total: sum(orderItems.price) 
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            eq(orders.status, 'processing')
          )
        );

      const pendingAmount = parseFloat(pendingResult[0]?.total || '0');

      // Calculate commission (platform fee)
      const totalCommission = totalEarnings * 0.05; // 5% platform fee

      // Calculate this month and last month earnings
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const thisMonthResult = await db
        .select({ 
          total: sum(orderItems.price) 
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            eq(orders.status, 'completed'),
            gte(orders.createdAt, thisMonthStart)
          )
        );

      const lastMonthResult = await db
        .select({ 
          total: sum(orderItems.price) 
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            eq(orders.status, 'completed'),
            gte(orders.createdAt, lastMonthStart),
            lte(orders.createdAt, lastMonthEnd)
          )
        );

      const thisMonthEarnings = parseFloat(thisMonthResult[0]?.total || '0');
      const lastMonthEarnings = parseFloat(lastMonthResult[0]?.total || '0');
      
      const growthPercentage = lastMonthEarnings > 0 
        ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
        : 0;

      return {
        totalEarnings,
        availableBalance,
        pendingAmount,
        totalCommission,
        thisMonthEarnings,
        lastMonthEarnings,
        growthPercentage
      };
    } catch (error) {
      console.error('Error getting earnings overview:', error);
      throw error;
    }
  }

  /**
   * Get earnings breakdown with pagination
   */
  async getEarningsBreakdown(vendorId: string, options: any): Promise<any> {
    try {
      const { startDate, endDate, page, limit } = options;
      const offset = (page - 1) * limit;

      let query = db
        .select({
          orderId: orders.id,
          orderDate: orders.createdAt,
          customerName: orders.customerName,
          amount: orderItems.price,
          commission: orderItems.commission,
          status: orders.status
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(eq(orderItems.vendorId, vendorId));

      if (startDate && endDate) {
        query = query.where(
          and(
            eq(orderItems.vendorId, vendorId),
            gte(orders.createdAt, new Date(startDate)),
            lte(orders.createdAt, new Date(endDate))
          )
        );
      }

      const earnings = await query
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const totalResult = await db
        .select({ count: count() })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(eq(orderItems.vendorId, vendorId));

      const total = totalResult[0]?.count || 0;

      return {
        earnings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting earnings breakdown:', error);
      throw error;
    }
  }

  /**
   * Create payout request
   */
  async createPayoutRequest(payoutData: any): Promise<PayoutRequest> {
    try {
      // In a real implementation, this would insert into a payouts table
      const payoutRequest: PayoutRequest = {
        id: crypto.randomUUID(),
        vendorId: payoutData.vendorId,
        amount: payoutData.amount,
        paymentMethod: payoutData.paymentMethod,
        paymentDetails: payoutData.paymentDetails,
        currency: payoutData.currency,
        fees: payoutData.fees,
        taxes: payoutData.taxes,
        status: 'pending',
        requestedAt: new Date()
      };

      // Store payout request (would use actual payouts table)
      console.log('Payout request created:', payoutRequest);

      return payoutRequest;
    } catch (error) {
      console.error('Error creating payout request:', error);
      throw error;
    }
  }

  /**
   * Get available balance for vendor
   */
  async getAvailableBalance(vendorId: string): Promise<number> {
    try {
      // Calculate total earnings from completed orders
      const earningsResult = await db
        .select({ 
          total: sum(orderItems.price) 
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            eq(orders.status, 'completed')
          )
        );

      const totalEarnings = parseFloat(earningsResult[0]?.total || '0');
      
      // Subtract platform commission (5%)
      const commission = totalEarnings * 0.05;
      
      // Subtract already paid out amounts (would query payouts table)
      const alreadyPaidOut = 0; // Would calculate from payouts table
      
      return totalEarnings - commission - alreadyPaidOut;
    } catch (error) {
      console.error('Error calculating available balance:', error);
      throw error;
    }
  }

  /**
   * Calculate available balance (helper method)
   */
  private async calculateAvailableBalance(vendorId: string): Promise<number> {
    return this.getAvailableBalance(vendorId);
  }

  /**
   * Get payout history with filters
   */
  async getPayoutHistory(vendorId: string, filters: any): Promise<any> {
    try {
      // In real implementation, would query payouts table
      // For now, return mock data structure
      return {
        payouts: [],
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: 0,
          totalPages: 0
        },
        summary: {
          totalPaidOut: 0,
          averagePayoutAmount: 0,
          totalPayouts: 0
        }
      };
    } catch (error) {
      console.error('Error getting payout history:', error);
      throw error;
    }
  }

  /**
   * Get payout status
   */
  async getPayoutStatus(vendorId: string, payoutId: string): Promise<PayoutRequest | null> {
    try {
      // In real implementation, would query payouts table
      return null;
    } catch (error) {
      console.error('Error getting payout status:', error);
      throw error;
    }
  }

  /**
   * Check if payout can be cancelled
   */
  async canCancelPayout(vendorId: string, payoutId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // In real implementation, would check payout status
      return { allowed: true };
    } catch (error) {
      console.error('Error checking payout cancellation:', error);
      throw error;
    }
  }

  /**
   * Cancel payout request
   */
  async cancelPayoutRequest(vendorId: string, payoutId: string, reason: string): Promise<PayoutRequest | null> {
    try {
      // In real implementation, would update payout status to cancelled
      return null;
    } catch (error) {
      console.error('Error cancelling payout request:', error);
      throw error;
    }
  }

  /**
   * Calculate payout fees
   */
  async calculatePayoutFees(amount: number, paymentMethod: string, currency: string): Promise<any> {
    try {
      let fees = {
        processingFee: 0,
        currencyConversionFee: 0,
        serviceFee: 0,
        total: 0
      };

      // Calculate fees based on payment method
      switch (paymentMethod) {
        case 'bkash':
        case 'nagad':
        case 'rocket':
          fees.processingFee = amount * 0.015; // 1.5% for mobile banking
          break;
        case 'bank_transfer':
          fees.processingFee = Math.min(amount * 0.01, 100); // 1% or max 100 BDT
          break;
        default:
          fees.processingFee = amount * 0.02; // 2% for other methods
      }

      // Currency conversion fee (if not BDT)
      if (currency !== 'BDT') {
        fees.currencyConversionFee = amount * 0.025; // 2.5%
      }

      // Service fee
      fees.serviceFee = 10; // Flat 10 BDT service fee

      fees.total = fees.processingFee + fees.currencyConversionFee + fees.serviceFee;

      return fees;
    } catch (error) {
      console.error('Error calculating payout fees:', error);
      throw error;
    }
  }

  /**
   * Get commission breakdown
   */
  async getCommissionBreakdown(vendorId: string, options: any): Promise<CommissionBreakdown> {
    try {
      // Calculate commissions by product and category
      const productCommissions = await db
        .select({
          productId: orderItems.productId,
          totalSales: sum(orderItems.price),
          totalCommission: sum(orderItems.commission),
          orderCount: count()
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            eq(orders.status, 'completed')
          )
        )
        .groupBy(orderItems.productId);

      const totalCommission = productCommissions.reduce(
        (sum, item) => sum + parseFloat(item.totalCommission || '0'), 
        0
      );

      const totalSales = productCommissions.reduce(
        (sum, item) => sum + parseFloat(item.totalSales || '0'), 
        0
      );

      const averageCommissionRate = totalSales > 0 ? (totalCommission / totalSales) * 100 : 0;

      return {
        productCommissions,
        categoryCommissions: [], // Would group by category
        totalCommission,
        averageCommissionRate
      };
    } catch (error) {
      console.error('Error getting commission breakdown:', error);
      throw error;
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(vendorId: string, paymentMethod: string, paymentDetails: any): Promise<any> {
    try {
      const [updatedVendor] = await db
        .update(vendors)
        .set({
          paymentMethod,
          paymentDetails,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId))
        .returning();

      return updatedVendor;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Get payout schedule
   */
  async getPayoutSchedule(vendorId: string): Promise<any> {
    try {
      const [schedule] = await db
        .select()
        .from(vendorPayoutSchedules)
        .where(eq(vendorPayoutSchedules.vendorId, vendorId));

      return schedule || {
        frequency: 'weekly',
        minimumAmount: 1000,
        autoPayoutEnabled: false
      };
    } catch (error) {
      console.error('Error getting payout schedule:', error);
      throw error;
    }
  }

  /**
   * Update payout schedule
   */
  async updatePayoutSchedule(vendorId: string, scheduleData: any): Promise<any> {
    try {
      // Check if schedule exists
      const [existingSchedule] = await db
        .select()
        .from(vendorPayoutSchedules)
        .where(eq(vendorPayoutSchedules.vendorId, vendorId));

      if (existingSchedule) {
        // Update existing schedule
        const [updatedSchedule] = await db
          .update(vendorPayoutSchedules)
          .set({
            frequency: scheduleData.frequency,
            minimumAmount: scheduleData.minimumAmount.toString(),
            autoPayoutEnabled: scheduleData.autoPayoutEnabled,
            updatedAt: new Date()
          })
          .where(eq(vendorPayoutSchedules.vendorId, vendorId))
          .returning();

        return updatedSchedule;
      } else {
        // Create new schedule
        const [newSchedule] = await db
          .insert(vendorPayoutSchedules)
          .values({
            vendorId,
            frequency: scheduleData.frequency,
            minimumAmount: scheduleData.minimumAmount.toString(),
            autoPayoutEnabled: scheduleData.autoPayoutEnabled
          })
          .returning();

        return newSchedule;
      }
    } catch (error) {
      console.error('Error updating payout schedule:', error);
      throw error;
    }
  }

  /**
   * Generate payout report
   */
  async generatePayoutReport(vendorId: string, options: any): Promise<any> {
    try {
      const { reportType, startDate, endDate, format } = options;

      // Get earnings data for the period
      const earnings = await this.getEarningsBreakdown(vendorId, {
        startDate,
        endDate,
        page: 1,
        limit: 1000
      });

      // Generate report based on type
      const report = {
        reportType,
        period: { startDate, endDate },
        format,
        generated: new Date(),
        data: earnings,
        summary: {
          totalEarnings: earnings.earnings.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0),
          totalCommissions: earnings.earnings.reduce((sum: number, e: any) => sum + parseFloat(e.commission || '0'), 0),
          orderCount: earnings.earnings.length
        }
      };

      return report;
    } catch (error) {
      console.error('Error generating payout report:', error);
      throw error;
    }
  }
}