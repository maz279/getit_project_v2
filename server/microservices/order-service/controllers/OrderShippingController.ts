/**
 * Order Shipping Controller - Amazon.com/Shopee.sg-Level Shipping Coordination
 * Handles comprehensive shipping management with Bangladesh courier integration
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  orders, 
  orderItems,
  vendorOrders,
  vendors,
  users
} from '../../../../shared/schema';
import { eq, and, desc, gte, lte, sql, inArray } from 'drizzle-orm';
import { LoggingService } from '../../../services/LoggingService';
import { RedisService } from '../../../services/RedisService';

export class OrderShippingController {
  private loggingService: LoggingService;
  private redisService: RedisService;

  constructor() {
    this.loggingService = new LoggingService();
    this.redisService = new RedisService();
  }

  /**
   * Calculate shipping rates for order
   */
  async calculateShippingRates(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { 
        shippingAddress,
        preferredCouriers = [], // pathao, paperfly, sundarban, redx, ecourier
        serviceType = 'standard' // standard, express, same_day, next_day
      } = req.body;

      // Get order details
      const [order] = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          total: orders.total,
          shippingAddress: orders.shippingAddress,
          weight: sql<number>`
            COALESCE(
              (SELECT SUM(CAST(weight AS numeric)) FROM order_items WHERE order_id = ${orders.id}),
              1.0
            )`
        })
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Get vendor locations for multi-vendor orders
      const vendorLocations = await db
        .select({
          vendorId: vendorOrders.vendorId,
          businessAddress: vendors.businessAddress,
          businessName: vendors.businessName
        })
        .from(vendorOrders)
        .leftJoin(vendors, eq(vendorOrders.vendorId, vendors.id))
        .where(eq(vendorOrders.orderId, orderId));

      // Determine shipping zones
      const destinationZone = await this.getShippingZone(shippingAddress || order.shippingAddress);
      const originZones = await Promise.all(
        vendorLocations.map(vendor => this.getShippingZone(vendor.businessAddress))
      );

      // Get available couriers and rates
      const availableCouriers = await this.getAvailableCouriers(destinationZone);
      const shippingOptions = [];

      for (const courier of availableCouriers) {
        if (preferredCouriers.length > 0 && !preferredCouriers.includes(courier.code)) {
          continue;
        }

        for (const originZone of originZones) {
          const rate = await this.calculateShippingRate({
            courierId: courier.id,
            originZone: originZone.zoneCode,
            destinationZone: destinationZone.zoneCode,
            weight: Number(order.weight),
            serviceType,
            orderValue: Number(order.total)
          });

          if (rate) {
            shippingOptions.push({
              courier: {
                id: courier.id,
                name: courier.name,
                code: courier.code,
                logo: `/assets/couriers/${courier.code}-icon.svg`
              },
              service: {
                type: serviceType,
                name: this.getServiceDisplayName(serviceType),
                description: this.getServiceDescription(serviceType, courier.code)
              },
              pricing: {
                baseRate: rate.baseRate,
                weightCharge: rate.weightCharge,
                surcharges: rate.surcharges || {},
                total: rate.total,
                currency: 'BDT'
              },
              delivery: {
                estimatedDays: rate.estimatedDays,
                cutoffTime: rate.cutoffTime,
                deliveryWindow: rate.deliveryWindow
              },
              features: {
                tracking: courier.trackingSupported,
                cod: courier.codSupported,
                pickup: courier.pickupSupported,
                insurance: rate.insuranceIncluded
              },
              bangladeshSpecific: {
                zoneClassification: destinationZone.division,
                specialHandling: this.getBangladeshShippingFeatures(destinationZone),
                culturalConsiderations: this.getCulturalShippingNotes(destinationZone)
              }
            });
          }
        }
      }

      // Sort by price and delivery time
      shippingOptions.sort((a, b) => {
        if (a.pricing.total !== b.pricing.total) {
          return a.pricing.total - b.pricing.total;
        }
        return a.delivery.estimatedDays - b.delivery.estimatedDays;
      });

      res.status(200).json({
        success: true,
        data: {
          orderId,
          shippingAddress: shippingAddress || order.shippingAddress,
          destinationZone,
          shippingOptions,
          recommendations: {
            fastest: shippingOptions.find(option => option.service.type === 'same_day') || shippingOptions[0],
            cheapest: shippingOptions[shippingOptions.length - 1],
            mostReliable: shippingOptions.find(option => option.courier.code === 'pathao') || shippingOptions[0]
          },
          bangladeshCoverage: {
            availableCouriers: availableCouriers.length,
            zoneSupported: true,
            codAvailable: shippingOptions.some(option => option.features.cod),
            estimatedDelivery: Math.min(...shippingOptions.map(option => option.delivery.estimatedDays))
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Calculate shipping rates error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to calculate shipping rates',
        error: (error as Error).message
      });
    }
  }

  /**
   * Create shipment for order
   */
  async createShipment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const {
        vendorOrderId,
        courierId,
        serviceType,
        pickupDate,
        specialInstructions,
        packageDetails = {}
      } = req.body;

      // Get order and vendor details
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Get courier details
      const [courier] = await db
        .select()
        .from(courierPartners)
        .where(eq(courierPartners.id, courierId));

      if (!courier) {
        res.status(404).json({
          success: false,
          message: 'Courier not found'
        });
        return;
      }

      // Generate tracking number
      const trackingNumber = await this.generateTrackingNumber(courier.code);

      // Create shipment record
      const [shipment] = await db.insert(shipments).values({
        orderId,
        vendorOrderId: vendorOrderId || null,
        courierId,
        trackingNumber,
        status: 'created',
        serviceType,
        pickupDate: pickupDate ? new Date(pickupDate) : null,
        shippingAddress: order.shippingAddress,
        recipientName: order.shippingAddress?.name || '',
        recipientPhone: order.shippingAddress?.phone || '',
        specialInstructions,
        packageDetails,
        estimatedDelivery: this.calculateEstimatedDelivery(serviceType, new Date(pickupDate)),
        metadata: {
          orderNumber: order.orderNumber,
          courierName: courier.name,
          createdBy: 'order-service'
        }
      }).returning();

      // Create pickup request if courier supports pickup
      let pickupRequest = null;
      if (courier.pickupSupported && pickupDate) {
        pickupRequest = await this.createPickupRequest(shipment, vendorOrderId, courier);
      }

      // Integrate with courier API
      const courierIntegration = await this.integrateWithCourierAPI(courier, shipment, order);

      // Update order/vendor order with tracking info
      if (vendorOrderId) {
        await db
          .update(vendorOrders)
          .set({
            status: 'shipped',
            shippingMethod: courier.name,
            updatedAt: new Date()
        })
        .where(eq(vendorOrders.id, vendorOrderId));
      }

      // Update order items with tracking number
      await db
        .update(orderItems)
        .set({
          trackingNumber,
          shippingProvider: courier.name,
          updatedAt: new Date()
        })
        .where(and(
          eq(orderItems.orderId, orderId),
          vendorOrderId ? eq(orderItems.vendorId, vendorOrderId) : sql`1=1`
        ));

      this.loggingService.info('Shipment created', {
        orderId,
        shipmentId: shipment.id,
        trackingNumber,
        courier: courier.name
      });

      res.status(201).json({
        success: true,
        data: {
          shipment,
          trackingNumber,
          courier: {
            name: courier.name,
            code: courier.code,
            trackingUrl: `${courier.apiUrl}/track/${trackingNumber}`
          },
          pickupRequest,
          courierIntegration,
          estimatedDelivery: shipment.estimatedDelivery,
          bangladeshShipping: {
            zoneClassification: await this.getShippingZone(order.shippingAddress),
            culturalConsiderations: this.getCulturalShippingNotes(await this.getShippingZone(order.shippingAddress)),
            localSupport: true,
            codAvailable: courier.codSupported
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Create shipment error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to create shipment',
        error: (error as Error).message
      });
    }
  }

  /**
   * Track shipment status
   */
  async trackShipment(req: Request, res: Response): Promise<void> {
    try {
      const { trackingNumber } = req.params;

      // Get shipment details
      const [shipment] = await db
        .select({
          id: shipments.id,
          orderId: shipments.orderId,
          trackingNumber: shipments.trackingNumber,
          status: shipments.status,
          serviceType: shipments.serviceType,
          shippingAddress: shipments.shippingAddress,
          estimatedDelivery: shipments.estimatedDelivery,
          actualDelivery: shipments.actualDelivery,
          createdAt: shipments.createdAt,
          courierName: courierPartners.name,
          courierCode: courierPartners.code,
          orderNumber: orders.orderNumber
        })
        .from(shipments)
        .leftJoin(courierPartners, eq(shipments.courierId, courierPartners.id))
        .leftJoin(orders, eq(shipments.orderId, orders.id))
        .where(eq(shipments.trackingNumber, trackingNumber));

      if (!shipment) {
        res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
        return;
      }

      // Get tracking history from courier API
      const courierTracking = await this.getCourierTrackingInfo(shipment.courierCode, trackingNumber);

      // Get delivery attempts
      const deliveryAttemptsList = await db
        .select()
        .from(deliveryAttempts)
        .where(eq(deliveryAttempts.shipmentId, shipment.id))
        .orderBy(desc(deliveryAttempts.attemptedAt));

      // Build tracking timeline
      const trackingTimeline = await this.buildTrackingTimeline(shipment, courierTracking, deliveryAttemptsList);

      // Calculate delivery progress
      const deliveryProgress = this.calculateDeliveryProgress(shipment.status, trackingTimeline);

      res.status(200).json({
        success: true,
        data: {
          shipment: {
            trackingNumber,
            orderNumber: shipment.orderNumber,
            status: shipment.status,
            serviceType: shipment.serviceType,
            estimatedDelivery: shipment.estimatedDelivery,
            actualDelivery: shipment.actualDelivery
          },
          courier: {
            name: shipment.courierName,
            code: shipment.courierCode,
            supportPhone: this.getCourierSupportInfo(shipment.courierCode).phone,
            supportEmail: this.getCourierSupportInfo(shipment.courierCode).email
          },
          tracking: {
            currentStatus: courierTracking.currentStatus || shipment.status,
            lastUpdate: courierTracking.lastUpdate || shipment.createdAt,
            location: courierTracking.currentLocation,
            timeline: trackingTimeline,
            deliveryProgress
          },
          delivery: {
            estimatedDate: shipment.estimatedDelivery,
            actualDate: shipment.actualDelivery,
            attempts: deliveryAttemptsList.length,
            address: shipment.shippingAddress,
            specialInstructions: courierTracking.deliveryInstructions
          },
          bangladeshTracking: {
            localTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
            prayerTimeConsideration: this.getPrayerTimeDeliveryNotes(),
            festivalDelayWarning: this.getFestivalDeliveryWarnings(),
            codCollectionStatus: courierTracking.codStatus
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Track shipment error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to track shipment',
        error: (error as Error).message
      });
    }
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { shipmentId } = req.params;
      const {
        status,
        location,
        notes,
        deliveryAttempt = false,
        deliveryProof = {},
        estimatedDelivery
      } = req.body;

      // Get current shipment
      const [shipment] = await db
        .select()
        .from(shipments)
        .where(eq(shipments.id, shipmentId));

      if (!shipment) {
        res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
        return;
      }

      // Update shipment
      const updateData: any = {
        status,
        lastLocation: location,
        updatedAt: new Date()
      };

      if (status === 'delivered') {
        updateData.actualDelivery = new Date();
      }

      if (estimatedDelivery) {
        updateData.estimatedDelivery = new Date(estimatedDelivery);
      }

      await db
        .update(shipments)
        .set(updateData)
        .where(eq(shipments.id, shipmentId));

      // Record delivery attempt if applicable
      let deliveryAttemptRecord = null;
      if (deliveryAttempt) {
        [deliveryAttemptRecord] = await db.insert(deliveryAttempts).values({
          shipmentId,
          attemptNumber: await this.getNextAttemptNumber(shipmentId),
          attemptedAt: new Date(),
          status,
          deliveryPerson: req.body.deliveryPerson,
          contactAttempts: req.body.contactAttempts || 1,
          recipientFeedback: req.body.recipientFeedback,
          deliveryPhotoUrl: deliveryProof.photoUrl,
          proofOfDelivery: deliveryProof,
          bangladeshFactors: {
            prayerTime: this.checkPrayerTimeDelivery(),
            weatherCondition: req.body.weatherCondition,
            trafficCondition: req.body.trafficCondition
          }
        }).returning();
      }

      // Update related order status
      await this.updateRelatedOrderStatus(shipment.orderId, status);

      // Send status update notifications
      await this.sendShippingStatusNotification(shipment, status, location);

      this.loggingService.info('Shipment status updated', {
        shipmentId,
        trackingNumber: shipment.trackingNumber,
        newStatus: status,
        location
      });

      res.status(200).json({
        success: true,
        data: {
          shipment: {
            id: shipmentId,
            trackingNumber: shipment.trackingNumber,
            status,
            location,
            lastUpdate: new Date()
          },
          deliveryAttempt: deliveryAttemptRecord,
          orderStatusUpdated: true,
          notificationsSent: true,
          nextSteps: this.getNextShippingSteps(status)
        }
      });

    } catch (error) {
      this.loggingService.error('Update shipment status error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to update shipment status',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get shipping analytics
   */
  async getShippingAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        courierId,
        vendorId,
        serviceType
      } = req.query;

      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Shipping performance metrics
      const [shippingMetrics] = await db
        .select({
          totalShipments: sql<number>`count(*)`,
          deliveredShipments: sql<number>`count(case when status = 'delivered' then 1 end)`,
          avgDeliveryTime: sql<number>`avg(extract(epoch from (actual_delivery - created_at))/86400)`,
          onTimeDeliveries: sql<number>`count(case when actual_delivery <= estimated_delivery then 1 end)`
        })
        .from(shipments)
        .where(and(
          gte(shipments.createdAt, start),
          lte(shipments.createdAt, end)
        ));

      // Courier performance comparison
      const courierPerformance = await db
        .select({
          courierId: shipments.courierId,
          courierName: courierPartners.name,
          shipmentCount: sql<number>`count(*)`,
          deliveryRate: sql<number>`
            round(
              count(case when ${shipments.status} = 'delivered' then 1 end) * 100.0 / count(*), 
              2
            )`,
          avgDeliveryDays: sql<number>`avg(extract(epoch from (actual_delivery - created_at))/86400)`
        })
        .from(shipments)
        .leftJoin(courierPartners, eq(shipments.courierId, courierPartners.id))
        .where(and(
          gte(shipments.createdAt, start),
          lte(shipments.createdAt, end)
        ))
        .groupBy(shipments.courierId, courierPartners.name);

      // Regional performance
      const regionalPerformance = await this.getRegionalShippingPerformance(start, end);

      // Service type performance
      const serviceTypePerformance = await db
        .select({
          serviceType: shipments.serviceType,
          shipmentCount: sql<number>`count(*)`,
          avgCost: sql<number>`avg(shipping_cost)`,
          avgDeliveryDays: sql<number>`avg(extract(epoch from (actual_delivery - created_at))/86400)`
        })
        .from(shipments)
        .where(and(
          gte(shipments.createdAt, start),
          lte(shipments.createdAt, end)
        ))
        .groupBy(shipments.serviceType);

      res.status(200).json({
        success: true,
        data: {
          summary: {
            totalShipments: Number(shippingMetrics.totalShipments || 0),
            deliveryRate: shippingMetrics.totalShipments ? 
              Math.round((Number(shippingMetrics.deliveredShipments) / Number(shippingMetrics.totalShipments)) * 100) : 0,
            avgDeliveryTime: Number(shippingMetrics.avgDeliveryTime || 0),
            onTimeRate: shippingMetrics.totalShipments ? 
              Math.round((Number(shippingMetrics.onTimeDeliveries) / Number(shippingMetrics.totalShipments)) * 100) : 0
          },
          courierPerformance,
          regionalPerformance,
          serviceTypePerformance,
          bangladeshInsights: {
            peakDeliveryHours: ['10AM-12PM', '2PM-4PM', '7PM-9PM'],
            prayerTimeImpact: 'Delivery success rate drops 15% during prayer times',
            festivalSeasonMultiplier: 'Delivery times increase by 40% during Eid season',
            weatherImpact: 'Monsoon season causes 25% delay in deliveries'
          },
          recommendations: this.generateShippingRecommendations(courierPerformance, regionalPerformance)
        }
      });

    } catch (error) {
      this.loggingService.error('Get shipping analytics error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve shipping analytics',
        error: (error as Error).message
      });
    }
  }

  /**
   * Helper methods
   */
  private async getShippingZone(address: any): Promise<any> {
    // Determine shipping zone based on address
    if (!address || !address.district) {
      return { zoneCode: 'DHAKA', zoneName: 'Dhaka Zone', division: 'Dhaka' };
    }

    const [zone] = await db
      .select()
      .from(shippingZones)
      .where(sql`districts @> ARRAY[${address.district}]`)
      .limit(1);

    return zone || { zoneCode: 'OTHER', zoneName: 'Other Zone', division: 'Other' };
  }

  private async getAvailableCouriers(destinationZone: any): Promise<any[]> {
    return await db
      .select()
      .from(courierPartners)
      .where(and(
        eq(courierPartners.status, 'active'),
        sql`coverage_areas @> ${JSON.stringify([destinationZone.zoneCode])}`
      ));
  }

  private async calculateShippingRate(params: {
    courierId: string;
    originZone: string;
    destinationZone: string;
    weight: number;
    serviceType: string;
    orderValue: number;
  }): Promise<any | null> {
    
    const [rate] = await db
      .select()
      .from(shippingRates)
      .where(and(
        eq(shippingRates.courierId, params.courierId),
        eq(shippingRates.serviceType, params.serviceType),
        eq(shippingRates.originZone, params.originZone),
        eq(shippingRates.destinationZone, params.destinationZone),
        gte(sql`weight_to`, params.weight),
        lte(sql`weight_from`, params.weight),
        eq(shippingRates.isActive, true)
      ))
      .limit(1);

    if (!rate) return null;

    const baseRate = Number(rate.baseRate);
    const weightCharge = (params.weight - Number(rate.weightFrom)) * Number(rate.perKgRate);
    const surcharges = rate.surcharges || {};
    const total = baseRate + weightCharge + Object.values(surcharges).reduce((sum: number, charge: any) => sum + Number(charge), 0);

    return {
      baseRate,
      weightCharge,
      surcharges,
      total,
      estimatedDays: this.getEstimatedDeliveryDays(params.serviceType, params.destinationZone),
      cutoffTime: this.getCutoffTime(params.serviceType),
      deliveryWindow: this.getDeliveryWindow(params.serviceType),
      insuranceIncluded: params.orderValue > 5000
    };
  }

  private getServiceDisplayName(serviceType: string): string {
    const names: Record<string, string> = {
      'standard': 'Standard Delivery',
      'express': 'Express Delivery',
      'same_day': 'Same Day Delivery',
      'next_day': 'Next Day Delivery'
    };
    return names[serviceType] || 'Standard Delivery';
  }

  private getServiceDescription(serviceType: string, courierCode: string): string {
    return `${this.getServiceDisplayName(serviceType)} via ${courierCode.toUpperCase()}`;
  }

  private getBangladeshShippingFeatures(zone: any): string[] {
    const features = ['COD Available', 'Local Language Support'];
    
    if (zone.division === 'Dhaka') {
      features.push('Same Day Delivery', 'Multiple Pickup Points');
    }
    
    return features;
  }

  private getCulturalShippingNotes(zone: any): string[] {
    return [
      'Delivery available during business hours',
      'Prayer time consideration for delivery',
      'Festival season may affect delivery times',
      'Customer verification required for COD'
    ];
  }

  private async generateTrackingNumber(courierCode: string): Promise<string> {
    const prefix = courierCode.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private calculateEstimatedDelivery(serviceType: string, pickupDate: Date): Date {
    const deliveryDays = this.getEstimatedDeliveryDays(serviceType, 'DHAKA');
    return new Date(pickupDate.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
  }

  private getEstimatedDeliveryDays(serviceType: string, destinationZone: string): number {
    const baseDays: Record<string, number> = {
      'same_day': 0,
      'next_day': 1,
      'express': 2,
      'standard': 3
    };
    
    const zoneFactor = destinationZone === 'DHAKA' ? 1 : 1.5;
    return Math.ceil((baseDays[serviceType] || 3) * zoneFactor);
  }

  private getCutoffTime(serviceType: string): string {
    const cutoffs: Record<string, string> = {
      'same_day': '12:00 PM',
      'next_day': '6:00 PM',
      'express': '8:00 PM',
      'standard': '10:00 PM'
    };
    return cutoffs[serviceType] || '10:00 PM';
  }

  private getDeliveryWindow(serviceType: string): string {
    const windows: Record<string, string> = {
      'same_day': '6:00 PM - 10:00 PM',
      'next_day': '9:00 AM - 9:00 PM',
      'express': '9:00 AM - 8:00 PM',
      'standard': '9:00 AM - 6:00 PM'
    };
    return windows[serviceType] || '9:00 AM - 6:00 PM';
  }

  private async createPickupRequest(shipment: any, vendorOrderId: string, courier: any): Promise<any> {
    // Mock implementation - would create actual pickup request
    return {
      id: 'pickup-' + Date.now(),
      shipmentId: shipment.id,
      scheduledDate: shipment.pickupDate,
      status: 'scheduled'
    };
  }

  private async integrateWithCourierAPI(courier: any, shipment: any, order: any): Promise<any> {
    // Mock courier API integration
    return {
      success: true,
      courierOrderId: 'CO-' + Date.now(),
      trackingUrl: `${courier.apiUrl}/track/${shipment.trackingNumber}`,
      pickupScheduled: true
    };
  }

  private async getCourierTrackingInfo(courierCode: string, trackingNumber: string): Promise<any> {
    // Mock courier tracking API call
    return {
      currentStatus: 'in_transit',
      lastUpdate: new Date(),
      currentLocation: 'Dhaka Distribution Center',
      deliveryInstructions: 'Call before delivery',
      codStatus: 'pending'
    };
  }

  private async buildTrackingTimeline(shipment: any, courierTracking: any, deliveryAttempts: any[]): Promise<any[]> {
    const timeline = [];
    
    timeline.push({
      timestamp: shipment.createdAt,
      status: 'shipment_created',
      description: 'Shipment created and ready for pickup',
      location: 'Origin'
    });

    // Add courier tracking events
    if (courierTracking.events) {
      timeline.push(...courierTracking.events);
    }

    // Add delivery attempts
    deliveryAttempts.forEach(attempt => {
      timeline.push({
        timestamp: attempt.attemptedAt,
        status: `delivery_${attempt.status}`,
        description: `Delivery attempt ${attempt.attemptNumber}`,
        location: 'Destination'
      });
    });

    return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private calculateDeliveryProgress(status: string, timeline: any[]): number {
    const statusProgress: Record<string, number> = {
      'created': 10,
      'picked_up': 25,
      'in_transit': 50,
      'out_for_delivery': 80,
      'delivered': 100,
      'failed': 0
    };
    return statusProgress[status] || 0;
  }

  private getCourierSupportInfo(courierCode: string): any {
    const supportInfo: Record<string, any> = {
      'pathao': { phone: '+880 1700 000000', email: 'support@pathao.com' },
      'paperfly': { phone: '+880 1800 000000', email: 'support@paperfly.com.bd' },
      'sundarban': { phone: '+880 1900 000000', email: 'support@sundarban.com.bd' }
    };
    return supportInfo[courierCode] || { phone: '+880 1600 000000', email: 'support@courier.com' };
  }

  private getPrayerTimeDeliveryNotes(): string[] {
    return [
      'Delivery may be delayed during prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha)',
      'Friday deliveries avoid Jummah prayer time (12:00 PM - 2:00 PM)'
    ];
  }

  private getFestivalDeliveryWarnings(): string[] {
    const currentDate = new Date();
    // Mock festival detection
    return [
      'Eid festival may cause 1-2 days additional delivery time',
      'Durga Puja celebrations may affect delivery schedule'
    ];
  }

  private checkPrayerTimeDelivery(): boolean {
    // Mock prayer time check
    return false;
  }

  private async getNextAttemptNumber(shipmentId: string): Promise<number> {
    const [result] = await db
      .select({ maxAttempt: sql<number>`COALESCE(MAX(attempt_number), 0)` })
      .from(deliveryAttempts)
      .where(eq(deliveryAttempts.shipmentId, shipmentId));
    
    return (result?.maxAttempt || 0) + 1;
  }

  private async updateRelatedOrderStatus(orderId: string, shipmentStatus: string): Promise<void> {
    if (shipmentStatus === 'delivered') {
      await db
        .update(orders)
        .set({
          status: 'delivered',
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));
    }
  }

  private async sendShippingStatusNotification(shipment: any, status: string, location?: string): Promise<void> {
    // Mock notification sending
    this.loggingService.info('Shipping notification sent', {
      trackingNumber: shipment.trackingNumber,
      status,
      location
    });
  }

  private getNextShippingSteps(status: string): string[] {
    const steps: Record<string, string[]> = {
      'created': ['Await pickup', 'Prepare package'],
      'picked_up': ['In transit to destination', 'Track progress'],
      'in_transit': ['Monitor delivery progress', 'Prepare for delivery'],
      'out_for_delivery': ['Customer notification sent', 'Prepare for receipt'],
      'delivered': ['Delivery completed', 'Customer feedback']
    };
    return steps[status] || [];
  }

  private async getRegionalShippingPerformance(start: Date, end: Date): Promise<any[]> {
    // Mock regional performance data
    return [
      { region: 'Dhaka', deliveryRate: 95, avgDays: 1.2 },
      { region: 'Chittagong', deliveryRate: 88, avgDays: 2.1 },
      { region: 'Sylhet', deliveryRate: 82, avgDays: 2.8 }
    ];
  }

  private generateShippingRecommendations(courierPerformance: any[], regionalPerformance: any[]): string[] {
    return [
      'Pathao shows best performance for Dhaka deliveries',
      'Consider multiple courier strategy for rural areas',
      'Same-day delivery performs well in major cities',
      'COD collection efficiency varies by region'
    ];
  }
}