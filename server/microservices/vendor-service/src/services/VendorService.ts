/**
 * Vendor Service - Amazon.com/Shopee.sg Level Business Logic
 * Enterprise-grade vendor management with advanced operations
 */

import { db } from '../../../../db';
import { vendors, vendorPayouts, orders, orderItems } from '@shared/schema';
import { eq, and, desc, count, sum, sql, ilike, or } from 'drizzle-orm';
import { 
  Vendor, 
  CreateVendorRequest, 
  UpdateVendorRequest, 
  VendorQueryOptions, 
  VendorListResponse, 
  PayoutRequest, 
  VendorPayout, 
  PayoutQueryOptions, 
  PayoutListResponse,
  VendorOrder 
} from '../types/vendor.types';

export class VendorService {
  /**
   * Create new vendor
   */
  async createVendor(vendorData: CreateVendorRequest & { userId: number }): Promise<Vendor> {
    try {
      const [vendor] = await db.insert(vendors)
        .values({
          ...vendorData,
          status: 'pending',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return vendor;
    } catch (error) {
      throw new Error(`Failed to create vendor: ${error.message}`);
    }
  }

  /**
   * Get vendor by ID
   */
  async getVendorById(vendorId: string): Promise<Vendor | null> {
    try {
      const [vendor] = await db.select()
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      return vendor || null;
    } catch (error) {
      throw new Error(`Failed to fetch vendor: ${error.message}`);
    }
  }

  /**
   * Update vendor profile
   */
  async updateVendor(vendorId: string, updateData: UpdateVendorRequest): Promise<Vendor> {
    try {
      const [vendor] = await db.update(vendors)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId))
        .returning();

      if (!vendor) {
        throw new Error('Vendor not found');
      }

      return vendor;
    } catch (error) {
      throw new Error(`Failed to update vendor: ${error.message}`);
    }
  }

  /**
   * Get all vendors with pagination and filtering
   */
  async getAllVendors(options: VendorQueryOptions): Promise<VendorListResponse> {
    try {
      const { page, limit, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [];
      
      if (status) {
        conditions.push(eq(vendors.status, status));
      }

      if (search) {
        conditions.push(
          or(
            ilike(vendors.businessName, `%${search}%`),
            ilike(vendors.contactEmail, `%${search}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get vendors
      const vendorList = await db.select()
        .from(vendors)
        .where(whereClause)
        .orderBy(sortOrder === 'desc' ? desc(vendors[sortBy]) : vendors[sortBy])
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ total }] = await db.select({ total: count() })
        .from(vendors)
        .where(whereClause);

      return {
        vendors: vendorList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch vendors: ${error.message}`);
    }
  }

  /**
   * Get vendor payouts
   */
  async getVendorPayouts(vendorId: string, options: PayoutQueryOptions): Promise<PayoutListResponse> {
    try {
      const { page, limit, status, startDate, endDate } = options;
      const offset = (page - 1) * limit;

      const conditions = [eq(vendorPayouts.vendorId, vendorId)];

      if (status) {
        conditions.push(eq(vendorPayouts.status, status));
      }

      if (startDate) {
        conditions.push(sql`${vendorPayouts.createdAt} >= ${startDate}`);
      }

      if (endDate) {
        conditions.push(sql`${vendorPayouts.createdAt} <= ${endDate}`);
      }

      const whereClause = and(...conditions);

      const payoutList = await db.select()
        .from(vendorPayouts)
        .where(whereClause)
        .orderBy(desc(vendorPayouts.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db.select({ total: count() })
        .from(vendorPayouts)
        .where(whereClause);

      return {
        payouts: payoutList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch vendor payouts: ${error.message}`);
    }
  }

  /**
   * Request payout
   */
  async requestPayout(vendorId: string, payoutData: PayoutRequest): Promise<VendorPayout> {
    try {
      // Verify vendor exists and is active
      const vendor = await this.getVendorById(vendorId);
      if (!vendor || !vendor.isActive) {
        throw new Error('Vendor not found or inactive');
      }

      // Check if vendor has sufficient balance (this would be calculated from sales/commissions)
      // For now, we'll assume the amount is valid

      const [payout] = await db.insert(vendorPayouts)
        .values({
          vendorId,
          payoutType: 'regular',
          amount: payoutData.amount.toString(),
          currency: 'BDT',
          status: 'pending',
          paymentMethod: payoutData.paymentMethod,
          paymentDetails: payoutData.paymentDetails,
          requestedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return payout;
    } catch (error) {
      throw new Error(`Failed to request payout: ${error.message}`);
    }
  }

  /**
   * Get pending payouts for vendor
   */
  async getPendingPayouts(vendorId: string): Promise<VendorPayout[]> {
    try {
      return await db.select()
        .from(vendorPayouts)
        .where(
          and(
            eq(vendorPayouts.vendorId, vendorId),
            eq(vendorPayouts.status, 'pending')
          )
        )
        .orderBy(desc(vendorPayouts.createdAt));
    } catch (error) {
      throw new Error(`Failed to fetch pending payouts: ${error.message}`);
    }
  }

  /**
   * Get recent orders for vendor
   */
  async getRecentOrders(vendorId: string, limit: number = 10): Promise<VendorOrder[]> {
    try {
      const recentOrders = await db.select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        shippingAddress: orders.shippingAddress,
        itemCount: count(orderItems.id)
      })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(eq(orderItems.vendorId, vendorId))
        .groupBy(orders.id, orders.orderNumber, orders.status, orders.total, orders.createdAt, orders.shippingAddress)
        .orderBy(desc(orders.createdAt))
        .limit(limit);

      return recentOrders.map(order => ({
        ...order,
        customerName: 'Customer', // Would get from user table join
        itemCount: Number(order.itemCount)
      }));
    } catch (error) {
      throw new Error(`Failed to fetch recent orders: ${error.message}`);
    }
  }

  /**
   * Approve vendor (Admin function)
   */
  async approveVendor(vendorId: string, approvedBy: number, notes?: string): Promise<void> {
    try {
      await db.update(vendors)
        .set({
          status: 'approved',
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId));

      // Log approval action
      // This would typically create an audit log entry
    } catch (error) {
      throw new Error(`Failed to approve vendor: ${error.message}`);
    }
  }

  /**
   * Reject vendor (Admin function)
   */
  async rejectVendor(vendorId: string, rejectedBy: number, reason: string): Promise<void> {
    try {
      await db.update(vendors)
        .set({
          status: 'rejected',
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId));

      // Log rejection action with reason
      // This would typically create an audit log entry
    } catch (error) {
      throw new Error(`Failed to reject vendor: ${error.message}`);
    }
  }

  /**
   * Suspend vendor (Admin function)
   */
  async suspendVendor(vendorId: string, suspendedBy: number, reason: string): Promise<void> {
    try {
      await db.update(vendors)
        .set({
          status: 'suspended',
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId));

      // Log suspension action with reason
    } catch (error) {
      throw new Error(`Failed to suspend vendor: ${error.message}`);
    }
  }

  /**
   * Get vendor statistics
   */
  async getVendorStats(): Promise<any> {
    try {
      const stats = await db.select({
        total: count(),
        active: count(sql`CASE WHEN status = 'approved' THEN 1 END`),
        pending: count(sql`CASE WHEN status = 'pending' THEN 1 END`),
        suspended: count(sql`CASE WHEN status = 'suspended' THEN 1 END`)
      })
        .from(vendors);

      return stats[0];
    } catch (error) {
      throw new Error(`Failed to fetch vendor statistics: ${error.message}`);
    }
  }
}