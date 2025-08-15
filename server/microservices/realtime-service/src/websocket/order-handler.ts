/**
 * Order WebSocket Handler - Real-time Order Events
 * Amazon.com/Shopee.sg-Level order real-time tracking
 */

import { Socket } from 'socket.io';
import { createClient } from 'redis';

export interface OrderEvent {
  type: 'status_update' | 'payment_update' | 'shipping_update' | 'delivery_update' | 'cancellation' | 'refund_update';
  orderId: string;
  customerId: string;
  vendorId?: string;
  data: any;
  timestamp: Date;
}

export class OrderEventHandler {
  private redis = createClient();

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      await this.redis.connect();
      console.log('✅ Redis connected for Order handler');
    } catch (error) {
      console.warn('⚠️ Redis connection failed for Order handler:', error.message);
    }
  }

  public async handleOrderStatusUpdate(socket: Socket, data: any) {
    try {
      const { orderId, customerId, vendorId, oldStatus, newStatus, trackingNumber } = data;
      
      const event: OrderEvent = {
        type: 'status_update',
        orderId,
        customerId,
        vendorId,
        data: {
          oldStatus,
          newStatus,
          trackingNumber,
          statusMessage: this.getStatusMessage(newStatus),
          statusMessage_bn: this.getStatusMessageBN(newStatus),
          estimatedDelivery: data.estimatedDelivery,
          courierPartner: data.courierPartner, // pathao, paperfly, sundarban, redx
          nextAction: this.getNextAction(newStatus),
          progress: this.getOrderProgress(newStatus)
        },
        timestamp: new Date()
      };

      // Notify customer
      socket.broadcast.to(`user:${customerId}`).emit('order_status_updated', event);
      
      // Notify vendor
      if (vendorId) {
        socket.broadcast.to(`vendor:${vendorId}`).emit('vendor_order_updated', event);
      }
      
      // Special handling for different statuses
      await this.handleSpecialOrderStatuses(socket, event);
      
      await this.storeOrderEvent(event);
      console.log(`📦 Order status updated: ${orderId} (${oldStatus} → ${newStatus})`);
    } catch (error) {
      console.error('❌ Error handling order status update:', error);
    }
  }

  public async handlePaymentUpdate(socket: Socket, data: any) {
    try {
      const { orderId, customerId, paymentId, status, amount, method, transactionId } = data;
      
      const event: OrderEvent = {
        type: 'payment_update',
        orderId,
        customerId,
        data: {
          paymentId,
          status, // pending, processing, completed, failed, refunded
          amount,
          method, // bkash, nagad, rocket, card, cod
          transactionId,
          paymentMessage: this.getPaymentMessage(status, method),
          paymentMessage_bn: this.getPaymentMessageBN(status, method),
          gateway: method,
          currency: 'BDT',
          fees: data.fees || 0
        },
        timestamp: new Date()
      };

      // Notify customer
      socket.broadcast.to(`user:${customerId}`).emit('payment_updated', event);
      
      // Special Bangladesh mobile banking notifications
      if (['bkash', 'nagad', 'rocket'].includes(method)) {
        socket.broadcast.to(`user:${customerId}`).emit('bangladesh_payment_update', {
          ...event,
          mobilePayment: true,
          instructions_bn: this.getMobilePaymentInstructions(method, status),
          instructions_en: this.getMobilePaymentInstructionsEN(method, status)
        });
      }

      // Notify vendor on successful payment
      if (status === 'completed' && data.vendorId) {
        socket.broadcast.to(`vendor:${data.vendorId}`).emit('payment_received', {
          orderId,
          amount,
          method,
          customerNotified: true
        });
      }

      await this.storeOrderEvent(event);
      console.log(`💳 Payment updated: ${orderId} (${status} via ${method})`);
    } catch (error) {
      console.error('❌ Error handling payment update:', error);
    }
  }

  public async handleShippingUpdate(socket: Socket, data: any) {
    try {
      const { orderId, customerId, vendorId, trackingNumber, courier, status, location } = data;
      
      const event: OrderEvent = {
        type: 'shipping_update',
        orderId,
        customerId,
        vendorId,
        data: {
          trackingNumber,
          courier, // pathao, paperfly, sundarban, redx, ecourier
          status, // picked_up, in_transit, out_for_delivery, delivered, failed
          location,
          shippingMessage: this.getShippingMessage(status, courier),
          shippingMessage_bn: this.getShippingMessageBN(status, courier),
          estimatedDelivery: data.estimatedDelivery,
          currentLocation: location,
          nextLocation: data.nextLocation,
          deliveryAttempts: data.deliveryAttempts || 0,
          contactNumber: data.contactNumber
        },
        timestamp: new Date()
      };

      // Notify customer
      socket.broadcast.to(`user:${customerId}`).emit('shipping_updated', event);
      
      // Notify vendor
      if (vendorId) {
        socket.broadcast.to(`vendor:${vendorId}`).emit('vendor_shipping_updated', event);
      }

      // Bangladesh-specific delivery notifications
      if (status === 'out_for_delivery') {
        socket.broadcast.to(`user:${customerId}`).emit('bangladesh_delivery_alert', {
          orderId,
          courier,
          deliveryToday: true,
          contactNumber: data.contactNumber,
          message_bn: 'আপনার অর্ডার আজ ডেলিভারি হবে! ডেলিভারি ম্যানের সাথে যোগাযোগ রাখুন।',
          message_en: 'Your order will be delivered today! Stay in touch with the delivery person.',
          courierDetails: this.getCourierDetails(courier)
        });
      }

      await this.storeOrderEvent(event);
      console.log(`🚚 Shipping updated: ${orderId} (${status} via ${courier})`);
    } catch (error) {
      console.error('❌ Error handling shipping update:', error);
    }
  }

  public async handleDeliveryUpdate(socket: Socket, data: any) {
    try {
      const { orderId, customerId, vendorId, deliveryStatus, deliveredBy, signature, photo } = data;
      
      const event: OrderEvent = {
        type: 'delivery_update',
        orderId,
        customerId,
        vendorId,
        data: {
          deliveryStatus, // delivered, failed, rescheduled
          deliveredBy,
          deliveredAt: new Date(),
          signature,
          photo,
          deliveryMessage: this.getDeliveryMessage(deliveryStatus),
          deliveryMessage_bn: this.getDeliveryMessageBN(deliveryStatus),
          nextSteps: this.getDeliveryNextSteps(deliveryStatus),
          customerSatisfaction: data.customerSatisfaction,
          reviewReminder: deliveryStatus === 'delivered'
        },
        timestamp: new Date()
      };

      // Notify customer
      socket.broadcast.to(`user:${customerId}`).emit('delivery_updated', event);
      
      // Notify vendor
      if (vendorId) {
        socket.broadcast.to(`vendor:${vendorId}`).emit('vendor_delivery_updated', event);
      }

      // Successful delivery celebrations
      if (deliveryStatus === 'delivered') {
        socket.broadcast.to(`user:${customerId}`).emit('delivery_celebration', {
          orderId,
          message_bn: '🎉 আপনার অর্ডার সফলভাবে ডেলিভারি হয়েছে! পণ্যের রিভিউ দিতে ভুলবেন না।',
          message_en: '🎉 Your order has been successfully delivered! Don\'t forget to leave a review.',
          reviewIncentive: true,
          loyaltyPoints: data.loyaltyPoints || 0
        });
      }

      await this.storeOrderEvent(event);
      console.log(`📬 Delivery updated: ${orderId} (${deliveryStatus})`);
    } catch (error) {
      console.error('❌ Error handling delivery update:', error);
    }
  }

  public async handleOrderCancellation(socket: Socket, data: any) {
    try {
      const { orderId, customerId, vendorId, reason, cancelledBy, refundAmount } = data;
      
      const event: OrderEvent = {
        type: 'cancellation',
        orderId,
        customerId,
        vendorId,
        data: {
          reason,
          cancelledBy, // customer, vendor, admin, system
          cancelledAt: new Date(),
          refundAmount,
          refundMethod: data.refundMethod,
          refundETA: data.refundETA,
          cancellationMessage: this.getCancellationMessage(reason, cancelledBy),
          cancellationMessage_bn: this.getCancellationMessageBN(reason, cancelledBy),
          affectedItems: data.affectedItems || [],
          restockingFee: data.restockingFee || 0
        },
        timestamp: new Date()
      };

      // Notify customer
      socket.broadcast.to(`user:${customerId}`).emit('order_cancelled', event);
      
      // Notify vendor
      if (vendorId && cancelledBy !== 'vendor') {
        socket.broadcast.to(`vendor:${vendorId}`).emit('vendor_order_cancelled', event);
      }

      // Special handling for payment refunds
      if (refundAmount > 0) {
        socket.broadcast.to(`user:${customerId}`).emit('refund_initiated', {
          orderId,
          amount: refundAmount,
          method: data.refundMethod,
          eta: data.refundETA,
          message_bn: `৳${refundAmount} টাকা রিফান্ড প্রক্রিয়া শুরু হয়েছে। ${data.refundETA} এর মধ্যে পেয়ে যাবেন।`,
          message_en: `Refund of ৳${refundAmount} initiated. You will receive it within ${data.refundETA}.`
        });
      }

      await this.storeOrderEvent(event);
      console.log(`❌ Order cancelled: ${orderId} (${reason} by ${cancelledBy})`);
    } catch (error) {
      console.error('❌ Error handling order cancellation:', error);
    }
  }

  // Bangladesh-specific order events

  public async handleCODOrderPlaced(socket: Socket, data: any) {
    try {
      const { orderId, customerId, vendorId, amount, deliveryAddress } = data;
      
      socket.broadcast.to(`user:${customerId}`).emit('cod_order_confirmed', {
        orderId,
        amount,
        deliveryAddress,
        message_bn: 'আপনার ক্যাশ অন ডেলিভারি অর্ডার নিশ্চিত হয়েছে। ডেলিভারির সময় টাকা প্রস্তুত রাখুন।',
        message_en: 'Your cash on delivery order is confirmed. Please keep the exact amount ready.',
        paymentReminder: true,
        courierContact: data.courierContact
      });

      // Notify vendor
      if (vendorId) {
        socket.broadcast.to(`vendor:${vendorId}`).emit('cod_order_received', {
          orderId,
          customerId,
          amount,
          specialInstructions: 'COD order - collect payment on delivery'
        });
      }

      console.log(`💰 COD order placed: ${orderId} (৳${amount})`);
    } catch (error) {
      console.error('❌ Error handling COD order:', error);
    }
  }

  public async handleBangladeshHolidayDelay(socket: Socket, data: any) {
    try {
      const { affectedOrders, holiday, newDeliveryDate } = data;
      
      for (const orderId of affectedOrders) {
        const orderInfo = await this.getOrderInfo(orderId);
        if (orderInfo) {
          socket.broadcast.to(`user:${orderInfo.customerId}`).emit('holiday_delivery_delay', {
            orderId,
            holiday,
            originalDate: orderInfo.estimatedDelivery,
            newDate: newDeliveryDate,
            message_bn: `${holiday} উপলক্ষে ডেলিভারি বিলম্বিত হবে। নতুন ডেলিভারি তারিখ: ${newDeliveryDate}`,
            message_en: `Delivery delayed due to ${holiday}. New delivery date: ${newDeliveryDate}`,
            apologies: true,
            compensation: data.compensation
          });
        }
      }

      console.log(`🏖️ Holiday delay notification sent for ${affectedOrders.length} orders`);
    } catch (error) {
      console.error('❌ Error handling holiday delay:', error);
    }
  }

  // Helper methods

  private async handleSpecialOrderStatuses(socket: Socket, event: OrderEvent) {
    const { newStatus } = event.data;
    
    switch (newStatus) {
      case 'confirmed':
        socket.broadcast.to(`user:${event.customerId}`).emit('order_preparation_started', {
          orderId: event.orderId,
          message_bn: 'আপনার অর্ডার প্রস্তুত করা শুরু হয়েছে',
          message_en: 'Your order preparation has started'
        });
        break;
        
      case 'shipped':
        socket.broadcast.to(`user:${event.customerId}`).emit('order_shipped_celebration', {
          orderId: event.orderId,
          trackingNumber: event.data.trackingNumber,
          message_bn: '🚚 আপনার অর্ডার শিপ হয়েছে! ট্র্যাকিং করুন।',
          message_en: '🚚 Your order has been shipped! Track your package.'
        });
        break;
        
      case 'delivered':
        socket.broadcast.to(`user:${event.customerId}`).emit('order_completion_celebration', {
          orderId: event.orderId,
          message_bn: '🎉 অর্ডার সম্পন্ন! আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ।',
          message_en: '🎉 Order completed! Thank you for shopping with us.',
          reviewRequest: true,
          loyaltyBonus: true
        });
        break;
    }
  }

  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      pending: 'Order is being processed',
      confirmed: 'Order confirmed and being prepared',
      shipped: 'Order has been shipped',
      out_for_delivery: 'Out for delivery',
      delivered: 'Order delivered successfully',
      cancelled: 'Order has been cancelled',
      refunded: 'Order refunded'
    };
    return messages[status] || 'Status updated';
  }

  private getStatusMessageBN(status: string): string {
    const messages: Record<string, string> = {
      pending: 'অর্ডার প্রক্রিয়াধীন',
      confirmed: 'অর্ডার নিশ্চিত এবং প্রস্তুত হচ্ছে',
      shipped: 'অর্ডার শিপ হয়েছে',
      out_for_delivery: 'ডেলিভারির জন্য বের হয়েছে',
      delivered: 'অর্ডার সফলভাবে ডেলিভারি হয়েছে',
      cancelled: 'অর্ডার বাতিল হয়েছে',
      refunded: 'অর্ডার রিফান্ড হয়েছে'
    };
    return messages[status] || 'স্ট্যাটাস আপডেট';
  }

  private getPaymentMessage(status: string, method: string): string {
    if (status === 'completed') return `Payment successful via ${method}`;
    if (status === 'failed') return `Payment failed via ${method}`;
    if (status === 'pending') return `Payment pending via ${method}`;
    return `Payment ${status}`;
  }

  private getPaymentMessageBN(status: string, method: string): string {
    if (status === 'completed') return `${method} দিয়ে পেমেন্ট সফল`;
    if (status === 'failed') return `${method} দিয়ে পেমেন্ট ব্যর্থ`;
    if (status === 'pending') return `${method} দিয়ে পেমেন্ট অপেক্ষমাণ`;
    return `পেমেন্ট ${status}`;
  }

  private getMobilePaymentInstructions(method: string, status: string): string {
    if (status === 'pending') {
      return `আপনার ${method} অ্যাপে গিয়ে পেমেন্ট সম্পন্ন করুন। PIN দিয়ে নিশ্চিত করুন।`;
    }
    return `${method} পেমেন্ট ${status}`;
  }

  private getMobilePaymentInstructionsEN(method: string, status: string): string {
    if (status === 'pending') {
      return `Please complete payment in your ${method} app. Confirm with your PIN.`;
    }
    return `${method} payment ${status}`;
  }

  private getShippingMessage(status: string, courier: string): string {
    const messages: Record<string, string> = {
      picked_up: `Package picked up by ${courier}`,
      in_transit: `Package in transit via ${courier}`,
      out_for_delivery: `Out for delivery by ${courier}`,
      delivered: `Delivered by ${courier}`,
      failed: `Delivery attempt failed`
    };
    return messages[status] || `Shipping ${status}`;
  }

  private getShippingMessageBN(status: string, courier: string): string {
    const messages: Record<string, string> = {
      picked_up: `${courier} প্যাকেজ সংগ্রহ করেছে`,
      in_transit: `${courier} দিয়ে প্যাকেজ পাঠানো হচ্ছে`,
      out_for_delivery: `${courier} ডেলিভারির জন্য বের হয়েছে`,
      delivered: `${courier} ডেলিভারি সম্পন্ন`,
      failed: `ডেলিভারি চেষ্টা ব্যর্থ`
    };
    return messages[status] || `শিপিং ${status}`;
  }

  private getCourierDetails(courier: string) {
    const details: Record<string, any> = {
      pathao: { name: 'Pathao', color: '#E91E63', tracking: 'https://pathao.com/track' },
      paperfly: { name: 'Paperfly', color: '#4CAF50', tracking: 'https://paperfly.com.bd/track' },
      sundarban: { name: 'Sundarban', color: '#FF9800', tracking: 'https://sundarban.com/track' },
      redx: { name: 'RedX', color: '#F44336', tracking: 'https://redx.com.bd/track' },
      ecourier: { name: 'eCourier', color: '#2196F3', tracking: 'https://ecourier.com.bd/track' }
    };
    return details[courier] || { name: courier, color: '#757575' };
  }

  private getNextAction(status: string): string {
    const actions: Record<string, string> = {
      pending: 'Wait for confirmation',
      confirmed: 'Order being prepared',
      shipped: 'Track your package',
      out_for_delivery: 'Be available for delivery',
      delivered: 'Leave a review'
    };
    return actions[status] || 'Check status updates';
  }

  private getOrderProgress(status: string): number {
    const progress: Record<string, number> = {
      pending: 10,
      confirmed: 25,
      shipped: 50,
      out_for_delivery: 80,
      delivered: 100,
      cancelled: 0
    };
    return progress[status] || 0;
  }

  private getDeliveryMessage(status: string): string {
    const messages: Record<string, string> = {
      delivered: 'Package delivered successfully',
      failed: 'Delivery attempt failed',
      rescheduled: 'Delivery has been rescheduled'
    };
    return messages[status] || `Delivery ${status}`;
  }

  private getDeliveryMessageBN(status: string): string {
    const messages: Record<string, string> = {
      delivered: 'প্যাকেজ সফলভাবে ডেলিভারি হয়েছে',
      failed: 'ডেলিভারি চেষ্টা ব্যর্থ',
      rescheduled: 'ডেলিভারি পুনঃনির্ধারণ করা হয়েছে'
    };
    return messages[status] || `ডেলিভারি ${status}`;
  }

  private getDeliveryNextSteps(status: string): string[] {
    if (status === 'delivered') {
      return ['Leave a review', 'Check your package', 'Contact support if issues'];
    }
    if (status === 'failed') {
      return ['Contact courier', 'Reschedule delivery', 'Check delivery address'];
    }
    return ['Track your order', 'Contact support'];
  }

  private getCancellationMessage(reason: string, cancelledBy: string): string {
    return `Order cancelled due to ${reason} by ${cancelledBy}`;
  }

  private getCancellationMessageBN(reason: string, cancelledBy: string): string {
    return `${cancelledBy} দ্বারা ${reason} কারণে অর্ডার বাতিল`;
  }

  private async storeOrderEvent(event: OrderEvent) {
    try {
      await this.redis.lPush(`order_events:${event.orderId}`, JSON.stringify(event));
      await this.redis.lTrim(`order_events:${event.orderId}`, 0, 49); // Keep last 50 events
      
      // Store in global order events for analytics
      await this.redis.lPush('global_order_events', JSON.stringify(event));
      await this.redis.lTrim('global_order_events', 0, 999); // Keep last 1000 events
      
      // Update order event counters
      await this.redis.hIncrBy('order_event_counters', event.type, 1);
    } catch (error) {
      console.warn('⚠️ Failed to store order event:', error.message);
    }
  }

  private async getOrderInfo(orderId: string): Promise<any> {
    try {
      const orderData = await this.redis.hGetAll(`order_info:${orderId}`);
      return orderData.customerId ? orderData : null;
    } catch (error) {
      return null;
    }
  }

  // Public API methods

  public async getOrderEventHistory(orderId: string, limit: number = 20): Promise<OrderEvent[]> {
    try {
      const events = await this.redis.lRange(`order_events:${orderId}`, 0, limit - 1);
      return events.map(event => JSON.parse(event));
    } catch (error) {
      return [];
    }
  }

  public async getOrderEventStats(): Promise<Record<string, number>> {
    try {
      return await this.redis.hGetAll('order_event_counters') || {};
    } catch (error) {
      return {};
    }
  }

  public async subscribeToOrder(socket: Socket, orderId: string, userId: string) {
    try {
      await socket.join(`order:${orderId}`);
      console.log(`👀 User ${userId} subscribed to order ${orderId}`);
    } catch (error) {
      console.error('❌ Error subscribing to order:', error);
    }
  }

  public async unsubscribeFromOrder(socket: Socket, orderId: string, userId: string) {
    try {
      await socket.leave(`order:${orderId}`);
      console.log(`👋 User ${userId} unsubscribed from order ${orderId}`);
    } catch (error) {
      console.error('❌ Error unsubscribing from order:', error);
    }
  }
}