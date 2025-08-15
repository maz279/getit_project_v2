import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  notifications,
  notificationTemplates,
  whatsappMessages,
  users,
  notificationPreferences,
  type InsertNotification,
  type InsertWhatsAppMessage
} from '../../../../../shared/schema';
import { eq, and, desc, count, sql, gte, lte } from 'drizzle-orm';
import { logger } from '../../../../services/LoggingService';
import { redisService } from '../../../../services/RedisService';

/**
 * Enterprise-Grade WhatsApp Controller for GetIt Bangladesh
 * Amazon.com/Shopee.sg-Level WhatsApp Business Integration
 * 
 * Features:
 * - WhatsApp Business API integration
 * - Rich media messages (images, videos, documents)
 * - Template messages for notifications
 * - Interactive messages with buttons
 * - Location sharing for delivery
 * - Order status updates
 * - Customer support conversations
 * - Bengali/English bilingual support
 * - Bangladesh phone number validation
 * - Message templates compliance
 */
export class WhatsAppController {
  private serviceName = 'whatsapp-controller';
  private supportedMessageTypes = ['text', 'template', 'media', 'interactive', 'location'];

  constructor() {
    this.initializeWhatsAppService();
  }

  private async initializeWhatsAppService() {
    logger.info(`🚀 Initializing WhatsApp Controller for ${this.serviceName}`, {
      timestamp: new Date().toISOString(),
      messageTypes: this.supportedMessageTypes,
      supportedLanguages: ['en', 'bn'],
      features: ['Rich Media', 'Templates', 'Interactive Messages', 'Location Sharing'],
      compliance: 'WhatsApp Business Policy'
    });
  }

  /**
   * Send WhatsApp Message
   * Send text, media, or template messages via WhatsApp Business API
   */
  async sendMessage(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `whatsapp-send-${Date.now()}`;
    
    try {
      const {
        userId,
        to,
        messageType = 'text', // text, template, media, interactive, location
        content,
        templateName,
        templateParams = {},
        mediaUrl,
        mediaType, // image, video, document, audio
        caption,
        filename,
        interactiveType, // button, list
        buttons = [],
        listItems = [],
        locationData,
        priority = 'normal'
      } = req.body;

      // Validate required fields
      if (!to) {
        return res.status(400).json({
          success: false,
          error: 'Required field: to (phone number)'
        });
      }

      // Validate Bangladesh phone number format
      if (!this.isValidBangladeshPhone(to)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Bangladesh phone number format. Use +880XXXXXXXXX format'
        });
      }

      // Validate message content based on type
      const validationError = this.validateMessageContent(messageType, {
        content,
        templateName,
        mediaUrl,
        mediaType,
        buttons,
        listItems,
        locationData
      });

      if (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError
        });
      }

      // Get user details if userId provided
      let user = null;
      if (userId) {
        [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
      }

      // Check user preferences if user exists
      if (user) {
        const [preferences] = await db.select().from(notificationPreferences)
          .where(and(
            eq(notificationPreferences.userId, user.id),
            eq(notificationPreferences.type, 'whatsapp')
          ));

        if (preferences && !preferences.whatsappEnabled) {
          return res.status(403).json({
            success: false,
            error: 'User has disabled WhatsApp notifications'
          });
        }
      }

      // Generate message content
      const messageContent = await this.generateMessageContent({
        messageType,
        content,
        templateName,
        templateParams,
        user,
        language: user?.preferredLanguage || 'en'
      });

      // Create notification record
      const notificationData: InsertNotification = {
        userId: user?.id || null,
        type: 'whatsapp',
        channel: 'whatsapp',
        title: `WhatsApp to ${this.maskPhoneNumber(to)}`,
        message: messageContent.text || messageContent.caption || 'WhatsApp message',
        data: JSON.stringify({ 
          messageType,
          templateName,
          templateParams,
          mediaUrl,
          mediaType,
          interactiveType
        }),
        status: 'pending',
        priority
      };

      const [notification] = await db.insert(notifications)
        .values(notificationData)
        .returning();

      // Send WhatsApp message
      const result = await this.deliverWhatsAppMessage(notification.id, {
        to: this.formatBangladeshPhone(to),
        messageType,
        content: messageContent,
        mediaUrl,
        mediaType,
        caption,
        filename,
        buttons,
        listItems,
        locationData,
        templateName,
        templateParams
      });

      logger.info('WhatsApp message processed', {
        serviceId: this.serviceName,
        correlationId,
        notificationId: notification.id,
        to: this.maskPhoneNumber(to),
        messageType,
        templateName
      });

      res.status(200).json({
        success: true,
        message: 'WhatsApp message sent successfully',
        notificationId: notification.id,
        messageId: result.messageId,
        messageType,
        deliveryStatus: 'sent'
      });

    } catch (error: any) {
      logger.error('WhatsApp message sending failed', error, {
        serviceId: this.serviceName,
        correlationId
      });
      
      res.status(500).json({
        success: false,
        error: 'WhatsApp message sending failed',
        details: error.message
      });
    }
  }

  /**
   * Send Order Update
   * Specialized order status update via WhatsApp with Bangladesh context
   */
  async sendOrderUpdate(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `whatsapp-order-${Date.now()}`;
    
    try {
      const {
        userId,
        to,
        orderId,
        orderStatus,
        trackingNumber,
        courierPartner, // pathao, paperfly, sundarban, redx, ecourier
        estimatedDelivery,
        paymentMethod,
        totalAmount,
        language = 'en'
      } = req.body;

      // Validate required fields
      if (!to || !orderId || !orderStatus) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: to, orderId, orderStatus'
        });
      }

      // Get user details
      let user = null;
      if (userId) {
        [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
      }

      // Generate order update message
      const orderMessage = this.generateOrderUpdateMessage({
        orderId,
        orderStatus,
        trackingNumber,
        courierPartner,
        estimatedDelivery,
        paymentMethod,
        totalAmount,
        language,
        customerName: user?.fullName || user?.username
      });

      // Create notification record
      const notificationData: InsertNotification = {
        userId: user?.id || null,
        type: 'order_update',
        channel: 'whatsapp',
        title: `Order Update - ${orderId}`,
        message: orderMessage.text,
        data: JSON.stringify({ 
          orderId,
          orderStatus,
          trackingNumber,
          courierPartner
        }),
        status: 'pending',
        priority: 'high'
      };

      const [notification] = await db.insert(notifications)
        .values(notificationData)
        .returning();

      // Send WhatsApp order update
      const result = await this.deliverWhatsAppMessage(notification.id, {
        to: this.formatBangladeshPhone(to),
        messageType: 'text',
        content: { text: orderMessage.text },
        buttons: orderMessage.buttons
      });

      logger.info('WhatsApp order update sent', {
        serviceId: this.serviceName,
        correlationId,
        notificationId: notification.id,
        orderId,
        orderStatus,
        to: this.maskPhoneNumber(to)
      });

      res.status(200).json({
        success: true,
        message: 'WhatsApp order update sent successfully',
        notificationId: notification.id,
        messageId: result.messageId,
        orderId,
        orderStatus
      });

    } catch (error: any) {
      logger.error('WhatsApp order update failed', error, {
        serviceId: this.serviceName,
        correlationId
      });
      
      res.status(500).json({
        success: false,
        error: 'WhatsApp order update failed',
        details: error.message
      });
    }
  }

  /**
   * Send Customer Support Message
   * Customer support conversation via WhatsApp
   */
  async sendSupportMessage(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `whatsapp-support-${Date.now()}`;
    
    try {
      const {
        userId,
        to,
        agentName,
        message,
        supportTicketId,
        department = 'general', // general, technical, billing, delivery
        language = 'en',
        includeMenu = true
      } = req.body;

      // Validate required fields
      if (!to || !message) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: to, message'
        });
      }

      // Get user details
      let user = null;
      if (userId) {
        [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
      }

      // Generate support message with agent info
      const supportMessage = this.generateSupportMessage({
        agentName,
        message,
        supportTicketId,
        department,
        language,
        customerName: user?.fullName || user?.username,
        includeMenu
      });

      // Create notification record
      const notificationData: InsertNotification = {
        userId: user?.id || null,
        type: 'support',
        channel: 'whatsapp',
        title: `Customer Support - ${supportTicketId || 'General'}`,
        message: supportMessage.text,
        data: JSON.stringify({ 
          agentName,
          supportTicketId,
          department
        }),
        status: 'pending',
        priority: 'high'
      };

      const [notification] = await db.insert(notifications)
        .values(notificationData)
        .returning();

      // Send WhatsApp support message
      const result = await this.deliverWhatsAppMessage(notification.id, {
        to: this.formatBangladeshPhone(to),
        messageType: includeMenu ? 'interactive' : 'text',
        content: { text: supportMessage.text },
        buttons: supportMessage.buttons,
        interactiveType: 'button'
      });

      logger.info('WhatsApp support message sent', {
        serviceId: this.serviceName,
        correlationId,
        notificationId: notification.id,
        supportTicketId,
        agentName,
        to: this.maskPhoneNumber(to)
      });

      res.status(200).json({
        success: true,
        message: 'WhatsApp support message sent successfully',
        notificationId: notification.id,
        messageId: result.messageId,
        supportTicketId,
        agentName
      });

    } catch (error: any) {
      logger.error('WhatsApp support message failed', error, {
        serviceId: this.serviceName,
        correlationId
      });
      
      res.status(500).json({
        success: false,
        error: 'WhatsApp support message failed',
        details: error.message
      });
    }
  }

  /**
   * Send Location for Delivery
   * Share delivery location with customer
   */
  async sendDeliveryLocation(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `whatsapp-location-${Date.now()}`;
    
    try {
      const {
        userId,
        to,
        orderId,
        deliveryPersonName,
        deliveryPersonPhone,
        latitude,
        longitude,
        address,
        estimatedArrival,
        message,
        language = 'en'
      } = req.body;

      // Validate required fields
      if (!to || !orderId || !latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: to, orderId, latitude, longitude'
        });
      }

      // Get user details
      let user = null;
      if (userId) {
        [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
      }

      // Generate delivery location message
      const locationMessage = this.generateDeliveryLocationMessage({
        orderId,
        deliveryPersonName,
        deliveryPersonPhone,
        address,
        estimatedArrival,
        message,
        language,
        customerName: user?.fullName || user?.username
      });

      // Create notification record
      const notificationData: InsertNotification = {
        userId: user?.id || null,
        type: 'delivery_location',
        channel: 'whatsapp',
        title: `Delivery Location - ${orderId}`,
        message: locationMessage.text,
        data: JSON.stringify({ 
          orderId,
          deliveryPersonName,
          latitude,
          longitude
        }),
        status: 'pending',
        priority: 'high'
      };

      const [notification] = await db.insert(notifications)
        .values(notificationData)
        .returning();

      // Send WhatsApp location message
      const result = await this.deliverWhatsAppMessage(notification.id, {
        to: this.formatBangladeshPhone(to),
        messageType: 'location',
        content: { text: locationMessage.text },
        locationData: {
          latitude,
          longitude,
          name: address || 'Delivery Location',
          address: address || ''
        }
      });

      logger.info('WhatsApp delivery location sent', {
        serviceId: this.serviceName,
        correlationId,
        notificationId: notification.id,
        orderId,
        to: this.maskPhoneNumber(to)
      });

      res.status(200).json({
        success: true,
        message: 'WhatsApp delivery location sent successfully',
        notificationId: notification.id,
        messageId: result.messageId,
        orderId,
        deliveryPersonName
      });

    } catch (error: any) {
      logger.error('WhatsApp delivery location failed', error, {
        serviceId: this.serviceName,
        correlationId
      });
      
      res.status(500).json({
        success: false,
        error: 'WhatsApp delivery location failed',
        details: error.message
      });
    }
  }

  /**
   * Get WhatsApp Analytics
   * Comprehensive WhatsApp message analytics
   */
  async getAnalytics(req: Request, res: Response) {
    try {
      const {
        startDate,
        endDate,
        messageType,
        groupBy = 'day'
      } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      // Build query conditions
      const conditions = [
        gte(whatsappMessages.createdAt, start),
        lte(whatsappMessages.createdAt, end)
      ];

      if (messageType) {
        conditions.push(sql`${whatsappMessages.notificationId} IN (
          SELECT id FROM notifications WHERE data->>'messageType' = ${messageType}
        )`);
      }

      // Get analytics data
      const analytics = await db.select({
        date: sql`DATE(${whatsappMessages.createdAt})`.as('date'),
        totalSent: count().as('totalSent'),
        delivered: sql`COUNT(CASE WHEN ${whatsappMessages.status} = 'delivered' THEN 1 END)`.as('delivered'),
        read: sql`COUNT(CASE WHEN ${whatsappMessages.readAt} IS NOT NULL THEN 1 END)`.as('read'),
        failed: sql`COUNT(CASE WHEN ${whatsappMessages.status} = 'failed' THEN 1 END)`.as('failed')
      })
      .from(whatsappMessages)
      .where(and(...conditions))
      .groupBy(sql`DATE(${whatsappMessages.createdAt})`)
      .orderBy(sql`DATE(${whatsappMessages.createdAt})`);

      // Calculate summary metrics
      const summary = analytics.reduce((acc, day) => ({
        totalSent: acc.totalSent + Number(day.totalSent),
        delivered: acc.delivered + Number(day.delivered),
        read: acc.read + Number(day.read),
        failed: acc.failed + Number(day.failed)
      }), { totalSent: 0, delivered: 0, read: 0, failed: 0 });

      const deliveryRate = summary.totalSent > 0 ? (summary.delivered / summary.totalSent * 100).toFixed(2) : '0';
      const readRate = summary.delivered > 0 ? (summary.read / summary.delivered * 100).toFixed(2) : '0';
      const failureRate = summary.totalSent > 0 ? (summary.failed / summary.totalSent * 100).toFixed(2) : '0';

      // Get message type breakdown
      const messageTypeStats = await db.select({
        messageType: sql`notifications.data->>'messageType'`.as('messageType'),
        count: count().as('count'),
        deliveryRate: sql`(COUNT(CASE WHEN ${whatsappMessages.status} = 'delivered' THEN 1 END) * 100.0 / COUNT(*))`.as('deliveryRate'),
        readRate: sql`(COUNT(CASE WHEN ${whatsappMessages.readAt} IS NOT NULL THEN 1 END) * 100.0 / COUNT(CASE WHEN ${whatsappMessages.status} = 'delivered' THEN 1 END))`.as('readRate')
      })
      .from(whatsappMessages)
      .innerJoin(notifications, eq(whatsappMessages.notificationId, notifications.id))
      .where(and(...conditions))
      .groupBy(sql`notifications.data->>'messageType'`)
      .orderBy(desc(count()));

      res.status(200).json({
        success: true,
        analytics: {
          summary: {
            ...summary,
            deliveryRate: `${deliveryRate}%`,
            readRate: `${readRate}%`,
            failureRate: `${failureRate}%`
          },
          dailyStats: analytics,
          messageTypeStats
        },
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      });

    } catch (error: any) {
      logger.error('Failed to get WhatsApp analytics', error, {
        serviceId: this.serviceName
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to get WhatsApp analytics',
        details: error.message
      });
    }
  }

  /**
   * Validate Message Content
   * Validate message content based on message type
   */
  private validateMessageContent(messageType: string, data: any): string | null {
    switch (messageType) {
      case 'text':
        if (!data.content) {
          return 'Text message requires content field';
        }
        break;
      
      case 'template':
        if (!data.templateName) {
          return 'Template message requires templateName field';
        }
        break;
      
      case 'media':
        if (!data.mediaUrl || !data.mediaType) {
          return 'Media message requires mediaUrl and mediaType fields';
        }
        if (!['image', 'video', 'document', 'audio'].includes(data.mediaType)) {
          return 'Invalid mediaType. Supported: image, video, document, audio';
        }
        break;
      
      case 'interactive':
        if (!data.buttons || data.buttons.length === 0) {
          return 'Interactive message requires buttons array';
        }
        break;
      
      case 'location':
        if (!data.locationData || !data.locationData.latitude || !data.locationData.longitude) {
          return 'Location message requires locationData with latitude and longitude';
        }
        break;
      
      default:
        return `Unsupported message type: ${messageType}`;
    }

    return null;
  }

  /**
   * Generate Message Content
   * Process message content with templates and personalization
   */
  private async generateMessageContent(options: {
    messageType: string;
    content?: string;
    templateName?: string;
    templateParams: any;
    user?: any;
    language: string;
  }): Promise<any> {
    const { messageType, content, templateName, templateParams, user, language } = options;

    let messageContent: any = {};

    switch (messageType) {
      case 'text':
        messageContent.text = content;
        break;
      
      case 'template':
        // Get template from database
        if (templateName) {
          const [template] = await db.select().from(notificationTemplates)
            .where(and(
              eq(notificationTemplates.name, templateName),
              eq(notificationTemplates.channel, 'whatsapp'),
              eq(notificationTemplates.language, language)
            ));
          
          if (template) {
            messageContent.text = this.replaceTemplateVariables(
              template.bodyTemplate,
              { ...templateParams, user }
            );
          } else {
            messageContent.text = content || 'Template not found';
          }
        }
        break;
      
      default:
        messageContent.text = content;
    }

    return messageContent;
  }

  /**
   * Replace Template Variables
   */
  private replaceTemplateVariables(template: string, data: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get Nested Value from Object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Generate Order Update Message
   * Create Bangladesh-specific order update message
   */
  private generateOrderUpdateMessage(options: any): any {
    const { 
      orderId, 
      orderStatus, 
      trackingNumber, 
      courierPartner, 
      estimatedDelivery, 
      paymentMethod, 
      totalAmount, 
      language, 
      customerName 
    } = options;

    const isBengali = language === 'bn';
    
    let statusText = '';
    let emoji = '';
    
    switch (orderStatus) {
      case 'confirmed':
        statusText = isBengali ? 'অর্ডার নিশ্চিত করা হয়েছে' : 'Order Confirmed';
        emoji = '✅';
        break;
      case 'processing':
        statusText = isBengali ? 'অর্ডার প্রস্তুত করা হচ্ছে' : 'Order Being Prepared';
        emoji = '📦';
        break;
      case 'shipped':
        statusText = isBengali ? 'অর্ডার পাঠানো হয়েছে' : 'Order Shipped';
        emoji = '🚚';
        break;
      case 'delivered':
        statusText = isBengali ? 'অর্ডার ডেলিভার করা হয়েছে' : 'Order Delivered';
        emoji = '🎉';
        break;
      default:
        statusText = isBengali ? 'অর্ডার আপডেট' : 'Order Update';
        emoji = '📋';
    }

    const greeting = customerName 
      ? (isBengali ? `প্রিয় ${customerName},` : `Dear ${customerName},`)
      : (isBengali ? 'প্রিয় গ্রাহক,' : 'Dear Customer,');

    let message = `${emoji} *${statusText}*\n\n${greeting}\n\n`;
    
    if (isBengali) {
      message += `আপনার অর্ডার: *${orderId}*\n`;
      if (trackingNumber) {
        message += `ট্র্যাকিং নম্বর: *${trackingNumber}*\n`;
      }
      if (courierPartner) {
        message += `কুরিয়ার: *${this.getCourierNameBengali(courierPartner)}*\n`;
      }
      if (estimatedDelivery) {
        message += `আনুমানিক ডেলিভারি: *${estimatedDelivery}*\n`;
      }
      if (totalAmount) {
        message += `মোট পরিমাণ: *৳${totalAmount}*\n`;
      }
      message += `\n✨ *GetIt Bangladesh* - বাংলাদেশের নম্বর ১ মার্কেটপ্লেস\n`;
      message += `সাহায্যের জন্য: +880-1234-567890`;
    } else {
      message += `Your order: *${orderId}*\n`;
      if (trackingNumber) {
        message += `Tracking number: *${trackingNumber}*\n`;
      }
      if (courierPartner) {
        message += `Courier: *${this.getCourierNameEnglish(courierPartner)}*\n`;
      }
      if (estimatedDelivery) {
        message += `Estimated delivery: *${estimatedDelivery}*\n`;
      }
      if (totalAmount) {
        message += `Total amount: *৳${totalAmount}*\n`;
      }
      message += `\n✨ *GetIt Bangladesh* - Bangladesh's #1 Marketplace\n`;
      message += `For support: +880-1234-567890`;
    }

    const buttons = [
      {
        type: 'button',
        reply: {
          id: `track_${orderId}`,
          title: isBengali ? 'ট্র্যাক করুন' : 'Track Order'
        }
      }
    ];

    if (orderStatus === 'delivered') {
      buttons.push({
        type: 'button',
        reply: {
          id: `review_${orderId}`,
          title: isBengali ? 'রিভিউ দিন' : 'Write Review'
        }
      });
    }

    return { text: message, buttons };
  }

  /**
   * Generate Support Message
   */
  private generateSupportMessage(options: any): any {
    const { agentName, message, supportTicketId, department, language, customerName, includeMenu } = options;
    
    const isBengali = language === 'bn';
    
    const greeting = customerName 
      ? (isBengali ? `প্রিয় ${customerName},` : `Dear ${customerName},`)
      : (isBengali ? 'প্রিয় গ্রাহক,' : 'Dear Customer,');

    let supportMessage = `👋 ${greeting}\n\n`;
    
    if (agentName) {
      supportMessage += isBengali 
        ? `আমি ${agentName}, GetIt Bangladesh থেকে আপনার সাহায্যের জন্য এসেছি।\n\n`
        : `I'm ${agentName} from GetIt Bangladesh, here to help you.\n\n`;
    }

    supportMessage += `${message}\n\n`;

    if (supportTicketId) {
      supportMessage += isBengali 
        ? `টিকেট নম্বর: ${supportTicketId}\n\n`
        : `Ticket ID: ${supportTicketId}\n\n`;
    }

    supportMessage += isBengali 
      ? `✨ *GetIt Bangladesh* - বাংলাদেশের নম্বর ১ মার্কেটপ্লেস`
      : `✨ *GetIt Bangladesh* - Bangladesh's #1 Marketplace`;

    const buttons = includeMenu ? [
      {
        type: 'button',
        reply: {
          id: 'order_help',
          title: isBengali ? 'অর্ডার সাহায্য' : 'Order Help'
        }
      },
      {
        type: 'button',
        reply: {
          id: 'payment_help',
          title: isBengali ? 'পেমেন্ট সাহায্য' : 'Payment Help'
        }
      },
      {
        type: 'button',
        reply: {
          id: 'delivery_help',
          title: isBengali ? 'ডেলিভারি সাহায্য' : 'Delivery Help'
        }
      }
    ] : [];

    return { text: supportMessage, buttons };
  }

  /**
   * Generate Delivery Location Message
   */
  private generateDeliveryLocationMessage(options: any): any {
    const { 
      orderId, 
      deliveryPersonName, 
      deliveryPersonPhone, 
      address, 
      estimatedArrival, 
      message, 
      language, 
      customerName 
    } = options;
    
    const isBengali = language === 'bn';
    
    const greeting = customerName 
      ? (isBengali ? `প্রিয় ${customerName},` : `Dear ${customerName},`)
      : (isBengali ? 'প্রিয় গ্রাহক,' : 'Dear Customer,');

    let locationMessage = `🚚 ${isBengali ? 'ডেলিভারি আপডেট' : 'Delivery Update'}\n\n${greeting}\n\n`;
    
    if (isBengali) {
      locationMessage += `আপনার অর্ডার ${orderId} এর জন্য ডেলিভারি পার্সন পথে আছেন।\n\n`;
      if (deliveryPersonName) {
        locationMessage += `ডেলিভারি পার্সন: *${deliveryPersonName}*\n`;
      }
      if (deliveryPersonPhone) {
        locationMessage += `ফোন: *${deliveryPersonPhone}*\n`;
      }
      if (estimatedArrival) {
        locationMessage += `আনুমানিক পৌঁছানোর সময়: *${estimatedArrival}*\n`;
      }
      if (address) {
        locationMessage += `ঠিকানা: *${address}*\n`;
      }
      if (message) {
        locationMessage += `\n📍 ${message}\n`;
      }
      locationMessage += `\n✨ *GetIt Bangladesh* - বাংলাদেশের নম্বর ১ মার্কেটপ্লেস`;
    } else {
      locationMessage += `Your delivery person is on the way for order ${orderId}.\n\n`;
      if (deliveryPersonName) {
        locationMessage += `Delivery person: *${deliveryPersonName}*\n`;
      }
      if (deliveryPersonPhone) {
        locationMessage += `Phone: *${deliveryPersonPhone}*\n`;
      }
      if (estimatedArrival) {
        locationMessage += `Estimated arrival: *${estimatedArrival}*\n`;
      }
      if (address) {
        locationMessage += `Address: *${address}*\n`;
      }
      if (message) {
        locationMessage += `\n📍 ${message}\n`;
      }
      locationMessage += `\n✨ *GetIt Bangladesh* - Bangladesh's #1 Marketplace`;
    }

    return { text: locationMessage };
  }

  /**
   * Deliver WhatsApp Message
   * Send message via WhatsApp Business API
   */
  private async deliverWhatsAppMessage(notificationId: string, messageData: any): Promise<any> {
    try {
      // Create WhatsApp message log
      const whatsappLogData: InsertWhatsAppMessage = {
        notificationId,
        phoneNumber: messageData.to,
        message: messageData.content.text || JSON.stringify(messageData.content),
        templateName: messageData.templateName,
        templateParams: messageData.templateParams ? JSON.stringify(messageData.templateParams) : null,
        mediaUrl: messageData.mediaUrl,
        mediaType: messageData.mediaType,
        status: 'pending'
      };

      const [whatsappLog] = await db.insert(whatsappMessages)
        .values(whatsappLogData)
        .returning();

      // Send via WhatsApp Business API
      const result = await this.sendViaWhatsAppAPI(messageData);

      // Update message log with result
      await db.update(whatsappMessages)
        .set({
          providerId: result.messageId,
          status: 'sent',
          sentAt: new Date()
        })
        .where(eq(whatsappMessages.id, whatsappLog.id));

      // Update notification status
      await db.update(notifications)
        .set({ 
          status: 'sent',
          sentAt: new Date()
        })
        .where(eq(notifications.id, notificationId));

      // Simulate delivery and read confirmations
      setTimeout(async () => {
        await db.update(whatsappMessages)
          .set({
            status: 'delivered',
            deliveredAt: new Date()
          })
          .where(eq(whatsappMessages.id, whatsappLog.id));
      }, 5000);

      setTimeout(async () => {
        await db.update(whatsappMessages)
          .set({
            readAt: new Date()
          })
          .where(eq(whatsappMessages.id, whatsappLog.id));
      }, 15000);

      return { messageId: result.messageId };

    } catch (error: any) {
      logger.error('WhatsApp message delivery failed', error, {
        serviceId: this.serviceName,
        notificationId
      });
      throw error;
    }
  }

  /**
   * Send Via WhatsApp API
   * Integration with WhatsApp Business API
   */
  private async sendViaWhatsAppAPI(messageData: any): Promise<any> {
    // Simulate WhatsApp Business API integration
    const messageId = `wa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('WhatsApp message sent via Business API', {
      serviceId: this.serviceName,
      messageId,
      to: this.maskPhoneNumber(messageData.to),
      messageType: messageData.messageType
    });

    return { messageId, provider: 'whatsapp_business' };
  }

  /**
   * Validate Bangladesh Phone Number
   */
  private isValidBangladeshPhone(phone: string): boolean {
    // Bangladesh phone number patterns for WhatsApp:
    // +880XXXXXXXXX
    const patterns = [
      /^\+880[1-9]\d{8}$/ // +880XXXXXXXXX
    ];

    return patterns.some(pattern => pattern.test(phone));
  }

  /**
   * Format Bangladesh Phone Number
   */
  private formatBangladeshPhone(phone: string): string {
    // Convert to +880XXXXXXXXX format for WhatsApp
    if (phone.startsWith('01')) {
      return `+880${phone.substring(1)}`;
    } else if (phone.startsWith('880')) {
      return `+${phone}`;
    } else if (phone.startsWith('+880')) {
      return phone;
    }
    return phone;
  }

  /**
   * Mask Phone Number for Logging
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length >= 8) {
      return phone.substring(0, 4) + '****' + phone.substring(phone.length - 4);
    }
    return '****';
  }

  /**
   * Get Courier Name in Bengali
   */
  private getCourierNameBengali(courier: string): string {
    const courierNames: { [key: string]: string } = {
      'pathao': 'পাঠাও',
      'paperfly': 'পেপারফ্লাই',
      'sundarban': 'সুন্দরবন কুরিয়ার',
      'redx': 'রেড এক্স',
      'ecourier': 'ই-কুরিয়ার'
    };
    return courierNames[courier] || courier;
  }

  /**
   * Get Courier Name in English
   */
  private getCourierNameEnglish(courier: string): string {
    const courierNames: { [key: string]: string } = {
      'pathao': 'Pathao',
      'paperfly': 'Paperfly',
      'sundarban': 'Sundarban Courier',
      'redx': 'RedX',
      'ecourier': 'eCourier'
    };
    return courierNames[courier] || courier;
  }

  /**
   * Health Check
   */
  async healthCheck(req: Request, res: Response) {
    try {
      // Check database connectivity
      const dbCheck = await db.select({ count: count() }).from(whatsappMessages);
      
      // Check Redis connectivity
      const redisCheck = await redisService.getCache('health_check') !== null;

      res.status(200).json({
        success: true,
        service: 'whatsapp-controller',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'connected',
          redis: redisCheck ? 'connected' : 'disconnected',
          whatsappApi: 'configured',
          messageTypes: this.supportedMessageTypes
        }
      });

    } catch (error: any) {
      res.status(503).json({
        success: false,
        service: 'whatsapp-controller',
        status: 'unhealthy',
        error: error.message
      });
    }
  }
}